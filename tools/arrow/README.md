# Arrow's language model

Arrow decides what a message means (one of 50 intents) with a small neural network that runs inside the app, offline.

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
| `gen.js` | Expands the templates with real foods, numbers, exercises and pages, then adds typos, fillers ("bro", "ra", "yaar") and emoji. |
| `train.js` | Trains the network, evaluates it, and writes `models/arrow-nlu.bin` (int8 embeddings, about 600 KB). |
| `realworld.tsv` | Hand-written test messages. Never trained on. |
| `blind_test.tsv` | Test messages written separately, without seeing the templates. Never trained on. |
| `app.js` | Loads the app's own data files into the trainer. |

## Retrain

```sh
cd tools/arrow
node train.js            # about a minute; prints accuracy and every miss
```

After adding foods, intents or templates, retrain and commit the new `models/arrow-nlu.bin`. Then bump the service-worker cache in `sw.js`.

On the phone, Arrow also learns from the Player. When the Player taps "Not what I meant" and picks the right answer, that phrasing is remembered on the device and wins next time. Profile → "Forget what Arrow learned" clears it.
