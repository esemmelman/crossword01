# Trail of Words — Spanish crossword

Click-to-place crossword using exactly the first ten Spanish entries in [span020](https://github.com/esemmelman/span020). Spanish clues; The crossword sits on the far left, followed by native desktop list boxes for the Across clues, Down clues, and English answer bank. Select an answer from the word bank, then click a grid square to place it. Across and Down selections highlight the corresponding entry. Includes tap/click and keyboard button alternatives, automatic completion feedback, restart, and responsive layout.

One translation is chosen where the source lists alternatives. Infinitive answers retain “to”; spaces are omitted in the grid. No login, build, or installation is needed. Open `index.html` or serve this directory with any static server.

`vocabulary.json` holds the ten source pairs. `node generate.cjs` generates a connected crossword in `puzzle.js`. The committed puzzle remains fixed until regenerated.

Hosted with GitHub Pages from the root of `main`. Pushing to `main` automatically publishes changes.

The activity automatically scales to the current browser viewport, including a 1920 × 1080 monitor at 150% scaling (1280 × 720 CSS screen pixels). All list entries stay visible; Start over sits below the first screen. No display popup is shown. Run `node verify-fit.cjs` to check fit calculations.
