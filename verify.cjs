const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(){this.children=[];this.handlers={};this.style={};this.classes=new Set();this.classList={add:(x)=>this.classes.add(x),remove:(x)=>this.classes.delete(x)};}
 append(...items){this.children.push(...items);}replaceChildren(){this.children=[];}setAttribute(){}addEventListener(name,fn){this.handlers[name]=fn;}
}
const elements=new Map();
const document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),createTextNode:text=>({textContent:text}),addEventListener(){}};
const context=vm.createContext({document,console});
vm.runInContext(fs.readFileSync('puzzle.js','utf8')+'\n'+fs.readFileSync('app.js','utf8'),context);
vm.runInContext(`
if(PUZZLE.length!==10)throw Error('Expected ten entries');
const verified=new Map();
for(const p of PUZZLE)for(let i=0;i<p.answer.length;i++){
 const k=at(p,i);if(verified.has(k)&&verified.get(k)!==p.answer[i])throw Error('Invalid crossing');verified.set(k,p.answer[i]);
}
const seen=new Set([PUZZLE[0].id]);let changed=true;while(changed){changed=false;for(const ids of cells.values())if(ids.some(id=>seen.has(id)))for(const id of ids)if(!seen.has(id)){seen.add(id);changed=true;}}
if(seen.size!==10)throw Error('Disconnected grid');
const first=PUZZLE[0];chooseWord(first.id);activate(first.id);if(placed.get(first.id)!==first.id)throw Error('Click placement failed');
$('reset').onclick();
for(const p of PUZZLE){const el=new (document.createElement('button').constructor)();wireDrop(el,[p.id]);el.handlers.drop({preventDefault(){},dataTransfer:{getData:()=>String(p.id)}});}
if(!$('feedback').textContent.includes('All 10'))throw Error('Completion failed');
$('reset').onclick();if(placed.size!==0)throw Error('Reset failed');
const a=PUZZLE[0],b=PUZZLE.find(p=>p.answer.length!==a.answer.length);place(a.id,b.id);if(placed.size)throw Error('Wrong length accepted');
const pair=PUZZLE.filter(p=>p.answer.length===6);if(pair.length>1){place(pair[0].id,pair[1].id);if(placed.get(pair[1].id)!==pair[0].id)throw Error('Placement failed');if($('feedback').textContent.includes('All 10'))throw Error('Incorrect completion');}
`,context);
assert.equal(elements.get('bank').children.length,10);
console.log('PASS: ten connected entries, valid crossings, click placement, drag/drop, completion, reset, wrong length, and completion feedback.');
