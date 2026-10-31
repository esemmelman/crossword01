const $ = id => document.getElementById(id);
const placed = new Map();
let selected = null, active = null, setIndex = 0, layoutIndex = -1;
let PUZZLE = [], rows = 0, cols = 0, bankOrder = [];
const entries = new Map(), cells = new Map();
const at = (p,i) => [p.r+(p.d?i:0),p.c+(p.d?0:i)].join(',');
const displayAnswer = word => word.answer;
function shuffle(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function startPuzzle(nextSet=false){
 const previousBank=bankOrder.map(w=>w.id).join(',');
 if(nextSet){setIndex=(setIndex+1)%PUZZLE_SETS.length;layoutIndex=-1;}
 const set=PUZZLE_SETS[setIndex];
 const choices=set.layouts.map((_,i)=>i).filter(i=>i!==layoutIndex);
 layoutIndex=choices[Math.floor(Math.random()*choices.length)];
 PUZZLE=set.layouts[layoutIndex];
 placed.clear();selected=null;active=null;entries.clear();cells.clear();
 for(const p of PUZZLE){entries.set(p.id,p);[...p.answer].forEach((_,i)=>{const k=at(p,i);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(p.id);});}
 rows=Math.max(...PUZZLE.map(p=>p.r+(p.d?p.answer.length:1)));
 cols=Math.max(...PUZZLE.map(p=>p.c+(p.d?1:p.answer.length)));
 bankOrder=shuffle(PUZZLE);
 if(bankOrder.map(w=>w.id).join(',')===previousBank)bankOrder.push(bankOrder.shift());
 render();if(window.resetCrosswordFit)window.resetCrosswordFit();
}
function say(text){$('feedback').textContent=text;}
function chooseWord(id){selected=selected===id?null:id;render();say('');}
function place(wordId,targetId){
 const word=entries.get(wordId),target=entries.get(targetId);
 if(!word||!target)return;
 if(word.answer.length!==target.answer.length){say(`That space needs ${target.answer.length} letters. “${word.english}” has ${word.answer.length}. Try another place.`);return;}
 for(const [slot,value] of placed)if(value===wordId)placed.delete(slot);
 placed.set(targetId,wordId);active=targetId;selected=null;render();say('');
}
function target(ids,wordId){
 const fitting=ids.filter(id=>entries.get(id).answer.length===entries.get(wordId).answer.length);
 if(fitting.includes(active))return active;
 if(fitting.length===1)return fitting[0];
 if(ids.length===1)return ids[0];
 return null;
}
function activate(id){active=active===id?null:id;render();}
function render(){
 const bank=$('bank');bank.replaceChildren();bank.size=bankOrder.length;
 for(const p of bankOrder){const used=[...placed.values()].includes(p.id),option=document.createElement('option');option.value=String(p.id);option.textContent=used?p.english.replace(/\S/g,ch=>ch+'\u0336'):p.english;option.className=used?'used':'';option.setAttribute('aria-label',p.english+(used?', used':''));option.selected=selected===p.id;bank.append(option);}
 bank.value=selected===null?'':String(selected);
 const grid=$('grid');grid.replaceChildren();grid.style.gridTemplateColumns=`repeat(${cols},52px)`;
 const values=new Map();
 for(const [slot,wordId] of placed){const p=entries.get(slot),w=entries.get(wordId);[...displayAnswer(w)].forEach((ch,i)=>{const k=at(p,i);if(!values.has(k))values.set(k,[]);if(slot===active)values.get(k).unshift(ch);else values.get(k).push(ch);});}
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
  const k=`${r},${c}`,ids=cells.get(k),el=document.createElement(ids?'button':'div');el.className='cell';
  if(!ids){el.classList.add('block');el.setAttribute('aria-hidden','true');grid.append(el);continue;}
  const starts=PUZZLE.filter(p=>p.r===r&&p.c===c);if(starts.length){const num=document.createElement('small');num.textContent=starts[0].number;el.append(num);}
  const letters=values.get(k)||[],conflict=new Set(letters.map(ch=>ch.toUpperCase())).size>1;el.append(document.createTextNode(conflict?'•':letters[0]||''));
  if(ids.includes(active))el.classList.add('highlight');
  el.setAttribute('aria-label',ids.map(id=>{const p=entries.get(id);return `${p.number} ${p.d?'Down':'Across'}, ${p.spanish}`;}).join('; ')+`, ${conflict?'conflicting letters':letters[0]||'empty'}`);
  el.onclick=()=>{if(selected!==null){const id=target(ids,selected);if(id!==null)place(selected,id);else say('Select an Across or Down clue to choose the direction.');}else{const next=ids[(ids.indexOf(active)+1)%ids.length];active=next;render();}};
  grid.append(el);
 }
 for(const [container,d] of [['across',0],['down',1]]){
  const list=$(container);list.replaceChildren();list.size=Math.max(2,PUZZLE.filter(p=>p.d===d).length);for(const p of PUZZLE.filter(p=>p.d===d)){
   const option=document.createElement('option');option.value=String(p.id);option.lang='es';option.textContent=p.number+' '+p.spanish;option.selected=active===p.id;list.append(option);
  }
  list.value=active!==null&&entries.get(active).d===d?String(active):'';
 }
}
$('bank').onchange=()=>{if($('bank').value!=='')chooseWord(Number($('bank').value));};
for(const name of ['across','down']){
 const list=$(name);list.onchange=()=>{if(list.value!=='')activate(Number(list.value));};
}

$('reset').onclick=()=>{startPuzzle();say('');};
$('next').onclick=()=>{startPuzzle(true);say('');};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;active=null;render();say('');}});
startPuzzle();
