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

(function(){
 if(!document.getElementById('gt')) return;
const gt=document.getElementById('gt'), cv=gt.querySelector('canvas'), c=cv.getContext('2d'), res=gt.querySelector('[data-res]');
 function draw(){
  const pts=gt.querySelector('[data-in]').value.split('\n').map(l=>l.split(/[,\s\t]+/).filter(Boolean).map(Number)).filter(p=>p.length>=2&&p.every(n=>isFinite(n))).map(p=>({x:p[0],y:p[1],e:Math.abs(p[2]||0)})).sort((a,b)=>a.x-b.x);
  c.clearRect(0,0,cv.width,cv.height);
  if(pts.length<2){ res.textContent='Enter at least two points.'; return; }
  const n=pts.length,sx=pts.reduce((s,p)=>s+p.x,0),sy=pts.reduce((s,p)=>s+p.y,0),sxx=pts.reduce((s,p)=>s+p.x*p.x,0),sxy=pts.reduce((s,p)=>s+p.x*p.y,0);
  const m=(n*sxy-sx*sy)/(n*sxx-sx*sx), b=(sy-m*sx)/n, f=pts[0], l=pts[n-1];
  const mMax=((l.y+l.e)-(f.y-f.e))/(l.x-f.x), mMin=((l.y-l.e)-(f.y+f.e))/(l.x-f.x), bMax=(f.y-f.e)-mMax*f.x, bMin=(f.y+f.e)-mMin*f.x, dm=Math.abs(mMax-mMin)/2;
  const x0=Math.min(0,f.x), x1=l.x*1.05, ys=[0,...pts.map(p=>p.y+p.e),...pts.map(p=>p.y-p.e),b,bMax,bMin], y0=Math.min(...ys), y1=Math.max(...ys)*1.05;
  const L=64,R=20,T=16,B=52,W=cv.width-L-R,H=cv.height-T-B, X=x=>L+(x-x0)/(x1-x0)*W, Y=y=>T+H-(y-y0)/(y1-y0)*H;
  const nice=r=>{const p=Math.pow(10,Math.floor(Math.log10(r/5))),q=r/5/p;return (q<1.5?1:q<3.5?2:q<7.5?5:10)*p;};
  const ticks=(a,z)=>{const s=nice(z-a),o=[];for(let t=Math.ceil(a/s)*s;t<=z+1e-9;t+=s)o.push(+t.toPrecision(10));return o;};
  const xt=ticks(x0,x1), yt=ticks(y0,y1);
  c.strokeStyle='#e2ded7'; c.lineWidth=1; xt.forEach(t=>{c.beginPath();c.moveTo(X(t),T);c.lineTo(X(t),T+H);c.stroke();}); yt.forEach(t=>{c.beginPath();c.moveTo(L,Y(t));c.lineTo(L+W,Y(t));c.stroke();});
  c.fillStyle='#111'; c.font='13px sans-serif'; c.textAlign='center'; xt.forEach(t=>c.fillText(t,X(t),T+H+18)); c.textAlign='right'; yt.forEach(t=>c.fillText(t,L-6,Y(t)+4)); c.textAlign='center';
  c.fillText(gt.querySelector('[data-xl]').value,L+W/2,T+H+42); c.save(); c.translate(16,T+H/2); c.rotate(-Math.PI/2); c.fillText(gt.querySelector('[data-yl]').value,0,0); c.restore();
  c.strokeStyle='#111'; c.beginPath(); c.moveTo(L,T); c.lineTo(L,T+H); c.lineTo(L+W,T+H); c.stroke();
  const line=(mm,bb,dash,col)=>{c.setLineDash(dash);c.strokeStyle=col;c.lineWidth=1.8;c.beginPath();c.moveTo(X(x0),Y(mm*x0+bb));c.lineTo(X(x1),Y(mm*x1+bb));c.stroke();c.setLineDash([]);};
  line(m,b,[],'#111'); line(mMax,bMax,[7,5],'#ff6a2b'); line(mMin,bMin,[2,4],'#1f7a3d');
  c.strokeStyle='#111'; c.lineWidth=1.4; pts.forEach(p=>{c.beginPath();c.moveTo(X(p.x),Y(p.y-p.e));c.lineTo(X(p.x),Y(p.y+p.e));c.moveTo(X(p.x)-4,Y(p.y-p.e));c.lineTo(X(p.x)+4,Y(p.y-p.e));c.moveTo(X(p.x)-4,Y(p.y+p.e));c.lineTo(X(p.x)+4,Y(p.y+p.e));c.stroke();c.beginPath();c.arc(X(p.x),Y(p.y),3,0,7);c.fill();});
  const dmR=+dm.toPrecision(1), dec=dmR?Math.max(0,-Math.floor(Math.log10(dmR))):3, sig=v=>v?v.toFixed(Math.max(0,-Math.floor(Math.log10(Math.abs(v))))):'0';
  res.innerHTML='<b>Best-fit gradient:</b> '+m.toPrecision(4)+' &nbsp; <b>Steepest:</b> '+mMax.toPrecision(4)+' &nbsp; <b>Shallowest:</b> '+mMin.toPrecision(4)+'<br><b>Gradient = '+m.toFixed(dec)+' ± '+sig(dmR)+'</b> (half the difference between steepest and shallowest) &nbsp;·&nbsp; <b>y-intercept:</b> '+b.toPrecision(3)+'<br><span class="muted">Black: best fit · orange dashed: steepest · green dotted: shallowest.</span>';
 }
 gt.querySelectorAll('textarea,input').forEach(i=>i.oninput=draw); draw();
})();
