import { ref, runTransaction, set, remove } from 'firebase/database'
import { db } from '../firebase.js'

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
