const fs = require('node:fs');
const vocabulary = JSON.parse(fs.readFileSync('vocabulary.json','utf8')).map((w,id)=>({...w,id,answer:w.english.replace(/[^a-z]/gi,'').toUpperCase()}));
const key=(r,c)=>`${r},${c}`;
function build(order){
 const grid=new Map(), placed=[];
 function add(w,r,c,d){ const p={...w,r,c,d}; placed.push(p); [...w.answer].forEach((ch,i)=>grid.set(key(r+(d?i:0),c+(d?0:i)),ch)); }
 add(order[0],0,0,Math.random()<0.5?0:1);
 for(const w of order.slice(1)){
  const candidates=[];
  for(const p of placed) for(let a=0;a<p.answer.length;a++) for(let b=0;b<w.answer.length;b++){
   if(p.answer[a]!==w.answer[b])continue;
   const d=1-p.d,r=p.r+(p.d?a:0)-(d?b:0),c=p.c+(p.d?0:a)-(d?0:b);
   if(grid.has(key(r-(d?1:0),c-(d?0:1)))||grid.has(key(r+(d?w.answer.length:0),c+(d?0:w.answer.length))))continue;
   let valid=true,cross=0;
   for(let i=0;i<w.answer.length;i++){
    const rr=r+(d?i:0),cc=c+(d?0:i),existing=grid.get(key(rr,cc));
    if(existing){ if(existing!==w.answer[i])valid=false; cross++; if(placed.some(q=>q.d===d&&Array.from(q.answer).some((_,j)=>q.r+(d?j:0)===rr&&q.c+(d?0:j)===cc)))valid=false; }
    else if(grid.has(key(rr+(d?0:1),cc+(d?1:0)))||grid.has(key(rr-(d?0:1),cc-(d?1:0))))valid=false;
   }
   if(valid&&cross){const cells=[...grid.keys()].map(k=>k.split(',').map(Number));cells.push([r,c],[r+(d?w.answer.length-1:0),c+(d?0:w.answer.length-1)]);const h=Math.max(...cells.map(x=>x[0]))-Math.min(...cells.map(x=>x[0]))+1,bw=Math.max(...cells.map(x=>x[1]))-Math.min(...cells.map(x=>x[1]))+1;candidates.push({r,c,d,score:h*bw+Math.abs(h-bw)*3});}
  }
  if(!candidates.length)return null;
  candidates.sort((a,b)=>a.score-b.score); const p=candidates[0];add(w,p.r,p.c,p.d);
 }
 const minR=Math.min(...placed.map(p=>p.r)),minC=Math.min(...placed.map(p=>p.c));placed.forEach(p=>{p.r-=minR;p.c-=minC;});
 placed.sort((a,b)=>a.r-b.r||a.c-b.c);let n=0,last='';for(const p of placed){const k=key(p.r,p.c);if(k!==last)n++;p.number=n;last=k;}
 return placed;
}

const sets=[];
for(let offset=0;offset<vocabulary.length;offset+=10){
 const words=vocabulary.slice(offset,offset+10),layouts=new Map();
 for(let t=0;t<1200;t++){
  const order=[...words];for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  const p=build(order);if(!p)continue;
  const signature=p.map(w=>[w.id,w.r,w.c,w.d].join(',')).join(';');
  const rows=Math.max(...p.map(w=>w.r+(w.d?w.answer.length:1))),cols=Math.max(...p.map(w=>w.c+(w.d?1:w.answer.length)));
  layouts.set(signature,{p,score:rows*cols+Math.abs(rows-cols)*4});
 }
 const pool=[...layouts.values()].sort((a,b)=>a.score-b.score).slice(0,24).map(x=>x.p);
 if(pool.length<2)throw Error('Not enough connected layouts for set '+(sets.length+1));
 sets.push({start:offset+1,end:offset+words.length,layouts:pool});console.log('Set '+sets.length+': '+pool.length+' connected randomized layouts ('+words.length+' words)');
}
fs.writeFileSync('puzzle.js','// Generated from all 69 entries in span020, in consecutive groups.\nconst PUZZLE_SETS = '+JSON.stringify(sets)+';\n');
