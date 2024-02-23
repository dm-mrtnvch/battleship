import {Commands} from "../types"
import {executeAttack} from "./attackController"
import {StartPlayWithBot} from "./botController"
import {finishController} from "./finishController"
import {CommandsType} from "./handleControllers"
import {randomAttack} from "./randomAttackController"
import {createGameRoom} from "./roomsController"
import {addShips} from "./shipsController"
import {addUsersToRoom} from "./userController"
import {userRegistration} from "./userRegistration"

export const commands: CommandsType = new Map(
  [
    [Commands.REGISTRATION, (type, data, ws) => userRegistration(type, data, ws)],
    [Commands.CREATE_ROOM, (type, data, ws) => createGameRoom(ws)],
    [Commands.ADD_USER_TO_ROOM, (type, data, ws) => addUsersToRoom(data, ws)],
    [Commands.ADD_SHIPS, (type, data, ws) => addShips(data, ws)],
    [Commands.ATTACK, (type, data, ws) => executeAttack(type, data, ws)],
    [Commands.RANDOM_ATTACK, (type, data, ws) => randomAttack(type, data, ws)],
    [Commands.SINGLE_PLAY, (type, data, ws) => StartPlayWithBot(ws)],
    [Commands.FINISH, (type, data, ws) => finishController(type, data, ws)],
  ]
)
