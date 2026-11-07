// Network diagram: rendering from lab state, device IDs, IPs, links, toggles and exports.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('../itlab/index.html','utf8');
let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};const wait=ms=>new Promise(r=>setTimeout(r,ms));
function boot(stub){return new JSDOM(html,{url:'https://lab.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){if(stub==='none')w.claude={use:async()=>null};else if(stub)w.claude={use:async n=>n==='downloads'?stub:null}}})}
(async()=>{
 const saved=[];const dom=boot({save:async r=>{saved.push(r);return{status:'saved'}}});const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
 const C=s=>{const el=d.querySelector(s);if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
 C('[data-act=tab][data-v=diagram]');ok(/Nothing to draw yet/.test(d.getElementById('main').textContent),'empty state');
 C('[data-act=sample]');C('#modalRoot [data-y]');
 // add a cluster, a switch, a branch VLAN and a VPN so every layer is drawn
 w.eval(`S.clusters.push({id:uid("c"),name:"CL-PROD",hyp:S.hosts[0].hyp,ha:true,drs:true});S.hosts.forEach(h=>h.clusterId=S.clusters[0].id);
  S.switches.push({id:uid("w"),name:"vDS-Prod",type:"vSphere Distributed Switch",uplinks:2,vlanIds:S.vlans.map(v=>v.id)});
  S.vlans.push({id:uid("n"),vlan:50,name:"Branch Users",subnet:"10.20.50.0/24",site:"Dallas"});
  S.vlans.push({id:uid("n"),vlan:60,name:"Warehouse",subnet:"10.30.60.0/24",site:"Austin-WH"});
  S.vpn.push({id:uid("t"),name:"HQ-to-Dallas",peer:"Branch-Dallas",type:"IPsec IKEv2",auth:"Certificate",status:"up"});commit()`);
 await wait(50);C('[data-act=tab][data-v=diagram]');
 const svg=d.querySelector('#dgmWrap svg');ok(!!svg,'SVG rendered');const txt=svg.textContent;
 ok(/FW-001/.test(txt)&&/ISP-001/.test(txt),'firewall + internet IDs');ok(/SW-\d{3} · vDS-Prod/.test(txt),'switch ID');
 ok((txt.match(/HST-\d{3}/g)||[]).length===2,'two host IDs');ok(/VM-\d{3} · DC01 · 10\.10\.20\.10/.test(txt),'DC01 shows VM ID + IP .10 (matches DNS record)');
 ok(/VM-\d{3} · FS01 · 10\.10\.20\.11/.test(txt),'FS01 gets next IP');ok(/mgmt 10\.10\.10\.2/.test(txt),'host management IP from Management VLAN');
 ok(/STG-\d{3} · DS-SAN-01/.test(txt),'storage ID');ok(/CL-\d{3} · CL-PROD · HA · LB/.test(txt),'cluster enclosure label');
 ok(/Site: Branch-Dallas/.test(txt)&&/VLAN 50 · Branch Users/.test(txt),'VPN site with matched branch VLAN');
 ok(/Site: Austin-WH/.test(txt)&&/not connected/.test(txt),'unconnected site flagged');
 ok(svg.querySelectorAll('line[stroke-dasharray]').length===2,'dashed storage links from both hosts');
 // inventory
 const rows=[...d.querySelectorAll('#main table tr')].slice(1).map(r=>r.firstElementChild.textContent);
 ok(rows.includes('FW-001')&&rows.filter(r=>/^VM-/.test(r)).length===2&&rows.includes('VLAN-50'),'inventory lists devices and VLANs');
 const ids=rows.filter(r=>!/^VLAN-/.test(r));ok(new Set(ids).size===ids.length,'device IDs are unique');
 // toggles + zoom
 C('input[data-act=dgmOpt][data-v=vms]');ok(!/DC01/.test(d.querySelector('#dgmWrap svg').textContent),'hide VMs');C('input[data-act=dgmOpt][data-v=vms]');
 C('input[data-act=dgmOpt][data-v=ips]');ok(!/10\.10\.20\.10/.test(d.querySelector('#dgmWrap svg').textContent),'hide IPs');C('input[data-act=dgmOpt][data-v=ips]');
 const w0=d.querySelector('#dgmWrap > div').style.width;C('[data-act=dgmZoom][data-v="1"]');ok(d.querySelector('#dgmWrap > div').style.width!==w0,'zoom changes size');
 // click-through navigation
 d.querySelector('#dgmWrap svg g[data-v="dc|dc-hosts"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ok(w.eval('S.tab')==='dc','clicking a host opens Datacenter');
 C('[data-act=tab][data-v=diagram]');d.querySelector('#dgmWrap svg g[data-v="net|net-vpn"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ok(w.eval('S.tab')==='net','clicking a site opens Network');
 // exports via claude.ai downloads capability
 C('[data-act=tab][data-v=diagram]');await wait(50);
 ok(!!d.querySelector('[data-act=dgmSave][data-v=svg]'),'download buttons shown when capability present');
 C('[data-act=dgmSave][data-v=svg]');await wait(30);C('[data-act=dgmSave][data-v=csv]');await wait(30);
 ok(saved[0]&&saved[0].filename==='corp.local-network-diagram.svg'.replace('corp.local',w.eval('S.ad.domain')||'itlab')&&saved[0].data.startsWith('<svg'),'SVG saved through capability');
 ok(saved[1]&&saved[1].filename.endsWith('-network-inventory.csv')&&saved[1].data.split('\n')[0]==='ID,Name,Type,Parent / location,Network,IP address,Status','CSV saved with header');
 ok(/<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/.test(saved[0].data)&&/fill="#0f1419"/.test(saved[0].data),'exported SVG is standalone with its own background');
 ok(errs.length===0,'no page errors '+errs.join('; '));
 // claude.ai view without the capability: download buttons hidden, copy still offered
 const d2=boot('none');const w2=d2.window;await wait(300);
 w2.eval("A.sample()");w2.document.querySelector('#modalRoot [data-y]').dispatchEvent(new w2.MouseEvent('click',{bubbles:true}));w2.eval("S.tab='diagram';render()");
 ok(!w2.document.querySelector('[data-act=dgmSave]')&&!!w2.document.querySelector('[data-act=dgmCopy]'),'no capability: downloads hidden, copy shown');
 // plain hosting (GitHub Pages): browser download fallback
 const d3=boot(null);const w3=d3.window;let clicked=null;w3.URL.createObjectURL=()=>'blob:x';w3.URL.revokeObjectURL=()=>{};w3.HTMLAnchorElement.prototype.click=function(){clicked=this.download};
 await wait(3300);w3.eval("A.sample()");w3.document.querySelector('#modalRoot [data-y]').dispatchEvent(new w3.MouseEvent('click',{bubbles:true}));w3.eval("S.tab='diagram';render()");
 w3.document.querySelector('[data-act=dgmSave][data-v=csv]').dispatchEvent(new w3.MouseEvent('click',{bubbles:true}));await wait(30);
 ok(clicked&&clicked.endsWith('.csv'),'browser download fallback outside claude.ai');
 process.exit(fail?1:0)})();
