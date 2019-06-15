#!/usr/bin/env node
import { hostname } from 'os';
import assert from 'assert';

import discover from '../Search';

const appName = process.argv[2];
assert(appName, 'hue-register requires the name of your app.');

const deviceName = hostname()
  .replace(/[^a-z0-9 ]/gi, '')
  .replace(/ +/g, '-');

const printRegistration = registration => {
  const serialized = JSON.stringify(registration, null, 2);

  // eslint-disable-next-line no-process-env
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.log(serialized);
  }
};

const handshakes = Object.create(null);

// Cancelling unnecessary scheduled retries makes the search snappier.
const cancelAllRetries = () =>
  Object.keys(handshakes).forEach(key => {
    const handshake = handshakes[key];

    clearTimeout(handshake.retry);
    handshake.terminated = true;
  });

const search = discover(async function register(bridge) {
  const handshake = handshakes[bridge.ip] || { bridge, retry: null };
  handshakes[bridge.ip] = handshake;

  try {
    const token = await bridge.connect({ appName, deviceName });

    // Send the result to stdout.
    printRegistration({ token, ip: bridge.ip });

    search.cancel();
    cancelAllRetries();
  } catch (error) {
    // No idea what just happened.
    if (error.code !== 101) {
      throw error;
    }
  }

  // Handle cases where termination occured while bridge
  // registration request was in flight.
  if (handshake.terminated) {
    return;
  }

  // Button not pressed. Try again in a moment.
  handshake.retry = setTimeout(register, 1000, bridge);
});
