document.getElementById('y').textContent=new Date().getFullYear();
const $=s=>document.querySelector(s),menu=$('#menu');
$('#burger').onclick=()=>menu.classList.toggle('open');
menu.querySelectorAll('a').forEach(a=>a.onclick=()=>menu.classList.remove('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});
document.querySelectorAll('[data-pick]').forEach(a=>a.addEventListener('click',()=>{$('#svc').value=a.dataset.pick}));
const f=$('#lead'),m=$('#msg');
f.addEventListener('submit',async e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(f));
  if(d.company)return;delete d.company;
  if(!d.name||!d.phone||!d.city||!d.details){m.textContent='Please fill name, phone, city and details.';return}
  m.textContent='Sending…';
  try{
    const r=await fetch('https://formsubmit.co/ajax/junkjunkiesflorida@gmail.com',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...d,_subject:'New junk lead: '+d.name+' ('+d.city+')',_template:'table',_captcha:'false'})});
    if(!r.ok)throw 0;
    f.reset();m.textContent="✅ Got it! We'll contact you shortly.";
  }catch{m.textContent='Something went wrong — please call 321-351-0284.'}
});
