import { useContext, useEffect, useRef, useState } from 'react'
import characters from '../data/characters.json'
import questions from '../data/questions.json'
import { LangContext, useT } from '../i18n/index.js'
import CharacterCard, { imageUrl } from '../components/CharacterCard.jsx'
import { answerFor, otherPlayer } from '../game/rules.js'
import { answerPending, askQuestion, endTurn, makeGuess } from '../game/api.js'

const byId = (id) => characters.find((c) => c.id === id)

function useFlipped(gameId, uid) {
  const key = `flipped:${gameId}:${uid}`
  const [flipped, setFlipped] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? []
    } catch {
      return []
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(flipped))
  }, [key, flipped])
  const toggle = (id) =>
    setFlipped((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const flipDown = (id) => setFlipped((f) => (f.includes(id) ? f : [...f, id]))
  return { flipped, toggle, flipDown }
}

function questionText(entry, lang) {
  if (entry.questionId) return questions.find((q) => q.id === entry.questionId)?.[lang] ?? ''
  return entry.text ?? ''
}

export default function Board({ me, uid, game, secretId }) {
  const t = useT()
  const { lang } = useContext(LangContext)
  const opp = otherPlayer(me)
  const secret = byId(secretId)
  const { flipped, toggle, flipDown } = useFlipped(game.id, uid)
  const [sheet, setSheet] = useState(false)
  const [guessMode, setGuessMode] = useState(false)
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const pending = game.pending
  const myTurn = game.turn === me
  const answered = pending && pending.answer !== undefined && pending.answer !== null
  const log = Object.values(game.log ?? {})
  const askedIds = new Set(log.filter((e) => e.questionId).map((e) => e.questionId))

  // The answering device works out suggested answers and guesses from its own secret.
  const answeredRef = useRef(null)
  useEffect(() => {
    if (!pending || pending.from === me || answered || !secret) return
    if (pending.kind === 'free') return
    const sig = `${game.id}:${pending.from}:${pending.kind}:${pending.questionId ?? pending.charId}:${log.length}`
    if (answeredRef.current === sig) return
    answeredRef.current = sig
    answerPending(pending, answerFor(pending, secret, questions))
  }, [pending, answered, secret, me, game.id, log.length])

  async function run(fn) {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const ask = (payload) =>
    run(async () => {
      await askQuestion(me, payload)
      setSheet(false)
    })

  const sendGuess = () =>
    run(async () => {
      await makeGuess(me, target.id)
      setTarget(null)
      setGuessMode(false)
    })

  const finishTurn = () =>
    run(async () => {
      if (pending.kind === 'guess' && pending.answer === false) flipDown(pending.charId)
      await endTurn(game)
    })

  const yesNo = (v) => (v ? t('yes') : t('no'))

  // ---- status panel ----
  let status
  if (!pending) {
    status = myTurn ? (
      <div className="actions">
        <button type="button" className="cta" disabled={busy} onClick={() => setSheet(true)}>
          ❓ {t('ask')}
        </button>
        <button
          type="button"
          className="cta alt"
          disabled={busy}
          onClick={() => setGuessMode((g) => !g)}
        >
          🎯 {guessMode ? t('cancel') : t('guess')}
        </button>
      </div>
    ) : (
      <p>{t('theirTurn', { name: t(opp) })}</p>
    )
  } else if (pending.from === me) {
    if (pending.kind === 'guess') {
      const hero = byId(pending.charId)?.name[lang]
      status = !answered ? (
        <p>{t('youGuessed', { hero })}</p>
      ) : pending.answer === false ? (
        <>
          <p className="bad">{t('wrongGuess', { hero })}</p>
          <button type="button" className="cta" disabled={busy} onClick={finishTurn}>
            {t('ok')}
          </button>
        </>
      ) : null
    } else {
      status = (
        <>
          <p className="q">{questionText(pending, lang)}</p>
          {!answered ? (
            <p>{t('waitingAnswer', { name: t(opp) })}</p>
          ) : (
            <>
              <p className={`answer ${pending.answer ? 'yes' : 'no'}`}>
                {pending.answer ? '✅' : '❌'} {yesNo(pending.answer)}
              </p>
              <p className="hint">{t('flipHint')}</p>
              <button type="button" className="cta" disabled={busy} onClick={finishTurn}>
                {t('ok')}
              </button>
            </>
          )}
        </>
      )
    }
  } else if (pending.kind === 'guess') {
    status = <p>{t('theyGuessed', { name: t(opp), hero: byId(pending.charId)?.name[lang] })}</p>
  } else {
    status = (
      <>
        <p>{t('asks', { name: t(opp) })}</p>
        <p className="q">{questionText(pending, lang)}</p>
        {pending.kind === 'free' && !answered ? (
          <div className="actions">
            <button
              type="button"
              className="cta yes"
              disabled={busy}
              onClick={() => run(() => answerPending(pending, true))}
            >
              ✅ {t('yes')}
            </button>
            <button
              type="button"
              className="cta no"
              disabled={busy}
              onClick={() => run(() => answerPending(pending, false))}
            >
              ❌ {t('no')}
            </button>
          </div>
        ) : (
          answered && <p>{t('youAnswered', { answer: yesNo(pending.answer) })}</p>
        )}
      </>
    )
  }

  return (
    <section className="board">
      <header className="board-top">
        <div className={`turn ${myTurn ? 'mine' : ''}`}>
          {myTurn ? t('yourTurn') : t('theirTurn', { name: t(opp) })}
        </div>
        {game.skipNote && <div className="note">💤 {t('skipped', { name: t(game.skipNote) })}</div>}
        {secret && (
          <div className="mini-hero" title={t('yourHero')}>
            <img src={imageUrl(secret)} alt="" />
            <span>{secret.name[lang]}</span>
          </div>
        )}
      </header>

      <div className="status">{status}</div>
      {guessMode && !pending && <p className="hint">{t('guessHint')}</p>}

      <div className="grid">
        {characters.map((c) => (
          <div key={c.id} className={flipped.includes(c.id) ? 'flipped' : ''}>
            <CharacterCard
              character={c}
              onClick={() => (guessMode && !pending ? setTarget(c) : toggle(c.id))}
            />
          </div>
        ))}
      </div>

      <details className="history">
        <summary>{t('history')}</summary>
        {log.length === 0 ? (
          <p>{t('nothingYet')}</p>
        ) : (
          <ul>
            {log.map((e, i) => (
              <li key={i}>
                <strong>{t(e.from)}:</strong>{' '}
                {e.kind === 'guess'
                  ? `${t('guessed')} ${byId(e.charId)?.name[lang]} → ${yesNo(e.answer)}`
                  : `${questionText(e, lang)} → ${yesNo(e.answer)}`}
              </li>
            ))}
          </ul>
        )}
      </details>

      {sheet && (
        <QuestionSheet
          asked={askedIds}
          busy={busy}
          onClose={() => setSheet(false)}
          onPick={(q) => ask({ kind: 'suggested', questionId: q.id })}
          onFree={(text) => ask({ kind: 'free', text })}
        />
      )}

      {target && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-box">
            <CharacterCard character={target} big />
            <h2>{t('isItThis', { hero: target.name[lang] })}</h2>
            <div className="actions">
              <button type="button" className="cta" disabled={busy} onClick={sendGuess}>
                {t('yes')}
              </button>
              <button type="button" className="cta alt" onClick={() => setTarget(null)}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function QuestionSheet({ asked, busy, onClose, onPick, onFree }) {
  const t = useT()
  const { lang } = useContext(LangContext)
  const [text, setText] = useState('')
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-box sheet">
        <h2>{t('suggested')}</h2>
        <ul className="qlist">
          {questions
            .filter((q) => !asked.has(q.id))
            .map((q) => (
              <li key={q.id}>
                <button type="button" disabled={busy} onClick={() => onPick(q)}>
                  <span className="qicon">{q.icon}</span>
                  <span>{q[lang]}</span>
                </button>
              </li>
            ))}
        </ul>
        <form
          className="own"
          onSubmit={(e) => {
            e.preventDefault()
            if (text.trim()) onFree(text.trim())
          }}
        >
          <label htmlFor="own-q">{t('ownQuestion')}</label>
          <input
            id="own-q"
            value={text}
            maxLength={120}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="cta" disabled={busy || !text.trim()}>
            {t('send')}
          </button>
        </form>
        <button type="button" className="link" onClick={onClose}>
          {t('cancel')}
        </button>
      </div>
    </div>
  )
}
