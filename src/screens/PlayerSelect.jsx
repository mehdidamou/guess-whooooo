import { useState } from 'react'
import { useT } from '../i18n/index.js'
import { PLAYERS, isTakenByOther } from '../game/rules.js'
import { claimPlayer } from '../game/api.js'

const EMOJI = { sofia: '🦸‍♀️', taninna: '🦄' }

export default function PlayerSelect({ room, uid }) {
  const t = useT()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  async function choose(name) {
    setBusy(true)
    setError(false)
    try {
      const ok = await claimPlayer(name, uid)
      if (!ok) setError(true)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="screen">
      <h1>{t('title')}</h1>
      <h2>{t('whoAreYou')}</h2>
      <div className="player-buttons">
        {PLAYERS.map((name) => {
          const taken = isTakenByOther(room, name, uid)
          return (
            <button
              key={name}
              type="button"
              className={`player-btn ${name}`}
              disabled={taken || busy}
              onClick={() => choose(name)}
            >
              <span className="emoji">{EMOJI[name]}</span>
              <span>{t(name)}</span>
              {taken && <small>{t('taken')}</small>}
            </button>
          )
        })}
      </div>
      {error && <p className="error">{t('error')}</p>}
    </section>
  )
}
