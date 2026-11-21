/* REVIEW GATE (Ms. Tesnar, Nov 21, 2026): "they had to get thru the review and then be rewarded with the game".
   Before a room opens: 6 problems answered CORRECTLY (typed answers). No skip, no Next button.
   A wrong answer explains the mistake, shows the right answer, then gives a BRAND-NEW problem (new numbers),
   so seeing an answer never helps. Tap questions shuffle their choices every time.
   Passing a room's review is remembered for the rest of the day on this Chromebook.
   The review unit comes from the teacher's Sheet (Settings tab) through Cup; default Unit 3. */
const Review=(function(){
  const NEED=6;
  let R=null;
  const today=()=>new Date().toISOString().slice(0,10);
  function unit(){const u=Cup.reviewUnit&&Cup.reviewUnit();return [1,2,3].includes(u)?u:3}
  function need(n){save.passed=save.passed||{};return save.passed[n]!==today()}
  function run(n,done){R={n,done,right:0,k:0,busy:false};$('#review').hidden=false;$('#rvRoom').textContent=`Room ${n}: ${ROOMS[n-1].name}`;
    $('#rvUnit').textContent=`Review: Unit ${unit()} + the room’s skill + order of operations`;next()}
  function bar(){$('#rvBar').innerHTML=Array.from({length:NEED},(_,i)=>`<i class="${i<R.right?'on':''}"></i>`).join('');$('#rvCount').textContent=`${R.right} of ${NEED} right`}
  function next(){
    let p;for(let t=0;t<20;t++){p=Q5.review(unit(),R.n,R.right);if(!R.p||p.key!==R.p.key)break}
    R.p=p;R.busy=false;bar();
    $('#rvProb').className='prob'+(/ptxt/.test(p.html)?' small':'');$('#rvProb').innerHTML=p.html+(/ptxt/.test(p.html)?'':'<span class="eq">?</span>');
    $('#rvFig').innerHTML=p.fig||'';$('#rvFb').className='fb';$('#rvFb').innerHTML='';
    const unitH=p.unit?`<span class="unit">${p.unit}</span>`:'';
    if(p.kind==='num')$('#rvAns').innerHTML=`<input class="box" id="r0" type="text" inputmode="numeric" autocomplete="off" aria-label="Your answer" maxlength="5">${unitH}<button type="button" class="btn go" id="rvCheck">Check</button>`;
    else if(p.kind==='choice'){
      /* shuffle the choices every time the question is shown */
      const order=p.choices.map((c,i)=>i).sort(()=>Math.random()-.5);R.order=order;
      $('#rvAns').innerHTML='<div class="choices">'+order.map((i,j)=>`<button type="button" class="ch" data-i="${i}"><kbd>${j+1}</kbd>${p.choices[i]}</button>`).join('')+'</div>'}
    else $('#rvAns').innerHTML=`<span class="mixed"><input class="box sm whole" id="rw" type="text" inputmode="numeric" autocomplete="off" aria-label="Whole number part, leave blank if none" maxlength="3"><span class="fbox"><input class="box sm" id="rn" type="text" inputmode="numeric" autocomplete="off" aria-label="Numerator" maxlength="3"><span class="bar"></span><input class="box sm" id="rd" type="text" inputmode="numeric" autocomplete="off" aria-label="Denominator" maxlength="3"></span></span>${unitH}<button type="button" class="btn go" id="rvCheck">Check</button><div class="alab" style="flex-basis:100%">whole number (if any) · fraction</div>`;
    const f=$('#rvAns input');if(f)f.focus({preventScroll:true});
  }
  function check(choice){
    if(!R||R.busy)return;const p=R.p;let ok,given;
    if(p.kind==='num'){const v=readInt('r0');if(v===null){$('#r0').focus();return}ok=v===p.ans;given=[v,1]}
    else if(p.kind==='choice'){if(choice==null)return;ok=choice===p.ans;given=choice}
    else{const w=readInt('rw'),n=readInt('rn'),d=readInt('rd');
      if(w===null&&n===null&&d===null){$('#rn').focus();return}
      if(n!==null&&d===null){$('#rd').focus();return}if(d!==null&&n===null){$('#rn').focus();return}
      if(d===0){$('#rvFb').className='fb bad';$('#rvFb').textContent='A denominator can’t be 0.';return}
      given=n===null?[w,1]:[(w||0)*d+n,d];ok=Q5.eqv(given,p.ans)}
    R.busy=true;
    if(ok){R.right++;SND.ding();Cup.add(1);bar();$('#rvFb').className='fb ok';$('#rvFb').textContent=pick(['Right!','Yes!','Correct!','Nice work!']);
      if(R.right>=NEED){save.passed=save.passed||{};save.passed[R.n]=today();persist();
        setTimeout(()=>{$('#review').hidden=true;const d=R.done;R=null;flashFb('Review done! The room is open. Go clear it!','ok');d()},RM?50:700)}
      else setTimeout(next,RM?50:600)}
    else{pfft();let note='';try{note=p.kind==='choice'?p.why(given):p.why(given)}catch(e){}
      $('#rvAns').querySelectorAll('input,button').forEach(b=>b.disabled=true);
      $('#rvFb').className='fb bad';
      $('#rvFb').innerHTML=`Not quite.${note?`<span class="note">${note}</span>`:''}${p.kind==='choice'?'':`<span class="ans">Answer: ${p.show}</span>`}<button type="button" class="btn" id="rvNew">Try a new problem</button>`;
      $('#rvNew').focus({preventScroll:true})}
  }
  $('#review').addEventListener('click',e=>{
    if(e.target.closest('#rvCheck'))check();
    else if(e.target.closest('#rvNew'))next();
    else{const b=e.target.closest('.ch');if(b&&!b.disabled)check(+b.dataset.i)}});
  $('#review').addEventListener('keydown',e=>{
    if(!R)return;
    if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if($('#rvNew'))next();else{const t=e.target;
      if(t.id==='rw'&&!t.value){$('#rn').focus();return}
      if(t.id==='rn'&&!$('#rd').value){$('#rd').focus();return}
      check()}return}
    if((e.key==='/'||e.key===' ')&&e.target.tagName==='INPUT'){e.preventDefault();const o=['rw','rn','rd'];const i=o.indexOf(e.target.id);if(i>=0&&i<2)$('#'+o[i+1]).focus();return}
    if(R.p&&R.p.kind==='choice'&&/^[1-9]$/.test(e.key)&&!$('#rvNew')){const i=R.order[+e.key-1];if(i!=null)check(i)}
  },true);
  if(/[?&]debug\b/.test(location.search))window.__RV=()=>R&&R.p;
  return {need,run,NEED};
})();
