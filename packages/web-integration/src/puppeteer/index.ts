import { PageAgent, type PageAgentOpt } from '@/common/agent';
import { forceClosePopup } from '@/common/utils';
import { getDebug } from '@acabai/shared/logger';
import type { Page as PuppeteerPage } from 'puppeteer';
import { WebPage as PuppeteerWebPage } from './page';
const debug = getDebug('puppeteer:agent');

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
      forceClosePopup(page, debug);
    }
  }
}

export { overrideAIConfig } from '@acabai/shared/env';

// Do NOT export this since it requires puppeteer
// export { puppeteerAgentForTarget } from './agent-launcher';
