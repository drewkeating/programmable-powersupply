# Programmable DC Powersupply

Simple webview to emulate Programmable DC Power supply output.

Interfaces with serial device for reading/writing power supply data.

See: `https://github.com/serialport/node-serialport`

Hardware tested: 
  Kiprim DC310S, which appears to be a re-branded OWON SPE3103.
  Kiprim DC605S, which appears to be a re-branded OWON SPE6053.

## Tech

Node
Websockets

## Instructions

Run `node index.js` to interface with serial device, and deploy websocket requests. See device data for more.

Visit `index.html` to receive websocket requests, which update UI

### Testing

Run `node test.js` to continuously generate a randomize sequence of data that will immediately satisfy `index.html` client for testing.

## Options

Visit `index.html?d=1` to enable optional display output.

## TODO

- Make `y axis` line scales be dynamic and not static (according to amp curve)
- Improve left to right scrolling
- Guarantee refresh rate for client
- Graphical fixes for accuracy


Example of a webview of the Kiprim DC310S:
![Screenshot of an example of the webview.](https://github.com/joeyslack/programmable-powersupply/blob/master/public/images/screenshot.png?raw=true)