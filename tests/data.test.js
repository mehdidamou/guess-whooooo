import { describe, it, expect } from 'vitest'
import characters from '../src/data/characters.json'
import questions from '../src/data/questions.json'

const answer = (c, q) => c[q.attr] === q.value

describe('roster data', () => {
  it('has 30 characters with unique ids and names in EN and FR', () => {
    expect(characters).toHaveLength(30)
    expect(new Set(characters.map((c) => c.id)).size).toBe(30)
    for (const c of characters) {
      expect(c.name.en).toBeTruthy()
      expect(c.name.fr).toBeTruthy()
    }
  })

  it('every question has EN and FR text and splits the roster', () => {
    for (const q of questions) {
      expect(q.en && q.fr && q.icon).toBeTruthy()
      const yes = characters.filter((c) => answer(c, q)).length
      expect(yes, q.id).toBeGreaterThan(0)
      expect(yes, q.id).toBeLessThan(30)
    }
  })

  it('every character can be told apart using the suggested questions', () => {
    const sig = characters.map((c) => questions.map((q) => (answer(c, q) ? 1 : 0)).join(''))
    const dupes = sig.filter((s, i) => sig.indexOf(s) !== i)
    expect(dupes).toHaveLength(0)
  })
})
