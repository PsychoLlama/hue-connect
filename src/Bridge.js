import invariant from 'invariant';
import axiosDefault from 'axios';

/**
 * Creates an interface around a hue bridge.
 * @class
 */
export default class Bridge {

  /**
   * @param {Object} config - Various settings.
   * @param {String} ip - Bridge IP address.
   * @param {Object} [axios] - Axios HTTP interface.
   */
  constructor ({ ip, axios = axiosDefault }) {
    invariant(ip, `Bridge(...) expected an IP, was given "${ip}".`);

    this.url = `http://${ip}/`;
    this._axios = axios;
    this.ip = ip;
  }

  /**
   * @return {Object} - The bridge response.
   * @param  {Object} registration - Registration details.
   * @param  {String} registration.appName - Your app's name.
   * @param  {String} registration.deviceName - The device's name.
   * @return {Promise} - Resolves when the request is acknowledged.
   */
  async registerOnce ({ appName, deviceName }) {
    invariant(appName, 'App name required, but was not given.');
    invariant(deviceName, 'Device name required, but was not given.');

    const devicetype = `${appName}#${deviceName}`;
    const registration = {devicetype};

    await this._axios.post(this.url, registration);
  }
}
