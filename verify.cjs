const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(){this.children=[];this.handlers={};this.style={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)};}
 append(...items){this.children.push(...items);}replaceChildren(){this.children=[];}setAttribute(){}addEventListener(name,fn){this.handlers[name]=fn;}
}
const elements=new Map();
const document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),createTextNode:text=>({textContent:text}),addEventListener(){}};
const context=vm.createContext({document,console,window:{}});
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
for(let setNumber=0;setNumber<7;setNumber++){
 expect(setIndex===setNumber,'Next skipped a set');
 const beforeLayout=layoutIndex,beforeBank=bankOrder.map(p=>p.id).join(',');
 const first=PUZZLE[0];$('bank').value=String(first.id);$('bank').onchange();
 const firstList=$(first.d?'down':'across');firstList.value=String(first.id);firstList.onchange();
 expect(placed.size===0,'Clue selection must not place an answer');
 $('grid').children[first.r*cols+first.c].onclick();expect(placed.get(first.id)===first.id,'Square click failed');
 const used=$('bank').children.find(option=>Number(option.value)===first.id);
 expect(used.className==='used'&&used.textContent.includes(String.fromCharCode(822))&&!used.textContent.includes('✓'),'Used word must be struck through');
 $('reset').onclick();expect(placed.size===0&&selected===null&&active===null,'Reset did not clear state');
 expect(layoutIndex!==beforeLayout,'Reset reused layout');expect(bankOrder.map(p=>p.id).join(',')!==beforeBank,'Reset reused bank order');
 for(const p of PUZZLE){
  $('bank').value=String(p.id);$('bank').onchange();active=p.id;
  const found=Array.from(p.answer).findIndex((_,j)=>cells.get(at(p,j)).length===1),j=found<0?0:found;
  const r=p.r+(p.d?j:0),c=p.c+(p.d?0:j);$('grid').children[r*cols+c].onclick();
 }
 expect($('feedback').textContent.includes('All '+PUZZLE.length),'Completion failed');
 for(const square of $('grid').children)for(const child of square.children)if(typeof child.textContent==='string')expect(!/[a-z]/.test(child.textContent),'Grid must be uppercase');
 const usedCount=$('bank').children.filter(option=>option.className==='used').length;expect(usedCount===PUZZLE.length,'Not all words marked used');
 $('next').onclick();expect(placed.size===0&&selected===null&&active===null,'Next retained progress');
}
expect(setIndex===0&&PUZZLE.length===10,'Next did not wrap to first group');
const a=PUZZLE[0],b=PUZZLE.find(p=>p.answer.length!==a.answer.length);place(a.id,b.id);expect(placed.size===0,'Wrong length accepted');
`,context);
const vocabulary=JSON.parse(fs.readFileSync('vocabulary.json','utf8'));assert.equal(vocabulary.length,69);
console.log('PASS: 168 connected unique layouts, all seven source groups, native selection and square clicks, uppercase answers, strike-through, randomized reset, Next progression, final nine, wraparound, completion, and wrong-length feedback.');
