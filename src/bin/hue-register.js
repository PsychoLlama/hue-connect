#!/usr/bin/env node
/* eslint-disable no-console */
import { hostname } from 'os';
import Search from '../Search';

const appName = process.argv[2];

if (!appName) {
  throw new Error('hue-register requires the name of your app.');
}

const deviceName = hostname()
  .replace(/[^a-z0-9 ]/gi, '')
  .replace(/ +/g, '-');

const options = { appName, deviceName };
const search = new Search(async function register (bridge) {
  try {
    const token = await bridge.connect(options);
    const auth = { token, ip: bridge.ip };
    const data = JSON.stringify(auth, null, 2);

    // Send the result to stdout.
    console.log(data);

    search.cancel();
  } catch (error) {

    // No idea what just happened.
    if (error.code !== 101) {
      throw error;
    }

    // Button not pressed. Try again in a moment.
    setTimeout(() => register(bridge), 1000);
  }
});
