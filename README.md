# Spanish crossword

Native desktop list boxes with Spanish Across/Down clues and an English word bank. Select a Spanish clue, then select its English translation in the word bank. Correct matches fill the crossword automatically. Incorrect English selections flash red for one second, then deselect; the Spanish clue stays selected so you can try again. Grid answers use uppercase letters with no spaces. Correct answers and their Spanish clues are struck through and grayed out in both lists. Incorrect matches never enter the grid. Correct matches remain grayed out until Start over or Next.

Vocabulary comes from all 69 entries of [span020](https://github.com/esemmelman/span020), preserving the original order. One English translation is chosen where the source offers alternatives.

- **Start over** clears progress, chooses a different connected crossword layout for the current set, and reshuffles the Across and Down lists. The word bank stays alphabetical.
- **Next** loads the next consecutive ten entries. The last group has nine entries (61–69), then Next returns to the first group.
- The crossword, enlarged lists, Start over, and Next fit the available browser viewport, including 1920 × 1080 at 150% scaling. Resolution/scaling are inspected silently. Start over and Next sit directly below the grid. List widths and font scaling are fixed within each puzzle; placing words adds no English to Spanish clues and shows no status. No popup or sign-in is needed.

Open `index.html` or serve this directory with any static server. No build or installation is needed. GitHub Pages publishes the root of `main` automatically on push.

`vocabulary.json` stores the 69 source pairs. `node generate.cjs` generates 24 distinct connected layouts per group into `puzzle.js`; the browser picks a different cached layout on each reset for an immediate response.

Run `node verify.cjs` for all 168 layouts, grouping, Spanish-first matching, the one-second error timer, capitalization, correct-pair styling, randomization, progression, silent placement, fixed scaling, and reset behavior. Run `node verify-fit.cjs` for viewport-fit calculations and control placement. These are automated structure and interaction checks; they do not replace browser visual inspection.

Across and Down clues are shuffled once per puzzle and keep their order during play. The English word bank is always sorted alphabetically.
