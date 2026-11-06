import { useContext, useEffect } from 'react'
import characters from '../data/characters.json'
import { LangContext, useT } from '../i18n/index.js'
import { SettingsContext, sfx, speak } from '../audio.js'
import CharacterCard from '../components/CharacterCard.jsx'
import { otherPlayer } from '../game/rules.js'
import { rematch, revealHero } from '../game/api.js'

const byId = (id) => characters.find((c) => c.id === id)

export default function End({ me, game, secretId }) {
  const t = useT()
  const { lang } = useContext(LangContext)
  const { sound, voice } = useContext(SettingsContext)
  const opp = otherPlayer(me)
  const won = game.winner === me

  // Each device reveals its own secret hero once the game is over.
  useEffect(() => {
    if (secretId) revealHero(me, secretId)
  }, [me, secretId])

  const title = won ? t('youWin') : t('winnerIs', { name: t(game.winner) })
  useEffect(() => {
    if (sound) (won ? sfx.win : sfx.lose)()
    if (voice) speak(title, lang)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mine = byId(secretId)
  const theirs = byId(game.reveal?.[opp])

  return (
    <section className="screen end">
      {won && <Confetti />}
      <h1>{title}</h1>
      <div className="reveal">
        <div>
          <p>{t('secretWas', { name: t(me) })}</p>
          {mine && <CharacterCard character={mine} />}
        </div>
        <div>
          <p>{t('secretWas', { name: t(opp) })}</p>
          {theirs ? <CharacterCard character={theirs} /> : <p>...</p>}
        </div>
      </div>
      <button type="button" className="cta" onClick={rematch}>
        {t('playAgain')}
      </button>
    </section>
  )
}

const PIECES = ['🎉', '⭐', '✨', '🎊', '🦸', '💥']

// Falling emojis; hidden by CSS when the device asks for reduced motion.
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    ch: PIECES[i % PIECES.length],
    left: (i * 37) % 100,
    delay: (i % 7) * 0.35,
    dur: 3 + (i % 5) * 0.6,
  }))
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        >
          {p.ch}
        </span>
      ))}
    </div>
  )
}
