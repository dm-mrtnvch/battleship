import {controller} from "./src/actions/handleControllers";
import {httpServer} from './src/http_server'
import {WebSocketServer} from "ws"
import dotenv from 'dotenv'
import {WebSocket} from 'ws'
import {Commands} from "./src/types"

const PORT_HTTP = 8080
const PORT_WSS = 3000

export interface IMessage {
  command: Commands
  content: string
  messageId: number
}

export type CustomWebSocket = WebSocket & {
  id: string
  madeAttacks: Set<string>
  aliveStatus?: boolean
  computerOpponent?: boolean
}

const keepAlive = function() {
  this.aliveStatus = true
}

console.log(`HTTP server operational on PORT: ${PORT_HTTP}`)
httpServer.listen(PORT_HTTP)
console.log(`WebSocket server active on PORT: ${PORT_WSS}`)

export const webSocketServer = new WebSocketServer({port: PORT_WSS})

const keepAliveInterval: NodeJS.Timeout = setInterval(function ping() {
  webSocketServer.clients.forEach(function each(ws: CustomWebSocket) {
    if (!ws.aliveStatus) return ws.terminate();

    ws.aliveStatus = false;
    ws.ping();
  });
}, 1000);

webSocketServer.on('connection', (ws: CustomWebSocket) => {
  console.log('Client connected to WebSocket server');
  ws.aliveStatus = true;
  ws.on('error', console.error);
  ws.on('pong', keepAlive);
  ws.on('message', (rawData: string) => {
    const message = JSON.parse(rawData.toString());
    const { type, data } = message;
    console.log(`Received action: ${type}. With data: ${data}`);
    controller(type, data, ws);
  });
});
webSocketServer.on('close', function close() {
  clearInterval(keepAliveInterval);
});


process.on('SIGINT', () => {
  clearInterval(keepAliveInterval);
  webSocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log('Client disconnected from WebSocket server');
      client.close();
    }
  });
  httpServer.close();
  webSocketServer.close();
  process.exit();
});
