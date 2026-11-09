// Cost model: per-device estimates, shared costs, header/dashboard display, editable assumptions.
const {JSDOM}=require('jsdom');const fs=require('fs');
const dom=new JSDOM(fs.readFileSync('../itlab/index.html','utf8'),{url:'https://lab.test/',runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};const near=(a,b,t=1)=>Math.abs(a-b)<=t;
const C=s=>{const el=d.querySelector(s);if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const M=()=>w.eval('costModel()');const cost=id=>w.eval(`costOf(costModel(),"${id}").total`);
ok(d.getElementById('costPill').textContent==='','no cost shown for an empty lab');
w.eval('S.platform="vmware";buildSample();commit()');
const [h1,h2]=w.eval('S.hosts.map(h=>h.id)');
ok(near(cost(h1),207.47+87.5+360+203.33,0.5),'VMware host: hardware + power + VVF (32 cores) + Windows DC for Windows VMs ≈ $858');
ok(near(cost(w.eval('S.storage[0].id')),1140,0.5),'40 TB all-flash SAN ≈ $1,140');
ok(near(cost('fw'),193.33,0.5)&&near(cost('core'),185,0.5),'edge firewall ≈ $193, core switch ≈ $185');
let m=M();ok(m.shared.some(l=>/72-core order minimum \(8 unused/.test(l.label)&&near(l.amt,90,0.01)),'VMware 72-core minimum applied for 64 licensed cores');
ok(near(m.total,3323.6,2),'sample lab total ≈ $3,324/mo ('+Math.round(m.total)+')');
ok(d.getElementById('costPill').textContent===`Est. $${Math.round(m.total).toLocaleString('en-US')}/mo`,'header shows the estimate on every page');
C('[data-act=tab][data-v=net]');ok(d.getElementById('costPill').textContent.startsWith('Est. $'),'header estimate still visible on Network page');
C('#costPill');ok(w.eval('S.tab')==='dash'&&!!d.querySelector('[data-anchor="dash-cost"]'),'clicking the header estimate opens the dashboard cost card');
const card=d.querySelector('[data-anchor="dash-cost"]').textContent;ok(/per year/.test(card)&&/Biggest cost drivers/.test(card)&&/Assumptions and sources \(\d+\)/.test(card),'dashboard card: total, annual, drivers, sources');
ok(d.querySelectorAll('[data-anchor="dash-cost"] details a[href^="https://"]').length>=20,'assumptions link to market sources');
C('[data-act=tab][data-v=dc]');ok(/Est\.\/mo/.test(d.querySelector('[data-anchor="dc-hosts"]').textContent)&&/\$858/.test(d.querySelector('[data-anchor="dc-hosts"]').textContent),'host table shows per-device estimate');
ok(/\$1,140/.test(d.querySelector('[data-anchor="dc-storage"]').textContent),'storage table shows per-device estimate');
// VM-level costs: SQL, RHEL, EDR, backup, offsite
w.eval(`S.vms.push({id:uid("v"),name:"SQL01",role:"SQL Server",os:"Windows Server 2025",vcpu:2,ram:16,disk:200,hostId:S.hosts[0].id,storageId:S.storage[0].id,vlanId:S.vlans[1].id,power:"on",snaps:[]});
 S.vms.push({id:uid("v"),name:"WEB01",role:"Web Server",os:"Red Hat Enterprise Linux 9",vcpu:2,ram:8,disk:100,hostId:S.hosts[1].id,storageId:S.storage[0].id,vlanId:S.vlans[1].id,power:"on",snaps:[]});commit()`);
const sql=w.eval('S.vms.find(v=>v.name==="SQL01").id'),web=w.eval('S.vms.find(v=>v.name==="WEB01").id');
ok(near(cost(sql),2*1418/12,0.01),'SQL Server Standard: 4-core minimum (2 packs) even with 2 vCPU');
ok(near(cost(web),1367/12,0.01),'RHEL subscription per VM');
w.eval('S.sec.edr=true;S.sec.siem=true;commit()');ok(near(cost(web),1367/12+15,0.01),'EDR adds Defender for Servers P2 per VM');
ok(M().shared.some(l=>/firewall logs/.test(l.label))&&!M().items.some(i=>i.lines.some(l=>/Sentinel log ingestion/.test(l.label))),'with Defender P2, server logs ride the free 500 MB/day; only firewall logs billed');
w.eval('S.sec.edr=false;commit()');ok(M().items.find(i=>i.id===web).lines.some(l=>/Sentinel log ingestion/.test(l.label)),'without EDR, server logs are billed in Sentinel');
w.eval('S.backups.push({id:uid("b"),n:"Nightly",vmIds:[S.vms[0].id],target:"local",freq:"Daily",last:"never"},{id:uid("b"),n:"Cloud",vmIds:[S.vms[0].id],target:"offsite",freq:"Daily",last:"never"});commit()');
const dcl=M().items.find(i=>i.id===w.eval('S.vms[0].id')).lines;ok(dcl.some(l=>/Veeam license/.test(l.label))&&dcl.some(l=>/Offsite copy \(0\.12 TB\)/.test(l.label))&&dcl.some(l=>/On-prem repository/.test(l.label)),'backup: Veeam license + on-prem + offsite storage sized from the VM disk');
ok(dcl.filter(l=>/Veeam/.test(l.label)).length===1,'one Veeam instance per VM even with two jobs');
// identity/security shared costs
w.eval('S.ad.domain="corp.local";S.ad.users=[{n:"a",ou:"Users",groups:[],admin:true},{n:"b",ou:"Users",groups:[],admin:false},{n:"c",ou:"Users",groups:[],admin:false}];S.sec.mfa=true;S.sec.pam=true;commit()');
m=M();ok(m.shared.some(l=>/Entra ID P1 × 3 users/.test(l.label)&&near(l.amt,21)),'MFA: Entra ID P1 per user');ok(m.shared.some(l=>/PAM × 5 admins/.test(l.label)&&near(l.amt,250)),'PAM: 5-user minimum');
// Hyper-V: Datacenter includes Hyper-V, no VMware lines
w.eval('S.platform="microsoft";buildSample();commit()');const hv=M().items.find(i=>i.kind==='host');
ok(hv.lines.some(l=>/Datacenter, 32 cores \(includes Hyper-V\)/.test(l.label))&&!hv.lines.some(l=>/vSphere/.test(l.label))&&!M().shared.some(l=>/VMware/.test(l.label)),'Hyper-V host: Windows Datacenter licensing, no VMware costs');
// VPN branch firewall
w.eval('S.vpn.push({id:uid("t"),name:"HQ-to-Dallas",peer:"Dallas",type:"IPsec IKEv2",auth:"Certificate",status:"up"});commit()');ok(near(cost(w.eval('S.vpn[0].id')),400/60+615/12,0.01),'each VPN site adds a branch firewall');
// diagram + inventory
C('[data-act=tab][data-v=diagram]');const svg=d.querySelector('#dgmWrap svg').textContent;ok(/est\. \$[\d,]+\/mo/.test(svg)&&/\$[\d,]+\/mo/.test(svg),'diagram shows per-device and total cost');
C('input[data-act=dgmOpt][data-v=costs]');ok(!/est\. \$/.test(d.querySelector('#dgmWrap svg').textContent),'costs toggle hides them');C('input[data-act=dgmOpt][data-v=costs]');
const inv=w.eval('csvOf(dgmInventory())').split('\n');ok(inv[0].endsWith(',Est. $/mo')&&inv.some(r=>/^FW-001,.*,193$/.test(r)),'inventory CSV has per-device monthly cost');
// editable assumptions
C('[data-act=tab][data-v=dash]');C('[data-act=editRates]');const f=d.querySelector('#modalRoot form');f.querySelector('[name=vvf]').value='190';f.querySelector('[name=kw]').value='150';f.dispatchEvent(new w.Event('submit',{cancelable:true}));
ok(w.eval('JSON.stringify(S.rates)')==='{"kw":150,"vvf":190}','edited rates stored as overrides only');
ok(/edited/.test(d.querySelector('[data-anchor="dash-cost"]').textContent),'edited rates flagged in the sources list');
w.eval('S.platform="vmware";buildSample();commit()');ok(w.eval('S.rates.vvf')===190,'custom rates survive loading the sample');
C('[data-act=editRates]');const rb=[...d.querySelectorAll('#modalRoot button')].find(b=>/Reset to market defaults/.test(b.textContent));ok(!!rb,'reset button offered when rates are edited');rb.click();ok(w.eval('Object.keys(S.rates).length')===0,'reset restores market defaults');
ok(errs.length===0,'no page errors '+errs.join('; '));
process.exit(fail?1:0);
