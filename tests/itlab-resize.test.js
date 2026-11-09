// VM resize: vCPU / memory / disk rules for powered-off and running VMs on vSphere and Hyper-V.
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync('../itlab/index.html','utf8'),{url:'https://lab.test/',runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
const C=s=>{const el=d.querySelector(s);if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const vm=n=>w.eval(`S.vms.find(v=>v.name==="${n}")`);
// open resize, fill, submit; returns the error text (empty when it closed)
function resize(name,vals){C('[data-act=tab][data-v=virt]');C(`[data-act=resize][data-v="${vm(name).id}"]`);const f=d.querySelector('#modalRoot form');
 for(const[k,v]of Object.entries(vals)){const el=f.querySelector(`[name="${k}"]`);if(!el)throw new Error('no field '+k);if(el.type==='checkbox')el.checked=v;else el.value=v}
 f.dispatchEvent(new w.Event('submit',{cancelable:true}));const e=d.querySelector('#modalRoot #ferr');const t=e?e.textContent:'';if(e)C('#modalRoot [data-close]');return t}
w.eval('S.platform="vmware";buildSample();commit()');
const dc=vm('DC01');ok(dc.power==='on'&&!dc.hotAdd,'sample DC01 running, hot add off');
ok(/hot add is off/i.test(resize('DC01',{vcpu:4})),'vSphere running + hot add off: vCPU change blocked');
ok(/hot add is off/i.test(resize('DC01',{ram:16})),'vSphere running + hot add off: memory change blocked');
ok(resize('DC01',{disk:120})===''&&vm('DC01').disk===120,'disk extends live');
ok(/extended but not shrunk/.test(resize('DC01',{disk:60})),'disk shrink blocked');
ok(/powered off/.test(resize('DC01',{hotAdd:true})),'hot add can\'t be toggled while running');
C('[data-act=tab][data-v=virt]');C(`[data-act=power][data-v="${vm('DC01').id}"]`);ok(vm('DC01').power==='off','shut down');
ok(resize('DC01',{vcpu:4,ram:16,hotAdd:true})===''&&vm('DC01').vcpu===4&&vm('DC01').ram===16&&vm('DC01').hotAdd,'powered off: resize + enable hot add');
ok(/more vCPUs than/.test(resize('DC01',{vcpu:64})),'cannot exceed host cores');ok(/more memory than/.test(resize('DC01',{ram:999})),'cannot exceed host RAM');
C(`[data-act=power][data-v="${vm('DC01').id}"]`);ok(vm('DC01').power==='on','power on');
ok(resize('DC01',{vcpu:6,ram:24})===''&&vm('DC01').vcpu===6&&vm('DC01').ram===24,'hot add on: increase live');
ok(/can't be removed|can't remove/.test(resize('DC01',{vcpu:2})),'hot add on: vCPU decrease still blocked live');
ok(/can't remove memory/.test(resize('DC01',{ram:8})),'hot add on: memory decrease blocked live');
w.eval('S.vms.push({id:uid("v"),name:"BIGSQL",role:"SQL Server",os:"Windows Server 2025",vcpu:8,ram:200,disk:500,hostId:S.vms.find(v=>v.name==="DC01").hostId,storageId:S.storage[0].id,vlanId:"",power:"on",snaps:[]});commit()');ok(/enough free capacity/.test(resize('DC01',{ram:64})),'running VM: host free-capacity check');
ok(/hot add/.test(d.querySelector('#main').textContent),'hot add badge shown in VM table');
ok(w.eval('S.log').some(l=>/DC01 resized live: 4→6 vCPU, 16→24 GB RAM/.test(l.msg)),'live resize logged');
ok(w.eval('S.log').some(l=>/extend the volume inside DC01/.test(l.msg)),'disk extend reminds about guest OS');
// Hyper-V rules
w.eval('S.platform="microsoft";buildSample();commit()');const fs1=vm('FS01');
C('[data-act=tab][data-v=virt]');C(`[data-act=resize][data-v="${fs1.id}"]`);ok(!d.querySelector('#modalRoot [name=hotAdd]'),'Hyper-V: no hot add setting');C('#modalRoot [data-close]');
ok(resize('FS01',{ram:32})===''&&vm('FS01').ram===32,'Hyper-V running: memory up live');
ok(resize('FS01',{ram:12})===''&&vm('FS01').ram===12,'Hyper-V running: memory down live');
ok(/Hyper-V can't change the vCPU/.test(resize('FS01',{vcpu:8})),'Hyper-V running: vCPU change blocked');
// new VM with hot add
w.eval('S.platform="vmware";buildSample();commit()');C('[data-act=tab][data-v=virt]');C('[data-act=newVM]');const f=d.querySelector('#modalRoot form');f.querySelector('[name=name]').value='APP01';f.querySelector('[name=hotAdd]').checked=true;f.dispatchEvent(new w.Event('submit',{cancelable:true}));
ok(vm('APP01')&&vm('APP01').hotAdd===true,'new VMware VM can be created with hot add on');
ok(w.eval('G.resize&&G.hotadd')&&errs.length===0,'tips defined, no page errors '+errs.join(';'));
process.exit(fail?1:0);
