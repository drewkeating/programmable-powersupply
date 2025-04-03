# Multimeter

Simple webview to emulate multimeter output.

Interfaces with serial device for reading/writing multimeter data.

See: `https://github.com/serialport/node-serialport`

## Tech

Node
Websockets

## Instructions

Run `node index.js` to interface with serial device, and deploy websocket requests. See device data for more.

Visit `index.html` to receive websocket requests, which update UI

## Options

Visit `index.html?d=1` to enable optional display output.

## TODO

- Make `y axis` line scales be dynamic and not static (according to amp curve)
- Improve left to right scrolling
- Guarantee refresh rate for client
- Graphical fixes for accuracy