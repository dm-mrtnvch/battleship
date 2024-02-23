import {CustomWebSocket, webSocketServer} from "../../index"
import {rooms} from "../data"
import {respondToGame} from "../responses"
import {Commands} from "../types"
import {isUserExist} from "./userRegistration"

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

export const addRoom = (ws: CustomWebSocket) => {
  const user = {
    name: isUserExist(ws.userId)?.name,
    index: isUserExist(ws.userId)?.index,
  }

  const id = rooms.size + 1
  const newRoom = {
    roomId: id,
    roomUsers: [user]
  }

  const wsOfAllUsersInRoom: CustomWebSocket[] = []
  ws.computerOpponent = false
  wsOfAllUsersInRoom.push(ws)

  const room = {
    id,
    users: wsOfAllUsersInRoom,
  }

  rooms.set(id, room)
  return newRoom
}

export const createGameRoom = (ws: CustomWebSocket) => {
  const roomData = addRoom(ws)
  webSocketServer.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      respondToGame(Commands.UPDATE_ROOM, JSON.stringify([roomData]), client)
    }
  })
}
