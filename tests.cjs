const assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),C=require("./core.js");
const s=C.initial();assert.equal(s.duels.length,0);assert.equal(s.teams.length,6);
for(const g of C.GROUPS)assert.equal(C.drive(C.newMatch(g,"Klassischer Vierer")),g!=="A");
assert.equal(C.drive(C.newMatch("B","Einzel")),false);
const duel={id:"d",teamAId:"1",teamBId:"2",matches:[],signatures:{}};
C.configure(duel,C.GROUPS,{"Klassischer Vierer":1,Fourball:1,Einzel:2});assert.equal(duel.matches.length,16);
const live=duel.matches[1];live.status="live";live.played[0]=true;live.holes[0]=1;
C.configure(duel,["A"],{"Klassischer Vierer":0,Fourball:0,Einzel:1});assert.equal(duel.matches.length,2);assert(duel.matches.includes(live));
let m=C.newMatch("B","Einzel");m.status="done";m.holes[0]=1;m.played[0]=true;assert.deepEqual(C.points(m),[1,0]);m.holes[0]=0;assert.deepEqual(C.points(m),[.5,.5]);m.holes[0]=-1;assert.deepEqual(C.points(m),[0,1]);
s.duels=[{...duel,matches:[m]}];assert.equal(C.leaderboard(s).find(t=>t.id==="2").points,1);assert.equal(C.leaderboard(s).find(t=>t.id==="1").points,0);
const old={teams:[{id:1,name:"Team A",color:"#123456"},{id:2,name:"Team B",color:"#654321"}],players:[["Max",1,"6.2","Aktiv","Kapitän","Club"]],matches:[{id:1,enc:"Team A vs. Team B",format:"Foursome",a:"Max",b:"Joe",status:"Beendet",holes:[1,...Array(17).fill(0)]}],config:{viererMatches:2,einzelMatches:3,hcpEinzelPct:75},events:[["09:00","Start","Heute","Club"]],messages:["Hallo"]};
const migrated=C.normalize(old);assert.equal(migrated.players[0].name,"Max");assert.equal(migrated.players[0].group,"");assert.equal(migrated.duels[0].teamAId,"1");assert.equal(migrated.duels[0].matches[0].status,"done");assert.equal(migrated.duels[0].matches[0].format,"Klassischer Vierer");assert.equal(migrated.config.vierer,2);assert.equal(migrated.events[0].title,"Start");assert.equal(migrated.messages[0].text,"Hallo");
assert.equal(C.handicap("12,4",75),9);assert.equal(C.handicap("",75),"–");
assert.deepEqual(C.parseCSV('Name;Klub;HCP;Gruppe;Team\r\n"Max; Test";Club;6,2;A;Team A'),[{name:"Max; Test",club:"Club",hcp:"6,2",group:"A",team:"Team A"}]);assert.throws(()=>C.parseCSV('Name;Klub\n"Offen;Club'));
assert.equal(C.parseCSV('Vorname,Nachname,HCP\nMax,Test,8.5')[0].name,"Max Test");
assert.throws(()=>C.normalize({}));assert.deepEqual(C.normalize(migrated),migrated);
const elements=new Map(),storage=new Map(),dialogs=[];
function el(id){if(!elements.has(id))elements.set(id,{value:"",innerHTML:"",textContent:"",className:"",querySelector:()=>({}),querySelectorAll:()=>[],showModal(){dialogs.push(id)},close(){},click(){}});return elements.get(id)}
class FakeFormData{constructor(data){this.data=data?.data||data||{}}get(k){return this.data[k]??null}getAll(k){const x=this.data[k];return Array.isArray(x)?x:x?[x]:[]}*[Symbol.iterator](){yield*Object.entries(this.data)}}
const ctx=vm.createContext({Cup:C,console,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},sessionStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:el,querySelectorAll:()=>[]},window:{addEventListener:()=>{},scrollTo:()=>{}},location:{hash:"",protocol:"file:"},navigator:{},confirm:()=>true,setTimeout:()=>1,clearTimeout:()=>{},FormData:FakeFormData,URL,Blob});
vm.runInContext(fs.readFileSync(__dirname+"/app.js","utf8"),ctx);const run=s=>vm.runInContext(s,ctx);
for(const p of ["overview","teams","members","duels","lineup","live","calendar","results","chat","admin"]){run('goto("'+p+'")');assert(el("app").innerHTML.length>300)}
run('editDuel()');el("editForm").onsubmit({preventDefault(){},target:{data:{teamAId:"1",teamBId:"2",date:"2026-10-17",groups:["A","B"],count0:"1",count1:"0",count2:"1"}}});assert.equal(run("state.duels[0].matches.length"),4);
run('selection=state.duels[0].id;matchId=state.duels[0].matches[0].id;handle("hole",matchId+":0:1")');assert.equal(run("state.duels[0].matches[0].holes[0]"),1);assert.equal(run("state.duels[0].matches[0].status"),"live");
run('handle("finish",matchId);handle("finish",matchId)');assert.equal(run("C.leaderboard(state)[0].points"),1);
run('goto("results")');assert.match(el("app").innerHTML,/1 : 0/);
run('handle("reset-score",matchId)');assert.equal(run("C.leaderboard(state)[0].points"),0);
run('commit(()=>state.events.push({id:"ev",title:"Start",date:"2026-10-17",time:"09:00",rsvp:false}));handle("rsvp","ev")');assert.equal(JSON.parse(storage.get("oneUpMatchV2")).events[0].rsvp,true);
el("messageText").value='<script>alert(1)</script>';run('sendChat({preventDefault(){}});goto("chat")');assert.match(el("app").innerHTML,/&lt;script&gt;/);assert(!el("app").innerHTML.includes('<script>alert(1)'));
run('session.role="Mitglied";handle("delete-all","")');assert.equal(run("state.duels.length"),1);
run('session.role="Admin";handle("delete-all","")');assert.equal(run("state.duels.length"),0);assert.equal(run("state.teams.length"),6);
run('goto("live");goto("lineup");goto("results")');
const before=run("JSON.stringify(state)");run('localStorage.setItem=()=>{throw Error("Quota exceeded")};commit(()=>state.teams=[])');assert.equal(run("JSON.stringify(state)"),before);
console.log("PASS: group/drive rules, configuration protection, scoring, handicap, CSV, legacy migration, all page rendering, duel creation, scoring lifecycle, live results, RSVP, chat escaping, role guards, deletion, storage rollback");

