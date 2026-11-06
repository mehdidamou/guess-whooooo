export const PLAYERS = ['sofia', 'taninna']

export const otherPlayer = (name) => (name === 'sofia' ? 'taninna' : 'sofia')

// Which player name does this device's uid hold in the room, if any?
export function whoAmI(room, uid) {
  if (!room?.players || !uid) return null
  return PLAYERS.find((p) => room.players[p]?.uid === uid) ?? null
}

// True when another uid already holds this name.
export function isTakenByOther(room, name, uid) {
  const holder = room?.players?.[name]?.uid
  return Boolean(holder && holder !== uid)
}

export const isReady = (room, name) => Boolean(room?.ready?.[name])

export const bothReady = (room) => PLAYERS.every((p) => isReady(room, p))

// Which screen to show for this device.
export function screenFor(room, uid) {
  const me = whoAmI(room, uid)
  if (!me) return 'select'
  if (bothReady(room)) return 'ready'
  if (isReady(room, me)) return 'waiting'
  return 'pick'
}
