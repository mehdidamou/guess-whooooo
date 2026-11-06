import { useEffect, useState } from 'react'
import { ref, onValue, set, serverTimestamp } from 'firebase/database'
import { db, signIn } from './firebase.js'

// Phase 0 connection check: signs in anonymously and writes/reads a ping.
export default function App() {
  const [status, setStatus] = useState('Connecting...')

  useEffect(() => {
    let unsub = () => {}
    signIn()
      .then(({ user }) => {
        const pingRef = ref(db, `rooms/family/pings/${user.uid}`)
        unsub = onValue(pingRef, (snap) => {
          setStatus(snap.exists() ? 'Connected to Firebase' : 'Signed in')
        })
        return set(pingRef, serverTimestamp())
      })
      .catch((err) => setStatus(`Error: ${err.code || err.message}`))
    return () => unsub()
  }, [])

  return (
    <main className="screen">
      <h1>Guess Whooooo</h1>
      <p>{status}</p>
    </main>
  )
}
