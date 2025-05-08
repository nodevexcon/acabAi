import type {
  MidsceneYamlScript as AcabaiYamlScript,
  MidsceneYamlScriptWebEnv as AcabaiYamlScriptWebEnv,
  MidsceneYamlTask as AcabaiYamlTask,
} from '@acabai/core';
import yaml from 'js-yaml';

export function buildYaml(
  env: AcabaiYamlScriptWebEnv,
  tasks: AcabaiYamlTask[],
) {
  const result: AcabaiYamlScript = {
    target: env,
    tasks,
  };

  return yaml.dump(result, {
    indent: 2,
  });
}
