import { useEffect, useMemo, useState } from 'react'
import { LangContext, detectLang, useT } from './i18n/index.js'
import { useRoom } from './game/useRoom.js'
import { screenFor, whoAmI, bothReady } from './game/rules.js'
import { leavePlayer, resetRoom } from './game/api.js'
import LangToggle from './components/LangToggle.jsx'
import PlayerSelect from './screens/PlayerSelect.jsx'
import CharacterPick from './screens/CharacterPick.jsx'
import Waiting from './screens/Waiting.jsx'

function Game() {
  const t = useT()
  const { uid, room, secretId, ready, error } = useRoom()

  if (error) {
    return (
      <section className="screen">
        <h1>{t('title')}</h1>
        <p className="error">
          {t('error')}: {error}
        </p>
      </section>
    )
  }
  if (!uid || !ready) {
    return (
      <section className="screen">
        <h1>{t('title')}</h1>
        <p>{t('loading')}</p>
      </section>
    )
  }

  const me = whoAmI(room, uid)
  const screen = screenFor(room, uid)

  return (
    <>
      {screen === 'select' && <PlayerSelect room={room} uid={uid} />}
      {screen === 'pick' && (
        <CharacterPick me={me} uid={uid} onNotMe={() => leavePlayer(me, uid)} />
      )}
      {(screen === 'waiting' || screen === 'ready') && (
        <Waiting me={me} secretId={secretId} both={bothReady(room)} />
      )}
      <footer className="page-footer">
        <button
          type="button"
          className="link"
          onClick={() => window.confirm(t('confirmReset')) && resetRoom(uid)}
        >
          {t('reset')}
        </button>
      </footer>
    </>
  )
}

export default function App() {
  const [lang, setLangState] = useState(detectLang)
  const value = useMemo(
    () => ({
      lang,
      setLang: (l) => {
        localStorage.setItem('lang', l)
        setLangState(l)
      },
    }),
    [lang],
  )
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LangContext.Provider value={value}>
      <LangToggle />
      <Game />
    </LangContext.Provider>
  )
}
