import { createContext } from 'react'

// Settings (sound effects and read-aloud) are per device, saved in localStorage.
export const SettingsContext = createContext({
  sound: true,
  voice: false,
  setSound: () => {},
  setVoice: () => {},
})

export const loadFlag = (key, fallback) => {
  const v = localStorage.getItem(key)
  return v === null ? fallback : v === '1'
}

let ctx
const audioCtx = () => {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx ??= new AC()
  return ctx
}

// Browsers only allow audio after a tap; call this from a user gesture.
export function unlockAudio() {
  const c = audioCtx()
  if (c && c.state === 'suspended') c.resume()
}

function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  const c = audioCtx()
  if (!c) return
  const t0 = c.currentTime + start
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

export const sfx = {
  turn: () => {
    tone(660, 0, 0.15)
    tone(880, 0.15, 0.25)
  },
  yes: () => {
    tone(523, 0, 0.12)
    tone(784, 0.12, 0.25)
  },
  no: () => {
    tone(330, 0, 0.15, 'triangle')
    tone(247, 0.15, 0.3, 'triangle')
  },
  wrong: () => {
    tone(200, 0, 0.25, 'sawtooth', 0.12)
    tone(150, 0.25, 0.4, 'sawtooth', 0.12)
  },
  win: () => {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, 0.3, 'triangle'))
    tone(1047, 0.6, 0.6, 'triangle')
  },
  lose: () => {
    tone(392, 0, 0.25, 'triangle')
    tone(330, 0.25, 0.25, 'triangle')
    tone(262, 0.5, 0.4, 'triangle')
  },
}

export function speak(text, lang) {
  if (!text || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang === 'fr' ? 'fr-FR' : 'en-US'
  u.rate = 0.9
  window.speechSynthesis.speak(u)
}
