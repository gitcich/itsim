// Learning Library: rendering, search/filter, links library -> simulator and simulator -> library.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync('../itlab/index.html','utf8');
const dom=new JSDOM(html,{url:'https://lab.test/',runScripts:'dangerously',pretendToBeVisual:true});
const w=dom.window,d=w.document;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
const C=s=>{const el=d.querySelector(s);if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}))};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const LIB=w.eval('LIB'),G=w.eval('G'),ANC=w.eval('LIB_ANCHOR'),STUDY=w.eval('SCN_STUDY');
 ok(LIB.length===50,'50 guides');ok(new Set(LIB.map(g=>g.id)).size===50,'unique ids');
 ok(LIB.every(g=>g.url.startsWith('https://natted.cloud/learn/')),'all links point to natted.cloud/learn');
 ok(LIB.every(g=>g.keys.every(k=>G[k])),'every related key is a glossary topic');
 ok(Object.values(STUDY).flat().every(id=>LIB.some(g=>g.id===id)),'scenario study links resolve');
 C('[data-act=sample]');C('#modalRoot [data-y]');
 C('[data-act=tab][data-v=learn]');ok(d.querySelectorAll('.libcard').length===50,'library shows all cards');
 const q=d.getElementById('libQ');q.value='vlan';q.dispatchEvent(new w.Event('input',{bubbles:true}));
 const n=d.querySelectorAll('.libcard').length;ok(n>0&&n<10,'search filters ('+n+')');
 q.value='';q.dispatchEvent(new w.Event('input',{bubbles:true}));C('[data-act=libCat][data-v="Security"]');ok(d.querySelectorAll('.libcard').length===5,'category filter');
 // every anchor referenced exists on its page
 const pages={};for(const [k,[t,a]] of Object.entries(ANC)){(pages[t]=pages[t]||new Set()).add(a)}
 let missing=[];for(const [t,as] of Object.entries(pages)){C(`[data-act=tab][data-v=${t}]`);for(const a of as)if(!d.querySelector(`[data-anchor="${a}"]`))missing.push(t+':'+a)}
 // id-entra only exists once a domain exists: build one
 ok(missing.filter(m=>m!=='id:id-entra').length===0,'all simulator anchors exist '+missing.join(','));
 // library -> simulator
 C('[data-act=tab][data-v=learn]');C('[data-act=libCat][data-v="All"]');
 C('[data-anchor="lib-vlan"] [data-act=goto]');await wait(60);
 ok(w.eval('S.tab')==='net'&&d.querySelector('[data-anchor="net-vlan"]').classList.contains('flash'),'Try it jumps to Network → VLANs and highlights it');
 // simulator -> library via 📚 button
 C('[data-anchor="net-fw"] .libbtn');ok(w.eval('S.tab')==='learn'&&w.eval('S.libKey')==='firewall','📚 opens library filtered to topic');
 ok([...d.querySelectorAll('.libcard')].length===w.eval("LIB.filter(g=>g.keys.includes('firewall')).length"),'topic filter count');
 // pinned tip shows Learn more and opens a guide
 C('[data-act=goto][data-v="net|net-fw"]');await wait(40);
 const ti=d.querySelector('.tip-ic[data-tip="dhcp"]');ti.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 ok(/Learn more/.test(d.getElementById('tip').textContent),'pinned tip lists related guides');
 d.querySelector('#tip [data-act=libOpen]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(60);
 ok(w.eval('S.tab')==='learn'&&w.eval('S.libFocus')==='dhcp'&&d.getElementById('tip').style.display==='none','tip guide opens library focused, tip closes');
 ok(d.querySelector('[data-anchor="lib-dhcp"]').classList.contains('flash'),'focused guide highlighted');
 // scenario study links
 C('[data-act=tab][data-v=scn]');ok(d.querySelectorAll('#main [data-act=libOpen]').length===Object.values(STUDY).flat().length,'scenario cards show study links');
 // external links open safely
 C('[data-act=tab][data-v=learn]');ok([...d.querySelectorAll('a.libread')].every(a=>a.target==='_blank'&&a.rel.includes('noopener')),'external links open in new tab with noopener');
 ok(errs.length===0,'no page errors '+errs.join('; '));
 process.exit(fail?1:0)})();
