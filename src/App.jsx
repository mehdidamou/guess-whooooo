import { useEffect, useMemo, useState } from 'react'
import { LangContext, detectLang, useT } from './i18n/index.js'
import { useRoom } from './game/useRoom.js'
import { screenFor, whoAmI } from './game/rules.js'
import { leavePlayer, resetRoom, startGameIfNeeded } from './game/api.js'
import LangToggle from './components/LangToggle.jsx'
import PlayerSelect from './screens/PlayerSelect.jsx'
import CharacterPick from './screens/CharacterPick.jsx'
import Waiting from './screens/Waiting.jsx'
import Board from './screens/Board.jsx'
import End from './screens/End.jsx'

function Game() {
  const t = useT()
  const { uid, room, secretId, ready, error } = useRoom()

  const screenNow = room && uid ? screenFor(room, uid) : null
  useEffect(() => {
    if (screenNow === 'ready' && !room?.game) startGameIfNeeded()
  }, [screenNow, room?.game])

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
      {screen === 'waiting' && <Waiting me={me} secretId={secretId} both={false} />}
      {screen === 'ready' && !room.game && (
        <section className="screen">
          <p>{t('loading')}</p>
        </section>
      )}
      {screen === 'ready' && room.game && !room.game.winner && (
        <Board me={me} uid={uid} game={room.game} secretId={secretId} />
      )}
      {screen === 'ready' && room.game?.winner && (
        <End me={me} game={room.game} secretId={secretId} />
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
