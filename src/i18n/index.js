import { createContext, useContext } from 'react'

export const strings = {
  en: {
    title: 'Guess Whooooo',
    loading: 'Loading...',
    whoAreYou: 'Who are you?',
    sofia: 'Sofia',
    taninna: 'Taninna',
    taken: 'Playing on another device',
    pickHero: 'Pick your secret hero',
    tapHero: 'Tap a hero',
    confirm: "This is my hero!",
    waitingFor: 'Waiting for {name}...',
    yourHero: 'Your secret hero',
    bothReady: 'Both heroes are chosen!',
    boardSoon: 'The game board is coming next.',
    change: 'Change hero',
    notMe: 'Not me',
    reset: 'Reset game',
    confirmReset: 'Reset the game for everyone?',
    hello: 'Hi {name}!',
    error: 'Something went wrong',
  },
  fr: {
    title: 'Guess Whooooo',
    loading: 'Chargement...',
    whoAreYou: 'Qui es-tu ?',
    sofia: 'Sofia',
    taninna: 'Taninna',
    taken: 'Joue sur un autre appareil',
    pickHero: 'Choisis ton héros secret',
    tapHero: 'Touche un héros',
    confirm: "C'est mon héros !",
    waitingFor: 'On attend {name}...',
    yourHero: 'Ton héros secret',
    bothReady: 'Les deux héros sont choisis !',
    boardSoon: 'Le plateau de jeu arrive bientôt.',
    change: 'Changer de héros',
    notMe: "Ce n'est pas moi",
    reset: 'Réinitialiser',
    confirmReset: 'Réinitialiser la partie pour tout le monde ?',
    hello: 'Salut {name} !',
    error: "Quelque chose s'est mal passé",
  },
}

export const LangContext = createContext({ lang: 'en', setLang: () => {} })

export function useT() {
  const { lang } = useContext(LangContext)
  return (key, vars = {}) =>
    (strings[lang][key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

export function detectLang() {
  const saved = localStorage.getItem('lang')
  if (saved === 'en' || saved === 'fr') return saved
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}
