(function(root){
"use strict";
const GROUPS=["A","B","C","D"],FORMATS=["Klassischer Vierer","Fourball","Einzel"];
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const clone=x=>JSON.parse(JSON.stringify(x));
function initial(){return {version:2,teams:["Golden Youngstars","Greens","Red Hot Chillis","OG’s","Bachspin","Blackies"].map((name,i)=>({id:String(i+1),name,color:["#5d9a73","#537ea8","#b75a52","#c9a83d","#8366a8","#303936"][i],captain:["Kevin Hinterberger","Thomas Schober","Viktor Antal","Günter Obermair","Christian Butz","Georg Marchgraber"][i]})),players:[],duels:[],events:[],messages:[],photos:[],config:{vierer:1,fourball:0,einzel:1,hcpEinzelPct:75,hcpDoppelPct:75,nennlisteUrl:""},nennliste:null}}
function normalize(raw){
if(!raw||!Array.isArray(raw.teams)||!Array.isArray(raw.players))throw Error("Ungültige Sicherung: Teams oder Spieler fehlen.");
const s={...initial(),...clone(raw),version:2};
s.teams=s.teams.map(t=>({id:String(t.id),name:String(t.name||"Team"),color:/^#[0-9a-f]{6}$/i.test(t.color)?t.color:"#28584a",captain:String(t.captain||"")}));
s.players=s.players.map(p=>Array.isArray(p)?{id:uid(),name:String(p[0]),teamId:String(p[1]),hcp:String(p[2]),status:p[3]||"Aktiv",role:p[4]||"Mitglied",club:p[5]||"",group:GROUPS.includes(p[6])?p[6]:""}:{...p,id:String(p.id||uid()),teamId:String(p.teamId),group:GROUPS.includes(p.group)?p.group:""});
s.config={...initial().config,...s.config};
if(raw.config?.viererMatches!==undefined){s.config.vierer=raw.config.viererEnabled===false?0:raw.config.viererMatches;s.config.einzel=raw.config.einzelMatches||1}
if(!Array.isArray(raw.duels)){
s.duels=[];const groups=new Map();
(raw.matches||[]).forEach(m=>{const k=m.duelId||m.enc||"Bestehendes Duell";if(!groups.has(k)){const names=(m.enc||"").split(" vs. ");const find=(id,n,fallback)=>s.teams.find(t=>t.id===String(id))?.id||s.teams.find(t=>t.name===n)?.id||s.teams[fallback]?.id;groups.set(k,{id:uid(),teamAId:find(m.teamAId,names[0],0),teamBId:find(m.teamBId,names[1],1),label:m.enc||"",date:"",signatures:{},matches:[]});s.duels.push(groups.get(k))}
groups.get(k).matches.push({id:String(m.id),group:m.group||"A",format:m.format==="Foursome"?"Klassischer Vierer":m.format,playerA:[],playerB:[],legacyA:m.a,legacyB:m.b,holes:(m.holes||Array(18).fill(0)).map(v=>v===1||v===-1?v:0),played:(m.holes||Array(18).fill(0)).map(v=>v!==0),status:m.status==="Beendet"?"done":m.status==="LIVE"?"live":"pending"})});
}
s.duels=s.duels.map(d=>({...d,id:String(d.id),teamAId:String(d.teamAId),teamBId:String(d.teamBId),signatures:d.signatures||{},matches:(d.matches||[]).map(m=>({...m,id:String(m.id),group:GROUPS.includes(m.group)?m.group:"A",playerA:(m.playerA||[]).map(String),playerB:(m.playerB||[]).map(String),holes:Array.from({length:18},(_,i)=>[1,-1].includes(m.holes?.[i])?m.holes[i]:0),played:Array.from({length:18},(_,i)=>m.played?.[i]??(m.holes?.[i]!==0&&m.holes?.[i]!==undefined)),status:["pending","live","done"].includes(m.status)?m.status:"pending"}))}));
s.events=(s.events||[]).map((e,i)=>Array.isArray(e)?{id:String(i),title:e[1],date:"",time:e[0],location:e[3],rsvp:false}:{...e,id:String(e.id)});
s.messages=(s.messages||[]).map(m=>typeof m==="string"?{id:uid(),text:m,channel:"team",teamId:s.teams[0]?.id,author:"Import",at:""}:m);
s.photos=Array.isArray(s.photos)?s.photos:[];return s;
}
const drive=m=>m.format==="Klassischer Vierer"&&m.group!=="A";
const started=m=>m.status!=="pending"||m.played.some(Boolean);
function newMatch(group,format){return {id:uid(),group,format,playerA:[],playerB:[],holes:Array(18).fill(0),played:Array(18).fill(false),status:"pending"}}
function configure(d,groups,counts){
let kept=0;const retained=d.matches.filter(started);
for(const m of retained){const target=groups.includes(m.group)?Number(counts[m.format]||0):0;if(!target||retained.filter(x=>x.group===m.group&&x.format===m.format).indexOf(m)>=target)kept++}
for(const m of d.matches.filter(m=>!started(m))){const target=groups.includes(m.group)?Number(counts[m.format]||0):0;const num=retained.filter(x=>x.group===m.group&&x.format===m.format).length;if(num<target)retained.push(m)}
for(const g of groups)for(const f of FORMATS){const count=retained.filter(m=>m.group===g&&m.format===f).length;for(let i=count;i<counts[f];i++)retained.push(newMatch(g,f))}
d.matches=retained;d.signatures={};return kept;
}
function score(m){const diff=m.holes.reduce((a,b)=>a+b,0),played=m.played.filter(Boolean).length,remaining=18-played;return {diff,played,remaining,text:played===0?"Noch nicht gestartet":diff===0?(m.status==="done"?"Geteilt":"All Square"):m.status==="done"?(Math.abs(diff)>remaining&&remaining>0?Math.abs(diff)+" & "+remaining:Math.abs(diff)+" UP"):Math.abs(diff)+" UP · "+(diff>0?"Team A":"Team B")}}
function points(m){if(m.status!=="done")return [0,0];const {diff}=score(m);return diff>0?[1,0]:diff<0?[0,1]:[.5,.5]}
function duelScore(d){return d.matches.reduce((a,m)=>{const p=points(m);return [a[0]+p[0],a[1]+p[1]]},[0,0])}
function leaderboard(s){return s.teams.map(t=>({...t,points:s.duels.reduce((sum,d)=>{const p=duelScore(d);return sum+(d.teamAId===t.id?p[0]:d.teamBId===t.id?p[1]:0)},0)})).sort((a,b)=>b.points-a.points)}
function handicap(v,pct){const n=Number(String(v).replace(",","."));return String(v).trim()!==""&&Number.isFinite(n)?Math.round(n*pct/100):"–"}
function parseCSV(text){
const first=text.split(/\r?\n/)[0],sep=first.includes("\t")?"\t":first.includes(";")?";":",";
const rows=[];let row=[],cell="",quote=false;
for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){cell+='"';i++}else quote=!quote}else if(c===sep&&!quote){row.push(cell.trim());cell=""}else if((c==="\n"||c==="\r")&&!quote){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell=""}else cell+=c}
if(quote)throw Error("Nicht geschlossenes Anführungszeichen in CSV.");row.push(cell.trim());if(row.some(Boolean))rows.push(row);if(!rows.length)return [];
const h=rows[0].map(c=>c.toLowerCase()),header=h.some(c=>/^(name|spieler|vorname|nachname|club|klub|hcp|handicap|gruppe|team)$/.test(c));
const col=(re,def)=>header?h.findIndex(c=>re.test(c)):def;
const ni=col(/^(name|spieler)$/,0),vi=col(/^vorname$/,-1),li=col(/^nachname$/,-1),ci=col(/^(club|klub|verein)$/,1),hi=col(/^(hcp|handicap|vorgabe)$/,2),gi=col(/^gruppe$/,-1),ti=col(/^team$/,-1);
return rows.slice(header?1:0).map(r=>({name:vi>=0||li>=0?((r[vi]||"")+" "+(r[li]||"")).trim():r[ni]||"",club:r[ci]||"",hcp:r[hi]||"",group:(r[gi]||"").toUpperCase(),team:r[ti]||""})).filter(r=>r.name);
}
const api={GROUPS,FORMATS,uid,clone,initial,normalize,drive,started,newMatch,configure,score,points,duelScore,leaderboard,handicap,parseCSV};
if(typeof module!=="undefined")module.exports=api;else root.Cup=api;
})(globalThis);

