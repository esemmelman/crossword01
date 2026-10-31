const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('fit.js','utf8');
for(const [width,height] of [[1264,570],[1264,490],[1904,880],[1008,430]]){
 const areaEvents={},workspaceEvents={},page={scrollTop:0,scrollLeft:0};
 const area={clientWidth:width,clientHeight:height,addEventListener:(name,fn)=>areaEvents[name]=fn};
 const workspace={offsetWidth:1950,offsetHeight:850,style:{},addEventListener:(name,fn)=>workspaceEvents[name]=fn};
 const lists={across:{offsetWidth:400,style:{}},down:{offsetWidth:420,style:{}},bank:{offsetWidth:410,style:{}}};
 const listeners={};
 const window={screen:{width:1280,height:720},devicePixelRatio:1.5,requestAnimationFrame:fn=>fn(),addEventListener:(name,fn)=>listeners[name]=fn};
 vm.runInNewContext(source,{window,document:{scrollingElement:page,getElementById:id=>id==='fit-area'?area:id==='workspace'?workspace:lists[id]},ResizeObserver:class{observe(){}}});
 const scale=Number(workspace.style.transform.match(/scale\((.+)\)/)[1]);
 assert.ok(workspace.offsetWidth*scale<=width);assert.ok(workspace.offsetHeight*scale<=height);
 assert.equal(workspace.style.visibility,'visible');assert.equal(window.crosswordDisplay.scaling,1.5);
 const originalTransform=workspace.style.transform;
 for(const event of [()=>areaEvents.scroll(),()=>workspaceEvents.focusin(),()=>workspaceEvents.change()]){area.scrollTop=150;area.scrollLeft=20;page.scrollTop=80;page.scrollLeft=10;event();assert.equal(area.scrollTop,0);assert.equal(area.scrollLeft,0);assert.equal(page.scrollTop,0);assert.equal(page.scrollLeft,0);assert.equal(workspace.style.transform,originalTransform);}
 assert.equal(lists.across.style.width,'400px');assert.equal(lists.down.style.width,'420px');assert.equal(lists.bank.style.width,'410px');
 // Even if native option decorations change intrinsic dimensions, placement cannot rescale.
 workspace.offsetWidth=2000;workspace.offsetHeight=900;window.fitCrossword();
 assert.equal(workspace.style.transform,originalTransform);
 assert.equal(workspace.style.width,'1950px');
 // Actual viewport resizing still refits the cached puzzle dimensions.
 area.clientWidth=width/2;listeners.resize();
 const smallerScale=Number(workspace.style.transform.match(/scale\((.+)\)/)[1]);assert.ok(1950*smallerScale<=width/2);
 // A new randomized puzzle is measured afresh.
 window.resetCrosswordFit();assert.equal(workspace.style.width,'2000px');
 const newScale=Number(workspace.style.transform.match(/scale\((.+)\)/)[1]);assert.ok(2000*newScale<=width/2);assert.ok(900*newScale<=height);
}
const html=fs.readFileSync('index.html','utf8');assert.ok(!html.includes('display.js'));assert.ok(!html.includes('set-range'));
const panel=html.match(/<section class="puzzle-panel"[\s\S]*?<\/section>/)[0];assert.ok(panel.indexOf('id="reset"')>panel.indexOf('id="grid"'));assert.ok(panel.includes('<button id="next">Next</button>'));
assert.ok(html.includes('id="feedback" class="sr-only"'));
assert.ok(fs.readFileSync('style.css','utf8').includes('min-height:0;overflow:clip;overflow-anchor:none'));
console.log('PASS: selection/focus scrolling cannot obscure the activity; fixed widths and font scaling across placements; viewport resizing and new puzzles refit; both buttons below grid; word-range label and visual status removed.');
