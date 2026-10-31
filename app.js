const $ = id => document.getElementById(id);
const placed = new Map();
let selected = null, active = null;
const at = (p,i) => [p.r+(p.d?i:0),p.c+(p.d?0:i)].join(',');
const entries = new Map(PUZZLE.map(p=>[p.id,p]));
const displayAnswer = word => word.english.split(/\s+/).map(part=>part.charAt(0).toUpperCase()+part.slice(1).toLowerCase()).join('').replace(/[^a-z]/gi,'');
const rows = Math.max(...PUZZLE.map(p=>p.r+(p.d?p.answer.length:1)));
const cols = Math.max(...PUZZLE.map(p=>p.c+(p.d?1:p.answer.length)));
const cells = new Map();
PUZZLE.forEach(p=>[...p.answer].forEach((_,i)=>{const k=at(p,i);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(p.id);}));
const bankOrder = [...PUZZLE].sort(()=>Math.random()-.5);
function say(text){$('feedback').textContent=text;}
function chooseWord(id){selected=selected===id?null:id;render();if(selected!==null)say(`Selected “${entries.get(id).english}”. Click a crossword square to place it.`);}
function place(wordId,targetId){
 const word=entries.get(wordId),target=entries.get(targetId);
 if(!word||!target)return;
 if(word.answer.length!==target.answer.length){say(`That space needs ${target.answer.length} letters. “${word.english}” has ${word.answer.length}. Try another place.`);return;}
 for(const [slot,value] of placed)if(value===wordId)placed.delete(slot);
 placed.set(targetId,wordId);active=targetId;selected=null;render();say(placed.size===10&&[...placed].every(([slot,id])=>slot===id)?'¡Excelente! All 10 answers are correct. You completed the crossword!':`Placed “${word.english}”.`);
}
function target(ids,wordId){
 if(ids.includes(active))return active;
 const fitting=ids.filter(id=>entries.get(id).answer.length===entries.get(wordId).answer.length);
 if(fitting.length===1)return fitting[0];
 if(ids.length===1)return ids[0];
 return null;
}
function activate(id){active=active===id?null:id;render();}
function render(){
 const bank=$('bank');bank.replaceChildren();
 for(const p of bankOrder){const used=[...placed.values()].includes(p.id),option=document.createElement('option');option.value=String(p.id);option.textContent=p.english+(used?' ✓':'');option.selected=selected===p.id;bank.append(option);}
 bank.value=selected===null?'':String(selected);
 const grid=$('grid');grid.replaceChildren();grid.style.gridTemplateColumns=`repeat(${cols},40px)`;
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
  const list=$(container);list.replaceChildren();for(const p of PUZZLE.filter(p=>p.d===d)){
   const option=document.createElement('option');option.value=String(p.id);option.lang='es';option.textContent=p.number+' '+p.spanish+(placed.has(p.id)?' — '+displayAnswer(entries.get(placed.get(p.id))):'');option.selected=active===p.id;list.append(option);
  }
  list.value=active!==null&&entries.get(active).d===d?String(active):'';
 }
}
$('bank').onchange=()=>{if($('bank').value!=='')chooseWord(Number($('bank').value));};
for(const name of ['across','down']){
 const list=$(name);list.onchange=()=>{if(list.value!=='')activate(Number(list.value));};
}

$('reset').onclick=()=>{placed.clear();selected=null;active=null;render();say('Fresh start! All ten words are back in the bank.');};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;active=null;render();say('Selection cleared.');}});
render();
