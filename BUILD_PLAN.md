# Build Plan: Guess Whooooo

Status: Approved v1.0 (stack and fixed family room approved 2026-11-06) | Date: 2026-11-06 | Based on PRD v1.0

## 1. Stack
| Layer | Choice | Why |
|---|---|---|
| Front end | Vite + React (JavaScript) | Fast, simple, builds to static files for GitHub Pages |
| Styling | Plain CSS (CSS variables, mobile-first) | No extra dependencies, big touch targets |
| Realtime | Firebase Realtime Database (Spark free plan) | Works over any network, free, simple listeners |
| Auth | Firebase Anonymous Auth | No accounts for the girls, but lets rules restrict writes |
| i18n | Small EN/FR dictionary + toggle | Two languages only, no library needed |
| Art | Hand-drawn SVG files, one per character | Small, sharp on any phone |
| Hosting | GitHub Pages via GitHub Actions | Free, deploy on push to `main` |
| Tests | Vitest for game logic | Rules are pure functions, easy to test |

## 2. Folder structure
```
Guess Game/
  index.html
  package.json, vite.config.js
  .github/workflows/deploy.yml
  public/characters/*.svg          # 30 SVGs
  src/
    main.jsx, App.jsx
    data/characters.json           # id, names EN/FR, attributes, svg path
    data/questions.json            # suggested questions mapped to attributes (EN/FR, icon)
    i18n/en.json, fr.json
    firebase.js                    # init + helpers
    game/rules.js                  # pure logic: answer question, check guess, next turn
    game/useGame.js                # hook subscribing to the room
    screens/ PlayerSelect, CharacterPick, Waiting, Board, End
    components/ CharacterCard, QuestionPanel, TurnBanner, LangToggle
    styles.css
  tests/rules.test.js
```

## 3. Game state (Firebase)
One fixed family room, `rooms/family`:
```
players: { sofia: {uid, ready}, taninna: {uid, ready} }
secret:  { sofia: charId, taninna: charId }     # read only by the owner
phase:   "pick" | "play" | "ended"
turn:    "sofia" | "taninna"
skip:    { sofia: false, taninna: false }       # lose-a-turn flag
pending: { from, type: "suggested"|"free", text/questionId, answer: null|true|false }
log:     [ {from, question, answer} ]
winner:  null | "sofia" | "taninna"
```
- Flipped-down cards stay local to each device (no need to sync).
- Suggested question: answered automatically by the asker's device from the opponent's secret, via a write the opponent's device resolves (see risk below).
- Free-form: opponent taps Yes/No.
- Wrong guess sets `skip[player] = true`; the next time their turn comes it is passed.
- Rematch resets `secret`, `phase`, `pending`, `log`, `winner`.

**Secrecy risk:** Realtime Database rules cannot hide one child from only one reader if both are anonymous unless uid is matched. Plan: store each secret at `secrets/{uid}` readable only by that uid; the opponent's device auto-answers suggested questions (it knows its own secret) and writes the answer. Same for guess checking: the guessed character is sent, the secret owner's device writes `correct: true/false`. Cheat-proof enough for kids, and rules block casual peeking in the database.

## 4. Phases
**Phase 0: Setup (needs you)**
- Create a GitHub repo (public) and a Firebase project; enable Realtime Database and Anonymous Auth; copy the web config.
- Config values go into repo variables or a `.env` (Firebase web keys are not secrets, but lock the database with rules).

**Phase 1: Content**
- Generate 30 characters + attributes (EN/FR) in `characters.json`.
- Define ~20 suggested questions with icons.
- Draw 30 SVGs; review together before moving on.

**Phase 2: Prototype**
- Project scaffold, language toggle, player select, character pick, waiting screen.
- Firebase wiring: two phones join, lock secrets, see each other ready.

**Phase 3: Game loop**
- Board with flip-down cards, turn banner, suggested + free-form questions, guess flow, lose-a-turn, win screen, rematch, reconnect.
- Unit tests for `rules.js`.

**Phase 4: Polish**
- Sounds, win animation, read-aloud (browser text-to-speech, EN/FR), larger icons for Taninna, accessibility pass.

**Phase 5: Deploy and test**
- GitHub Actions to Pages, test on both Android phones over home Wi-Fi, fix issues, play a real game with the girls.

## 5. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Realtime rules are fiddly | Use anonymous auth and per-uid secret paths; test rules in the Firebase emulator |
| Phone drops connection mid-game | State lives in Firebase; app re-subscribes on load; uid persisted by Firebase auth |
| Only two fixed players could clash (both choose Sofia) | Disable a name once claimed; "Reset room" button for parents |
| Text-to-speech French voice missing on a phone | Fall back silently; icons still carry meaning |
| SVG art takes time | Build the template once (body shapes, colours, accessories) and vary by attribute |

## 6. Decisions needed from you
1. OK with **Vite + React** as proposed?
2. OK with a **fixed family room** (no room codes) in v1?
3. Ready to do Phase 0 (create the GitHub repo and Firebase project)? I can guide you step by step.
