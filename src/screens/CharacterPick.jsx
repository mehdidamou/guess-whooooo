import { useContext, useState } from 'react'
import characters from '../data/characters.json'
import { LangContext, useT } from '../i18n/index.js'
import CharacterCard from '../components/CharacterCard.jsx'
import { confirmPick } from '../game/api.js'

export default function CharacterPick({ me, uid, onNotMe }) {
  const t = useT()
  const { lang } = useContext(LangContext)
  const [picked, setPicked] = useState(null)
  const [busy, setBusy] = useState(false)
  const chosen = characters.find((c) => c.id === picked)

  async function confirm() {
    if (!picked) return
    setBusy(true)
    try {
      await confirmPick(me, uid, picked)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="pick">
      <header className="topbar">
        <strong>{t('hello', { name: t(me) })}</strong>
        <button type="button" className="link" onClick={onNotMe}>
          {t('notMe')}
        </button>
      </header>
      <h2>{t('pickHero')}</h2>
      <div className="grid">
        {characters.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            selected={c.id === picked}
            onClick={() => setPicked(c.id)}
          />
        ))}
      </div>
      <footer className="confirm-bar">
        {chosen ? (
          <button type="button" className="cta" disabled={busy} onClick={confirm}>
            {t('confirm')} ({chosen.name[lang]})
          </button>
        ) : (
          <span>{t('tapHero')}</span>
        )}
      </footer>
    </section>
  )
}
