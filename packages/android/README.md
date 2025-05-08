# @midscene/android

Android automation library for Midscene. Automate UI actions, extract data, and perform assertions using AI.

See https://midscenejs.com/ for details.

## Documentation

### Basic Usage

```typescript
import { AndroidAgent, AndroidDevice } from '@midscene/android';

// Create a device instance with a specific device ID
const device = new AndroidDevice('device_serial_id');
const agent = new AndroidAgent(device);

// Launch a URL or app
await agent.launch('https://www.example.com'); // Open a website
await agent.launch('com.android.settings'); // Open an app by package name
```

### Using ADB Device

```typescript
import { agentFromAdbDevice } from '@midscene/android';

// Get the first connected device
const agent = await agentFromAdbDevice();

// Or specify a device ID
const agent = await agentFromAdbDevice('device_serial_id');
```

### Remote ADB Connection

You can connect to a remote ADB server instead of using the local ADB server:

#### Using Options with agentFromAdbDevice

```typescript
import { agentFromAdbDevice } from '@midscene/android';

// Connect to a remote ADB server
const agent = await agentFromAdbDevice(undefined, {
  adbConnectionOptions: {
    host: '192.168.1.100',
    port: 5037
  }
});
```

#### Direct Device Creation

```typescript
import { AndroidAgent, AndroidDevice } from '@midscene/android';

// Create a device with remote ADB connection
const device = new AndroidDevice('device_serial_id', {
  host: '192.168.1.100',
  port: 5037
});

const agent = new AndroidAgent(device);
```

## Environment Variables

- `MIDSCENE_ADB_PATH` - Custom path to ADB executable

## License

Midscene is MIT licensed.