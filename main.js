document.getElementById('y').textContent=new Date().getFullYear();
const f=document.getElementById('lead'),m=document.getElementById('msg');
f.addEventListener('submit',async e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(f));
  if(d.company)return; delete d.company;
  if(!d.name||!d.phone||!d.city||!d.details){m.textContent='Please fill name, phone, city and details.';return;}
  m.textContent='Sending…';
  try{
    const r=await fetch('https://formsubmit.co/ajax/junkjunkiesflorida@gmail.com',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({...d,_subject:'New junk lead: '+d.name+' ('+d.city+')',_template:'table',_captcha:'false'})});
    if(!r.ok)throw 0;
    f.reset();m.textContent="✅ Got it! Aaron will contact you shortly.";
  }catch{m.textContent='Something went wrong — please try again in a minute.';}
});
