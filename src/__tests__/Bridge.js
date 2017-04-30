/* eslint-disable no-underscore-dangle */
import Bridge from '../Bridge';

jest.useFakeTimers();

describe('Bridge', () => {
  let bridge, ip, axios;
  const deviceName = 'my-awesome-device';
  const appName = 'my-awesome-app-name';

  beforeEach(() => {
    axios = {
      get: jest.fn(async () => ({})),
      post: jest.fn(async () => ({})),
    };

    ip = '192.168.1.42';
    bridge = new Bridge({ ip, axios });
  });

  it('contains the bridge address', () => {
    expect(bridge.ip).toBe(ip);
  });

  it('sets the default axios interface', () => {
    const bridge = new Bridge({ ip });

    expect(bridge._axios).toBeTruthy();
  });

  it('throws if the IP is omitted', () => {
    const fail = () => new Bridge({ axios });

    expect(fail).toThrow(/ip/i);
  });

  it('sends the registration information', async () => {
    await bridge.registerOnce({ appName, deviceName });

    expect(axios.post).toHaveBeenCalledWith(`http://${ip}/`, {
      devicetype: `${appName}#${deviceName}`,
    });
  });

  it('throws if the app name is omitted', async () => {
    const spy = jest.fn();
    await bridge.registerOnce({ deviceName }).catch(spy);

    expect(spy).toHaveBeenCalled();

    const {message} = spy.mock.calls[0][0];
    expect(message).toMatch(/app/i);
    expect(message).toMatch(/name/i);
  });

  it('throws if the device name is omitted', async () => {
    const spy = jest.fn();
    await bridge.registerOnce({ appName }).catch(spy);

    expect(spy).toHaveBeenCalled();

    const {message} = spy.mock.calls[0][0];
    expect(message).toMatch(/device/i);
    expect(message).toMatch(/name/i);
  });
});
