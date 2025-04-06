const WebSocket = require("ws")
const express = require("express")
const http = require("http")
const path = require("path")
const { SerialPort } = require("serialport")
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
const clients = new Set();

// Set up the serial port
const port = new SerialPort({
  path: "COM4", // Change this to your actual port
  baudRate: 115200,
});

// Serve the client page
app.use(express.static("public"));

// Track the current active task
let activeTask = 0;
let tasks = [
  'measure:voltage',
  'measure:current',
  'voltage',
  'current',
  'voltage:limit',
  'current:limit',
];

// Payload property metadata, persisted last value between subsequent updates
let power = 0;

// Hold all response data in array, mapped directly to named tasks above.
// responseData array should always hold the last received data for each named property/task by index increment (`activeTask` integer)
// Order matters, processed in order of tasks listed above
let responseData = new Array(tasks.length).fill(parseFloat("0.00").toFixed(3));

// Main serial request, executed on prio queue. 
// Returns timer ID
const readData = () => {
  return setTimeout(request_measure, 0, tasks[activeTask]);
}

// Construct payload for client side
let payload = { 
  timestamp: new Date().toISOString(), 
  voltage: responseData[0], 
  current: responseData[1], 
  power, 
  voltage_set: responseData[2], 
  current_set: responseData[3], 
  voltage_limit: responseData[4], 
  current_limit: responseData[5],
  status: responseData[0] && responseData[0] > 0 ? "Online" : "Offline",
};

let count = 0;
// Handle incoming data responses
// Designed to work on current 'activeTask' index
port.on("data", function (data) {
  if (data && data.toString().trim().length > 0) {
    responseData[activeTask] = parseFloat(data.toString().trim()).toFixed(3);

    // Special handling for dynamic data when we have 'measure:voltage', and 'measure:current' (index 0 & 1)
    // Calculate power and store it until index 0 & 1 are updated again
    if (activeTask == 1) {
      power = (parseFloat(responseData[0]) * parseFloat(responseData[1])).toFixed(3);
    }

    payload = { 
      timestamp: new Date().toISOString(), 
      voltage: responseData[0],
      current: responseData[1],
      power,
      voltage_set: responseData[2], 
      current_set: responseData[3], 
      voltage_limit: responseData[4], 
      current_limit: responseData[5],
      status: responseData[0] && responseData[0] > 0 ? "Online" : payload['status'],
    }
  }

  // Prepare next task
  activeTask++;

  // Last task completed ('current:limit')
  if (activeTask >= tasks.length) {
    // Point activeTask back to first task for repeat
    activeTask = 0;
    payload['status'] = responseData[0] && responseData[0] > 0 ? "Online" : "Offline";

    // The following will modify the task queue by prioritizing `measure:` commands over more static data
    // In this case there will be 10 `measure:` calls completed for every `voltage:limit`, which is updated 10 times less.
    // 10 is arbitrary threshold, modify as required, for as often as you want extra data. 
    count++
    if (count == 10) {
      tasks = [
        'measure:voltage',
        'measure:current',
        'voltage',
        'current',
        'voltage:limit',
        'current:limit',
      ];

      count = 0;
    }
    else {
      // Enable/disable high frequency tasks as desired
      tasks = [
        'measure:voltage',
        'measure:current',
        // 'voltage',
        // 'current',
        // 'voltage:limit',
        // 'current:limit',
      ];
    }
  }

  // Continuously read data
  return readData();
});

// Send request to serial port
const request_measure = (request) => {
  port.write(`${request}?\r\n`, function(error) {
    if (error) console.log("Request Measure Error:", msg);
  });
}

// Handle websocket client connection
wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.add(ws);
  
  // Kick start the data reading serial data for the first time
  readData();

  // Main event loop, constantly send data to client side on a regular timer
  // Note: This is optimistic in 100ms deliverability - we don't have a guarantee that all [6] data points
  // have been updated since last request, this depends on bandwidth of serial data - we are being optimistic
  const timer = setInterval(() => {
    // Send data to all connected clients, at every interval, steady stream of data sent to clients
    for (let client of clients) {
      client.send(JSON.stringify(payload));
    }
  }, 100); // decide appropriate duration for UI refresh rate. Websockets are fast

  // Cleanup on socket close
  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(timer);
    clients.delete(ws);
  });
});

// Listen on port
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

// Serve an HTML page for the client
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});