document.getElementById('y').textContent=new Date().getFullYear();
const f=document.getElementById('lead'),m=document.getElementById('msg');
f.addEventListener('submit',async e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(f));
  if(!d.name||!d.phone||!d.city||!d.details){m.textContent='Please fill name, phone, city and details.';return;}
  m.textContent='Sending…';
  try{
    const r=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
    if(!r.ok)throw 0;
    f.reset();m.textContent="✅ Got it! Aaron will contact you shortly.";
  }catch{m.textContent='Something went wrong — please call or text (346) 413-9644.';}
});
