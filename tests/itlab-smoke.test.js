const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('../itlab/index.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const click=sel=>{const el=d.querySelector(sel);if(!el)throw new Error('missing '+sel);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const submit=(vals={})=>{const f=d.querySelector('#modalRoot form');if(!f)throw new Error('no form');for(const[k,v]of Object.entries(vals)){const el=f.querySelector(`[name="${k}"]`);el.value=v}f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));const e=d.querySelector('#ferr');if(e&&e.textContent)console.log('FORM ERR',e.textContent)};
const ok=()=>{const b=d.querySelector('#modalRoot [data-y],#modalRoot [data-n]');if(b)b.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const S=()=>w.eval('S');
click('[data-act=sample]');click('#modalRoot [data-y]');
for(const t of ['dash','dc','virt','net','id','sec','scn'])click(`[data-act=tab][data-v=${t}]`);
click('[data-act=startScn][data-v=s2]');
click('[data-act=tab][data-v=dc]');click('[data-act=addCluster]');
d.querySelectorAll('#modalRoot input[name=hosts]').forEach(i=>i.checked=true);submit();
click('[data-act=tab][data-v=virt]');click('[data-act=newVM]');submit({name:'APP01',role:'Web Server'});
const v=S().vms[0].id;click(`[data-act=migrate][data-v=${v}]`);submit();
click('[data-act=tab][data-v=dc]');click(`[data-act=failHost][data-v=${S().hosts[0].id}]`);
console.log('scn2',w.eval('scnState().res'));
// identity
click('[data-act=tab][data-v=id]');click('[data-act=createDomain]');submit();click('[data-act=bulkUsers]');click('[data-act=addGPO]');submit({setting:'Security baseline'});
// tooltip
const ti=d.querySelector('.tip-ic');ti.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));console.log('tip:',d.getElementById('tip').querySelector('h4').textContent);
// sec toggle
click('[data-act=tab][data-v=sec]');d.querySelector('input[data-act=sec][data-v=mfa]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
console.log('mfa',S().sec.mfa,'posture',w.eval('posture().score'));
click('[data-act=plat][data-v=microsoft]');console.log(d.querySelector('h2').textContent);
// glossary coverage
const keys=Object.keys(w.eval('G'));const used=[...html.matchAll(/(?:tip\(|data-tip=)["']([a-z0-9]+)["']/g)].map(m=>m[1]);
console.log('missing tips',[...new Set(used)].filter(k=>!keys.includes(k)));
console.log('log',S().log.slice(0,8).map(l=>l.msg));console.log('errors',errs);
