# Hunter System

A Solo Leveling style calisthenics and nutrition app. Train at home with bodyweight moves, clear one quest a day, earn EXP and rank up from E to S.

**Live app:** https://sashank3201.github.io/Hunter/

It is a Progressive Web App (PWA): plain HTML, CSS and JavaScript with no build step, no server and no account. Everything runs in the browser and works offline once loaded.

## What's inside

- **Daily quests.** A rank-based program of 150+ calisthenics moves in blocks (push, pull, legs, core, plyometrics, speed, mobility, flexibility). New moves unlock as you level up, and every target grows a little past your last session.
- **Workout runner.** Warm-up, set timers, rest timers, a matched cool-down and animated form demos for every move.
- **Ranks and trials.** Pass a rank trial to move up from E to S. The next rank's moves stay locked until you pass it.
- **Gates.** Dungeon raids, with optional 3D worlds (three.js), bosses and loot.
- **Shadows, weapons, chests and achievements.**
- **Story events.** Eight Solo Leveling arcs take turns, one a week: five daily chapters, then a 3D boss raid that drops a weapon and a shadow.
- **Arrow skins.** Eleven looks for Arrow. Each event's fifth chapter gives one, and three more come from milestones (quests cleared, best streak, shadows commanded). Pick one in **Profile → Arrow skin**, or tell Arrow "wear the Monarch skin".
- **Diet.** Daily calorie and protein targets, a food log with 200+ foods (lots of Indian staples), and voice input.
- **Arrow.** A chat companion that understands English, Telugu and Hindi written in English letters. It logs food, coaches you from your own numbers ("give me advice", "am I improving?", "plan my day"), answers training, diet and sleep questions, and follows up when you say "tell me more". Its language model runs on the phone, offline.
- **Weekly report** with a grade, and a shareable Hunter License card.

The app has five tabs: Status, Quest, Gates, Progress and Diet. Profile and settings open from the button at the top.

## Install it on your phone

No app store needed. Open the live link once with internet, then:

- **Android (Chrome):** tap the ⋮ menu, then **Install app** (or **Add to Home screen**).
- **iPhone (Safari):** tap **Share**, then **Add to Home Screen**.

It opens full screen like a normal app and works offline after that. It updates itself whenever you open it with internet.

Notes:
- Haptics (vibration) work on Android. iPhone browsers don't allow websites to vibrate.
- Voice input in the food log needs a browser with speech recognition, such as Chrome or Safari.

## Run it on your computer

### What you need

| Tool | Needed for | Get it |
| --- | --- | --- |
| A modern browser | Using the app | Chrome, Edge, Safari or Firefox |
| Git | Getting the code | https://git-scm.com |
| Any static web server | Running it locally | Python 3 (already on macOS and most Linux) or Node.js |
| Node.js 18+ | Optional: only to retrain Arrow or rebuild the Hairline figures | https://nodejs.org |

There is nothing to install with npm and nothing to compile.

### Steps

```sh
git clone https://github.com/Sashank3201/Hunter.git
cd Hunter
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

No Python? Use Node instead:

```sh
npx serve -l 8000
```

On Windows, use `python` or `py` instead of `python3` if that's how Python is installed.

**Don't open `index.html` by double-clicking it.** Browsers block the service worker, the 3D module and Arrow's model file on `file://` pages, so parts of the app won't work. Always go through a local server.

### Open it on your phone during development

Start the server as above, find your computer's local IP address, and open `http://<that-ip>:8000` on a phone on the same Wi-Fi. The app runs, but offline mode and **Install app** only work on `localhost` or HTTPS, so test those on the live site.

## Put your own copy online (GitHub Pages)

1. Fork this repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute or two the app is live at `https://<your-username>.github.io/Hunter/`.

Every push to `main` redeploys it. The `.nojekyll` file tells GitHub to serve the files exactly as they are.

## Your data

All progress stays on your device, in the browser's local storage. Nothing is sent anywhere.

| Key | What it holds |
| --- | --- |
| `hunter_system_v1` | Level, EXP, quests, records, shadows, weapons, settings |
| `hunter_diet_v1` | Body details, diet type, food log and Arrow's chat |
| `hunter_arrow_v1` | Arrow's memory and what it learned from you |

Clearing the browser's site data or uninstalling the app deletes your progress. To keep it safe, or to move it to another phone, open **Profile and settings → Data → Save backup**. This downloads a `.json` file that **Restore from backup** loads back in.

## Making changes

There is no build step: edit a file, save it, and refresh the page.

- **Scripts load in order.** `index.html` loads the files in `js/` as classic scripts that share global variables, so the order matters. `js/data.js` comes first and `js/main.js` comes last. Only `js/world3d.js` is an ES module, loaded when a Gate opens.
- **Adding a new file:** add it to `index.html`, and to the `ASSETS` list in `sw.js` so it works offline.
- **Before every release:** bump the cache name in `sw.js` (`hunter-system-v21` → `hunter-system-v22`) so phones store the new files for offline use.
- **Adding a story event:** add it to `STORY_EVENTS` in `js/story.js` (anywhere in the list), with its weapon in `WEAPONS`, its shadow in `SHADOW_BODY` and `SHADOW_SKILLS` (`js/data.js`), its skin in `ARROW_SKINS`, a silhouette look in `js/shadows.js` and a raid world in `js/world3d.js`. Weeks that have already started keep their event, so a new one never replaces a live one. Then retrain Arrow so it knows the new names.
- **Test switches.** Set these in the browser console, or in a test before the page loads:

| Switch | Effect |
| --- | --- |
| `window.__TODAY='2026-10-12'` | Pretend today is that date |
| `window.__NO_SUDDEN=1` | No sudden quests |
| `window.__NO_CHEST=1` | No daily login chest |
| `window.__NO_EVENT=1` | No story events |
| `window.__NO_WEAPON_FX=1` | No weapon reveal animation |
| `window.__NO_REACT=1` | Arrow doesn't react to big moments |

### Project layout

| Path | What it is |
| --- | --- |
| `index.html` | The page and script order |
| `css/app.css` | All styles, light and dark |
| `js/data.js` | Game data: ranks, the move library, weekly split, warm-ups, cool-downs |
| `js/state.js` | Saved state, levels and today's plan |
| `js/engine.js` | EXP, level-ups, penalties and rewards |
| `js/views.js` | The tabs' screens |
| `js/workout.js`, `js/timer.js` | The workout runner and timers |
| `js/demos.js` | Stick-figure form demos for every move |
| `js/trials.js`, `js/dungeons.js`, `js/world3d.js` | Rank trials, Gates and the 3D worlds |
| `js/shadows.js`, `js/weapons.js`, `js/items.js`, `js/chest.js` | Shadows, weapons, items and chests |
| `js/events.js`, `js/story.js`, `js/feats.js` | Story events and achievements |
| `js/nutrition.js`, `js/foods.js`, `js/foodlog.js`, `js/recipes.js` | Diet targets, food database, food log and recipes |
| `js/arrow*.js`, `js/bot.js`, `js/botgame.js` | Arrow: brain, words, language model and the rest-timer mini game |
| `js/report.js`, `js/card.js` | Weekly report and Hunter License card |
| `js/awaken.js`, `js/menu.js`, `js/main.js` | First-run sign-up, the profile menu, start-up |
| `js/vendor/` | three.js and the avatar engine |
| `models/arrow-nlu.bin` | Arrow's trained language model |
| `tools/arrow/` | Training data and scripts for Arrow's model |
| `figures/` | Hairline line-art figures (Arise, Gate) |
| `fonts/`, `icons/`, `img/` | Fonts, app icons, shadow art |
| `sw.js`, `manifest.webmanifest` | Offline support and install settings |

### Retrain Arrow

Needs Node.js 18+. Takes about two minutes:

```sh
cd tools/arrow
node train.js --skip --epochs 10 --D 48
```

This writes a new `models/arrow-nlu.bin`. Commit it and bump the cache in `sw.js`. See [tools/arrow/README.md](tools/arrow/README.md) for how the model works and its test scores.

### Hairline figures

See [figures/README.md](figures/README.md).

## Credits

- [three.js](https://threejs.org) (MIT license, `js/vendor/three.LICENSE`) for the 3D Gates.
- Fonts: Archivo and IBM Plex Mono, under the SIL Open Font License (`fonts/LICENSE-*.txt`).
- Hairline figures made with [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline).

Hunter System is a fan project inspired by *Solo Leveling*. It is not affiliated with or endorsed by the creators or publishers of *Solo Leveling*.

This app is not medical advice. Check with a doctor before starting a new training or diet plan, especially if you have an injury or a health condition.
