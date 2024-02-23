import {CustomWebSocket} from "../../index"
import {game, rooms} from "../data"
import {Commands} from "../types"
import {randomInteger} from "../utils"
import {executeAttack, wasAttackExecuted} from "./attackController"

export const generateRandomAttackMove = (gameId: number, indexPlayer: number, ws: CustomWebSocket) => {
  let randomAttackData_JSON: string
  const players = rooms.get(gameId)?.users
  const enemy: any = players && players.filter((player) => player.id !== ws.id)[0]
  const random_X = randomInteger(0,9)
  const random_Y = randomInteger(0,9)

  if (indexPlayer === game.get(gameId)?.idxOfActivePlayer) {
    if (wasAttackExecuted(random_X, random_Y, enemy.madeAttacks) && enemy.madeAttacks.size < 100) {
      generateRandomAttackMove(gameId, indexPlayer, ws)
      return
    }

    randomAttackData_JSON = JSON.stringify({
      x: random_X,
      y: random_Y,
      gameId,
      indexPlayer
    })
  }
  return randomAttackData_JSON
}

export const randomAttackHandler = (type: Commands, data: string, ws: CustomWebSocket) => {
  const { gameId, indexPlayer} = JSON.parse(data)
  const randomAttackData_JSON = generateRandomAttackMove(gameId, indexPlayer, ws)
  executeAttack(Commands.ATTACK, randomAttackData_JSON, ws)
}
