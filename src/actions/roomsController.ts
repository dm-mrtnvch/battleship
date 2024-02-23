import {CustomWebSocket} from "../../index"
import {rooms} from "../data"
import {respondToGame} from "../responses"
import {Commands} from "../types"

export const getGameRooms = (ws: CustomWebSocket) => {
  if (rooms.size > 0) {
    const allAvailableRooms: any = []
    rooms.forEach((room, roomId) => {
      const roomData = {
        roomId,
        roomUsers: room.users,
      }
      allAvailableRooms.push(roomData)
    })
    respondToGame(Commands.UPDATE_ROOM, JSON.stringify(allAvailableRooms), ws)
  }
}
