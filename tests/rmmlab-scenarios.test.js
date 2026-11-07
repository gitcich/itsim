const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync('../rmmlab/index.html','utf8'),{runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const C=s=>{const el=d.querySelector(s);if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const Y=()=>C('#modalRoot [data-y]');
const sub=(v={},checks={})=>{const f=d.querySelector('#modalRoot form');if(!f)throw new Error('no form');for(const[k,x]of Object.entries(v)){const el=f.querySelector(`[name="${k}"]`);if(el.type==='checkbox')el.checked=x;else el.value=x}
 for(const[k,arr]of Object.entries(checks))f.querySelectorAll(`input[name="${k}"]`).forEach(i=>i.checked=arr.includes(i.value));
 f.dispatchEvent(new w.Event('submit',{cancelable:true}));const e=d.querySelector('#ferr');if(e&&e.textContent)console.log('  ERR',e.textContent)};
const S=()=>w.eval('S');const res=()=>w.eval('scnState().res');const P=n=>S().policies.find(p=>p.name.startsWith(n));
const start=id=>{C('[data-act=tab][data-v=scn]');C(`[data-act=startScn][data-v=${id}]`);Y()};
const tabs=['dash','orgs','devs','pols','lib','patch','alerts','tix','bk','scn'];
// s1
start('s1');C('[data-act=tab][data-v=orgs]');C('[data-act=addOrg]');sub();const o=S().orgs.find(x=>x.name==='Lone Star Dental');
C(`[data-act=addLoc][data-v=${o.id}]`);sub({n:'Georgetown'});C(`[data-act=deploy][data-v=${o.id}]`);sub({n:3});
C(`[data-act=addDoc][data-v=${o.id}]`);sub({type:'Credential',detail:'x'});C(`[data-act=addDoc][data-v=${o.id}]`);sub({type:'Apps & Services',title:'Dentrix'});
console.log('s1',res());
// s2
start('s2');C('[data-act=tab][data-v=pols]');
for(const n of ['Windows Workstations','Windows Servers']){const p=P(n);C(`[data-act=selPol][data-v=${p.id}]`);C('[data-act=ptab][data-v=patch]');
 C(`input[data-act=patchOn]`);C(`input[data-act=patchAI]`);C(`[data-act=patchEdit]`);sub({reboot:'Automatic'})}
C('[data-act=tab][data-v=patch]');C('[data-act=ptues]');C('[data-act=tick][data-v=24]');
for(const t of tabs)C(`[data-act=tab][data-v=${t}]`);
C('[data-act=tick][data-v=24]');console.log('s2',res(),'compl',w.eval('compliancePct(S.devices)'));
// s3
start('s3');C('[data-act=tab][data-v=pols]');const pw=P('Windows Workstations');C(`[data-act=selPol][data-v=${pw.id}]`);C('[data-act=ptab][data-v=cond]');C(`[data-act=addCond]`);sub({kind:'disk',th:90,script:'x1'});
C('[data-act=ptab][data-v=auto]');C('[data-act=addAuto]');sub();C('[data-act=tick][data-v=1]');console.log('s3',res());
// s4
start('s4');C('[data-act=tab][data-v=devs]');const ws2=S().devices.find(x=>x.name==='BBC-WS02');C(`[data-act=selDev][data-v=${ws2.id}]`);C(`[data-act=remote][data-v=${ws2.id}]`);C('#modalRoot [data-svc]');C('#modalRoot [data-x]');
C('[data-act=tab][data-v=tix]');for(const t of S().tickets){C(`[data-act=openTicket][data-v=${t.id}]`);const f=d.querySelector('#modalRoot form');const q=n=>f.querySelector('[name='+n+']');q('as').value='Alex (Tier 1)';if(t.pri==='P1'){q('note').value='Restarted spooler remotely';q('status').value='Resolved'}f.dispatchEvent(new w.Event('submit',{cancelable:true}))}
console.log('s4',res());
// s5
start('s5');C('[data-act=tab][data-v=pols]');C(`[data-act=selPol][data-v=${P('Windows Workstations').id}]`);C('[data-act=ptab][data-v=sw]');C('[data-act=swEdit]');sub({},{install:['Microsoft 365 Apps','Google Chrome','7-Zip'],tpp:['Google Chrome']});
C('[data-act=ptab][data-v=sec]');C('input[data-act=avOn]');C('[data-act=ptab][data-v=cond]');C('[data-act=addCond]');sub({kind:'avoff'});
for(let i=0;i<4;i++)C('[data-act=tick][data-v=24]');console.log('s5',res(),S().devices.filter(x=>!x.online).map(x=>x.name));
// s6
start('s6');C('[data-act=tab][data-v=pols]');C(`[data-act=selPol][data-v=${P('Windows Servers').id}]`);C('[data-act=ptab][data-v=bk]');C('[data-act=bkEdit]');sub({en:true,dest:'Hybrid'});
C('[data-act=ptab][data-v=cond]');C('[data-act=addCond]');sub({kind:'bkfail',sev:'Critical'});
C(`[data-act=selPol][data-v=${P('Linux').id}]`);C('[data-act=ptab][data-v=bk]');C('[data-act=bkEdit]');sub({en:true});
C('[data-act=tick][data-v=24]');C('[data-act=tab][data-v=bk]');C(`[data-act=restoreTest][data-v=${S().devices.find(x=>x.name==='HCL-SRV01').id}]`);console.log('s6',res());
// child inheritance tab check
C('[data-act=tab][data-v=pols]');C(`[data-act=selPol][data-v=${P('Workstations – Law').id}]`);for(const t of ['cond','auto','patch','sw','sec','bk'])C(`[data-act=ptab][data-v=${t}]`);
C('[data-act=ptab][data-v=patch]');C('[data-act=ownSetting][data-k=patch]');console.log('child own patch',!!P('Workstations – Law').patch);
const keys=Object.keys(w.eval('G'));const html=fs.readFileSync('../rmmlab/index.html','utf8');const used=[...html.matchAll(/(?:tip\(|data-tip=)["']([a-z]+)["']/g)].map(m=>m[1]);
console.log('missing tips',[...new Set(used)].filter(k=>!keys.includes(k)),'errors',errs);
