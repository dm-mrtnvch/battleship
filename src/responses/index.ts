import {CustomWebSocket} from "../../index"
import {Commands} from "../types"

export const respondToGame = (type: Commands, data: string, ws: CustomWebSocket | WebSocket) => {
  const response = JSON.stringify({
    id: 0,
    type,
    data,
  })
  ws.send(response)
}

export const respondToGameWithPC = async (name: string, pcIndex: number, ws: CustomWebSocket) => {
  if (ws.readyState !== ws.OPEN) {
    try {
      await waitForOpenConnection(ws)
      PCRegistrationSuccess(name, pcIndex, ws)
    } catch (err) {
      console.error('error: ', err)
    }
  } else {
    PCRegistrationSuccess(name, pcIndex, ws)
  }
}

export const PCRegistrationSuccess = (name: string, pcIndex: number, ws: CustomWebSocket) => {
  ws.id = name
  ws.send(
    JSON.stringify({
      type: Commands.REGISTRATION,
      data: JSON.stringify({
        index: pcIndex,
        name: name,
        error: false,
        errorText: '',
      }),
    }),
  )
}

export const waitForOpenConnection = async (ws: CustomWebSocket) => {
  return new Promise<void>((resolve, reject) => {
    let attempt = 0
    const maxAttempts = 5

    const intervalId = setInterval(() => {
      if (attempt > maxAttempts - 1) {
        reject(new Error('max attempts reached'))
        clearInterval(intervalId)
      }
      if (ws.readyState === ws.OPEN) {
        resolve()
        clearInterval(intervalId)
      }
      attempt++
    }, 300)
  })
}
