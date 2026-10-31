// Fit once per puzzle; placements never change the measured dimensions or scale.
(() => {
 const area = document.getElementById('fit-area');
 const workspace = document.getElementById('workspace');
 const lists = ['across','down','bank'].map(id=>document.getElementById(id));
 // Native list selection can try to scroll a transformed ancestor into view.
 // Keep the fitted activity at its origin rather than hiding its top rows.
 const keepVisible=()=>{
  area.scrollTop=0;area.scrollLeft=0;
  const page=document.scrollingElement;
  if(page){page.scrollTop=0;page.scrollLeft=0;}
 };
 area.addEventListener('scroll',keepVisible,{passive:true});
 workspace.addEventListener('focusin',()=>window.requestAnimationFrame(keepVisible));
 workspace.addEventListener('change',()=>window.requestAnimationFrame(keepVisible));
 let pending=false, needsMeasure=true, width=1, height=1;
 window.fitCrossword=()=>{
  if(pending)return;
  pending=true;
  window.requestAnimationFrame(()=>{
   pending=false;
   if(needsMeasure){
    // Only a new puzzle or loaded font may change the lists' intrinsic widths.
    workspace.style.width='max-content';
    for(const list of lists)list.style.width='auto';
    for(const list of lists)list.style.width=list.offsetWidth+'px';
    width=Math.max(1,workspace.offsetWidth);
    height=Math.max(1,workspace.offsetHeight);
    workspace.style.width=width+'px';
    needsMeasure=false;
   }
   const scale=Math.min(1,Math.max(1,area.clientWidth-2)/width,Math.max(1,area.clientHeight-2)/height);
   workspace.style.transform=`scale(${scale})`;
   workspace.style.visibility='visible';
   keepVisible();
  });
 };
 window.resetCrosswordFit=()=>{needsMeasure=true;window.fitCrossword();};
 window.crosswordDisplay={screenWidth:window.screen.width,screenHeight:window.screen.height,scaling:window.devicePixelRatio||1};
 window.addEventListener('resize',window.fitCrossword);
 if(window.visualViewport)window.visualViewport.addEventListener('resize',window.fitCrossword);
 if(document.fonts)document.fonts.ready.then(window.resetCrosswordFit);
 new ResizeObserver(window.fitCrossword).observe(area);
 window.fitCrossword();
})();
