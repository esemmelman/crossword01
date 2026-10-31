// Browsers expose the usable CSS viewport after display scaling and browser zoom.
// Fit against that viewport rather than assuming physical monitor pixels are usable.
(() => {
 const area = document.getElementById('fit-area');
 const workspace = document.getElementById('workspace');
 let pending = false;
 window.fitCrossword = () => {
  if (pending) return;
  pending = true;
  window.requestAnimationFrame(() => {
   pending = false;
   const scale = Math.min(1,
    Math.max(1, area.clientWidth - 2) / Math.max(1, workspace.offsetWidth),
    Math.max(1, area.clientHeight - 2) / Math.max(1, workspace.offsetHeight));
   workspace.style.transform = `scale(${scale})`;
   workspace.style.visibility = 'visible';
  });
 };
 window.crosswordDisplay = {
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  scaling: window.devicePixelRatio || 1
 };
 window.addEventListener('resize', window.fitCrossword);
 if (window.visualViewport) window.visualViewport.addEventListener('resize', window.fitCrossword);
 if (document.fonts) document.fonts.ready.then(window.fitCrossword);
 new ResizeObserver(window.fitCrossword).observe(workspace);
 new ResizeObserver(window.fitCrossword).observe(area);
 window.fitCrossword();
})();
