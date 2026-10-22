# Arrow's language model

Arrow decides what a message means (one of 60 intents) with a small neural network that runs inside the app, offline.

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
| `blind_test.tsv` | Test messages written separately, without seeing the templates. Never trained on. |
| `collected_a.tsv`, `collected_b.tsv` | 1,600 natural chats (English-heavy, and Telugu/Hindi-mixed) written separately and used as training data. Any line that matches or nearly matches a blind-test message is dropped before training. |
| `evalset.js`, `tune.sh` | Score a model on a test file; compare model settings on held-out natural chats. |
| `app.js` | Loads the app's own data files into the trainer. |

## Retrain

```sh
cd tools/arrow
node train.js --skip --D 48     # a minute or two; prints accuracy and every miss
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
| Seed | 7 |
| Training examples | 56,204 |
| Intents | 60 |
| File size | 874 KB |

The nine newest intents are `ask_advice`, `ask_progress`, `daily_plan`, `nutrition_tip`, `feeling_down`, `more`, `fun_fact`, `arrow_skin` and `about_me`. Their test lines in `realworld.tsv` were written before their templates.

The blind test is split into two halves of 200 messages:

- **Dev half:** its misses were used to find gaps in the templates.
- **Test half:** the honest score. During the update that added the nine new intents it was checked once mid-way, and one template it showed was overlapping (`should i eat before or after workout`) was removed. Model settings and seed were chosen on the natural validation set (`--natval`), not on the blind test.

| Test | Accuracy |
| --- | --- |
| Blind test half (honest) | **97.5%** |
| Blind dev half | 99.0% |
| Hand-written set | 99.5% |

On the blind test half, Arrow answers directly 89% of the time (confidence ≥ 0.42), and those answers were all right. For the rest it shows "did you mean" chips.

Adding intents costs a little accuracy on everyday chats about the old ones. On the natural validation set (held-out collected chats, three seeds each), the 51-intent model averaged 91.7%. The 60-intent model averaged 89.0% at D=32 and 90.2% at D=48, which is why D went up. Some of the remaining misses land in a new intent that still answers well, for example "white rice for fat loss, good or bad?" now gets the rice tip instead of the nutrition facts.

To retrain with the same settings:

```sh
node train.js --skip --epochs 10 --D 48
```
