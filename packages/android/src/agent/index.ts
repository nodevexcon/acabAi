import { PageAgent, type PageAgentOpt } from '@acabai/web/agent';
import { AndroidDevice } from '../page';

import { vlLocateMode } from '@acabai/shared/env';
import { getConnectedDevices, type AdbConnectionOptions } from '../utils';

import { debugPage } from '../page';

export class AndroidAgent extends PageAgent<AndroidDevice> {
  constructor(page: AndroidDevice, opts?: PageAgentOpt) {
    super(page, opts);

    if (!vlLocateMode()) {
      throw new Error(
        'Android Agent only supports vl-model. https://midscenejs.com/choose-a-model.html',
      );
    }
  }

  async launch(uri: string): Promise<void> {
    const device = this.page;
    await device.launch(uri);
  }
}

export interface AgentFromAdbDeviceOptions extends PageAgentOpt {
  adbConnectionOptions?: AdbConnectionOptions;
}

export async function agentFromAdbDevice(
  deviceId?: string,
  opts?: AgentFromAdbDeviceOptions,
) {
  const adbConnectionOptions = opts?.adbConnectionOptions;

  if (!deviceId) {
    const devices = await getConnectedDevices(adbConnectionOptions);

    deviceId = devices[0].udid;

    debugPage(
      'deviceId not specified, will use the first device (id = %s)',
      deviceId,
    );
  }

  const page = new AndroidDevice(deviceId, adbConnectionOptions);

  await page.connect();

  return new AndroidAgent(page, opts);
}
