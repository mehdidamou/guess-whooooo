import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, onValue } from 'firebase/database'
import { auth, db, signIn } from '../firebase.js'

// Signs in anonymously, then subscribes to the family room and this user's secret.
export function useRoom() {
  const [uid, setUid] = useState(null)
  const [room, setRoom] = useState(null)
  const [secretId, setSecretId] = useState(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const stop = onAuthStateChanged(auth, (user) => setUid(user ? user.uid : null))
    signIn().catch((e) => setError(e.code || e.message))
    return stop
  }, [])

  useEffect(() => {
    if (!uid) return undefined
    const offRoom = onValue(
      ref(db, 'rooms/family'),
      (snap) => {
        setRoom(snap.val())
        setReady(true)
      },
      (e) => setError(e.code || e.message),
    )
    const offSecret = onValue(ref(db, `secrets/${uid}/charId`), (snap) => setSecretId(snap.val()))
    return () => {
      offRoom()
      offSecret()
    }
  }, [uid])

  return { uid, room, secretId, ready, error }
}
