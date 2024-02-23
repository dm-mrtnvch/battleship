import {CustomWebSocket} from "../../index"
import {rooms} from "../data"
import {respondToGame} from "../responses"
import {Commands} from "../types"
import {isUserExist} from "./userRegistration"

export const addUsersToRoom = (data: string, ws: CustomWebSocket) => {
  const roomIndex = JSON.parse(data).indexRoom
  const roomAdmin = rooms.get(roomIndex)?.users[0]

  if (roomAdmin.id !== ws.id) {
    const room = {
      id: roomIndex,
      users: [roomAdmin, ws]
    }
    rooms.set(roomIndex, room)
  }

  const currentRoomPlayers = rooms.get(roomIndex).users

  currentRoomPlayers.forEach((user: CustomWebSocket) => {
    const player = {
      idGame: roomIndex,
      idPlayer: isUserExist(user.id).index,
    }
    respondToGame(Commands.CREATE_ROOM, JSON.stringify(player), user)
  })
}
