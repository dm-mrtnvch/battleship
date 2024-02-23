import {CustomWebSocket} from "../../index"
import {Commands} from "../types"
import {commands} from "./commandsControllers"

export type CommandsType = Map<string, (type: Commands, data: string, ws: CustomWebSocket) => void>

export const controller = async(type: Commands, data: string, ws: CustomWebSocket) => {
  if (!type) return

  const handler = commands.get(type)

  try {
    if (handler) await handler(type, data, ws)
    else ws.send(JSON.stringify({ error: true, errorText: 'invalid request' }))
  } catch (error) {
    console.log("error: ", error.message)
  }
}
