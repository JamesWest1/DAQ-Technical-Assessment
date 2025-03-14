import { clear, time } from "console";
import net from "net";
import { WebSocket, WebSocketServer } from "ws";

interface VehicleData {
  battery_temperature: number | string;
  timestamp: number;
}

const TCP_PORT = 12000;
const WS_PORT = 8080;
const tcpServer = net.createServer();
const websocketServer = new WebSocketServer({ port: WS_PORT });
const TEMP_UPPERBOUND = 80
const TEMP_LOWERBOUND = 20
const TIME_THRESHOLD = 5000 // 5000 ms
let tempQueue:number[] = [] // stores all timestamps that exceed TEMP_THRESHOLD in the last 5 seconds


const convertFromLatin1 = (latin1: string) => {
  return 1;
}

const updateTempInfo = (bat_temp:number, timestamp:number) => {
  if (bat_temp < TEMP_LOWERBOUND || bat_temp > TEMP_UPPERBOUND) tempQueue.push(timestamp);
  while (tempQueue.length !== 0 && timestamp - tempQueue[0] > TIME_THRESHOLD) {
    tempQueue.shift()
  }
}

const checkTemperatureError = (timestamp:number) => {
  let tempErrorStr = "Critical temperature consistently reached"
  if (tempQueue.length >= 3) {
    console.log({error: tempErrorStr, timestamp: timestamp})
    return tempErrorStr;
  }
  return "";
}

tcpServer.on("connection", (socket) => {
  console.log("TCP client connected");

  socket.on("data", (msg) => {
    const message: string = msg.toString();
    const vd:VehicleData = JSON.parse(message);
    if (typeof vd.battery_temperature === "string") {
      vd.battery_temperature = convertFromLatin1(vd.battery_temperature);
      return;
    }
    updateTempInfo(vd.battery_temperature, vd.timestamp)
    console.log(`Received: ${message}`);
    const errorMsg = checkTemperatureError(vd.timestamp) // prints error message if temp is exceeding the limit
    const sendValue = {battery_temperature: vd.battery_temperature, timestamp: vd.timestamp, errorMsg: errorMsg}
    // Send JSON over WS to frontend clients
    websocketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sendValue));
      }
    });
  });

  socket.on("end", () => {
    console.log("Closing connection with the TCP client");
  });

  socket.on("error", (err) => {
    console.log("TCP client error: ", err);
  });
});

websocketServer.on("listening", () =>
  console.log(`Websocket server started on port ${WS_PORT}`)
);

websocketServer.on("connection", async (ws: WebSocket) => {
  console.log("Frontend websocket client connected");
  ws.on("error", console.error);
});

tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});
