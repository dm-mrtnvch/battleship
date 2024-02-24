import {CustomWebSocket} from "../../index"
import {game, playersShips, rooms, users} from "../data"
import {respondToGame, respondToGameWithPC} from "../responses"
import {Attack, Commands} from "../types"
import {randomInteger} from "../utils"
import {saveAttack, targetHitCheck, wasAttackExecuted} from "./attackController"
import {isUserExist} from "./userRegistration"
import {WebSocket} from 'ws';

export const ENEMY_PC = 'Enemy_PC'

export const ShipCollection = [
  '{"ships":[{"position":{"x":1,"y":9},"direction":false,"type":"medium","length":2},{"position":{"x":3,"y":3},"direction":true,"type":"large","length":3},{"position":{"x":7,"y":0},"direction":true,"type":"large","length":3},{"position":{"x":5,"y":6},"direction":false,"type":"small","length":1},{"position":{"x":5,"y":2},"direction":false,"type":"small","length":1},{"position":{"x":8,"y":4},"direction":true,"type":"huge","length":4},{"position":{"x":0,"y":2},"direction":false,"type":"medium","length":2},{"position":{"x":8,"y":9},"direction":true,"type":"small","length":1},{"position":{"x":4,"y":8},"direction":false,"type":"small","length":1},{"position":{"x":1,"y":7},"direction":false,"type":"medium","length":2}]}',

  '{"ships":[{"position":{"x":2,"y":0},"direction":true,"type":"medium","length":2},{"position":{"x":4,"y":5},"direction":false,"type":"huge","length":4},{"position":{"x":4,"y":0},"direction":true,"type":"large","length":3},{"position":{"x":0,"y":8},"direction":false,"type":"small","length":1},{"position":{"x":6,"y":3},"direction":false,"type":"medium","length":2},{"position":{"x":0,"y":3},"direction":false,"type":"large","length":3},{"position":{"x":3,"y":7},"direction":false,"type":"medium","length":2},{"position":{"x":7,"y":8},"direction":false,"type":"small","length":1},{"position":{"x":0,"y":0},"direction":true,"type":"small","length":1},{"position":{"x":1,"y":5},"direction":false,"type":"small","length":1}]}',

  '{"ships":[{"position":{"x":1,"y":5},"direction":true,"length":2,"hitCapacity":2},{"position":{"x":8,"y":6},"direction":false,"length":1,"hitCapacity":1},{"position":{"x":0,"y":1},"direction":true,"length":3,"hitCapacity":3},{"position":{"x":3,"y":5},"direction":true,"length":4,"hitCapacity":4},{"position":{"x":6,"y":6},"direction":true,"length":1,"hitCapacity":1},{"position":{"x":0,"y":8},"direction":false,"length":1,"hitCapacity":1},{"position":{"x":6,"y":4},"direction":false,"length":2,"hitCapacity":2},{"position":{"x":7,"y":0},"direction":true,"length":2,"hitCapacity":2},{"position":{"x":2,"y":3},"direction":false,"length":1,"hitCapacity":1},{"position":{"x":2,"y":1},"direction":false,"length":3,"hitCapacity":3}]}',

  '{"ships":[{"position":{"x":3,"y":0},"direction":true,"type":"medium","length":2},{"position":{"x":8,"y":8},"direction":false,"type":"small","length":1},{"position":{"x":6,"y":8},"direction":true,"type":"medium","length":2},{"position":{"x":0,"y":9},"direction":false,"type":"small","length":1},{"position":{"x":2,"y":8},"direction":false,"type":"large","length":3},{"position":{"x":5,"y":4},"direction":true,"type":"large","length":3},{"position":{"x":7,"y":4},"direction":true,"type":"medium","length":2},{"position":{"x":5,"y":2},"direction":false,"type":"huge","length":4},{"position":{"x":0,"y":4},"direction":false,"type":"small","length":1},{"position":{"x":0,"y":2},"direction":false,"type":"small","length":1}]}',

  '{"ships":[{"position":{"x":9,"y":1},"direction":false,"type":"small","length":1},{"position":{"x":1,"y":0},"direction":true,"type":"small","length":1},{"position":{"x":8,"y":6},"direction":true,"type":"medium","length":2},{"position":{"x":6,"y":1},"direction":false,"type":"medium","length":2},{"position":{"x":2,"y":2},"direction":false,"type":"large","length":3},{"position":{"x":5,"y":8},"direction":true,"type":"small","length":1},{"position":{"x":3,"y":5},"direction":true,"type":"large","length":3},{"position":{"x":1,"y":5},"direction":true,"type":"huge","length":4},{"position":{"x":0,"y":2},"direction":false,"type":"small","length":1},{"position":{"x":5,"y":5},"direction":true,"type":"medium","length":2}]}'
]

export const StartPlayWithBot = async (ws: CustomWebSocket) => {
  ws.computerOpponent = true
  const wsPC: any = new WebSocket('ws://localhost:3000')
  wsPC.aliveStatus = true
  wsPC.madeAttacks = new Set()
  const id = rooms.size + 1
  const pcIndex = users.length + 1
  const wsOfAllUsersInRoom: CustomWebSocket[] = []
  const madeAttacksByPC: Set<string> = new Set()
  const randomShipIdx = randomInteger(0,ShipCollection.length - 1)
  const ships = JSON.parse(ShipCollection[randomShipIdx]).ships

  wsOfAllUsersInRoom.push(ws)

  await respondToGameWithPC(ENEMY_PC, pcIndex, wsPC)
  wsOfAllUsersInRoom.push(wsPC)
  const room = {
    id,
    users: wsOfAllUsersInRoom,
  }

  rooms.set(id, room)
  game.set(id, {
    gameCounter: 1,
    idxOfActivePlayer: isUserExist(ws.id)?.index || 0
  })

  const shipsBoardArrayWithHitsHistory = ships.map((ship) => {
    return {
      ...ship,
      hitCapacity: ship.length,
    }
  })
  playersShips.set(ENEMY_PC, shipsBoardArrayWithHitsHistory)

  respondToGame(Commands.CREATE_GAME, JSON.stringify({
    idGame: id,
    idPlayer: isUserExist(ws.id)?.index,
  }), ws)

  wsPC.send(
    JSON.stringify({
      type: Commands.CREATE_GAME,
      data: JSON.stringify({
        idGame: id,
        idPlayer: +(isUserExist(ws.id)?.index) + 1,
      }),
      id: 0,
    }),
  )

  wsPC.send(
    JSON.stringify({
      type: Commands.START_GAME,
      data: JSON.stringify({
        ships: shipsBoardArrayWithHitsHistory,
        currentPlayerIndex: isUserExist(ENEMY_PC)?.index,
      }),
      id: 0,
    }),
  )

  respondToGame(Commands.TURN, JSON.stringify({
    currentPlayer: isUserExist(ws.id)?.index,
  }), ws)

  wsPC.send(
    JSON.stringify({
      type: Commands.TURN,
      data: JSON.stringify({
        currentPlayer: isUserExist(ws.id)?.index,
      }),
      id: 0,
    }),
  )

  const pcAttack = (wsPC: CustomWebSocket) => {
    if (pcIndex === game.get(id)?.idxOfActivePlayer) {
      let x: number = randomInteger(0,9)
      let y: number = randomInteger(0,9)
      if (wasAttackExecuted(x, y, madeAttacksByPC)) {
        while (wasAttackExecuted(x, y, madeAttacksByPC)) {
          x = randomInteger(0,9)
          y = randomInteger(0,9)
        }
      }
      saveAttack(x, y, madeAttacksByPC)

      const status = targetHitCheck(wsPC, playersShips.get(wsPC.id), x, y, pcIndex, wsPC)

      const nextTurnToPlayer: number =
        status === Attack.Shot ? pcIndex : (isUserExist(wsPC.id)?.index as number)

      game.set(id, {
        gameCounter: 2,
        idxOfActivePlayer: nextTurnToPlayer,
      })

      const attackResponseData = {
        position: {
          x: x,
          y: y,
        },
        currentPlayer: pcIndex,
        status: status,
      }
      respondToGame(Commands.ATTACK, JSON.stringify(attackResponseData), wsPC)
      respondToGame(Commands.TURN, JSON.stringify({ currentPlayer: nextTurnToPlayer }), wsPC)
    }
  }
  setInterval(() => pcAttack(ws), 5000)
}
