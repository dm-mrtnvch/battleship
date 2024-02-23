import {CustomWebSocket} from "../../index"
import {Commands} from "../types"

export const respondToGame = (type: Commands, data: string, ws: CustomWebSocket | WebSocket) => {
  const response = JSON.stringify({
    id: 0,
    type,
    data,
  });
  ws.send(response)
}
