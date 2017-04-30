# Hue-connect
*Easy setup for Philips Hue apps*

[![Travis branch](https://img.shields.io/travis/PsychoLlama/hue-connect/master.svg?style=flat-square)](https://travis-ci.org/PsychoLlama/hue-connect)
[![npm](https://img.shields.io/npm/v/hue-connect.svg?style=flat-square)](https://www.npmjs.com/package/hue-connect)

## Why
Because bridge discovery is weird and so is attaining an API token.

## Installing
It's published on npm.

```sh
# If you love speed
yarn add hue-connect

# Otherwise...
npm install --save hue-connect
```

Now you can use it in your project. It works with ES Module syntax or plain ol' `require`.

```js
// ES Modules
import discover from 'hue-connect'

// CommonJS
const discover = require('hue-connect')
```

## API
There are two functions exported from this module:

- `discover(callback)`
- `Bridge`

### Discovery
The main export from `hue-connect` is a function. Pass it a callback and it'll invoke it with every bridge it finds.

```js
import discover from 'hue-connect'

const search = discover((bridge) => {
  console.log('Found bridge:', bridge)
})
```

Once you no longer care about finding new bridges (like once you've attained a token), stop the bridge search using the `.cancel()` method.

```js
const search = discover((bridge) => {})

search.cancel()
```

> **Note:** Bridge discovery works because [this other module](https://www.npmjs.com/package/hue-bridge-discovery) is amazing.

### Bridge
A bridge is a simple way to get an API token from a hue bridge.

If you know the bridge IP address already, you can skip discovery and create an instance directly.

Bridges are created automatically when using `discover()`.

```js
import { Bridge } from 'hue-connect'

const bridge = new Bridge({
  ip: '192.168.1.42',
})
```

#### `bridge.connect()`
Attaining an API token is pretty straightforward. Call the `.connect` method and it returns a promise. If the user pressed the bridge button, you get a token.

```js
bridge.connect({
  appName: 'the-name-of-your-app',
  deviceName: 'the-computer-name-or-whatevs',
})
```

> **Note:** It wants the app and device name [because Hue likes that stuff](https://www.developers.meethue.com/documentation/getting-started). If you're just experimenting, you can make something up. But don't tell Hue I said that.

Assuming the user has pressed the button, the promise will resolve with your shiny new API token.

```js
bridge.connect({
  appName: 'illumination',
  deviceName: 'bob',
}).then((token) => {
  console.log('Awesome sauce!', token)
})
```

Otherwise the promise will reject horribly.

```js
bridge.connect({ appName, deviceName }).catch((error) => {
  console.log('Oh noes:', error.message)
  console.log('Secret error code:', error.code)
})
```

All the error codes are in [this giant table](https://www.developers.meethue.com/documentation/error-messages), but you might need to create a hue account to see 'em. The most common is `101` which means the user is lazy and just hasn't pressed the button.

## Examples
So you've seen all the docs. Here's some examples to tie it all together.

### Discovery
Finds all the local bridges and pings them once a second until the user presses the bridge button.

```js
const discover = require('hue-connect')

const search = discover(getToken)

async function getToken (bridge) {
  try {
    const token = await bridge.connect({
      appName: 'no-app-name',
      deviceName: 'computrz',
    })

    console.log('Success!')

    console.log({
      bridge: bridge.ip,
      token: token,
    })

    // Stop searching for new bridges.
    search.cancel()
  } catch (error) {

    // It's some weird error.
    if (error.code !== 101) {
      throw error
    }

    // User hasn't pressed the bridge button.
    // Try again in a second.
    setTimeout(getToken, 1000, bridge)
  }
}
```
