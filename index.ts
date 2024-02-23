import {controller} from "./src/actions/handleControllers";
import {httpServer} from './src/http_server'
import {WebSocketServer} from "ws"
import dotenv from 'dotenv'
import {WebSocket} from 'ws'
import {Commands} from "./src/types"
dotenv.config()

const PORT_HTTP = 8181
const PORT_WSS = 3000

export interface IMessage {
  command: Commands
  content: string
  messageId: number
}

export type CustomWebSocket = WebSocket & {
  id: string
  executedAttacks: Set<string>
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

const keepAliveInterval: NodeJS.Timeout = setInterval(function checkAlive() {
  webSocketServer.clients.forEach(function checkClient(client: CustomWebSocket) {
    if (!client.aliveStatus) return client.terminate()

    client.aliveStatus = false
    client.ping()
  })
}, 1000)

webSocketServer.on('connection', (client: CustomWebSocket) => {
  console.log('WebSocket server connection established')
  client.aliveStatus = true
  client.on('error', console.error)
  client.on('pong', keepAlive)
  client.on('message', (messageData: string) => {
    const message: any = JSON.parse(messageData)
    const { type, data } = message
    console.log(`Action received: ${message.command}. Data: ${message.content}`)
    controller(type, data, client);
  })
})

webSocketServer.on('close', () => {
  clearInterval(keepAliveInterval)
})


process.on('SIGINT', () => {
  clearInterval(keepAliveInterval)
  webSocketServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log('WebSocket server disconnection')
      client.close()
    }
  })
  httpServer.close()
  webSocketServer.close()
  process.exit()
})
