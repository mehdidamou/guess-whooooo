import characters from '../data/characters.json'
import { useT } from '../i18n/index.js'
import CharacterCard from '../components/CharacterCard.jsx'
import { otherPlayer } from '../game/rules.js'
import { unlockPick } from '../game/api.js'

// Shown after locking in a hero. `both` is true when the other player is ready too.
export default function Waiting({ me, secretId, both }) {
  const t = useT()
  const hero = characters.find((c) => c.id === secretId)
  return (
    <section className="screen">
      <h1>{t('title')}</h1>
      <h2>{both ? t('bothReady') : t('waitingFor', { name: t(otherPlayer(me)) })}</h2>
      <p>{t('yourHero')}</p>
      {hero && <CharacterCard character={hero} big />}
      {both ? (
        <p>{t('boardSoon')}</p>
      ) : (
        <button type="button" className="link" onClick={() => unlockPick(me)}>
          {t('change')}
        </button>
      )}
    </section>
  )
}
