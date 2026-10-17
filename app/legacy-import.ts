import {teams,mergeFixture} from './model';

// Build on a copy so a rejected import never changes the saved tournament.
export function importLegacy(current:any,raw:any){
 if(!raw||!Array.isArray(raw.teams)||!Array.isArray(raw.players)||!Array.isArray(raw.duels))throw Error('Bitte eine JSON-Sicherung der 1UP-Match-App auswählen.');
 if(raw.players.length>1200||raw.duels.length>100)throw Error('Sicherung ist zu groß.');
 const s=structuredClone(current);
 const key=(v:string)=>v.toLowerCase().replace(/[’'\s]/g,'');
 const aliases:any={'bachspin':'Backspin','redhotchillis':'Red Hot Chilis'};
 const mapped=new Map<string,string>();
 for(const t of raw.teams){const name=teams.find(n=>key(n)===key(String(t.name)))||aliases[key(String(t.name))];if(!name)throw Error('Unbekanntes Team: '+t.name+'. Bitte zuerst den Teamnamen in der Offline-App zuordnen.');mapped.set(String(t.id),name);}
 if(new Set(mapped.values()).size!==mapped.size)throw Error('Mehrere Quellteams haben denselben Zielnamen.');
 const hcp=(v:any)=>{const n=Number(String(v).replace(',','.'));if(String(v).trim()===''||!Number.isFinite(n)||n< -10||n>54)throw Error('Ungültiges Handicap: '+v);return n;};
 const members=new Map<string,any>();
 for(const p of raw.players){const t=mapped.get(String(p.teamId));if(!t||typeof p.name!=='string'||!p.name.trim()||p.name.length>100)throw Error('Spieler ohne gültiges Team oder Namen.');const value={id:'legacy-'+String(p.id),name:p.name.trim(),hcp:hcp(p.hcp),group:['A','B','C','D'].includes(p.group)?p.group:'',club:String(p.club||''),status:String(p.status||'Aktiv'),role:String(p.role||'Mitglied')};members.set(String(p.id),value);const existing=s.rosters[t].find((r:any)=>key(r.name)===key(value.name));if(existing)Object.assign(existing,value,{id:existing.id});else s.rosters[t].push(value);if(s.rosters[t].length>200)throw Error('Maximal 200 Mitglieder pro Team.');}
 for(const t of raw.teams){const profile=s.profiles[mapped.get(String(t.id))!];if(/^#[0-9a-f]{6}$/i.test(t.color))profile.color=t.color;if(typeof t.logo==='string'&&t.logo.length<=150000&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(t.logo))profile.logo=t.logo;profile.captain=String(t.captain||'').slice(0,100);}
 for(const d of raw.duels){
  if(typeof d.id!=='string'||!d.id||!Array.isArray(d.matches)||!d.matches.length||d.matches.length>36)throw Error('Ungültiges Teamduell oder mehr als 36 Matches.');
  const id='legacy-'+d.id;if(s.fixtures.some((f:any)=>f.id===id))throw Error('Dieses Teamduell wurde bereits übernommen: '+d.id);
  const a=mapped.get(String(d.teamAId)),b=mapped.get(String(d.teamBId));if(!a||!b||a===b)throw Error('Ungültige Teampaarung.');
  if(!d.date||!Number.isFinite(Date.parse(d.date)))throw Error('Bitte für jedes Teamduell vor dem Import ein Datum festlegen.');
  const formats=d.matches.map((m:any)=>m.format==='Fourball'?'Vierball':m.format==='Klassischer Vierer'&&m.group!=='A'?'Vierer mit Auswahldrive':m.format);
  if(formats.some((v:string)=>!['Einzel','Klassischer Vierer','Vierer mit Auswahldrive','Vierball'].includes(v)))throw Error('Unbekannte Spielform.');
  const f:any={id,a,b,date:new Date(d.date+'T09:00:00').toISOString(),formats,lineups:{[a]:[],[b]:[]},rules:{...s.settings,holes:18},course:s.course,verify:false,venue:'Golfresort Kremstal',startHole:1,gapMinutes:0,signatures:{},legacy:true,importedSignatures:d.signatures||{}};
  for(const [index,m] of d.matches.entries())for(const [side,t] of [['A',a],['B',b]]){const ids=m['player'+side];const count=formats[index]==='Einzel'?1:2;if(!Array.isArray(ids)||ids.length!==count)throw Error('Bitte offene Aufstellungen vor dem Import vervollständigen.');for(const pid of ids){const p=members.get(String(pid));if(!p||mapped.get(String(raw.players.find((r:any)=>String(r.id)===String(pid))?.teamId))!==t)throw Error('Aufstellung enthält unbekannte Spieler oder falsches Team.');f.lineups[t!].push({...p});}}
  s.fixtures.push(f);mergeFixture(s,f);
  for(const [i,m] of d.matches.entries()){
   if(!Array.isArray(m.holes)||m.holes.length!==18||!Array.isArray(m.played)||m.played.length!==18||m.holes.some((v:any)=>![-1,0,1].includes(v))||m.played.some((v:any)=>typeof v!=='boolean')||!['pending','live','done'].includes(m.status))throw Error('Ungültige Loch-Ergebnisse.');
   const match=s.matches.find((v:any)=>v.fixtureId===id&&v.slot===i);const holes=m.holes.map((v:number,j:number)=>m.played[j]?v:null);
   if(holes.some((v:any,j:number)=>v!==null&&holes.slice(0,j).includes(null)))throw Error('Bitte Lücken in den Loch-Ergebnissen vor dem Import schließen.');
   Object.assign(match,{holes,entries:{A:[...holes],B:[...holes]},group:m.group,importedFinished:m.status==='done',legacySource:m.id});
  }
 }
 return s;
}
