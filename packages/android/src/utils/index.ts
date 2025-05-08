import { ADB, type Device } from 'appium-adb';
import { debugPage } from '../page';

export interface AdbConnectionOptions {
  host?: string;
  port?: number;
}

export async function getConnectedDevices(options?: AdbConnectionOptions): Promise<Device[]> {
  try {
    const adbOptions: any = {
      adbExecTimeout: 60000,
    };

    // If remote ADB host is specified, configure for remote connection
    if (options?.host) {
      debugPage(`Using remote ADB server at ${options.host}:${options.port || 5037}`);
      adbOptions.remoteAdbHost = options.host;
      if (options.port) {
        adbOptions.adbPort = options.port;
      }
    }

    const adb = await ADB.createADB(adbOptions);
    const devices = await adb.getConnectedDevices();

    debugPage(`Found ${devices.length} connected devices: `, devices);

    return devices;
  } catch (error: any) {
    console.error('Failed to get device list:', error);
    throw new Error(
      `Unable to get connected Android device list, please check https://acabai.com/integrate-with-android.html#faq : ${error.message}`,
      {
        cause: error,
      },
    );
  }
}
