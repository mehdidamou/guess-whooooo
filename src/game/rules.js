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

// ---- Gameplay ----

export const newGame = (rand = Math.random) => ({
  id: Date.now(),
  turn: PLAYERS[rand() < 0.5 ? 0 : 1],
  skip: { sofia: false, taninna: false },
  pending: null,
  winner: null,
  skipNote: null,
})

// Computed on the answering device from its own secret character.
// pending.kind: 'suggested' (uses a question from questions.json) or 'guess' (a character id).
export function answerFor(pending, secret, questions) {
  if (pending.kind === 'guess') return pending.charId === secret.id
  const q = questions.find((x) => x.id === pending.questionId)
  return q ? secret[q.attr] === q.value : false
}

// After the asker acknowledges an answered question/guess: who plays next?
// A wrong guess costs the guesser their next turn (the opponent plays twice).
export function afterTurn(game) {
  const { pending } = game
  const me = pending.from
  const other = otherPlayer(me)
  const skip = { sofia: false, taninna: false, ...game.skip }
  if (pending.kind === 'guess' && pending.answer === false) skip[me] = true
  let turn = other
  let skipNote = null
  if (skip[other]) {
    skip[other] = false
    turn = me
    skipNote = other
  }
  return { turn, skip, skipNote }
}

// Which screen to show for this device.
export function screenFor(room, uid) {
  const me = whoAmI(room, uid)
  if (!me) return 'select'
  if (bothReady(room)) return 'ready'
  if (isReady(room, me)) return 'waiting'
  return 'pick'
}
