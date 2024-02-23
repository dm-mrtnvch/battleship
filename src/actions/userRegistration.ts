import {CustomWebSocket} from "../../index"
import {users} from "../data"
import {Commands} from "../types"
import {getGameRooms} from "./roomsController"

export const isUserExist = (name: string) => users.find((user) => user.name === name)
export const isUserRegistered = (name: string, password: string) => users.some((user) => user.name === name && user.password === password)

export const addNewUser = (name: string, password: string, ws: CustomWebSocket) => {
  if (isUserExist(name)) return

  const user = {
    index: users.length + 1,
    name,
    password,
    victories: 0
  }
  users.push(user)
  ws.executedAttacks = new Set()
  registrationSuccess(name, '', ws)
}

export const registrationSuccess = (name: string, errMsg: string, ws: CustomWebSocket) => {
  ws.id = name
  ws.send(
    JSON.stringify({
      type: Commands.REGISTRATION,
      data: JSON.stringify({
        index: isUserExist(name)?.index,
        name: name,
        error: false,
        errorText: errMsg,
      }),
    }),
  )
}

export const registrationFail = (name: string, errMsg: string, ws: CustomWebSocket) => {
  ws.id = ''
  ws.send(
    JSON.stringify({
      type: Commands.REGISTRATION,
      data: JSON.stringify({
        id: '',
        name: '',
        error: true,
        errorText: errMsg,
      }),
    }),
  )
}

export const userRegistration = (type: Commands, data: string, ws: CustomWebSocket) => {
  const { name, password } = JSON.parse(data)
  if (!isUserExist(name)) {
    addNewUser(name, password, ws)
    getGameRooms(ws)
  } else {
    if (isUserRegistered(name, password)) {
      registrationSuccess(name, 'user already exist', ws)
    } else {
      registrationFail(name, 'user already exist', ws)
    }
  }
}
