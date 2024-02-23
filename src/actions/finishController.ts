import {CustomWebSocket} from "../../index"
import {respondToGame} from "../responses"
import {Commands} from "../types"
import {isUserExist} from "./userRegistration"

export const finishController = (type: Commands, data: string, ws: CustomWebSocket) => {
  respondToGame(type, JSON.stringify({
    winPlayer: isUserExist(ws.id)?.index,
  }), ws)
}
