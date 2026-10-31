// This blocking popup runs in the document head, before the puzzle is rendered.
(() => {
 const ratio = window.devicePixelRatio || 1;
 const width = window.screen.width;
 const height = window.screen.height;
 window.alert([
  `Screen resolution (browser pixels): ${width} × ${height}`,
  `Estimated resolution (device pixels): ${Math.round(width * ratio)} × ${Math.round(height * ratio)}`,
  `Scaling (display scaling × browser zoom): ${Math.round(ratio * 100)}%`,
  '',
  'Click OK to display the crossword.'
 ].join('\n'));
})();
