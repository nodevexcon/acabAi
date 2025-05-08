import type { PlanningActionParamScroll } from './types';

export interface LocateOption {
  prompt?: string;
  deepThink?: boolean; // only available in vl model
}

export interface DetailedLocateParam extends LocateOption {
  prompt: string;
}

export interface scrollParam {
  direction: 'down' | 'up' | 'right' | 'left';
  scrollType: 'once' | 'untilBottom' | 'untilTop' | 'untilRight' | 'untilLeft';
  distance?: null | number; // distance in px
}

export interface AcabaiYamlScript {
  target?: AcabaiYamlScriptWebEnv;
  web?: AcabaiYamlScriptWebEnv;
  android?: AcabaiYamlScriptAndroidEnv;
  tasks: AcabaiYamlTask[];
}

export interface AcabaiYamlTask {
  name: string;
  flow: AcabaiYamlFlowItem[];
  continueOnError?: boolean;
}

export interface AcabaiYamlScriptEnvBase {
  output?: string;
  aiActionContext?: string;
}

export interface AcabaiYamlScriptWebEnv extends AcabaiYamlScriptEnvBase {
  // for web only
  serve?: string;
  url: string;

  // puppeteer only
  userAgent?: string;
  acceptInsecureCerts?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  viewportScale?: number;
  waitForNetworkIdle?: {
    timeout?: number;
    continueOnNetworkIdleError?: boolean; // should continue if failed to wait for network idle, true for default
  };
  cookie?: string;
  forceSameTabNavigation?: boolean; // if track the newly opened tab, true for default in yaml script

  // puppeteer-extra plugins
  enableStealth?: boolean; // Enable puppeteer-stealth plugin to avoid detection
  enableAdBlocker?: boolean; // Enable adblocker plugin to block ads
  adBlockerOptions?: {
    path?: string; // Path to custom adblock rules file
    blockTrackers?: boolean; // Block trackers in addition to ads, default true
  };

  // bridge mode config
  bridgeMode?: false | 'newTabWithUrl' | 'currentTab';
  closeNewTabsAfterDisconnect?: boolean;
}

export interface AcabaiYamlScriptAndroidEnv
  extends AcabaiYamlScriptEnvBase {
  // The Android device ID to connect to, optional, will use the first device if not specified
  deviceId?: string;

  // The URL or app package to launch, optional, will use the current screen if not specified
  launch?: string;
}

export type AcabaiYamlScriptEnv =
  | AcabaiYamlScriptWebEnv
  | AcabaiYamlScriptAndroidEnv;

export interface AcabaiYamlFlowItemAIAction {
  ai?: string; // this is the shortcut for aiAction
  aiAction?: string;
  aiActionProgressTips?: string[];
}

export interface AcabaiYamlFlowItemAIAssert {
  aiAssert: string;
}

export interface AcabaiYamlFlowItemAIQuery {
  aiQuery: string;
  name?: string;
}

export interface AcabaiYamlFlowItemAINumber {
  aiNumber: string;
  name?: string;
}

export interface AcabaiYamlFlowItemAINString {
  aiString: string;
  name?: string;
}

export interface AcabaiYamlFlowItemAIBoolean {
  aiBoolean: string;
  name?: string;
}

export interface AcabaiYamlFlowItemAILocate {
  aiLocate: string;
  name?: string;
}

export interface AcabaiYamlFlowItemAIWaitFor {
  aiWaitFor: string;
  timeout?: number;
}

export interface AcabaiYamlFlowItemAITap extends LocateOption {
  aiTap: string;
}

export interface AcabaiYamlFlowItemAIHover extends LocateOption {
  aiHover: string;
}

export interface AcabaiYamlFlowItemAIInput extends LocateOption {
  aiInput: string; // value to input
  locate: string; // where to input
}

export interface AcabaiYamlFlowItemAIKeyboardPress extends LocateOption {
  aiKeyboardPress: string;
  locate?: string; // where to press, optional
}

export interface AcabaiYamlFlowItemAIScroll
  extends LocateOption,
    PlanningActionParamScroll {
  aiScroll: null;
  locate?: string; // which area to scroll, optional
}

export interface AcabaiYamlFlowItemEvaluateJavaScript {
  javascript: string;
  name?: string;
}

export interface AcabaiYamlFlowItemSleep {
  sleep: number;
}

export type AcabaiYamlFlowItem =
  | AcabaiYamlFlowItemAIAction
  | AcabaiYamlFlowItemAIAssert
  | AcabaiYamlFlowItemAIQuery
  | AcabaiYamlFlowItemAIWaitFor
  | AcabaiYamlFlowItemAITap
  | AcabaiYamlFlowItemAIHover
  | AcabaiYamlFlowItemAIInput
  | AcabaiYamlFlowItemAIKeyboardPress
  | AcabaiYamlFlowItemAIScroll
  | AcabaiYamlFlowItemSleep;

export interface FreeFn {
  name: string;
  fn: () => void;
}

export interface ScriptPlayerTaskStatus extends AcabaiYamlTask {
  status: ScriptPlayerStatusValue;
  currentStep?: number;
  totalSteps: number;
  error?: Error;
}

export type ScriptPlayerStatusValue = 'init' | 'running' | 'done' | 'error';
