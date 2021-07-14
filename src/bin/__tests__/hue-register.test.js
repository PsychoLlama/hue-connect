/* eslint-disable no-plusplus */
import discover from '../../Search';
import '../hue-register';

jest.useFakeTimers('legacy');
jest.mock('../../Search', () => {
  const mock = jest.genMockFromModule('../../Search');
  mock.default.mockReturnValue({
    cancel: jest.fn(),
  });

  // Forgive me.
  process.argv[2] = 'fake-app-name';

  return mock;
});

const defer = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { resolve, reject, promise };
};

describe('Hue register', () => {
  const [register] = discover.mock.calls[0];
  const { cancel } = discover();
  const createConnectionFailError = () => {
    const error = new Error('Testing failed bridge authentication.');
    error.code = 101;

    return error;
  };

  let ip = 1;
  const createBridge = (shouldAuthenticate = true) => ({
    ip: ip++,
    connect: jest.fn(async () => {
      if (shouldAuthenticate) {
        return 'tok3n';
      }

      throw createConnectionFailError();
    }),
  });

  beforeEach(() => {
    cancel.mockReset();
  });

  it('initiates a search', () => {
    expect(discover).toHaveBeenCalledWith(expect.any(Function));
  });

  it('attempts a connection', async () => {
    const bridge = createBridge();
    const promise = register(bridge);

    expect(bridge.connect).toHaveBeenCalled();

    await promise;
  });

  it('retries if the connection fails', async () => {
    const bridge = createBridge(false);
    await register(bridge);

    expect(setTimeout).toHaveBeenCalled();

    bridge.connect.mockReset();
    setTimeout.mock.calls[0][0](bridge);

    expect(bridge.connect).toHaveBeenCalled();
  });

  it('cancels the search if the connection succeeds', async () => {
    const bridge = createBridge();
    await register(bridge);

    expect(cancel).toHaveBeenCalled();
  });

  it('does not continue pinging other bridges', async () => {
    setTimeout.mockReturnValue('TIMEOUT_ID');
    const bridge2 = createBridge(false);
    const bridge1 = createBridge();
    bridge2.ip += 1;

    await register(bridge2);
    await register(bridge1);

    // Already authenticated with bridge1.
    expect(clearTimeout).toHaveBeenCalledWith('TIMEOUT_ID');
  });

  // Edge case: two bridges searching, one succeeds and clears the retry
  // timeouts, but the other is waiting for a bridge response and hasn't
  // registered for a retry yet.
  it('stops retrying if another bridge succeeded while in flight', async () => {
    const bridge2 = createBridge();
    const bridge1 = createBridge();
    const deferred = defer();
    bridge2.connect.mockReturnValue(deferred.promise);
    bridge2.ip += 1;

    const inFlight = register(bridge2);
    await register(bridge1);

    setTimeout.mockReset();
    deferred.reject(createConnectionFailError());
    await inFlight;

    expect(setTimeout).not.toHaveBeenCalled();
  });
});
