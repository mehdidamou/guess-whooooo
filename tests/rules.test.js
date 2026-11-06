import { describe, it, expect } from 'vitest'
import { whoAmI, isTakenByOther, bothReady, screenFor, otherPlayer } from '../src/game/rules.js'

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
