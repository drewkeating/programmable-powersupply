// Simple test suite for sending consistent data over websockets that `index.html` client expects
const WebSocket = require("ws")
const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const clients = new Set();

// Handle websocket client connection
wss.on("connection", (ws) => {
  clients.add(ws);
  // Kick start the data reading serial data for the first time
  // readData();

  let c = 0, v = 0;
  // Main event loop, constantly send data to client side on a regular timer
  // Note: This is optimistic in 100ms deliverability - we don't have a guarantee that all [6] data points
  // have been updated since last request, this depends on bandwidth of serial data - we are being optimistic
  const timer = setInterval(() => {
    
    // Randomize data generation so it at least looks halfway realistic
    if (c == 0) {
      c = Math.floor(Math.random() * (60 - 0 + 1) + 0);
    } else {
      c = Math.floor(Math.random() * ((c+1) - (c-1) + 1) + (c-1));
    }

    if (v == 0) {
      v = Math.floor(Math.random() * (60 - 0 + 1) + 0);
    } else {
      v = Math.floor(Math.random() * ((v+1) - (v-1) + 1) + (v-1));
    }

    let payload = {
      current: c,
      voltage: v,
      power: (parseFloat(c) * parseFloat(v)).toFixed(3),
      voltage_set: v,
      current_set: c,
      voltage_limit: 120,
      current_limit: 60,
      status: 'Online' // force status
    
    }
    
      // Toggle hide/show of chart for offline status.
      // if (data.status == "Offline") e('.chart').classList.add('hidden');
      // else e('.chart').classList.remove('hidden');

    // Send data to all connected clients, at every interval, steady stream of data sent to clients
    for (let client of clients) {
      client.send(JSON.stringify(payload));
    }
  }, 100); // decide appropriate duration for UI refresh rate. Websockets are fast

  // Cleanup on socket close
  ws.on("close", () => {
    clearInterval(timer);
    clients.delete(ws);
  });
});


// Listen on port
server.listen(3000, () => {
  console.log("Generating test data and sending over Websocket localhost:3000");
});

// Serve an HTML page for the client
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});