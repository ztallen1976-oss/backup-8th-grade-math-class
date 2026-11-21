const {chromium}=require('playwright');const assert=require('assert');
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:844},{width:1100,height:800}]){
const pg=await b.newPage({viewport:vp});pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto('http://127.0.0.1:8766/game.html?debug');await pg.click('#bStart');
await pg.waitForSelector('#review:not([hidden])');
// no skip: no close/skip buttons, game not started behind it
const btns=await pg.$$eval('#review button',bs=>bs.map(b=>b.textContent.trim()));assert(!btns.some(t=>/skip|next|close/i.test(t)),btns);
// wrong answer -> inputs locked, new problem has new numbers, count unchanged
const p1=await pg.evaluate(()=>{const p=__RV();return {key:p.key,kind:p.kind,ans:p.ans}});
if(p1.kind==='num'){await pg.fill('#r0',String(p1.ans+1));await pg.click('#rvCheck')}else if(p1.kind==='frac'){await pg.fill('#rn',String(p1.ans[0]+1));await pg.fill('#rd',String(p1.ans[1]));await pg.click('#rvCheck')}
await pg.waitForSelector('#rvNew');assert(await pg.$eval('#rvCount',e=>e.textContent)==='0 of 6 right');
const locked=await pg.$$eval('#rvAns input,#rvAns button',x=>x.every(e=>e.disabled));assert(locked,'inputs locked after a miss');
if(vp.width===1100)await pg.screenshot({path:'shot_review_wrong.png'});
await pg.click('#rvNew');const p2=await pg.evaluate(()=>__RV().key);assert(p2!==p1.key,'new problem after a miss');
// Enter on an empty box does nothing
await pg.press('#rvAns input','Enter');assert(await pg.$eval('#rvCount',e=>e.textContent)==='0 of 6 right');
// answer 6 right
for(let k=0;k<6;k++){const p=await pg.evaluate(()=>{const p=__RV();return {kind:p.kind,ans:p.ans}});const c=await pg.$eval('#rvCount',e=>e.textContent);
  if(k===2&&vp.width===1100)await pg.screenshot({path:'shot_review.png'});
  if(p.kind==='num'){await pg.fill('#r0',String(p.ans));await pg.press('#r0','Enter')}else if(p.kind==='choice'){await pg.click(`#rvAns .ch[data-i="${p.ans}"]`)}else{await pg.fill('#rn',String(p.ans[0]));await pg.fill('#rd',String(p.ans[1]));await pg.press('#rd','Enter')}
  await pg.waitForFunction(c=>document.querySelector('#review').hidden||document.querySelector('#rvCount').textContent!==c,c);await pg.waitForTimeout(700)}
await pg.waitForSelector('#review',{state:'hidden'});assert(await pg.isHidden('#title'));
// same day: no second review for that room
await pg.reload();await pg.click('#bStart');await pg.waitForTimeout(400);assert(await pg.isHidden('#review'),'passed today');
// tomorrow: review again
await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('squeaky-cheeks-5'));for(const k in s.passed)s.passed[k]='2000-01-01';localStorage.setItem('squeaky-cheeks-5',JSON.stringify(s))});
await pg.reload();await pg.click('#bStart');await pg.waitForSelector('#review:not([hidden])');
const sw=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert(sw<=0,'scroll '+sw);
console.log(vp.width,'review gate ok');await pg.close()}
// in-game: a missed problem comes back with NEW numbers
const pg=await b.newPage();await pg.goto('http://127.0.0.1:8766/game.html?debug');await pg.evaluate(()=>{const s=JSON.parse(localStorage.getItem('squeaky-cheeks-5')||'{}');s.passed={1:new Date().toISOString().slice(0,10)};localStorage.setItem('squeaky-cheeks-5',JSON.stringify(s))});
await pg.reload();await pg.click('#bStart');await pg.waitForTimeout(300);
const miss=await pg.evaluate(()=>{const p=__Q();return {key:p.key,ans:p.ans}});await pg.fill('#a0',String(miss.ans+1));await pg.press('#a0','Enter');
const keys=[];for(let k=0;k<6;k++){await pg.waitForFunction(s=>document.querySelector('#prob').dataset.seq!==s,String(k+1),{timeout:9000});const p=await pg.evaluate(()=>{const p=__Q();return {key:p.key,ans:p.ans}});keys.push(p.key);await pg.fill('#a0',String(p.ans));await pg.press('#a0','Enter')}
assert(!keys.includes(miss.key),'missed problem never repeats with the same numbers');
console.log('retry uses new numbers ok');console.log('errors',errs.length?errs:'none');assert(!errs.length);await b.close();console.log('REVIEW TESTS PASSED')})().catch(e=>{console.error(e);process.exit(1)});
