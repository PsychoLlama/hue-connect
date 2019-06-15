/* eslint-disable no-underscore-dangle */
import Bridge from '../Bridge';

jest.useFakeTimers();

describe('Bridge', () => {
  let bridge, ip, axios;
  const deviceName = 'my-awesome-device';
  const appName = 'my-awesome-app-name';

  beforeEach(() => {
    axios = {
      get: jest.fn(async () => ({})).mockReturnValue({ data: [] }),
      post: jest
        .fn(async () => ({}))
        .mockReturnValue({
          data: [
            {
              success: { username: 'bob' },
            },
          ],
        }),
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

  describe('connect()', () => {
    it('sends the registration details', async () => {
      await bridge.connect({ appName, deviceName });

      expect(axios.post).toHaveBeenCalledWith(`http://${ip}/api/`, {
        devicetype: `${appName}#${deviceName}`,
      });
    });

    it('throws if the app name is omitted', async () => {
      const spy = jest.fn();
      await bridge.connect({ deviceName }).catch(spy);

      expect(spy).toHaveBeenCalled();

      const { message } = spy.mock.calls[0][0];
      expect(message).toMatch(/app/i);
      expect(message).toMatch(/name/i);
    });

    it('throws if the device name is omitted', async () => {
      const spy = jest.fn();
      await bridge.connect({ appName }).catch(spy);

      expect(spy).toHaveBeenCalled();

      const { message } = spy.mock.calls[0][0];
      expect(message).toMatch(/device/i);
      expect(message).toMatch(/name/i);
    });

    it('throws if the payload contains an error', async () => {
      const error = { type: 101, address: '/', description: 'Lolz' };
      const errors = Promise.resolve({
        data: [{ error }],
      });

      const spy = jest.fn();
      axios.post.mockReturnValueOnce(errors);

      await bridge.connect({ appName, deviceName }).catch(spy);

      expect(spy).toHaveBeenCalledWith(expect.any(Error));
      const [result] = spy.mock.calls[0];

      expect(result.code).toBe(error.type);
      expect(result.address).toBe(error.address);
      expect(result.message).toBe(error.description);
    });

    it('resolves with the token if successful', async () => {
      const success = { username: 'JsfewsC-Ae-FkjzdeNCKjopPFECKAjLSDUJVB-iz' };
      const response = Promise.resolve({
        data: [{ success }],
      });

      axios.post.mockReturnValue(response);

      const result = await bridge.connect({ appName, deviceName });

      expect(result).toEqual(success.username);
    });
  });
});
