import {CustomWebSocket} from "../../index"
import {game, playersShips, rooms, shipsBoard} from "../data"
import {respondToGame} from "../responses"
import {Commands} from "../types"

export const buildShipsBoard = (id: string, shipsArray) => {
  const fieldSize = 10
  const field = []

  for (let i = 0; i < fieldSize; i++) {
    field[i] = new Array(fieldSize).fill('.')
  }

  shipsArray.forEach((ship) => {
    const { position, direction, type, length } = ship
    const { x, y } = position
    if (direction) {
      for (let i = y; i < y + length; i++) {
        if (i >= 0 && i < fieldSize && x >= 0 && x < fieldSize) {
          field[i][x] = type[0].toUpperCase()
        }
      }
    } else {
      for (let i = x; i < x + length; i++) {
        if (y >= 0 && y < fieldSize && i >= 0 && i < fieldSize) {
          field[y][i] = type[0].toUpperCase()
        }
      }
    }
  })

  return field
}

export const initializeGame = (gameID: number, playerIndex: number, ws: CustomWebSocket) => {
  if (game.get(gameID)?.gameCounter < 2) {
    setTimeout((gameID: number, playerIndex: number, ws: CustomWebSocket) => initializeGame(gameID, playerIndex, ws), 1000)
  } else {
    const players = rooms.get(gameID)?.users
    players?.forEach((user) => {
      respondToGame(Commands.START_GAME, JSON.stringify({
        ships: playersShips.get(user.id),
        currentPlayerIndex: playerIndex,
      }), user)

      const gameData = game.get(gameID) || {
        gameCounter: 0,
        idxOfActivePlayer: 0,
      }
      gameData && (gameData.idxOfActivePlayer = playerIndex)
      game.set(gameID, gameData)

      respondToGame(Commands.TURN, JSON.stringify({
        currentPlayer: playerIndex,
      }), ws)
    })
  }
}

export const addShips = (data: string, ws: CustomWebSocket) => {
  console.log(data)
  const { indexPlayer, gameId, ships } = JSON.parse(data)
  let count: number | undefined = game.get(gameId)?.gameCounter
  count ? count++ : count = 1
  game.set(gameId, {
    gameCounter: count,
    idxOfActivePlayer: 0,
  })
  const shipsBoardArray = [...ships]
  shipsBoard.set(ws.id, buildShipsBoard(ws.id, shipsBoardArray))

  const shipsBoardArrayWithHitsHistory = ships.map((ship) => {
    return {
      ...ship,
      hitCapacity: ship.length,
    }
  })
  playersShips.set(ws.id, shipsBoardArrayWithHitsHistory)
  initializeGame(gameId, indexPlayer, ws)
}
