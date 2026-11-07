// Stubs the artifact "sample" capability and checks the assistant panel, tools and fallbacks.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('../rmmlab/index.html','utf8');
function boot(stub){return new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){if(stub)w.claude={use:async n=>n==='sample'?stub(w):null}}})}
const wait=ms=>new Promise(r=>setTimeout(r,ms));let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
(async()=>{
 let seen=null;
 const dom=boot(w=>{const f=async(input,opts)=>{seen={input,opts};const dev=await opts.tools.find(t=>t.name==='get_device').execute({name:'hcl-ws03'});
   const pol=await opts.tools.find(t=>t.name==='get_policy').execute({name:'Windows Workstations'});await opts.tools.find(t=>t.name==='open_page').execute({page:'devs',device:'HCL-WS03'});
   opts.onText({text:'Partial',delta:'Partial'});return{text:`**${dev.name}** disk is ${dev.diskPct}%.\n- Open **Policies**\n- Add a condition (${pol.name})`,truncated:false}};return f});
 const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
 await wait(400);
 d.querySelector('[data-act=sample]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));d.querySelector('#modalRoot [data-y]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 d.getElementById('aiBtn').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 ok(d.getElementById('aiPanel').classList.contains('open'),'panel opens');ok(d.querySelectorAll('#aiSugg button').length===4,'suggestions shown');
 d.getElementById('aiIn').value='Why is HCL-WS03 slow?';d.getElementById('aiForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await wait(100);
 const last=[...d.querySelectorAll('#aiMsgs .am.a')].pop();
 ok(last&&last.querySelector('b')&&last.querySelector('li'),'markdown rendered');ok(/get device/.test(last.textContent),'tool use shown');
 ok(seen.input[seen.input.length-1].content.includes('Current lab context')&&seen.input[0].role==='user','prompt has context');ok(seen.opts.cache===false,'cache off');
 ok(w.eval('S.tab')==='devs'&&w.eval('S.devices.find(x=>x.id===S.sel).name')==='HCL-WS03','open_page navigated');
 // second turn keeps history, scenario hint button
 w.eval("A.startScn('s3')");d.querySelector('#modalRoot [data-y]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 d.querySelector('[data-act=askAI][data-v=hint]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(100);
 ok(seen.input.length===3&&/hint/.test(seen.input[2].content)&&/Self-healing/.test(seen.input[2].content),'hint request includes scenario + history');
 ok(errs.length===0,'no page errors '+errs.join('; '));
 // no capability → graceful off state
 const d2=boot(null);await wait(6500);d2.window.document.getElementById('aiBtn').dispatchEvent(new d2.window.MouseEvent('click',{bubbles:true}));
 ok(/isn't available/.test(d2.window.document.getElementById('aiMsgs').textContent),'fallback message without capability');
 // not_granted
 const d3=boot(()=>async()=>{throw{code:'not_granted',message:'no'}});await wait(400);const w3=d3.window;w3.document.getElementById('aiIn').value='hi';w3.document.getElementById('aiForm').dispatchEvent(new w3.Event('submit',{cancelable:true}));await wait(50);
 ok(/isn't available/.test(w3.document.getElementById('aiMsgs').textContent),'not_granted hides assistant');
 const keys=Object.keys(w.eval('G'));const used=[...html.matchAll(/(?:tip\(|data-tip=)["']([a-z]+)["']/g)].map(m=>m[1]);ok([...new Set(used)].every(k=>keys.includes(k)),'all tip keys defined');
 process.exit(fail?1:0)})();
