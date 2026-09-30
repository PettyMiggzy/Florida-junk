import { writeFile } from 'node:fs/promises';
const B='https://api.venice.ai/api/v1',H={Authorization:`Bearer ${process.env.VENICE_API_KEY}`,'Content-Type':'application/json'};
const L=', shot on Canon EOS R5 35mm lens, natural Florida light, photorealistic, candid documentary photograph, realistic textures, no text, no logos, no watermark';
const shots={
 residential:'Two workers in black t-shirts carrying an old armchair out of a Florida home front door to a white box truck, palm trees, sunny',
 mattress:'Two workers lifting an old mattress into the back of a white junk removal truck in a suburban Florida driveway',
 estate:'Interior of a Florida home living room full of furniture boxes and household items being sorted for an estate cleanout, warm light',
 hoarder:'Workers in gloves and masks carefully clearing a very cluttered room full of boxes and bags in a house, documentary style',
 storage:'Open storage unit door with stacked furniture and boxes inside, worker with a hand truck, orange roll-up door',
 shed:'Old weathered backyard wooden shed being taken apart by workers in Florida backyard with palm tree',
 commercial:'Workers clearing old office desks, chairs and cubicle furniture from a commercial office space into a truck',
 truck:'Clean white junk removal box truck with green accents parked in a Haines City Florida neighborhood street at golden hour, palm trees, no text on truck'
};
for(const[n,p]of Object.entries(shots)){
 try{const j=await(await fetch(`${B}/image/generate`,{method:'POST',headers:H,body:JSON.stringify({model:'flux-2-max',prompt:p+L,width:1280,height:720,format:'jpeg',safe_mode:false})})).json();
 if(!j.images?.[0]){console.error(n,JSON.stringify(j).slice(0,150));continue}
 await writeFile(`assets/${n}.jpg`,Buffer.from(j.images[0],'base64'));console.log('saved',n)}catch(e){console.error(n,e.message)}}
