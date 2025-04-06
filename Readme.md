# Programmable DC Powersupply

Simple webview to emulate Programmable DC Powersupply output.

Interfaces with serial device for reading/writing powersupply data.

See: `https://github.com/serialport/node-serialport`

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