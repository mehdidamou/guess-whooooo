import { describe, it, expect } from 'vitest'
import {
  whoAmI,
  isTakenByOther,
  bothReady,
  screenFor,
  otherPlayer,
  newGame,
  answerFor,
  afterTurn,
} from '../src/game/rules.js'
import characters from '../src/data/characters.json'
import questions from '../src/data/questions.json'

describe('gameplay rules', () => {
  const byId = (id) => characters.find((c) => c.id === id)

  it('starts with a random player and clean state', () => {
    expect(newGame(() => 0.1).turn).toBe('sofia')
    expect(newGame(() => 0.9).turn).toBe('taninna')
    expect(newGame().pending).toBe(null)
  })

  it('answers suggested questions and guesses from the secret', () => {
    const web = byId('web-whiz')
    expect(answerFor({ kind: 'suggested', questionId: 'mask' }, web, questions)).toBe(true)
    expect(answerFor({ kind: 'suggested', questionId: 'flies' }, web, questions)).toBe(false)
    expect(answerFor({ kind: 'suggested', questionId: 'color-red' }, web, questions)).toBe(true)
    expect(answerFor({ kind: 'guess', charId: 'web-whiz' }, web, questions)).toBe(true)
    expect(answerFor({ kind: 'guess', charId: 'zip-fox' }, web, questions)).toBe(false)
  })

  it('passes the turn after a question', () => {
    const g = { skip: {}, pending: { from: 'sofia', kind: 'suggested', answer: true } }
    expect(afterTurn(g)).toEqual({
      turn: 'taninna',
      skip: { sofia: false, taninna: false },
      skipNote: null,
    })
  })

  it('a wrong guess loses the next turn, then play returns to the opponent', () => {
    const wrong = { skip: {}, pending: { from: 'sofia', kind: 'guess', answer: false } }
    const r1 = afterTurn(wrong)
    expect(r1.turn).toBe('taninna')
    expect(r1.skip.sofia).toBe(true)
    // Taninna ends her turn: Sofia's turn is skipped, so Taninna plays again
    const r2 = afterTurn({ skip: r1.skip, pending: { from: 'taninna', kind: 'suggested', answer: false } })
    expect(r2.turn).toBe('taninna')
    expect(r2.skipNote).toBe('sofia')
    expect(r2.skip.sofia).toBe(false)
    // After that, it alternates normally
    const r3 = afterTurn({ skip: r2.skip, pending: { from: 'taninna', kind: 'suggested', answer: true } })
    expect(r3.turn).toBe('sofia')
  })
})

const room = {
  players: { sofia: { uid: 'u1' }, taninna: { uid: 'u2' } },
  ready: { sofia: true },
}

describe('room rules', () => {
  it('finds which player a device is', () => {
    expect(whoAmI(room, 'u1')).toBe('sofia')
    expect(whoAmI(room, 'u2')).toBe('taninna')
    expect(whoAmI(room, 'zzz')).toBe(null)
    expect(whoAmI(null, 'u1')).toBe(null)
  })

  it('detects a name taken by another device', () => {
    expect(isTakenByOther(room, 'sofia', 'u2')).toBe(true)
    expect(isTakenByOther(room, 'sofia', 'u1')).toBe(false)
    expect(isTakenByOther({}, 'sofia', 'u1')).toBe(false)
  })

  it('picks the right screen', () => {
    expect(screenFor(null, 'u1')).toBe('select')
    expect(screenFor({ players: { sofia: { uid: 'u1' } } }, 'u1')).toBe('pick')
    expect(screenFor(room, 'u1')).toBe('waiting')
    expect(screenFor(room, 'u2')).toBe('pick')
    expect(screenFor({ ...room, ready: { sofia: true, taninna: true } }, 'u2')).toBe('ready')
  })

  it('knows when both are ready and who the other player is', () => {
    expect(bothReady(room)).toBe(false)
    expect(bothReady({ ready: { sofia: true, taninna: true } })).toBe(true)
    expect(otherPlayer('sofia')).toBe('taninna')
  })
})
