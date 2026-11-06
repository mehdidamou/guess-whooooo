# MEMORY.md: Guess Game

Living log of learnings, decisions and progress. Read CLAUDE.md first, then this file.

## Project summary
"Guess Whooooo": Guess Who-style real-time web game for Sofia (11) and Taninna (6). Player picks Sofia/Taninna, then a character from 30 Marvel-inspired ones. Two devices, same time.

## Progress
- 2026-11-06: Session 1. Folder was empty. Drafted PRD.md v0.1, then v0.2 after Mehdi answered the open questions.

## Decisions (2026-11-06)
- Art: original characters inspired by Marvel archetypes (not Marvel names/art).
- Roster: 30 characters generated randomly by Claude, then balanced.
- Wrong final guess: lose a turn.
- Questions: both suggested/icon questions and free-form.
- Devices: home Wi-Fi, Android phones, web browsers. Phone-first design.
- Languages: English + French with toggle.
- Hosting: GitHub (Pages for front end).
- Name: Guess Whooooo.
- Realtime backend: Firebase (Realtime Database, free Spark plan).
- Character images: hand-drawn SVG (cartoon style), created by Claude.

## Key learnings
- Age gap (6 vs 11) drives design: icon-based questions, read-aloud, forgiving rules for Taninna, optional depth for Sofia.
- GitHub Pages is static only, so real-time sync needs a free realtime service (Firebase/Supabase, recommended) or peer-to-peer WebRTC.
- Original characters make a public GitHub repo safe from Marvel IP issues.

## Open questions
1. (Resolved: hand-drawn SVG.)
2. (Resolved: Firebase.)
3. (Resolved: free-form answered manually by opponent; suggested questions auto-answered.)
4. (Resolved: GitHub account exists, public repo OK.)

All open questions resolved. PRD is v1.0.

## Build plan (BUILD_PLAN.md, approved 2026-11-06)
Vite + React, plain CSS, Firebase RTDB + anonymous auth, GitHub Pages via Actions, Vitest. Fixed family room (no room codes). Mehdi approved stack and fixed room. Phases 0-5: setup, content, prototype, game loop, polish, deploy.

## Phase 0 progress
- GitHub repo created (public): https://github.com/mehdidamou/guess-whooooo.git
- Firebase project: appears created. Mehdi gave guess-whooooo.web.app (so project ID is likely `guess-whooooo`). Still need: confirmation Anonymous Auth + Realtime Database (locked mode) are enabled, and the firebaseConfig block (apiKey, databaseURL, appId, etc.).
- authDomain confirmed: guess-whooooo.firebaseapp.com. Still missing: apiKey, databaseURL, projectId, appId (Mehdi has been sending single values, not the full block).
- firebaseConfig received 2026-11-06 (web app config, not secret; protected by DB rules): projectId guess-whooooo, databaseURL https://guess-whooooo-default-rtdb.europe-west1.firebasedatabase.app (RTDB exists, europe-west1), authDomain guess-whooooo.firebaseapp.com, storageBucket guess-whooooo.firebasestorage.app, messagingSenderId 1057459858094, appId 1:1057459858094:web:f59990b0d70aa8afc79b3f, measurementId G-BH4Q5S1JLZ, apiKey AIzaSyC3rQijJJceY8fjXFlOossRO5eCDLSyLlo. (Analytics measurementId present, so Analytics is on; we plan not to use it.)
- Console UI learnings: new Firebase console has icon-only left rail; Project settings is now gear > "General" (Your apps > Config).
- Still to confirm: Anonymous Auth enabled; RTDB in locked mode.
- Note: Firebase Hosting URL exists, but the decision is GitHub Pages hosting. Revisit only if Mehdi prefers Firebase Hosting.

## Scaffold done (2026-11-06)
- Created Vite + React project in this folder: package.json, vite.config.js (base /guess-whooooo/), index.html, src/{main.jsx,App.jsx,firebase.js,styles.css}, database.rules.json, .github/workflows/deploy.yml, .gitignore, .claude/launch.json (dev server port 5173).
- npm install OK, `npm run build` OK, `npm test` passes (no tests yet).
- Connection test: anonymous sign-in works (user got past it). Database write returned PERMISSION_DENIED because the rules in database.rules.json are not yet published in the Firebase console (still locked). Next: Mehdi pastes the rules in Realtime Database > Rules and publishes.
- npm audit: 4 high vulns, all in firebase's Firestore packages, which we don't use (only auth + database). Revisit later.
- Not yet done: git init, commit, push to GitHub (needs Mehdi's go-ahead); enable Pages with source "GitHub Actions" in repo Settings > Pages.

- Rules published by Mehdi; page shows "Connected to Firebase". Firebase connection verified end to end.

- Pushed to GitHub (main) after installing gh CLI via Homebrew and `gh auth login` (HTTPS, keyring) as mehdidamou. Plain git push failed first: no stored credentials.
- Pages enabled via gh api (build_type workflow). First deploy succeeded. Live: https://mehdidamou.github.io/guess-whooooo/ . Not yet tested on a phone.

- Live site confirmed "Connected to Firebase" on Mehdi's device. Phase 0 complete.

## Phase 1 content (2026-11-06, in progress)
- src/data/characters.json: 30 original characters (EN/FR names; attributes villain, girl, human, hair, color, mask, cape, flies, strong, armor, weapon, animal, energy). 13 girls, 3 villains, 3 non-human-ish (tree, fox, rock) + android + goo.
- src/data/questions.json: 28 suggested yes/no questions (EN/FR, emoji icon) mapped to attributes. Auto-answered from the secret character.
- tests/data.test.js: 3 passing tests (30 unique chars, questions split roster, every character distinguishable by questions).
- Generator script lives in the session scratchpad only; JSON files are the source of truth now.
- Roster approved by Mehdi (2026-11-06).
- 30 SVGs generated into public/characters/<id>.svg (referenced as characters/<id>.svg), drawn by an attribute-driven Python template (script was in the scratchpad, not kept). Visuals match attributes (mask, cape, armor, wings, weapon, energy glow, villain brows). Special art for tree, fox, rock, android, goo. Reviewed on a contact sheet; looks good. Committed and pushed (2026-11-06, commit ded7070); live site redeploys via Actions.

## Phase 2 screens (2026-11-06)
- Built: i18n (EN/FR, auto-detect + toggle, saved in localStorage), PlayerSelect, CharacterPick (tap + confirm bar), Waiting/ready screen, Reset game button, "Not me" and "Change hero" options.
- Architecture: src/game/{rules.js (pure, tested), api.js (Firebase writes), useRoom.js (auth + subscriptions)}. Who-am-I is derived from room.players[name].uid == anonymous uid, so reloads/reconnects just work (no localStorage needed). Secret hero stored at secrets/<uid>/charId (owner-only read by rules).
- Tested with two origins (localhost vs 127.0.0.1 = two anonymous users): name claiming greyed out live, both-ready screen on both sides. 7 tests pass (data + rules). Test data cleaned with Reset.
- Database rules unchanged (no republish needed).

## Phase 3 game loop (2026-11-06)
- Built: Board (30-card grid, tap to flip down, turn banner, status panel, question history), QuestionSheet (28 suggested questions with icons + free-form input), guess flow with confirm modal, End screen (winner, both heroes revealed, Play again).
- Game state at rooms/family/game: {id, turn, skip, pending{from,kind,questionId|text|charId,answer}, winner, skipNote, log, reveal}. Random starter chosen by a transaction (startGameIfNeeded).
- Suggested questions and guesses are auto-answered by the opponent's device from its own secret (answerFor); free-form questions get manual Yes/No buttons. Asker presses OK to log the answer and pass the turn. Wrong guess => guesser loses next turn (afterTurn). Rematch clears ready+game, players stay.
- Flipped cards are local only (localStorage per game id + uid).
- Tested end to end with two origins: suggested Q auto-answer, free-form manual answer, wrong guess + lose-a-turn banner, correct guess win + reveal on both sides, rematch back to pick. 11 unit tests pass, build OK. Rules unchanged.
- Not yet done: real-phone test of Phase 3, visual polish of question sheet, Phase 4 polish (sounds, win animation, read-aloud TTS for Taninna, accessibility), reconnect edge cases.

## Next steps
1. Commit/push Phase 3 (ask Mehdi), play a real game on both Android phones.
2. Phase 4 polish: sounds, win animation, read-aloud (TTS EN/FR), bigger icons for Taninna.
2. Phase 1 content: 30 characters (EN/FR), questions, SVG art.
2. Generate roster (30 characters with attributes, EN/FR).
3. Set up repo, build prototype.
