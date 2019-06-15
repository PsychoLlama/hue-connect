import DiscoveryService from 'hue-bridge-discovery';
import invariant from 'invariant';
import Bridge from './Bridge';

/**
 * Searches for Hue Bridges.
 * @class  BridgeSearch
 */
export class BridgeSearch {
  /**
   * @param  {Function} callback - Invoked for each discovered bridge.
   */
  constructor(callback) {
    invariant(
      typeof callback === 'function',
      `BridgeSearch(...) expected a callback, was given "${callback}".`
    );

    const search = new DiscoveryService();

    search.on(DiscoveryService.EVENT_HUE_DISCOVERED, this._createBridge);

    search.start();

    this._callback = callback;
    this._search = search;
  }

  /**
   * @param  {Object} discovery - Discovered bridge.
   * @param  {Object} discovery.address - Bridge IP address.
   * @return {undefined}
   */
  _createBridge = discovery => {
    const bridge = new Bridge({ ip: discovery.address });

    this._callback(bridge);
  };

  /**
   * Cancels the search.
   * @return {undefined}
   */
  cancel() {
    this._search.removeListener(
      DiscoveryService.EVENT_HUE_DISCOVERED,
      this._createBridge
    );

    this._search.stop();
  }
}

/**
 * Instantiates a new discovery service.
 * @return {BridgeSearch} - Search for the bridge.
 */
export default function locateHueBridges(...args) {
  return new BridgeSearch(...args);
}
