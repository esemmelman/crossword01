const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(){this.children=[];this.handlers={};this.style={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)};}
 append(...items){this.children.push(...items);}replaceChildren(){this.children=[];}setAttribute(){}addEventListener(name,fn){this.handlers[name]=fn;}
}
const elements=new Map();
const document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),createTextNode:text=>({textContent:text}),addEventListener(){}};
let fitResets=0,clock=0,timerId=0;const timers=new Map();
function advance(ms){const until=clock+ms;while(true){const next=[...timers].filter(([,t])=>t.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;clock=next[1].at;timers.delete(next[0]);next[1].callback();}clock=until;}
const context=vm.createContext({document,console,window:{resetCrosswordFit:()=>fitResets++,setTimeout:(callback,delay)=>{const id=++timerId;timers.set(id,{callback,at:clock+delay});return id;},clearTimeout:id=>timers.delete(id)},getFitResets:()=>fitResets,advance});
vm.runInContext(fs.readFileSync('puzzle.js','utf8')+'\n'+fs.readFileSync('app.js','utf8'),context);
vm.runInContext(`
function expect(value,message){if(!value)throw Error(message);}
expect(PUZZLE_SETS.length===7,'Expected all seven sets');
for(const [setNumber,set] of PUZZLE_SETS.entries()){
 expect(set.start===setNumber*10+1,'Source order changed');
 expect(set.layouts.length>1,'Missing randomized layouts');
 const signatures=new Set();
 for(const puzzle of set.layouts){
  expect(puzzle.length===(setNumber===6?9:10),'Wrong set size');
  expect(new Set(puzzle.map(p=>p.id)).size===puzzle.length,'Duplicate vocabulary');
  const verified=new Map(),idsAt=new Map();
  for(const p of puzzle){
   expect(p.id>=set.start-1&&p.id<set.end,'Wrong vocabulary group');
   expect(p.answer===p.english.replace(/[^a-z]/gi,'').toUpperCase(),'Answer normalization');
   for(let i=0;i<p.answer.length;i++){
    const k=at(p,i);expect(!verified.has(k)||verified.get(k)===p.answer[i],'Invalid crossing');verified.set(k,p.answer[i]);
    if(!idsAt.has(k))idsAt.set(k,[]);idsAt.get(k).push(p.id);
   }
  }
  const seen=new Set([puzzle[0].id]);let changed=true;
  while(changed){changed=false;for(const ids of idsAt.values())if(ids.some(id=>seen.has(id)))for(const id of ids)if(!seen.has(id)){seen.add(id);changed=true;}}
  expect(seen.size===puzzle.length,'Disconnected grid');
  const signature=puzzle.map(p=>[p.id,p.r,p.c,p.d].join(',')).join(';');expect(!signatures.has(signature),'Repeated layout');signatures.add(signature);
 }
}
function clickSpanish(p){const list=$(p.d?'down':'across');list.value=String(p.id);list.onchange();}
function clickEnglish(p){$('bank').value=String(p.id);$('bank').onchange();}
for(let setNumber=0;setNumber<7;setNumber++){
 expect(setIndex===setNumber,'Next skipped set');
 expect(bankOrder.every((p,i)=>i===0||bankOrder[i-1].english.localeCompare(p.english,'en',{sensitivity:'base'})<=0),'Bank must be alphabetical');
 for(const d of [0,1]){const numbered=PUZZLE.filter(p=>p.d===d);expect(clueOrders[d].length===numbered.length,'Missing clues');if(numbered.length>1)expect(clueOrders[d].some((p,i)=>p.id!==numbered[i].id),'Clue list must be shuffled');}
 const beforeLayout=layoutIndex,beforeBank=bankOrder.map(p=>p.id).join(','),initialFitResets=getFitResets();
 const originalClues=JSON.stringify([$('across').children.map(o=>o.textContent),$('down').children.map(o=>o.textContent)]);
 const first=PUZZLE[0],other=PUZZLE[1];
 clickEnglish(first);expect(placed.size===0&&selected===null,'English first must not place or remain selected');
 clickSpanish(first);expect(placed.size===0&&active===first.id,'Spanish must select clue without placing');
 clickEnglish(other);expect(placed.size===0&&wrong===other.id&&selected===other.id,'Incorrect match must not fill crossword');
 expect($('bank').children.find(o=>Number(o.value)===other.id).className==='wrong','Wrong English must be red');
 advance(999);expect(wrong===other.id&&selected===other.id,'Red flash ended before one second');
 advance(1);expect(wrong===null&&selected===null&&$('bank').value==='','Wrong English must deselect at one second');
 expect(active===first.id,'Keep Spanish selected for retry');
 clickEnglish(first);expect(placed.get(first.id)===first.id&&active===null&&selected===null,'Correct pair did not fill crossword');
 expect(getFitResets()===initialFitResets,'Placement changed scaling');expect($('feedback').textContent==='','No placement status');
 expect(JSON.stringify([$('across').children.map(o=>o.textContent.split(String.fromCharCode(822)).join('')),$('down').children.map(o=>o.textContent.split(String.fromCharCode(822)).join(''))])===originalClues,'Spanish labels changed');
 for(const [listName,id] of [['bank',first.id],[first.d?'down':'across',first.id]]){const option=$(listName).children.find(o=>Number(o.value)===id);expect(option.className==='used'&&option.textContent.includes(String.fromCharCode(822)),'Correct pair must be gray and crossed out');}
 $('reset').onclick();expect(placed.size===0&&active===null&&selected===null,'Reset did not clear progress');expect(layoutIndex!==beforeLayout,'Reset did not randomize layout');expect(bankOrder.map(p=>p.id).join(',')===beforeBank,'Reset changed alphabetical bank order');
 for(const p of PUZZLE){clickSpanish(p);clickEnglish(p);}
 expect(placed.size===PUZZLE.length,'Not all correct pairs filled');expect($('feedback').textContent==='','No completion status');
 for(const name of ['across','down'])for(const option of $(name).children){const p=entries.get(Number(option.value));expect(option.textContent.split(String.fromCharCode(822)).join('')===p.number+' '+p.spanish,'English appended to Spanish');expect(option.className==='used','Correct Spanish not crossed out');}
 for(const square of $('grid').children){expect(!square.onclick,'Grid clicks must not place answers');for(const child of square.children)if(typeof child.textContent==='string')expect(!/[a-z]/.test(child.textContent),'Grid must be uppercase');}
 expect($('bank').children.every(o=>o.className==='used'),'Correct English not crossed out');
 $('next').onclick();expect(placed.size===0&&active===null&&selected===null,'Next retained progress');
}
expect(setIndex===0&&PUZZLE.length===10,'Next did not wrap');
// Timers from a previous attempt must never change a new clue, answer, or puzzle.
clickSpanish(PUZZLE[0]);clickEnglish(PUZZLE[1]);$('reset').onclick();clickSpanish(PUZZLE[0]);advance(1000);expect(active===PUZZLE[0].id&&wrong===null,'Old timer changed reset puzzle');
clickEnglish(PUZZLE[1]);$('next').onclick();clickSpanish(PUZZLE[0]);advance(1000);expect(active===PUZZLE[0].id&&wrong===null,'Old timer changed next set');
clickEnglish(PUZZLE[1]);clickSpanish(PUZZLE[2]);advance(1000);expect(active===PUZZLE[2].id&&wrong===null,'Old timer changed new Spanish selection');
clickEnglish(PUZZLE[3]);clickEnglish(PUZZLE[2]);advance(1000);expect(isCorrect(PUZZLE[2].id)&&selected===null&&wrong===null,'Correct retry did not cancel timer');
`,context);
const vocabulary=JSON.parse(fs.readFileSync('vocabulary.json','utf8'));assert.equal(vocabulary.length,69);
console.log('PASS: all 168 layouts and seven sets; Spanish-first matching; uppercase placement; correct-pair gray strike-through; wrong-answer red flash for exactly 1000ms; deselection, retry, timer cancellation, stable layout, alphabetical word bank, shuffled clues, reset, Next, and final nine.');
