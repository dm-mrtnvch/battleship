import {CustomWebSocket, webSocketServer} from "../../index"
import {game, hitsOfShips, playersShips, rooms, shipsBoard, users} from "../data"
import {respondToGame} from "../responses"
import {Attack, Commands} from "../types"
import {ENEMY_PC} from "./botController"
import {isUserExist} from "./userRegistration"

export const saveAttack = (x: number, y: number, set: Set<string>) => {
  set.add(`x${x}y${y}`)
}

export const wasAttackExecuted = (x: number, y: number, set: Set<string>) => {
  return set.has(`x${x}y${y}`)
}


export const executeAttack = (type: Commands, data: string, ws: CustomWebSocket) => {
  const {x, y, gameId, indexPlayer} = JSON.parse(data)
  const players = rooms.get(gameId)?.users
  const enemy: any = players && players.filter((player) => player.id !== ws.id)[0]

  if (ws.id !== ENEMY_PC && indexPlayer === game.get(gameId)?.idxOfActivePlayer) {
    if (!wasAttackExecuted(x, y, enemy.madeAttacks)) {
      saveAttack(x, y, enemy.madeAttacks)
      const status: any = targetHitCheck(enemy, playersShips.get(enemy.id), x, y, indexPlayer, ws)
      players?.forEach((user) => {
        const nextTurnToPlayer: number = (status === Attack.Shot
          || status === Attack.Killed) ? indexPlayer
          : (isUserExist(enemy.id)?.index)

        game.set(gameId, {
          gameCounter: 2,
          idxOfActivePlayer: nextTurnToPlayer,
        })

        const response = {
          position: {
            x: x,
            y: y,
          },
          currentPlayer: indexPlayer,
          status: status,
        }
        respondToGame(type, JSON.stringify(response), user)
        respondToGame(Commands.TURN, JSON.stringify({
          currentPlayer: nextTurnToPlayer,
        }), user)
      })
    }

    if (enemy && enemy.readyState === WebSocket.CLOSED
      || isLoser(playersShips.get(enemy.id.toString()))) {
      countVictories(ws.id)

      players.forEach((user) => {
        respondToGame(Commands.FINISH, JSON.stringify({
          winPlayer: isUserExist(ws.id)?.index,
        }), user)
      })

      hitsOfShips.clear()
      playersShips.clear()
      game.set(gameId, {
        gameCounter: 0,
        idxOfActivePlayer: 0,
      })
      rooms.clear()

      webSocketServer.clients?.forEach((client: CustomWebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          const victoryBoardArray: any = []
          users.forEach((user) =>
            victoryBoardArray.push({
              name: user.name,
              wins: user.victories,
            }),
          )
          respondToGame(Commands.UPDATE_WINNERS, JSON.stringify(victoryBoardArray), client)
        }
      })
    }
  }

  if (ws.id === ENEMY_PC && indexPlayer === game.get(gameId)?.idxOfActivePlayer) {
    const botPC_ID = rooms.get(1).users[1].id
    const status: any = targetHitCheck(enemy, playersShips.get(ws.id), x, y, indexPlayer, ws)
    players?.forEach((user) => {
      const nextTurnToPlayer: number = (status === Attack.Shot
        || status === Attack.Killed) ? indexPlayer
        : (isUserExist(enemy.id)?.index as number)

      game.set(gameId, {
        gameCounter: 2,
        idxOfActivePlayer: nextTurnToPlayer,
      })

      const response = {
        position: {
          x: x,
          y: y,
        },
        currentPlayer: indexPlayer,
        status: status,
      }
      respondToGame(type, JSON.stringify(response), user)
      respondToGame(Commands.TURN, JSON.stringify({
        currentPlayer: nextTurnToPlayer,
      }), user)
    })

    if (enemy && enemy.readyState === WebSocket.CLOSED
      || isLoser(playersShips.get(botPC_ID.toString()))) {
      countVictories(ws.id)
      players.forEach((user) => {
        respondToGame(Commands.FINISH, JSON.stringify({
          winPlayer: isUserExist(ws.id)?.index,
        }), user)
      })
      hitsOfShips.clear()
      playersShips.clear()
      game.set(gameId, {
        gameCounter: 0,
        idxOfActivePlayer: 0,
      })
      rooms.clear()

      webSocketServer.clients?.forEach((client: CustomWebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          const victoryBoardArray = []
          users.forEach((user) =>
            victoryBoardArray.push({
              name: user.name,
              wins: user.victories,
            }),
          )
          respondToGame(Commands.UPDATE_WINNERS, JSON.stringify(victoryBoardArray), client)
        }
      })
    }
  }
}

export const targetHitCheck = (enemy: any, ships: any, x: number, y: number, indexPlayer: number, ws: CustomWebSocket) => {
  const isGameVsPC = rooms.get(1).users[0].isGameVsPC
  const botPC_ID = isGameVsPC && rooms.get(1).users[1].id
  const enemyID: string = isGameVsPC ? botPC_ID : enemy.id
  let poolS = []

  const currentBoard = shipsBoard.get(enemyID)

  let cells: number[][]
  if (x === 0 && y === 0) {
    cells = [[x, y + 1], [x + 1, y], [x + 1, y + 1]]
  } else if (x === 9 && y === 0) {
    cells = [[x - 1, y], [x - 1, y + 1], [x, y + 1]]
  } else if (x === 9 && y === 9) {
    cells = [[x - 1, y], [x, y - 1], [x - 1, y - 1]]
  } else if (x === 0 && y === 9) {
    cells = [[x + 1, y], [x, y - 1], [x + 1, y - 1]]
  } else if (x === 0 && (y !== 0 && y !== 9)) {
    cells = [[x + 1, y], [x, y - 1], [x + 1, y - 1], [x + 1, y + 1], [x, y + 1]]
  } else if (y === 0 && (x !== 0 && x !== 9)) {
    cells = [[x + 1, y], [x + 1, y + 1], [x, y + 1], [x - 1, y + 1], [x - 1, y]]
  } else if (x === 9 && (y !== 0 && y !== 9)) {
    cells = [[x, y - 1], [x - 1, y - 1], [x - 1, y], [x - 1, y + 1], [x, y + 1]]
  } else if (y === 9 && (x !== 0 && x !== 9)) {
    cells = [[x - 1, y], [x - 1, y - 1], [x, y - 1], [x + 1, y - 1], [x + 1, y]]
  } else {
    cells = [[x, y - 1], [x, y + 1], [x + 1, y], [x + 1, y - 1], [x + 1, y + 1], [x - 1, y], [x - 1, y - 1], [x - 1, y + 1]]
  }

  if (ws.id !== ENEMY_PC && currentBoard) {
    switch (currentBoard[y][x]) {
      case ('S'):
        shipsBoard.get(enemyID)[y][x] = 'K'
        console.log('Killed Small ship')
        cells.forEach(cell => {
          makeResponsePool(cell[0], cell[1], indexPlayer, poolS)
          saveAttack(cell[0], cell[1], enemy.madeAttacks)
        })
        poolS.forEach(p => respondToGame(Commands.ATTACK, JSON.stringify(p), ws))
        poolS.length = 0
        break
      case ('M'): {
        shipsBoard.get(enemyID)[y][x] = 'K'
        cells.forEach(cell => {
          if (shipsBoard.get(enemyID)[cell[1]][cell[0]] === 'K') {
            console.log('Killed Middle ship')
          }
        })
        break
      }
      case ('L'): {
        shipsBoard.get(enemyID)[y][x] = 'K'
        break
      }
      case ('H'): {
        shipsBoard.get(enemyID)[y][x] = 'K'
        break
      }
    }
  }

  function hitCheck(ship: any) {
    const sizeHorizontal = ship.direction === false ? ship.length - 1 : 0
    const sizeVertical = ship.direction === true ? ship.length - 1 : 0
    if (
      x >= ship.position.x
      && x <= ship.position.x + sizeHorizontal
      && y >= ship.position.y
      && y <= ship.position.y + sizeVertical
    ) {
      if (!hitsOfShips?.get(enemyID)?.has(`${x}*${y}`) && ship.hitCapacity) {
        ship.hitCapacity--
      }
      const madeHits = hitsOfShips.get(enemyID)
      const newHits = madeHits?.add(`${x}*${y}`)
      hitsOfShips.set(enemyID, newHits as Set<string>)
      return true
    } else {
      return false
    }
  }
  if (ships) {
    return ships.some(hitCheck) ? Attack.Shot : Attack.Miss
  }
}

export function makeResponsePool(x: number, y: number, indexPlayer: number, poolArr: any): void {
  const response = {
    position: {
      x: x,
      y: y
    },
    currentPlayer: indexPlayer,
    status: Attack.Miss,
  }
  poolArr.push(response)
}

export const isLoser = (playersShipsCollection: any | undefined): boolean => playersShipsCollection && playersShipsCollection.every((ship) => ship.hitCapacity === 0)


export const countVictories = (name: string): void => {
  const idxOfWinner: number = users.findIndex((user) => user.name === name)
  users[idxOfWinner].victories++
}
