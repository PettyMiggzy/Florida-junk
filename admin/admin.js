const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const SERVICES=["Residential Junk Removal","Furniture Removal","Appliance Removal","Mattress Removal","Garage Cleanouts","Estate Cleanouts","Hoarder Cleanup","Storage Unit Cleanouts","Yard Waste Removal","Construction Debris Removal","Shed Removal","Hot Tub Removal","Commercial Junk Removal","Property Cleanouts"];
$('#svc').innerHTML='<option value="">—</option>'+SERVICES.map(s=>`<option>${s}</option>`).join('');
let jobs=[],map,layer,calDate=new Date(),photoData=null;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=n=>'$'+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:0});
const fmt=d=>d?new Date(d).toLocaleString([], {weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Not scheduled';
async function api(u,o={}){const r=await fetch(u,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...o});if(r.status===401)throw new Error('auth');if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||'error');return r.json()}

async function boot(){
  let ok=false;try{ok=(await api('/api/login')).ok}catch{}
  $('#gate').hidden=ok;$('#app').hidden=!ok;if(ok)load();
}
$('#login').onsubmit=async e=>{e.preventDefault();$('#lerr').textContent='';
  try{await api('/api/login',{method:'POST',body:JSON.stringify({password:$('#pw').value})});$('#pw').value='';boot()}
  catch(x){$('#lerr').textContent=x.message==='auth'?'Wrong password':x.message}};
$('#logout').onclick=async()=>{await api('/api/login',{method:'DELETE'});location.reload()};
async function load(){try{jobs=(await api('/api/admin')).jobs}catch(e){if(e.message==='auth')return boot();$('#upcoming').textContent='Could not load: '+e.message;return}render()}

const TITLES={dash:'Dashboard',cal:'Schedule',map:'Map',jobs:'All Jobs'};
$$('#tabs button').forEach(b=>b.onclick=()=>{$$('#tabs button').forEach(x=>x.classList.toggle('on',x===b));
  Object.keys(TITLES).forEach(t=>$('#t-'+t).hidden=t!==b.dataset.t);$('#title').textContent=TITLES[b.dataset.t];
  if(b.dataset.t==='map')drawMap()});

function card(j){
  const tel=j.phone?`<a href="tel:${esc(j.phone)}">Call</a>`:'';
  const nav=j.address?`<a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(j.address)}">Navigate</a>`:'';
  const done=j.status!=='completed'&&j.status!=='cancelled'?`<button data-done="${j.id}">✓ Complete</button>`:'';
  return `<div class="job" data-id="${j.id}"><b>${esc(j.name||'Unnamed')}</b><div class="r"><span class="tag ${j.status}">${j.status}</span>${j.price?`<b>${money(j.price)}</b>`:''}</div>
  <div class="m">${esc(j.service||'')} · ${fmt(j.scheduled_at)}<br>${esc(j.address||j.city||'')}${j.published?' · 🌐 public':''}</div>
  <div class="qa" style="grid-column:1/3">${tel}${nav}${done}</div></div>`}
function bind(el){el.querySelectorAll('.job').forEach(c=>c.onclick=e=>{if(e.target.closest('a,button[data-done]'))return;openForm(jobs.find(j=>j.id==c.dataset.id))});
  el.querySelectorAll('[data-done]').forEach(b=>b.onclick=async()=>{const j=jobs.find(x=>x.id==b.dataset.done);await api('/api/admin',{method:'PUT',body:JSON.stringify({...j,status:'completed',scheduled_at:j.scheduled_at})});load()})}

function render(){
  const now=new Date(),wk=new Date(now.getTime()+7*864e5),mo=new Date(now.getFullYear(),now.getMonth(),1);
  const up=jobs.filter(j=>j.status==='scheduled'&&j.scheduled_at&&new Date(j.scheduled_at)>=new Date(now.getTime()-36e5*3)).sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at));
  const leads=jobs.filter(j=>j.status==='lead');
  const doneM=jobs.filter(j=>j.status==='completed'&&new Date(j.completed_at||j.created_at)>=mo);
  $('#stats').innerHTML=[[leads.length,'New leads'],[up.filter(j=>new Date(j.scheduled_at)<=wk).length,'Jobs next 7 days'],[doneM.length,'Completed this month'],[money(doneM.reduce((s,j)=>s+Number(j.price||0),0)),'Revenue this month'],[jobs.filter(j=>j.published).length,'Public pins']]
   .map(([n,l])=>`<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
  $('#upcoming').innerHTML=up.slice(0,8).map(card).join('')||'<small>Nothing scheduled yet.</small>';
  $('#leads').innerHTML=leads.slice(0,8).map(card).join('')||'<small>No new leads.</small>';
  bind($('#upcoming'));bind($('#leads'));drawTable();drawCal();if(!$('#t-map').hidden)drawMap();
}
function drawTable(){
  const q=$('#q').value.toLowerCase(),s=$('#fs').value;
  const r=jobs.filter(j=>(!s||j.status===s)&&(!q||[j.name,j.phone,j.address,j.city,j.service].join(' ').toLowerCase().includes(q)));
  $('#table').innerHTML=r.map(card).join('')||'<small>No jobs.</small>';bind($('#table'));
}
$('#q').oninput=$('#fs').onchange=drawTable;

function drawCal(){
  const y=calDate.getFullYear(),m=calDate.getMonth(),first=new Date(y,m,1),start=new Date(y,m,1-first.getDay());
  $('#calttl').textContent=first.toLocaleString([], {month:'long',year:'numeric'});
  let h=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="dow">${d}</div>`).join('');
  for(let i=0;i<42;i++){const d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i),k=d.toDateString();
    const ev=jobs.filter(j=>j.scheduled_at&&new Date(j.scheduled_at).toDateString()===k&&j.status!=='cancelled');
    h+=`<div class="day ${d.getMonth()!==m?'dim':''} ${k===new Date().toDateString()?'today':''}"><i>${d.getDate()}</i>${ev.map(j=>`<span class="ev ${j.status}" data-id="${j.id}">${new Date(j.scheduled_at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} ${esc(j.name)}</span>`).join('')}</div>`}
  $('#cal').innerHTML=h;$$('.ev').forEach(e=>e.onclick=()=>openForm(jobs.find(j=>j.id==e.dataset.id)));
}
$('#prev').onclick=()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()-1,1);drawCal()};
$('#next').onclick=()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()+1,1);drawCal()};

const COL={lead:'#ffb020',scheduled:'#4db8ff',completed:'#39ff14',cancelled:'#ff4d4d'};
function drawMap(){
  if(!map){map=L.map('map').setView([28.11,-81.62],9);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'© OpenStreetMap © CARTO',maxZoom:19}).addTo(map);layer=L.layerGroup().addTo(map)}
  setTimeout(()=>map.invalidateSize(),50);layer.clearLayers();const pts=[];
  jobs.filter(j=>j.lat!=null&&j.lng!=null&&j.status!=='cancelled').forEach(j=>{
    const icon=L.divIcon({className:'',html:`<div class="pin" style="background:${COL[j.status]};color:${COL[j.status]};${j.published?'outline:2px solid #fff':''}"></div>`,iconSize:[18,18]});
    const mk=L.marker([j.lat,j.lng],{icon}).addTo(layer);pts.push([j.lat,j.lng]);
    mk.bindPopup(`<b>${esc(j.name)}</b><br>${esc(j.service||'')}<br>${fmt(j.scheduled_at)}<br><a href="#" data-e="${j.id}" style="color:#39ff14">Open job</a>`);
    mk.on('popupopen',e=>e.popup.getElement().querySelector('[data-e]').onclick=ev=>{ev.preventDefault();openForm(j)})});
  if(pts.length)map.fitBounds(pts,{padding:[50,50],maxZoom:13});
}

const F=$('#jf');
function openForm(j){
  F.reset();photoData=null;$('#pv').hidden=true;$('#gmsg').textContent='';
  $('#mt').textContent=j?'Edit Job':'New Job';$('#del').hidden=!j;
  if(j){for(const [k,v] of Object.entries(j)){const el=F.elements[k];if(!el||k==='photo')continue;
      if(el.type==='checkbox')el.checked=!!v;else if(k==='scheduled_at')el.value=v?new Date(new Date(v)-new Date(v).getTimezoneOffset()*6e4).toISOString().slice(0,16):'';else el.value=v??''}
    if(j.photo){photoData=j.photo;$('#pv').src=j.photo;$('#pv').hidden=false}}
  $('#modal').hidden=false;
}
$('#add').onclick=()=>openForm();$('#cancel').onclick=()=>$('#modal').hidden=true;
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').hidden=true};
$('#photo').onchange=e=>{const f=e.target.files[0];if(!f)return;const img=new Image();img.onload=()=>{
  const s=Math.min(1,900/img.width),c=document.createElement('canvas');c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  photoData=c.toDataURL('image/jpeg',.78);$('#pv').src=photoData;$('#pv').hidden=false};img.src=URL.createObjectURL(f)};
$('#geo').onclick=async()=>{const a=F.elements.address.value.trim();if(!a)return;$('#gmsg').textContent='Searching…';
  try{const r=await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q='+encodeURIComponent(a))).json();
    if(!r[0]){$('#gmsg').textContent='Address not found — try adding city and FL.';return}
    F.elements.lat.value=r[0].lat;F.elements.lng.value=r[0].lon;
    if(!F.elements.city.value){const p=a.split(',');if(p.length>1)F.elements.city.value=p[p.length-2].trim()}
    $('#gmsg').textContent='✓ Pinned: '+r[0].display_name.slice(0,70)}catch{$('#gmsg').textContent='Lookup failed.'}};
F.onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(F));d.published=F.elements.published.checked;d.photo=photoData;
  if(!d.id)delete d.id;if(d.address&&!d.lat){await $('#geo').onclick()}
  d.lat=F.elements.lat.value;d.lng=F.elements.lng.value;
  try{await api('/api/admin',{method:d.id?'PUT':'POST',body:JSON.stringify(d)});$('#modal').hidden=true;load()}catch(x){$('#gmsg').textContent='Save failed: '+x.message}};
$('#del').onclick=async()=>{if(!confirm('Delete this job permanently?'))return;await api('/api/admin?id='+F.elements.id.value,{method:'DELETE'});$('#modal').hidden=true;load()};
boot();
