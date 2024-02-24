import {CustomWebSocket} from "../../index"
import {Commands} from "../types"
import {commands} from "./commandsControllers"

export type CommandsType = Map<string, (type: Commands, data: string, ws: CustomWebSocket) => void>

export const controller = async(type: Commands, data: string, ws: CustomWebSocket) => {
  if (!type) return

  const handler = commands.get(type)
  if (handler) await handler(type, data, ws)


}
