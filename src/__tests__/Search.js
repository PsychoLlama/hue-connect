/* eslint-disable require-jsdoc, no-underscore-dangle, camelcase */
import discover from '../Search';
import Bridge from '../Bridge';

describe('Bridge search', () => {
  let search, callback, service;
  const eventName = 'event constant';

  beforeEach(() => {
    const DiscoveryService = jest.fn(() => {
      service = {
        removeListener: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        on: jest.fn(),
      };

      return service;
    });

    DiscoveryService.EVENT_HUE_DISCOVERED = eventName;

    discover.__Rewire__('DiscoveryService', DiscoveryService);
    callback = jest.fn();
    search = discover(callback);
  });

  afterEach(() => {
    discover.__ResetDependency__('DiscoveryService');
  });

  it('returns a search', () => {
    expect(search).toEqual(expect.any(Object));
    expect(search.cancel).toEqual(expect.any(Function));
  });

  it('creates a new bridge search', () => {
    expect(service).toBeTruthy();
    expect(service.on).toHaveBeenCalledWith(
      eventName,
      expect.any(Function)
    );
    expect(service.start).toHaveBeenCalled();
  });

  it('terminates the search when cancel is called', () => {
    expect(service.removeListener).not.toHaveBeenCalled();

    search.cancel();

    expect(service.removeListener).toHaveBeenCalledWith(
      eventName,
      expect.any(Function)
    );

    expect(service.stop).toHaveBeenCalled();
  });

  it('creates a bridge instance for each discovered bridge', () => {
    const ip = '192.168.1.211';

    service.on.mock.calls[0][1]({
      hue_bridgeid: '1234ABCDEFFEBAD1',
      address: ip,
    });

    expect(callback).toHaveBeenCalledWith(expect.any(Bridge));
  });

  it('throws if the callback is not a function', () => {
    const fail = () => discover();

    expect(fail).toThrow(/callback/i);
  });
});
