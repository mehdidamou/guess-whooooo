import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

// Firebase web config is public by design. Data is protected by database.rules.json.
const firebaseConfig = {
  apiKey: 'AIzaSyC3rQijJJceY8fjXFlOossRO5eCDLSyLlo',
  authDomain: 'guess-whooooo.firebaseapp.com',
  databaseURL: 'https://guess-whooooo-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'guess-whooooo',
  storageBucket: 'guess-whooooo.firebasestorage.app',
  messagingSenderId: '1057459858094',
  appId: '1:1057459858094:web:f59990b0d70aa8afc79b3f',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)

// Anonymous sign-in: no accounts for the girls. Firebase keeps the uid across reloads.
export function signIn() {
  return signInAnonymously(auth)
}
