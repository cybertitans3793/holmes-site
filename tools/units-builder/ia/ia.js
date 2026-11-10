/* IA page script. Runs inside the Exam Skills page shell (exam.py page()), which already handles
   the top tabs and any [data-go] click (tabs: 0 Start here, 1 Stages, 2 Reference, 3 Topic ideas). */
(function(){
 const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
 const top=()=>{ try{ window.scrollTo(0,0); }catch(e){} };

 // stage switcher
 const sb=[...document.querySelectorAll('.ia-stagebar button')], sp=[...document.querySelectorAll('.ia-stage')];
 function stage(i){ sb.forEach((b,k)=>b.setAttribute('aria-selected',k==i)); sp.forEach((p,k)=>p.classList.toggle('on',k==i)); store.set('ia-stage',i); }
 sb.forEach((b,i)=>b.onclick=()=>stage(i));
 const s0=+store.get('ia-stage')||0; if(s0>0&&s0<sb.length) stage(s0);

 // links: "#" never jumps; [data-stage] opens that stage (the shell has already switched to the Stages tab if data-go is set);
 // [data-ref] opens that Reference section
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[data-go]'); if(a) e.preventDefault();
  const s=e.target.closest('[data-stage]'); if(s){ stage(+s.dataset.stage); top(); }
  const r=e.target.closest('[data-ref]'); if(r){ const d=document.querySelector('[data-refsec="'+r.dataset.ref+'"]'); if(d){ d.open=true; setTimeout(()=>d.scrollIntoView({block:'start'}),30); } }
 });

 // "Your next step": the first stage whose due date hasn't passed (stages with no date yet count as the next one)
 const rows=[...document.querySelectorAll('.ia-tl li')];
 if(rows.length){
  const today=new Date(); today.setHours(0,0,0,0);
  let cur=rows.findIndex(li=>!li.dataset.due || new Date(li.dataset.due+'T23:59:59')>=today);
  if(cur<0) cur=rows.length-1;
  rows[cur].classList.add('now');
  const li=rows[cur], name=li.querySelector('b').textContent.replace(/^\d+ · /,''), d=li.querySelector('.d').textContent.trim();
  const h=document.querySelector('[data-next-h]'), dd=document.querySelector('[data-next-d]'), go=document.querySelector('[data-next-go]');
  const verb=['Choose your topic','Plan your procedure','Collect your data','Analyse your data','Write your rough draft','Finish your final draft'][cur];
  if(h) h.textContent='Stage '+(cur+1)+' · '+verb;
  if(dd) dd.textContent=/^[A-Z][a-z]{2} \d/.test(d)?'Due '+d:(d==='TBA'?'Due date to be announced':'');
  if(go){ go.dataset.stage=cur; go.textContent='Go to Stage '+(cur+1)+' →'; }
 }

 // research question builder (static; the Review app's ?unit=IA-RQ form replaces it once wired: ia_tabs(rq_form=True))
 const rq=document.getElementById('rqb');
 if(rq){ const v=k=>{const i=rq.querySelector('[data-k='+k+']'); return (i.value||i.placeholder).trim();};
  const upd=()=>{ rq.querySelector('[data-out]').textContent='How does '+v('iv')+' affect '+v('dv')+', measured with '+v('how')+'?'; };
  rq.querySelectorAll('input').forEach(i=>i.oninput=upd); upd(); }

 // checklist (Stage 5): ticks saved in this browser
 const cks=[...document.querySelectorAll('[data-ck]')], prog=document.querySelector('[data-progress]');
 const showProg=()=>{ if(prog) prog.textContent=cks.filter(c=>c.checked).length+' of '+cks.length+' ticked'; };
 cks.forEach(c=>{ c.checked=store.get('ia-ck-'+c.dataset.ck)==='1'; c.onchange=()=>{ c.checked?store.set('ia-ck-'+c.dataset.ck,'1'):store.del('ia-ck-'+c.dataset.ck); showProg(); }; });
 const clr=document.querySelector('[data-ck-clear]');
 if(clr) clr.onclick=()=>{ cks.forEach(c=>{c.checked=false; store.del('ia-ck-'+c.dataset.ck);}); showProg(); };
 showProg();

 // topic ideas: grouped by area (collapsed); "Needs" filter and search open the groups with matches and hide the rest
 const groups=[...document.querySelectorAll('.ia-area')], cnt=document.querySelector('.ia-count'), q=document.querySelector('.ia-search');
 const total=document.querySelectorAll('.ia-idea').length; let gear='';
 function filt(){ const t=(q&&q.value||'').toLowerCase().trim(), on=!!(t||gear); let n=0;
  groups.forEach(g=>{ let m=0;
   g.querySelectorAll('.ia-idea').forEach(d=>{ const ok=(!gear||d.dataset.gear.split('|').includes(gear))&&(!t||(g.dataset.area+' '+d.textContent).toLowerCase().includes(t)); d.hidden=!ok; if(ok)m++; });
   const c=g.querySelector('.c'); c.textContent=(on?m+' of '+c.dataset.n:c.dataset.n)+' ideas';
   g.hidden=on&&!m; if(on) g.open=m>0; n+=m; });
  if(cnt) cnt.textContent=on?n+' of '+total+' ideas match':total+' ideas in '+groups.length+' topics. Open one to browse.'; }
 document.querySelectorAll('.ia-filters').forEach(row=>{
  row.querySelectorAll('button').forEach(b=>b.onclick=()=>{ gear=b.dataset.v; row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b)); if(!gear&&!(q&&q.value)) groups.forEach(g=>g.open=false); filt(); }); });
 if(q) q.oninput=()=>{ if(!q.value&&!gear) groups.forEach(g=>g.open=false); filt(); };
 filt();
})();
