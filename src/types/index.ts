export enum Commands {
  REGISTRATION = 'reg',
  CREATE_ROOM = 'create_room',
  CREATE_GAME = 'create_game',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  ADD_SHIPS = 'add_ships',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  SINGLE_PLAY = 'single_play',
  TURN = 'turn',
  FINISH = 'finish',
  START_GAME = 'start_game',
  UPDATE_ROOM = 'update_room',
  UPDATE_WINNERS = 'update_winners'
}

export enum Attack {
  Miss = 'miss',
  Killed = 'killed',
  Shot = 'shot'
}

export type AttackType = Attack.Miss | Attack.Killed | Attack.Shot

