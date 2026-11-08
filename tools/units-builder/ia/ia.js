/* IA page script. Runs inside the Exam Skills page shell (exam.py page()), which already handles
   the top tabs and any [data-go] click. The gradient tool at the end is the one from exam.py's IA tab. */
(function(){
 const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};

 // in-page links to other tabs: stop the "#" jump (the page shell does the switch)
 document.addEventListener('click',e=>{const a=e.target.closest('a[data-go]'); if(a) e.preventDefault();});

 // stage switcher
 const sb=[...document.querySelectorAll('.ia-stagebar button')], sp=[...document.querySelectorAll('.ia-stage')];
 function stage(i){ sb.forEach((b,k)=>b.setAttribute('aria-selected',k==i)); sp.forEach((p,k)=>p.classList.toggle('on',k==i)); store.set('ia-stage',i); }
 sb.forEach((b,i)=>b.onclick=()=>stage(i));
 const s0=+store.get('ia-stage')||0; if(s0>0&&s0<sb.length) stage(s0);

 // research question builder
 const rq=document.getElementById('rqb');
 if(rq){ const v=k=>{const i=rq.querySelector('[data-k='+k+']'); return (i.value||i.placeholder).trim();};
  const upd=()=>{ rq.querySelector('[data-out]').textContent='How does '+v('iv')+' (from '+v('rg')+') affect '+v('dv')+', measured with '+v('how')+'?'; };
  rq.querySelectorAll('input').forEach(i=>i.oninput=upd); upd(); }

 // checklist: ticks saved in this browser
 const cks=[...document.querySelectorAll('[data-ck]')], prog=document.querySelector('[data-progress]');
 const showProg=()=>{ if(prog) prog.textContent=cks.filter(c=>c.checked).length+' of '+cks.length+' ticked'; };
 cks.forEach(c=>{ c.checked=store.get('ia-ck-'+c.dataset.ck)==='1'; c.onchange=()=>{ c.checked?store.set('ia-ck-'+c.dataset.ck,'1'):store.del('ia-ck-'+c.dataset.ck); showProg(); }; });
 const clr=document.querySelector('[data-ck-clear]');
 if(clr) clr.onclick=()=>{ cks.forEach(c=>{c.checked=false; store.del('ia-ck-'+c.dataset.ck);}); showProg(); };
 showProg();

 // topic ideas filter
 const ideas=[...document.querySelectorAll('.ia-idea')], cnt=document.querySelector('.ia-count'), q=document.querySelector('.ia-search');
 const sel={area:'',gear:''};
 function filt(){ const t=(q&&q.value||'').toLowerCase().trim(); let n=0;
  ideas.forEach(d=>{ const ok=(!sel.area||d.dataset.area===sel.area)&&(!sel.gear||d.dataset.gear.split('|').includes(sel.gear))&&(!t||d.textContent.toLowerCase().includes(t)); d.hidden=!ok; if(ok)n++; });
  if(cnt) cnt.textContent=n+' of '+ideas.length+' ideas shown'; }
 document.querySelectorAll('.ia-filters').forEach(row=>{ const key=row.dataset.f;
  row.querySelectorAll('button').forEach(b=>b.onclick=()=>{ sel[key]=b.dataset.v; row.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b)); filt(); }); });
 if(q) q.oninput=filt; filt();
})();
