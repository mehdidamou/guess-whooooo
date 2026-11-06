import { ref, runTransaction, set, remove, update, push } from 'firebase/database'
import { db } from '../firebase.js'
import { newGame, afterTurn } from './rules.js'

const room = (path = '') => ref(db, `rooms/family${path}`)

// Claim a player name. Fails (returns false) if another device already holds it.
export async function claimPlayer(name, uid) {
  const result = await runTransaction(room(`/players/${name}`), (current) => {
    if (current && current.uid !== uid) return undefined // abort
    return { uid }
  })
  return result.committed
}

// Lock in the secret character. The secret lives at secrets/<uid>, readable only by its owner.
export async function confirmPick(name, uid, charId) {
  await set(ref(db, `secrets/${uid}`), { charId })
  await set(room(`/ready/${name}`), true)
}

// Let the player change their mind before the other player is ready.
export async function unlockPick(name) {
  await remove(room(`/ready/${name}`))
}

// Give up this name on this device.
export async function leavePlayer(name, uid) {
  await remove(room(`/ready/${name}`))
  await remove(room(`/players/${name}`))
  await remove(ref(db, `secrets/${uid}`))
}

// Parent button: clear the whole room.
export async function resetRoom(uid) {
  await remove(room())
  if (uid) await remove(ref(db, `secrets/${uid}`))
}

// ---- Gameplay ----

// Both devices may call this at once; the transaction makes sure only one game is created.
export async function startGameIfNeeded() {
  await runTransaction(room('/game'), (current) => current ?? newGame())
}

// Ask a question. kind: 'suggested' (questionId) or 'free' (text).
export async function askQuestion(from, { kind, questionId, text }) {
  const pending = { from, kind }
  if (questionId) pending.questionId = questionId
  if (text) pending.text = text
  await set(room('/game/pending'), pending)
}

export async function makeGuess(from, charId) {
  await set(room('/game/pending'), { from, kind: 'guess', charId })
}

// Written by the answering device. A correct guess also ends the game.
export async function answerPending(pending, value) {
  const updates = { 'rooms/family/game/pending/answer': value }
  if (pending.kind === 'guess' && value) updates['rooms/family/game/winner'] = pending.from
  await update(ref(db), updates)
}

// Written by the asker once they have seen the answer: logs it and passes the turn.
export async function endTurn(game) {
  const { pending } = game
  const next = afterTurn(game)
  const entry = { from: pending.from, kind: pending.kind, answer: pending.answer ?? false }
  if (pending.questionId) entry.questionId = pending.questionId
  if (pending.text) entry.text = pending.text
  if (pending.charId) entry.charId = pending.charId
  const key = push(room('/game/log')).key
  await update(ref(db), {
    [`rooms/family/game/log/${key}`]: entry,
    'rooms/family/game/turn': next.turn,
    'rooms/family/game/skip': next.skip,
    'rooms/family/game/skipNote': next.skipNote,
    'rooms/family/game/pending': null,
  })
}

// After the game ends each device reveals its own secret hero.
export async function revealHero(name, charId) {
  await set(room(`/game/reveal/${name}`), charId)
}

// Play again: both players stay, everyone picks a new hero.
export async function rematch() {
  await update(ref(db), { 'rooms/family/ready': null, 'rooms/family/game': null })
}
