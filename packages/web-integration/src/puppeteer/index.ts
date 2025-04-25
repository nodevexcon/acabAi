import { PageAgent, type PageAgentOpt } from '@/common/agent';
import type { Page as PuppeteerPage } from 'puppeteer';
import { WebPage as PuppeteerWebPage } from './page';

export { WebPage as PuppeteerWebPage } from './page';

/**
 * Extended options for PuppeteerAgent
 */
export interface PuppeteerAgentOptions extends PageAgentOpt {
  /**
   * Enable puppeteer-stealth plugin to avoid detection
   * @default false
   */
  enableStealth?: boolean;

  /**
   * Enable adblocker plugin to block ads
   * @default false
   */
  enableAdBlocker?: boolean;

  /**
   * Options for adblocker plugin
   */
  adBlockerOptions?: {
    /**
     * Path to custom adblock rules file
     */
    path?: string;

    /**
     * Block trackers in addition to ads
     * @default true
     */
    blockTrackers?: boolean;
  };
}

export class PuppeteerAgent extends PageAgent<PuppeteerWebPage> {
  /**
   * Whether stealth mode is enabled
   */
  readonly stealthEnabled: boolean;

  /**
   * Whether ad blocker is enabled
   */
  readonly adBlockerEnabled: boolean;

  /**
   * Ad blocker options
   */
  readonly adBlockerOptions?: {
    path?: string;
    blockTrackers?: boolean;
  };

  constructor(page: PuppeteerPage, opts?: PuppeteerAgentOptions) {
    const webPage = new PuppeteerWebPage(page);
    super(webPage, opts);

    // Initialize plugin options
    this.stealthEnabled = opts?.enableStealth || false;
    this.adBlockerEnabled = opts?.enableAdBlocker || false;
    this.adBlockerOptions = opts?.adBlockerOptions;

    const { forceSameTabNavigation = true } = opts ?? {};

    if (forceSameTabNavigation) {
      page.on('popup', async (popup) => {
        if (!popup) {
          console.warn(
            'got a popup event, but the popup is not ready yet, skip',
          );
          return;
        }
        const url = await popup.url();
        console.log(`Popup opened: ${url}`);
        await popup.close(); // Close the newly opened TAB
        await page.goto(url);
      });
    }
  }
}

export { overrideAIConfig } from '@midscene/shared/env';

// Do NOT export this since it requires puppeteer
// export { puppeteerAgentForTarget } from './agent-launcher';
