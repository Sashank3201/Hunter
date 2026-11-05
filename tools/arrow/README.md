# Arrow's language model

Arrow decides what a message means (one of 70 intents) with a small neural network that runs inside the app, offline.

The model has four stages:

1. Each message becomes a bag of hashed features: words, word pairs, character 3- and 4-grams, and placeholders such as `@F` for any known food, `@N` for a number and `@E` for an exercise.
2. The feature embeddings are averaged.
3. The average goes through one ReLU layer.
4. A softmax over the intents gives the answer.

The same feature code (`js/arrow-nlu.js`) runs in the trainer and in the app, so they always agree.

## Files

| File | What it is |
| --- | --- |
| `templates.js` | Example messages for every intent, in English, Telugu and Hindi written in English letters. |
| `gen.js` | Expands the templates with real foods, numbers, exercises, pages, story events, bosses and Arrow skins, then adds typos, fillers ("bro", "ra", "yaar") and emoji. |
| `train.js` | Trains the network, evaluates it, and writes `models/arrow-nlu.bin` (int8 embeddings, about 870 KB). |
| `realworld.tsv` | Hand-written test messages. Never trained on. |
| `userphrases.tsv` | 60 messages the Player actually sent Arrow, variations of them, and look-alikes that must stay with the old intents. Never trained on: the generator drops any template line that matches one word for word. |
| `blind_test.tsv` | Test messages written separately, without seeing the templates. Never trained on. |
| `collected_a.tsv`, `collected_b.tsv` | 1,600 natural chats (English-heavy, and Telugu/Hindi-mixed) written separately and used as training data. Any line that matches or nearly matches a blind-test message is dropped before training. |
| `evalset.js`, `tune.sh` | Score a model on a test file; compare model settings on held-out natural chats. |
| `app.js` | Loads the app's own data files into the trainer. |

## Retrain

```sh
cd tools/arrow
node train.js --skip --D 48 --seed 8     # a minute or two; prints accuracy and every miss
```

After adding foods, intents or templates, retrain and commit the new `models/arrow-nlu.bin`. Then bump the service-worker cache in `sw.js`.

On the phone, Arrow also learns from the Player. When the Player taps "Not what I meant" and picks the right answer, that phrasing is remembered on the device and wins next time. Profile → "Forget what Arrow learned" clears it.

## Current model

| Setting | Value |
| --- | --- |
| Buckets (B) | 16,384 |
| Embedding size (D) | 48 |
| Hidden layer (H) | 96 |
| Character n-grams | 3 and 4 |
| Skip-grams | on |
| Epochs | 10 |
| Seed | 8 |
| Training examples | 63,862 |
| Intents | 70 |
| File size | 878 KB |

The newest intents are `rest_day`, `swap_move`, `short_quest` and `rivals`. Before they were trained they existed only as regex rules in `arrowReply`, so any phrasing the regex missed fell to "my brain glitched". The regex stays as an instant first pass; the model now catches what it misses (for example "door wala exercise hata do", "sirf 10 minute hai mere paas", "who's winning this week me or my friend"). The pain intent also learned arms, forearms, biceps, triceps, thighs and calves (`BODY` in `gen.js` had none, which is why "My left arm is injured" failed), plus words like injured, strained and pulled.

Before those, the newest were `expedition`, `skill_tree` and `chronicle` (their 24 lines in `realworld.tsv` were written before their templates), and before them `ask_advice`, `ask_progress`, `daily_plan`, `nutrition_tip`, `feeling_down`, `more`, `fun_fact`, `arrow_skin`, `about_me`, `log_body`, `ask_body` and `ask_sleep`. Their test lines in `realworld.tsv` were written before their templates. Telling Arrow how you slept ("slept 5 hours") stays under `recovery`, which logs it, and "my knee is better now" stays under `pain`, which clears the injury.

The blind test is split into two halves of 200 messages:

- **Dev half:** its misses were used to find gaps in the templates.
- **Test half:** the honest score. During the update that added the nine new intents it was checked once mid-way, and one template it showed was overlapping (`should i eat before or after workout`) was removed. Model settings and seed were chosen on the natural validation set (`--natval`), not on the blind test.

| Test | Before (66 intents) | Now (70 intents) |
| --- | --- | --- |
| Blind test half (honest) | 94.0% | **95.5%** |
| Blind dev half | 99.0% | 98.5% |
| Hand-written set (433 lines) | 94.7% | 99.1% (98.4% of the 249 never seen in training) |
| The Player's phrases (`userphrases.tsv`, 60 lines) | 28.3% | **98.3%** |
| ...test half (26 lines, honest) | | 96.2% |
| ...lines no training example comes close to (43) | | 97.7% |

On the blind test half, Arrow answers directly 90% of the time (confidence ≥ 0.42), and those answers are 97.8% right (98.9% before). For the rest it shows "did you mean" chips.

`userphrases.tsv` was written before the new templates. Its dev half had one miss after the first retrain: "not in the mood to work out today" went to `rest_day`, so Arrow would have offered a Rest Pass instead of a push. Six `motivate` lines about mood and laziness fixed it. The retrain then flipped one test-half line, "upper arm is sore and swollen after the fall", to `log_food` at 31%. It was left as it is rather than tuned on. In the app the pain rule catches that sentence before the model, and 31% is below the answer threshold anyway.

## Why the model stayed at 878 KB

A bigger model was tried first. Each size was trained on the new data with three seeds and scored on the held-out natural chats (`--natval --skip --epochs 10`):

| Size | Settings | Natural chats (3 seeds) |
| --- | --- | --- |
| 878 KB | B 16,384, D 48 | **89.6%** (87.5 to 91.7) |
| 1.7 MB | B 32,768, D 48 | 89.4% (88.7 to 90.1) |
| 1.7 MB | B 16,384, D 96 | 89.5% (88.7 to 89.9) |
| 2.2 MB | B 32,768, D 64 | 89.5% (88.5 to 90.5) |

None beats the current size by more than seed noise. Trained on the same full data, the 2.2 MB model and the 878 KB one also scored the same on the Player's phrases (98.3%) and on the blind test half (95.0% each, before the `motivate` fix). What fixed the failures was the training data, not the size. This network averages word features and picks one of a fixed set of intents, so more room mostly stores the same patterns again.

Teaching Arrow its bodies (`{FM}` in `arrow_skin`: "become Kirby", "turn into a cloud", "what bodies do you have") and the nine body skins cost a little. Before, the blind test half was 96.5%, the dev half 99.5% and the hand-written set 99.2%; the test half now misses 3 more of its 200 messages. On the natural validation set the old templates averaged 89.6% over seeds 7, 8 and 9, the new ones 88.5%, and single seeds swing by up to 3 points, so most of that is noise. Seed 9 scored best on the natural set, so it ships. On 20 body and new-skin phrases the old model got 6 right, the new one 20.

Adding `expedition`, `skill_tree` and `chronicle` (with a `{PK}` slot for perk names and `{MO}` for months) left the natural validation average where it was: 88.1%, 88.6% and 88.8% on seeds 7, 8 and 9, 88.5% on average, the same as before. Seed 9 was best again and ships. The blind test half went from 95.0% to 94.0% (2 more misses of 200); one of its misses now lands in a new intent ("my crush left me on read" → `expedition` at 11% confidence, so Arrow asks what you meant instead of answering). The hand-written set went up from 98.7% to 99.3%, with all 24 new lines right.

Adding intents costs a little accuracy on everyday chats about the old ones. On the natural validation set (held-out collected chats, three seeds each), the 51-intent model averaged 91.7%. The 60-intent model averaged 89.0% at D=32 and 90.2% at D=48, which is why D went up. Some of the remaining misses land in a new intent that still answers well, for example "white rice for fat loss, good or bad?" now gets the rice tip instead of the nutrition facts.

To retrain with the same settings:

```sh
node train.js --skip --epochs 10 --D 48 --seed 8
```
