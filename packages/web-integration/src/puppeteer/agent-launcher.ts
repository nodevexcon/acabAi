import { readFileSync } from 'node:fs';
import { getDebug } from '@acabai/shared/logger';
import { assert } from '@acabai/shared/utils';

import { PuppeteerAgent, type PuppeteerAgentOptions } from '@/puppeteer/index';
import type { AcabaiYamlScriptWebEnv } from '@acabai/core';
import { DEFAULT_WAIT_FOR_NETWORK_IDLE_TIMEOUT } from '@acabai/shared/constants';

// Import standard puppeteer as a fallback
import puppeteer from 'puppeteer';

// Import puppeteer-extra and plugins
// Note: These imports are using dynamic imports to avoid breaking if packages are not installed
let puppeteerExtra: any = null;
let StealthPlugin: any = null;
let AdblockerPlugin: any = null;

// Try to load puppeteer-extra and plugins
try {
  // Using require instead of import for conditional loading
  puppeteerExtra = require('puppeteer-extra');
  StealthPlugin = require('puppeteer-extra-plugin-stealth');
  AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
} catch (error) {
  console.warn('puppeteer-extra or plugins not found, using standard puppeteer');
}

export const defaultUA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';
export const defaultViewportWidth = 1440;
export const defaultViewportHeight = 768;
export const defaultViewportScale = process.platform === 'darwin' ? 2 : 1;
export const defaultWaitForNetworkIdleTimeout =
  DEFAULT_WAIT_FOR_NETWORK_IDLE_TIMEOUT;

interface FreeFn {
  name: string;
  fn: () => void;
}

const launcherDebug = getDebug('puppeteer:launcher');

export async function launchPuppeteerPage(
  target: AcabaiYamlScriptWebEnv,
  preference?: {
    headed?: boolean;
    keepWindow?: boolean;
    enableStealth?: boolean;
    enableAdBlocker?: boolean;
    adBlockerOptions?: {
      path?: string;
      blockTrackers?: boolean;
    };
  },
) {
  assert(target.url, 'url is required');
  const freeFn: FreeFn[] = [];

  // prepare the environment
  const ua = target.userAgent || defaultUA;
  let width = defaultViewportWidth;
  let preferMaximizedWindow = true;
  if (target.viewportWidth) {
    preferMaximizedWindow = false;
    assert(
      typeof target.viewportWidth === 'number',
      'viewportWidth must be a number',
    );
    width = Number.parseInt(target.viewportWidth as unknown as string, 10);
    assert(width > 0, `viewportWidth must be greater than 0, but got ${width}`);
  }
  let height = defaultViewportHeight;
  if (target.viewportHeight) {
    preferMaximizedWindow = false;
    assert(
      typeof target.viewportHeight === 'number',
      'viewportHeight must be a number',
    );
    height = Number.parseInt(target.viewportHeight as unknown as string, 10);
    assert(
      height > 0,
      `viewportHeight must be greater than 0, but got ${height}`,
    );
  }
  let dpr = defaultViewportScale;
  if (target.viewportScale) {
    preferMaximizedWindow = false;
    assert(
      typeof target.viewportScale === 'number',
      'viewportScale must be a number',
    );
    dpr = Number.parseInt(target.viewportScale as unknown as string, 10);
    assert(dpr > 0, `viewportScale must be greater than 0, but got ${dpr}`);
  }
  const viewportConfig = {
    width,
    height,
    deviceScaleFactor: dpr,
  };

  const headed = preference?.headed || preference?.keepWindow;

  // only maximize window in headed mode
  preferMaximizedWindow = preferMaximizedWindow && !!headed;

  // launch the browser
  if (headed && process.env.CI === '1') {
    console.warn(
      'you are probably running headed mode in CI, this will usually fail.',
    );
  }
  // do not use 'no-sandbox' on windows https://www.perplexity.ai/search/how-to-solve-this-with-nodejs-dMHpdCypRa..JA8TkQzbeQ
  const isWindows = process.platform === 'win32';
  const args = [
    ...(isWindows ? [] : ['--no-sandbox', '--disable-setuid-sandbox']),
    '--disable-features=HttpsFirstBalancedModeAutoEnable',
    '--disable-features=PasswordLeakDetection',
    '--disable-save-password-bubble',
    `--user-agent="${ua}"`,
    preferMaximizedWindow
      ? '--start-maximized'
      : `--window-size=${width},${height + 200}`, // add 200px for the address bar
  ];

  launcherDebug(
    'launching browser with viewport, headed',
    headed,
    'viewport',
    viewportConfig,
    'args',
    args,
    'preference',
    preference,
  );

  // Launch options for puppeteer
  const launchOptions = {
    headless: !headed,
    defaultViewport: viewportConfig,
    args,
    acceptInsecureCerts: target.acceptInsecureCerts,
  };

  let browser;

  // Check if puppeteer-extra is available and if stealth or adblocker is enabled
  if (puppeteerExtra && (preference?.enableStealth || preference?.enableAdBlocker)) {
    launcherDebug('Using puppeteer-extra with plugins');

    // Add stealth plugin if enabled
    if (preference?.enableStealth && StealthPlugin) {
      launcherDebug('Adding stealth plugin');
      puppeteerExtra.use(StealthPlugin());
    }

    // Add adblocker plugin if enabled
    if (preference?.enableAdBlocker && AdblockerPlugin) {
      const adBlockerOptions = preference.adBlockerOptions || {};
      const blockTrackers = adBlockerOptions.blockTrackers !== false; // Default to true

      launcherDebug('Adding adblocker plugin with options:', {
        blockTrackers,
        path: adBlockerOptions.path
      });

      const adblockerPlugin = AdblockerPlugin({
        blockTrackers,
      });

      // Load custom rules if provided
      if (adBlockerOptions.path) {
        try {
          const customRules = readFileSync(adBlockerOptions.path, 'utf-8');
          adblockerPlugin.setRules(customRules);
        } catch (error) {
          console.warn(`Failed to load custom adblock rules from ${adBlockerOptions.path}:`, error);
        }
      }

      puppeteerExtra.use(adblockerPlugin);
    }

    // Launch browser with puppeteer-extra
    browser = await puppeteerExtra.launch(launchOptions);
  } else {
    // Fall back to standard puppeteer if plugins are not available or not enabled
    launcherDebug('Using standard puppeteer');
    browser = await puppeteer.launch(launchOptions);
  }

  freeFn.push({
    name: 'puppeteer_browser',
    fn: () => {
      if (!preference?.keepWindow) {
        if (isWindows) {
          setTimeout(() => {
            browser.close();
          }, 800);
        } else {
          browser.close();
        }
      }
    },
  });

  const pages = await browser.pages();
  const page = pages[0];
  // await page.setUserAgent(ua);
  // await page.setViewport(viewportConfig);

  if (target.cookie) {
    const cookieFileContent = readFileSync(target.cookie, 'utf-8');
    await page.setCookie(...JSON.parse(cookieFileContent));
  }

  const waitForNetworkIdleTimeout =
    typeof target.waitForNetworkIdle?.timeout === 'number'
      ? target.waitForNetworkIdle.timeout
      : defaultWaitForNetworkIdleTimeout;

  try {
    await page.goto(target.url);
    if (waitForNetworkIdleTimeout > 0) {
      await page.waitForNetworkIdle({
        timeout: waitForNetworkIdleTimeout,
      });
    }
  } catch (e) {
    if (
      typeof target.waitForNetworkIdle?.continueOnNetworkIdleError ===
        'boolean' &&
      !target.waitForNetworkIdle?.continueOnNetworkIdleError
    ) {
      const newError = new Error(`failed to wait for network idle: ${e}`, {
        cause: e,
      });
      throw newError;
    }
    const newMessage = `failed to wait for network idle after ${waitForNetworkIdleTimeout}ms, but the script will continue.`;
    console.warn(newMessage);
  }

  return { page, freeFn };
}

export async function puppeteerAgentForTarget(
  target: AcabaiYamlScriptWebEnv,
  preference?: {
    headed?: boolean;
    keepWindow?: boolean;
    testId?: string;
    cacheId?: string;
    enableStealth?: boolean;
    enableAdBlocker?: boolean;
    adBlockerOptions?: {
      path?: string;
      blockTrackers?: boolean;
    };
  },
) {
  // Merge stealth and adblocker options from target and preference
  // Preference options take precedence over target options
  const enableStealth = preference?.enableStealth ?? (target as any).enableStealth ?? false;
  const enableAdBlocker = preference?.enableAdBlocker ?? (target as any).enableAdBlocker ?? false;
  const adBlockerOptions = preference?.adBlockerOptions ?? (target as any).adBlockerOptions;

  // Launch page with merged options
  const { page, freeFn } = await launchPuppeteerPage(target, {
    ...preference,
    enableStealth,
    enableAdBlocker,
    adBlockerOptions,
  });

  // prepare Puppeteer agent with extended options
  const agent = new PuppeteerAgent(page, {
    autoPrintReportMsg: false,
    testId: preference?.testId,
    cacheId: preference?.cacheId,
    aiActionContext: target.aiActionContext,
    forceSameTabNavigation:
      typeof target.forceSameTabNavigation !== 'undefined'
        ? target.forceSameTabNavigation
        : true, // true for default in yaml script
    // Pass stealth and adblocker options
    enableStealth,
    enableAdBlocker,
    adBlockerOptions,
  });

  freeFn.push({
    name: 'midscene_puppeteer_agent',
    fn: () => agent.destroy(),
  });

  return { agent, freeFn };
}
