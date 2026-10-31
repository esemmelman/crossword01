const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('fit.js', 'utf8');
// 1280 x 720 screen at 150%, with browser chrome, status, and both buttons reserved.
for (const [width,height] of [[1264,570],[1264,490],[1904,880],[1008,430]]) {
 const area = {clientWidth:width,clientHeight:height};
 const workspace = {offsetWidth:1950,offsetHeight:850,style:{}};
 const listeners = {};
 const window = {screen:{width:1280,height:720},devicePixelRatio:1.5,
  requestAnimationFrame:fn=>fn(),addEventListener:(name,fn)=>listeners[name]=fn};
 vm.runInNewContext(source,{window,document:{getElementById:id=>id==='fit-area'?area:workspace},ResizeObserver:class {observe(){}}});
 let scale = Number(workspace.style.transform.match(/scale\((.+)\)/)[1]);
 assert.ok(workspace.offsetWidth*scale<=width);
 assert.ok(workspace.offsetHeight*scale<=height);
 assert.equal(workspace.style.visibility,'visible');
 assert.equal(window.crosswordDisplay.scaling,1.5);
 // Longer labels after placement must also fit without a horizontal page scroll.
 workspace.offsetWidth=2600;listeners.resize();
 scale=Number(workspace.style.transform.match(/scale\((.+)\)/)[1]);
 assert.ok(workspace.offsetWidth*scale<=width);
 assert.ok(workspace.offsetHeight*scale<=height);
}
const html=fs.readFileSync('index.html','utf8');
assert.ok(!html.includes('display.js'));
assert.ok(html.indexOf('id="reset"')>html.indexOf('id="feedback"'));
assert.ok(html.includes('<button id="next">Next</button>'));
assert.ok(html.indexOf('id="next"')<html.indexOf('</main>'));
console.log('PASS: viewport fit at 150% scaling, smaller browser areas, resizing, and longer labels; both buttons in activity; popup removed.');
