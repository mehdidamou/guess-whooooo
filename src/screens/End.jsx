import { useEffect } from 'react'
import characters from '../data/characters.json'
import { useT } from '../i18n/index.js'
import CharacterCard from '../components/CharacterCard.jsx'
import { otherPlayer } from '../game/rules.js'
import { rematch, revealHero } from '../game/api.js'

const byId = (id) => characters.find((c) => c.id === id)

export default function End({ me, game, secretId }) {
  const t = useT()
  const opp = otherPlayer(me)
  const won = game.winner === me

  // Each device reveals its own secret hero once the game is over.
  useEffect(() => {
    if (secretId) revealHero(me, secretId)
  }, [me, secretId])

  const mine = byId(secretId)
  const theirs = byId(game.reveal?.[opp])

  return (
    <section className="screen end">
      <h1>{won ? t('youWin') : t('winnerIs', { name: t(game.winner) })}</h1>
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
