// config keys
export const ACABAI_OPENAI_INIT_CONFIG_JSON =
  'ACABAI_OPENAI_INIT_CONFIG_JSON';
export const ACABAI_MODEL_NAME = 'ACABAI_MODEL_NAME';
export const ACABAI_LANGSMITH_DEBUG = 'ACABAI_LANGSMITH_DEBUG';
export const ACABAI_DEBUG_AI_PROFILE = 'ACABAI_DEBUG_AI_PROFILE';
export const ACABAI_DEBUG_AI_RESPONSE = 'ACABAI_DEBUG_AI_RESPONSE';
export const ACABAI_DANGEROUSLY_PRINT_ALL_CONFIG =
  'ACABAI_DANGEROUSLY_PRINT_ALL_CONFIG';
export const ACABAI_DEBUG_MODE = 'ACABAI_DEBUG_MODE';
export const ACABAI_MCP_USE_PUPPETEER_MODE =
  'ACABAI_MCP_USE_PUPPETEER_MODE';

export const ACABAI_FORCE_DEEP_THINK = 'ACABAI_FORCE_DEEP_THINK';

export const ACABAI_OPENAI_SOCKS_PROXY = 'ACABAI_OPENAI_SOCKS_PROXY';
export const OPENAI_API_KEY = 'OPENAI_API_KEY';
export const OPENAI_BASE_URL = 'OPENAI_BASE_URL';
export const OPENAI_MAX_TOKENS = 'OPENAI_MAX_TOKENS';

export const ACABAI_ADB_PATH = 'ACABAI_ADB_PATH';

export const ACABAI_CACHE = 'ACABAI_CACHE';
export const ACABAI_USE_VLM_UI_TARS = 'ACABAI_USE_VLM_UI_TARS';
export const ACABAI_USE_QWEN_VL = 'ACABAI_USE_QWEN_VL';
export const ACABAI_USE_DOUBAO_VISION = 'ACABAI_USE_DOUBAO_VISION';
export const ACABAI_USE_GEMINI = 'ACABAI_USE_GEMINI';
export const ACABAI_USE_VL_MODEL = 'ACABAI_USE_VL_MODEL';
export const MATCH_BY_POSITION = 'MATCH_BY_POSITION';
export const ACABAI_API_TYPE = 'MIDSCENE-API-TYPE';
export const ACABAI_REPORT_TAG_NAME = 'ACABAI_REPORT_TAG_NAME';

export const ACABAI_USE_AZURE_OPENAI = 'ACABAI_USE_AZURE_OPENAI';
export const ACABAI_AZURE_OPENAI_SCOPE = 'ACABAI_AZURE_OPENAI_SCOPE';
export const ACABAI_AZURE_OPENAI_INIT_CONFIG_JSON =
  'ACABAI_AZURE_OPENAI_INIT_CONFIG_JSON';

export const AZURE_OPENAI_ENDPOINT = 'AZURE_OPENAI_ENDPOINT';
export const AZURE_OPENAI_KEY = 'AZURE_OPENAI_KEY';
export const AZURE_OPENAI_API_VERSION = 'AZURE_OPENAI_API_VERSION';
export const AZURE_OPENAI_DEPLOYMENT = 'AZURE_OPENAI_DEPLOYMENT';

export const ACABAI_USE_ANTHROPIC_SDK = 'ACABAI_USE_ANTHROPIC_SDK';
export const ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY';

export const ACABAI_RUN_DIR = 'ACABAI_RUN_DIR';

// @deprecated
export const OPENAI_USE_AZURE = 'OPENAI_USE_AZURE';

export const allConfigFromEnv = () => {
  return {
    [ACABAI_OPENAI_INIT_CONFIG_JSON]:
      process.env[ACABAI_OPENAI_INIT_CONFIG_JSON] || undefined,
    [ACABAI_MODEL_NAME]: process.env[ACABAI_MODEL_NAME] || undefined,
    [ACABAI_DEBUG_MODE]: process.env[ACABAI_DEBUG_MODE] || undefined,
    [ACABAI_FORCE_DEEP_THINK]:
      process.env[ACABAI_FORCE_DEEP_THINK] || undefined,
    [ACABAI_LANGSMITH_DEBUG]:
      process.env[ACABAI_LANGSMITH_DEBUG] || undefined,
    [ACABAI_DEBUG_AI_PROFILE]:
      process.env[ACABAI_DEBUG_AI_PROFILE] || undefined,
    [ACABAI_DEBUG_AI_RESPONSE]:
      process.env[ACABAI_DEBUG_AI_RESPONSE] || undefined,
    [ACABAI_DANGEROUSLY_PRINT_ALL_CONFIG]:
      process.env[ACABAI_DANGEROUSLY_PRINT_ALL_CONFIG] || undefined,
    [OPENAI_API_KEY]: process.env[OPENAI_API_KEY] || undefined,
    [OPENAI_BASE_URL]: process.env[OPENAI_BASE_URL] || undefined,
    [OPENAI_MAX_TOKENS]: process.env[OPENAI_MAX_TOKENS] || undefined,
    [OPENAI_USE_AZURE]: process.env[OPENAI_USE_AZURE] || undefined,
    [ACABAI_ADB_PATH]: process.env[ACABAI_ADB_PATH] || undefined,
    [ACABAI_CACHE]: process.env[ACABAI_CACHE] || undefined,
    [MATCH_BY_POSITION]: process.env[MATCH_BY_POSITION] || undefined,
    [ACABAI_REPORT_TAG_NAME]:
      process.env[ACABAI_REPORT_TAG_NAME] || undefined,
    [ACABAI_OPENAI_SOCKS_PROXY]:
      process.env[ACABAI_OPENAI_SOCKS_PROXY] || undefined,
    [ACABAI_USE_AZURE_OPENAI]:
      process.env[ACABAI_USE_AZURE_OPENAI] || undefined,
    [ACABAI_AZURE_OPENAI_SCOPE]:
      process.env[ACABAI_AZURE_OPENAI_SCOPE] || undefined,
    [ACABAI_AZURE_OPENAI_INIT_CONFIG_JSON]:
      process.env[ACABAI_AZURE_OPENAI_INIT_CONFIG_JSON] || undefined,
    [ACABAI_USE_ANTHROPIC_SDK]:
      process.env[ACABAI_USE_ANTHROPIC_SDK] || undefined,
    [ACABAI_USE_VLM_UI_TARS]:
      process.env[ACABAI_USE_VLM_UI_TARS] || undefined,
    [ACABAI_USE_QWEN_VL]: process.env[ACABAI_USE_QWEN_VL] || undefined,
    [ACABAI_USE_DOUBAO_VISION]:
      process.env[ACABAI_USE_DOUBAO_VISION] || undefined,
    [ACABAI_USE_GEMINI]: process.env[ACABAI_USE_GEMINI] || undefined,
    [ACABAI_USE_VL_MODEL]: process.env[ACABAI_USE_VL_MODEL] || undefined,
    [ANTHROPIC_API_KEY]: process.env[ANTHROPIC_API_KEY] || undefined,
    [AZURE_OPENAI_ENDPOINT]: process.env[AZURE_OPENAI_ENDPOINT] || undefined,
    [AZURE_OPENAI_KEY]: process.env[AZURE_OPENAI_KEY] || undefined,
    [AZURE_OPENAI_API_VERSION]:
      process.env[AZURE_OPENAI_API_VERSION] || undefined,
    [AZURE_OPENAI_DEPLOYMENT]:
      process.env[AZURE_OPENAI_DEPLOYMENT] || undefined,
    [ACABAI_MCP_USE_PUPPETEER_MODE]:
      process.env[ACABAI_MCP_USE_PUPPETEER_MODE] || undefined,
    [ACABAI_RUN_DIR]: process.env[ACABAI_RUN_DIR] || undefined,
  };
};

let globalConfig: Partial<ReturnType<typeof allConfigFromEnv>> | null = null;

const getGlobalConfig = () => {
  if (globalConfig === null) {
    globalConfig = allConfigFromEnv();
  }
  return globalConfig;
};

// import { UITarsModelVersion } from '@ui-tars/shared/constants';
export enum UITarsModelVersion {
  V1_0 = '1.0',
  V1_5 = '1.5',
  DOUBAO_1_5_15B = 'doubao-1.5-15B',
  DOUBAO_1_5_20B = 'doubao-1.5-20B',
}

export const uiTarsModelVersion = (): UITarsModelVersion | false => {
  if (vlLocateMode() !== 'vlm-ui-tars') {
    return false;
  }

  const versionConfig: any = getAIConfig(ACABAI_USE_VLM_UI_TARS);
  if (versionConfig === '1' || versionConfig === 1) {
    return UITarsModelVersion.V1_0;
  }
  if (versionConfig === 'DOUBAO' || versionConfig === 'DOUBAO-1.5') {
    return UITarsModelVersion.DOUBAO_1_5_20B;
  }
  return `${versionConfig}` as UITarsModelVersion;
};

export const vlLocateMode = ():
  | 'qwen-vl'
  | 'doubao-vision'
  | 'gemini'
  | 'vl-model' // not actually in use
  | 'vlm-ui-tars'
  | false => {
  const enabledModes = [
    getAIConfigInBoolean(ACABAI_USE_DOUBAO_VISION) &&
      'ACABAI_USE_DOUBAO_VISION',
    getAIConfigInBoolean(ACABAI_USE_QWEN_VL) && 'ACABAI_USE_QWEN_VL',
    getAIConfigInBoolean(ACABAI_USE_VLM_UI_TARS) &&
      'ACABAI_USE_VLM_UI_TARS',
    getAIConfigInBoolean(ACABAI_USE_GEMINI) && 'ACABAI_USE_GEMINI',
  ].filter(Boolean);

  if (enabledModes.length > 1) {
    throw new Error(
      `Only one vision mode can be enabled at a time. Currently enabled modes: ${enabledModes.join(', ')}. Please disable all but one mode.`,
    );
  }

  if (getAIConfigInBoolean(ACABAI_USE_QWEN_VL)) {
    return 'qwen-vl';
  }

  if (getAIConfigInBoolean(ACABAI_USE_DOUBAO_VISION)) {
    return 'doubao-vision';
  }

  if (getAIConfigInBoolean(ACABAI_USE_GEMINI)) {
    return 'gemini';
  }

  if (getAIConfigInBoolean(ACABAI_USE_VL_MODEL)) {
    return 'vl-model';
  }

  if (getAIConfigInBoolean(ACABAI_USE_VLM_UI_TARS)) {
    return 'vlm-ui-tars';
  }

  return false;
};

export const getAIConfig = (
  configKey: keyof ReturnType<typeof allConfigFromEnv>,
): string | undefined => {
  if (configKey === MATCH_BY_POSITION) {
    throw new Error(
      'MATCH_BY_POSITION is deprecated, use ACABAI_USE_VL_MODEL instead',
    );
  }

  return getGlobalConfig()[configKey]?.trim();
};

export const getAIConfigInBoolean = (
  configKey: keyof ReturnType<typeof allConfigFromEnv>,
) => {
  const config = getAIConfig(configKey) || '';
  if (/^(true|1)$/i.test(config)) {
    return true;
  }
  if (/^(false|0)$/i.test(config)) {
    return false;
  }
  return !!config.trim();
};

export const getAIConfigInJson = (
  configKey: keyof ReturnType<typeof allConfigFromEnv>,
) => {
  const config = getAIConfig(configKey);
  try {
    return config ? JSON.parse(config) : undefined;
  } catch (error: any) {
    throw new Error(
      `Failed to parse json config: ${configKey}. ${error.message}`,
      {
        cause: error,
      },
    );
  }
};

export const overrideAIConfig = (
  newConfig: Partial<ReturnType<typeof allConfigFromEnv>>,
  extendMode = false, // true: merge with global config, false: override global config
) => {
  for (const key in newConfig) {
    if (typeof key !== 'string') {
      throw new Error(`Failed to override AI config, invalid key: ${key}`);
    }
    if (typeof newConfig[key as keyof typeof newConfig] === 'object') {
      throw new Error(
        `Failed to override AI config, invalid value for key: ${key}, value: ${newConfig[key as keyof typeof newConfig]}`,
      );
    }
  }

  const currentConfig = getGlobalConfig();
  globalConfig = extendMode
    ? { ...currentConfig, ...newConfig }
    : { ...newConfig };
};
