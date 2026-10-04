const $=s=>document.querySelector(s);
document.getElementById('y').textContent=new Date().getFullYear();
const menu=$('#menu');
$('#burger').onclick=()=>menu.classList.toggle('open');
menu.querySelectorAll('a').forEach(a=>a.onclick=()=>menu.classList.remove('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});
document.querySelectorAll('[data-pick]').forEach(a=>a.addEventListener('click',()=>{$('#svc').value=a.dataset.pick}));
const wire=f=>{const m=f.querySelector('.fmsg');
f.addEventListener('submit',async e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(f));
  if(d.company)return;delete d.company;
  if(!d.name||!d.phone||!d.city){m.textContent='Please fill name, phone and city / ZIP.';return}
  if(f.id==='lead'&&!d.details){m.textContent='Please tell us what needs to go.';return}
  if(!d.details)d.details='Quick quote request from the top of the page'+(d.service?' ('+d.service+')':'');
  m.textContent='Sending…';
  try{
    const r=await fetch('https://formsubmit.co/ajax/junkjunkiesflorida@gmail.com',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...d,_subject:'New junk lead: '+d.name+' ('+d.city+')',_template:'table',_captcha:'false'})});
    fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).catch(()=>{});
    if(!r.ok)throw 0;
    f.reset();m.textContent="✅ Got it! We'll contact you shortly.";
  }catch{m.textContent='Something went wrong — please call 321-351-0284.'}
})};
document.querySelectorAll('form.leadform').forEach(wire);


// Public "jobs we've cleared" map (shows only when the owner has published completed jobs)
(async()=>{try{
  const {jobs}=await (await fetch('/api/jobs')).json();if(!jobs||!jobs.length)return;
  const sec=$('#work');sec.hidden=false;
  const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';document.head.appendChild(css);
  const js=document.createElement('script');js.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
  js.onload=()=>{const map=L.map('pubmap',{scrollWheelZoom:false}).setView([28.11,-81.62],9);
    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=cb1_45ku_1_83da3050619fc32faad2506e',{attribution:'© OpenStreetMap © CARTO'}).addTo(map);
    const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const icon=L.divIcon({className:'',html:'<div style="width:18px;height:18px;border-radius:50%;background:#39ff14;border:3px solid #050505;box-shadow:0 0 16px #39ff14"></div>',iconSize:[18,18]});
    const pts=jobs.map(j=>{L.marker([j.lat,j.lng],{icon}).addTo(map).bindPopup(`${j.photo?`<img src="${j.photo}" style="width:200px;border-radius:8px;display:block;margin-bottom:6px">`:''}<b>${esc(j.title||j.service)}</b><br>${esc(j.city)}`);return[j.lat,j.lng]});
    map.fitBounds(pts,{padding:[50,50],maxZoom:12})};
  document.body.appendChild(js);
  $('#pubcards').innerHTML=jobs.filter(j=>j.photo).slice(0,8).map(j=>`<div class="pc"><img loading="lazy" src="${j.photo}" alt=""><div><b>${j.title||j.service||'Cleared job'}</b><small>${j.city||''}</small></div></div>`).join('');
}catch{}})();

// Google reviews: paste the Place ID from the Google Business Profile (see README) to turn this section on.
const GOOGLE_PLACE_ID='';
if(GOOGLE_PLACE_ID){$('#reviews').hidden=false;
  $('#rv-write').href='https://search.google.com/local/writereview?placeid='+GOOGLE_PLACE_ID;
  $('#rv-read').href='https://search.google.com/local/reviews?placeid='+GOOGLE_PLACE_ID}
// real-photo reels: crossfade every 4.5s
document.querySelectorAll('.reelbg').forEach(function(r,k){var im=r.children,n=im.length,i=0;if(n<2||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
setInterval(function(){im[i].classList.remove('on');i=(i+1)%n;im[i].classList.add('on')},4500+k*300)});
