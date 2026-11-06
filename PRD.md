# PRD: Guess Whooooo

Status: v1.0 (all open questions answered) | Date: 2026-11-06 | Owner: Mehdi

## Decisions (v0.2)
- Art: **original "Marvel-inspired" characters** (new names and designs, superhero archetypes). Safe to host on GitHub.
- Roster: 30 characters selected/generated randomly by Claude, balanced across attributes.
- Wrong final guess: **lose a turn** (no instant loss).
- Questions: **both** suggested/icon questions and free-form (manual Yes/No answer).
- Devices: **home Wi-Fi, Android phones, web browsers** (Chrome). Design phone-first, portrait and landscape.
- Languages: **English and French**, with an in-game language toggle.
- Hosting: **GitHub** (GitHub Pages for the front end).
- Name: **Guess Whooooo**.
- Realtime backend: **Firebase** (Realtime Database, free Spark plan).
- Character images: **hand-drawn SVG** (cartoon style), created by Claude.

## 1. Overview
A two-player, real-time "Guess Who"-style web game for Sofia (11) and Taninna (6), inspired by Marvel characters. Each player opens the site on their own device, picks who they are, picks a secret character, and then takes turns asking yes/no questions to guess the opponent's character.

## 2. Goals
- Sofia and Taninna can play together from different devices at the same time.
- Fun and simple enough for a 6-year-old, with enough depth to stay interesting for an 11-year-old.
- Private family project: no accounts, no ads, no data collection.

### Non-goals (v1)
- Public release, monetization, accounts or chat with strangers.
- Playing against a computer or more than two players.
- Selling or distributing anything using Marvel IP.

## 3. Users
| Player | Age | Needs |
|---|---|---|
| Taninna | 6 | Big tap targets, pictures over text, few steps, read-aloud/icon-based questions, forgiving rules |
| Sofia | 11 | Can read, wants real strategy, may enjoy a "hard" mode |
| Parent (Mehdi) | - | Easy to run and host, safe, cheap, easy to edit characters |

## 4. User flow
1. **Landing:** two big buttons, "Sofia" and "Taninna". If the other player already took a name, that button is disabled.
2. **Character pick:** grid of 30 characters. Tap to preview, then confirm. Choice is secret and locked in.
3. **Waiting:** "Waiting for [other player]..." until both have locked in.
4. **Play:** each player sees a board of all 30 characters. Players take turns. On their turn a player asks a yes/no question, the opponent answers, and the asker flips down characters that no longer fit.
5. **Guess:** on their turn a player may make a final guess. Right = win, wrong = lose (or lose a turn in "Easy" mode, see open questions).
6. **End:** winner celebration, both secret characters revealed, "Play again" button.

## 5. Functional requirements
### Must have (v1)
- F1. Player selection (Sofia/Taninna), one device per player, no password.
- F2. Roster of 30 Marvel-inspired characters, each with picture, name and attributes.
- F3. Real-time sync between two devices (turn, answers, game state).
- F4. Secret character pick, hidden from the opponent until the game ends.
- F5. Game board where tapping a character flips it down/up.
- F6. Turn indicator ("Your turn" / "Sofia is thinking...").
- F7. Questions: pick from a **suggested question list** built from attributes (e.g. "Does your hero wear a mask?", "Can they fly?"). Opponent answers with big Yes/No buttons. Taninna benefits from icon-based questions. The answer can be auto-computed from the secret character so nobody can cheat or misanswer.
- F8. Final guess action and win/lose detection.
- F9. Play again / rematch without reloading.
- F10. Reconnect: if a device refreshes or drops, the player rejoins the same game.
- F11. Responsive layout for tablets and phones, works on iPad and phone browsers.

### Should have
- S1. Sound effects and a fun win animation.
- S2. Read-aloud of questions for Taninna (browser text-to-speech).
- S3. Free-form question mode for Sofia with manual Yes/No answers.
- S4. Win counter per player (stored locally or in the room).

### Could have
- C1. Difficulty setting (Easy: fewer characters on board, e.g. 12; Normal: 30).
- C2. Themes or character packs.
- C3. Computer opponent for solo play.

## 6. Character roster (draft, 30)
Attributes to tag each character: hero or villain, gender, hair colour, mask, cape, flies, super strength, uses tech or armor, has a hammer or shield, team (Avengers, X-Men, Guardians, Spider-verse, other), costume colour.

Characters are **original** designs inspired by Marvel archetypes (web-slinger, armored genius, shield soldier, thunder god, green giant, shrinking hero, cosmic raccoon-like sidekick, etc.), with new names. The 30 are generated randomly by Claude, then balanced: a mix of heroes and a few villains, boys and girls, varied hair, colours and powers so questions stay useful. Names and attributes are stored in French and English.

## 7. Art and legal approach (decided)
Original characters inspired by Marvel archetypes, with new names and designs, avoiding Marvel names, logos and distinctive costumes. This keeps the repo safe to host publicly on GitHub. Art is stored as swappable image files (SVG/PNG, cartoon style); how to produce the 30 images is still open (see section 12).

## 8. Technical approach (proposed, to confirm)
- Web app, no install, phone-first for Android Chrome. Static front end hosted on **GitHub Pages**.
- GitHub Pages has no server, so real-time sync needs one of:
  - **Option 1 (recommended): free hosted realtime service** (Firebase Realtime DB or Supabase Realtime). Simple, reliable, works on any network.
  - **Option 2: peer-to-peer WebRTC (e.g. PeerJS)**. No backend of our own, but connection setup can be flaky and needs a signaling server.
- Game "room" with a short code or a fixed family room, since there are only two known players.
- Characters stored as a JSON file (EN/FR text) plus an image folder, so edits need no code changes.
- i18n: all UI text in EN/FR dictionaries with a language toggle.
- Cost target: about $0.

## 9. Non-functional requirements
- Loads in under 3 seconds on home Wi-Fi.
- Turn updates appear on the other device within 1 second.
- No personal data collected, no third-party trackers, no chat.
- Kid-safe content: no violent imagery, cartoon style.
- Accessible: large text, high contrast, not colour-only cues.

## 10. Success criteria
- Sofia and Taninna complete a full game on two devices without help.
- Taninna can play without reading much.
- They ask to play again.

## 11. Milestones
1. PRD and decisions agreed.
2. Roster and attributes finalised, art sourced or created.
3. Prototype: pick player, pick character, sync board (local test).
4. Full game loop with turns, questions, guess, win.
5. Polish (sound, animations, TTS), deploy, test on real devices with the girls.

## 12. Open questions
1. (Resolved: hand-drawn SVG.)
2. (Resolved: Firebase.)
3. (Resolved: free-form questions are answered manually by the opponent; suggested questions are auto-answered.)
4. (Resolved: GitHub account exists, public repo OK.)

All open questions are resolved. PRD v1.0 is ready for build planning.

Resolved in v0.2: art approach, roster, wrong-guess rule, question mode, devices, languages, hosting, name.
