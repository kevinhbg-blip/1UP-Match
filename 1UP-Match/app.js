const seed={
teams:[
{id:1,name:"Golden Youngstars",color:"#5d9a73",captain:"Kevin Hinterberger",points:8.5,live:true},
{id:2,name:"Greens",color:"#537ea8",captain:"Thomas Schober",points:7,live:true},
{id:3,name:"Red Hot Chillis",color:"#b75a52",captain:"Viktor Antal",points:5.5,live:false},
{id:4,name:"OG`s",color:"#c9a83d",captain:"Günter Obermair",points:4,live:false},
{id:5,name:"Bachspin",color:"#8366a8",captain:"Christian Butz",points:3,live:true},
{id:6,name:"Blackies",color:"#303936",captain:"Georg Marchgraber",points:2,live:false}
],
players:[
["Maximilian Fesel",1,"6.2","Aktiv","Kapitän"],["Lukas Berger",1,"8.1","Aktiv","Mitglied"],["Felix Freller",1,"11.4","Ersatz","Mitglied"],
["Thomas Gruber",2,"5.8","Aktiv","Kapitän"],["Daniel Hofer",2,"9.2","Aktiv","Mitglied"],["Jonas Maier",2,"10.3","Aktiv","Mitglied"],
["Sarah Elmer",3,"12.1","Aktiv","Mitglied"],["Carina Wenschitz",4,"14.5","Aktiv","Mitglied"],["Jakob Six",5,"16.3","Ersatz","Mitglied"]
],
matches:[
{id:1,enc:"Green Masters vs. Blue Eagles",format:"Fourball",a:"Maximilian Fesel / Lukas Berger",b:"Thomas Gruber / Daniel Hofer",status:"LIVE",holes:Array(18).fill(0)},
{id:2,enc:"Green Masters vs. Blue Eagles",format:"Klassischer Vierer",auswahlDrive:false,a:"Felix Freller / Lukas Berger",b:"Thomas Gruber / Jonas Maier",status:"LIVE",holes:Array(18).fill(0)},
{id:3,enc:"Green Masters vs. Blue Eagles",format:"Einzel",a:"Maximilian Fesel",b:"Jonas Maier",status:"Noch nicht gestartet",holes:Array(18).fill(0)}
],
config:{viererEnabled:true,viererMatches:1,auswahlDrive:false,einzelMatches:1,hcpEinzelPct:75,hcpDoppelPct:75,nennlisteUrl:""},
nennliste:{updatedAt:null,fetchedAt:null,sourceUrl:"",count:0},
events:[
["09:00","Foursomes-Auftakt","Heute","Golfplatz · Tee 1"],["11:30","Fourballs","Heute","Golfplatz · Tee 1–4"],["14:30","Einzel","Heute","Golfplatz · Tee 1–10"],["18:30","Siegerehrung","Heute","Clubhaus · Terrasse"]
],
messages:["Max, Tee 1 um 11:20? ⛳","Passt. Bin 10 Minuten vorher dort. 💪","Fourball-Aufstellung ist bestätigt."]
};
let state=JSON.parse(localStorage.getItem("ryderCupState")||"null")||seed;
(function migrate(){
if(!state.matches) state.matches=[];
state.matches.forEach(m=>{if(m.format==="Foursome")m.format="Klassischer Vierer";if(m.format==="Klassischer Vierer"&&m.auswahlDrive===undefined)m.auswahlDrive=false});
if(!state.config){let vc=state.matches.filter(m=>m.format==="Klassischer Vierer").length,ec=state.matches.filter(m=>m.format==="Einzel").length;state.config={viererEnabled:true,viererMatches:vc||1,auswahlDrive:false,einzelMatches:ec||1}}
if(state.config.hcpEinzelPct===undefined)state.config.hcpEinzelPct=75;
if(state.config.hcpDoppelPct===undefined)state.config.hcpDoppelPct=75;
if(state.config.nennlisteUrl===undefined)state.config.nennlisteUrl="";
if(!state.nennliste)state.nennliste={updatedAt:null,fetchedAt:null,sourceUrl:"",count:0};
})();
let currentMatch=1, currentPage="overview";
function teamName(id){return state.teams.find(t=>t.id===id)?.name||"Unbekanntes Team"}
function duels(){let groups=new Map();state.matches.forEach(m=>{let key=m.duelId||m.enc||"Bestehende Begegnung";if(!groups.has(key))groups.set(key,[]);groups.get(key).push(m)});return [...groups.values()]}
function duelTitle(matches){let m=matches[0];return m.teamAId&&m.teamBId?teamName(m.teamAId)+" vs. "+teamName(m.teamBId):m.enc}
function matchPoints(m){let score=m.holes.reduce((a,v)=>a+v,0);return m.status==="Beendet"?(score>0?[1,0]:score<0?[0,1]:[0.5,0.5]):[0,0]}
function duelScore(matches){return matches.reduce((s,m)=>{let p=matchPoints(m);return [s[0]+p[0],s[1]+p[1]]},[0,0])}
function recalculatePoints(){state.teams.forEach(t=>{t.points=0;t.live=false});state.matches.forEach(m=>{let a=state.teams.find(t=>t.id===(m.teamAId||1)),b=state.teams.find(t=>t.id===(m.teamBId||2)),p=matchPoints(m);if(a){a.points+=p[0];a.live ||= m.status==="LIVE"}if(b){b.points+=p[1];b.live ||= m.status==="LIVE"}})}
function deleteAllDuels(){
if(!state.matches.length)return;
if(!confirm("Alle Teamduelle einschließlich Matches, Live-Scores und Ergebnissen dauerhaft löschen? Teams und Mitglieder bleiben erhalten."))return;
state.matches=[];currentMatch=null;recalculatePoints();save();app();toast("Alle Teamduelle gelöscht")
}
function createDuel(){
let a=+document.getElementById("duelTeamA").value,b=+document.getElementById("duelTeamB").value;
if(a===b||!state.teams.some(t=>t.id===a)||!state.teams.some(t=>t.id===b)){toast("Bitte zwei unterschiedliche Teams auswählen.");return}
let id=nextMatchId(),duelId="duel-"+id,c=state.config;
let formats=[...(c.viererEnabled?Array(c.viererMatches).fill("Klassischer Vierer"):[]),...Array(c.einzelMatches).fill("Einzel")];
formats.forEach(format=>state.matches.push({id:id++,duelId,teamAId:a,teamBId:b,enc:teamName(a)+" vs. "+teamName(b),format,auswahlDrive:format==="Klassischer Vierer"&&!!c.auswahlDrive,a:"Offen · "+teamName(a),b:"Offen · "+teamName(b),status:"Noch nicht gestartet",holes:Array(18).fill(0)}));
save();app();toast("Teamduell angelegt")
}
function renderDuelsAdmin(){return `<div class="panel" style="margin-bottom:22px"><h3>Teamduelle verwalten</h3><p class="small muted">Neue Paarungen erhalten die unten gespeicherte Anzahl an Vierer- und Einzel-Matches. Teams und Mitglieder bleiben beim Löschen erhalten.</p><div class="toolbar"><label>Team A <select class="select" id="duelTeamA">${state.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("")}</select></label><label>Team B <select class="select" id="duelTeamB">${state.teams.map((t,i)=>`<option value="${t.id}" ${i===1?"selected":""}>${esc(t.name)}</option>`).join("")}</select></label><button class="btn primary" onclick="createDuel()" ${state.teams.length<2?"disabled":""}>+ Paarung anlegen</button><button class="btn" onclick="deleteAllDuels()" ${state.matches.length?"":"disabled"}>Alle Teamduelle löschen</button></div><div>${duels().map(ms=>`<p><b>${esc(duelTitle(ms))}</b> · ${ms.length} Matches</p>`).join("")||'<p class="small muted">Keine Teamduelle vorhanden. Lege eine neue Paarung an.</p>'}</div></div>`}

function save(){localStorage.setItem("ryderCupState",JSON.stringify(state))}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function app(){document.getElementById("app").innerHTML=`
<aside class="sidebar"><div class="brand"><small>Club Edition</small><h1>Ryder <b>Cup</b></h1></div>
<nav class="nav">${nav("🏆","Übersicht","overview")}${nav("📋","Aufstellung","lineup")}${nav("⛳","Live","live")}${nav("📅","Kalender","calendar")}${nav("👥","Mitglieder","members")}${nav("📸","Album","album")}${nav("💬","Chat","chat")}${nav("🏅","Ergebnisse","results")}${nav("⚙️","Admin","admin")}</nav>
<div class="sideuser"><span class="online">●</span><strong>Maximilian Fesel</strong><div>Captain · Green Masters</div></div></aside>
<div class="content"><div class="topbar"><div><div class="eyebrow">Golfclub · Saison 2026</div><h2 id="pageTitle">Übersicht</h2></div><div class="user">● Online · Captain</div></div>
${pages()}</div><div class="mobilebar">${nav("🏆","","overview")}${nav("📋","","lineup")}${nav("⛳","","live")}${nav("📅","","calendar")}${nav("💬","","chat")}${nav("⚙️","","admin")}</div>`;bindNav();renderAll()}
function nav(icon,label,id){return `<button data-page="${id}" class="${currentPage===id?"active":""}" title="${label}">${icon}<span>${label}</span></button>`}
function pages(){return `
<section id="overview" class="page"><div class="hero"><div class="herohead"><div><div class="eyebrow" style="color:#b8c9c1">Ryder Cup · Club Championship</div><h1>Die Jagd nach dem Gold</h1><p>Aktueller Gesamtstand aller Teams</p></div><div class="pill"><span class="live">● LIVE</span> · Tag 2</div></div><div class="leader" id="leader"></div></div><div class="layout"><div class="panel"><h3>Begegnungen · live</h3><div id="overviewMatches"></div></div><div class="panel"><h3>Nächste Termine</h3><div id="overviewEvents"></div></div></div></section>
<section id="live" class="page"><div class="notice">Live-Modus: Tippe pro Loch auf Team A oder Team B. Der Matchstatus wird sofort berechnet und lokal gespeichert.</div><div class="panel"><div class="toolbar"><select class="select" id="matchSelect"></select></div><div id="liveMatch"></div></div></section>
<section id="lineup" class="page"><div class="toolbar"><select class="select"><option>Green Masters</option><option>Blue Eagles</option></select><select class="select"><option>Foursomes</option><option>Fourballs</option><option>Einzel</option></select></div><div class="panel"><h3>Aufstellung · Begegnung 01</h3><div class="tablewrap"><table class="table"><thead><tr><th>Match</th><th>Team A / Spieler</th><th>Team B / Spieler</th><th>Status</th><th></th></tr></thead><tbody>${state.matches.map(m=>`<tr><td><span class="small muted">${esc(m.enc)}</span><br>${esc(m.format)}${m.format==="Klassischer Vierer"&&m.auswahlDrive?' <span class="pill" style="background:#f1e6c8;font-size:10px">Auswahl-Drive</span>':""}</td><td>${esc(m.a)}</td><td>${esc(m.b)}</td><td><span class="pill" style="background:#eef3ef">bestätigt</span></td><td><button class="btn" onclick="alert('Captain-Recht: Nur Spieler des eigenen Teams können geändert werden.')">Bearbeiten</button></td></tr>`).join("")}</tbody></table></div></div></section>
<section id="calendar" class="page"><div class="panel"><h3>Turnier-Timeline</h3><div class="timeline" id="events"></div></div></section>
<section id="members" class="page"><div class="panel"><div class="toolbar"><button class="btn primary" onclick="addPlayer()">+ Spieler hinzufügen</button><button class="btn" onclick="document.querySelector('[data-page=&quot;admin&quot;]').click()">⬆️ Mitglieder importieren</button><button class="btn" onclick="toast('Filter: nur Green Masters')">Nur mein Team</button><span class="pill" id="nennlisteBadgeMembers" style="background:#eef3ef">${nennlisteBadgeText()}</span></div><div class="tablewrap"><table class="table"><thead><tr><th>Spieler</th><th>Team</th><th>Klub</th><th>HCP</th><th>Vorgabe Einzel</th><th>Vorgabe Doppel</th><th>Status</th><th>Rolle</th><th>Rechte</th></tr></thead><tbody>${state.players.map(p=>{let t=state.teams.find(x=>x.id===p[1]);let own=p[1]===1;return `<tr class="${own?"":"locked"}"><td><b>${esc(p[0])}</b></td><td>${esc(t.name)}</td><td>${esc(p[5]||"–")}</td><td>${p[2]}</td><td>${hcpVorgabe(p[2],state.config.hcpEinzelPct)}</td><td>${hcpVorgabe(p[2],state.config.hcpDoppelPct)}</td><td>${p[3]}</td><td>${p[4]}</td><td>${own?'<button class="btn">Bearbeiten</button>':'🔒 Nur Ansicht'}</td></tr>`}).join("")}</tbody></table></div></div></section>
<section id="album" class="page"><div class="panel"><div class="toolbar"><button class="btn primary" onclick="toast('Upload-Demo geöffnet')">+ Foto / Video</button><button class="btn">Alle Teams</button></div><div class="album"><div class="photo"><span>Foursomes · Tee 1</span></div><div class="photo"><span>Team Spirit · Tag 2</span></div><div class="photo"><span>Captain's Match</span></div></div><div class="sponsor"><b>ANZEIGE</b><br>Turnier unterstützt von <strong>Alpine Golf Partner</strong></div></div></section>
<section id="chat" class="page"><div class="toolbar"><button class="btn primary" onclick="chatMode('team')">Team-Chat</button><button class="btn" onclick="chatMode('captains')">Kapitäns-Chat</button></div><div class="panel"><h3 id="chatTitle">Green Masters · Team-Chat</h3><div class="chat"><div class="messages" id="messages"></div><div class="compose"><input class="input" id="chatInput" placeholder="Nachricht schreiben …"><button class="btn primary" onclick="sendMessage()">Senden</button></div></div></div></section>
<section id="results" class="page"><div class="panel" id="resultsContent"><h3>Ergebnisse der Teamduelle</h3>${duels().map(ms=>{let score=duelScore(ms);return `<div class="feeditem"><b>${esc(duelTitle(ms))}</b><br>${score[0]} : ${score[1]} · ${ms.filter(m=>m.status==="Beendet").length}/${ms.length} Matches beendet</div>`}).join("")||'<p class="small muted">Keine Teamduelle vorhanden.</p>'}</div></section>
<section id="admin" class="page">${renderDuelsAdmin()}<div class="notice">Lege hier die Matchformate für neue Teamduelle fest. Bereits angelegte Duelle und Live-Scores bleiben beim Speichern erhalten.</div>
<div class="layout">
<div class="panel"><h3>Klassischer Vierer</h3>
<div class="switchrow"><span>Format aktiv</span><label class="switch"><input type="checkbox" id="adminViererEnabled" onchange="onViererEnabledChange()"><span class="slider"></span></label></div>
<div class="field"><label for="adminViererMatches">Anzahl Matches (1–10)</label><input type="number" class="input" id="adminViererMatches" min="1" max="10" step="1"></div>
<div class="switchrow" id="adminAuswahlDriveRow"><span>Auswahl-Drive</span><label class="switch"><input type="checkbox" id="adminAuswahlDrive"><span class="slider"></span></label></div>
</div>
<div class="panel"><h3>Einzel</h3>
<div class="field"><label for="adminEinzelMatches">Anzahl Matches (1–16)</label><input type="number" class="input" id="adminEinzelMatches" min="1" max="16" step="1"></div>
</div>
</div>
<div class="toolbar" style="margin-top:16px"><button class="btn primary" onclick="saveAdminConfig()">Konfiguration speichern</button></div>
<small id="adminStatus" class="small muted"></small>

<div class="panel" style="margin-top:22px"><h3>Handicap-Vorgabe</h3>
<p class="small muted" style="margin-top:-6px">Legt fest, mit welchem Anteil der Stamm-Vorgabe (Club-HCP) ein Spieler bzw. ein Team antritt – getrennt für Einzel- und Doppel-Matches (Klassischer Vierer &amp; Fourball). 75 % entspricht der klassischen „¾-Vorgabe“.</p>
<div class="layout">
<div class="field"><label for="adminHcpEinzel">Einzel · Vorgabe-Anteil (%)</label><input type="number" class="input" id="adminHcpEinzel" min="0" max="100" step="1" oninput="updateHcpPreview()"></div>
<div class="field"><label for="adminHcpDoppel">Doppel · Vorgabe-Anteil (%)</label><input type="number" class="input" id="adminHcpDoppel" min="0" max="100" step="1" oninput="updateHcpPreview()"></div>
</div>
<div class="notice" id="hcpPreview" style="margin-top:4px"></div>
<div class="toolbar" style="margin-top:14px"><button class="btn primary" onclick="saveAdminConfig()">Konfiguration speichern</button></div>
</div>

<div class="panel" style="margin-top:22px"><h3>Nennliste</h3>
<div class="notice" id="nennlisteStatus" style="margin-bottom:12px">${nennlisteBadgeText(true)}</div>

<h4 style="margin:4px 0 6px">Automatisch abrufen</h4>
<p class="small muted" style="margin-top:-4px">Trag hier die Adresse eines Nennlisten-Feeds ein (JSON mit Zeitstempel + Spielerliste, z. B. aus einem automatisierten Abruf-Skript). GitHub-Raw-Links funktionieren direkt im Browser (CORS-frei); die golf.at-Seite selbst kann aus der App heraus nicht direkt geladen werden.</p>
<div class="toolbar"><input type="text" class="input" id="nennlisteUrl" style="flex:1;min-width:220px" placeholder="https://raw.githubusercontent.com/dein-repo/nennliste/main/nennliste.json"><button class="btn primary" onclick="fetchNennliste()">🔄 Jetzt abrufen</button></div>
<small id="nennlisteFetchMsg" class="small muted"></small>

<h4 style="margin:20px 0 6px">Manuell einfügen</h4>
<p class="small muted" style="margin-top:-4px">Alternativ: CSV-/Tabellen-Export von der Verbands- bzw. Klub-Website einfügen oder als Datei hochladen. Erwartet werden Name, Klub und HCP je Zeile (Komma, Semikolon oder Tab getrennt, mit oder ohne Kopfzeile).</p>
<div class="toolbar"><label class="btn" style="cursor:pointer">📄 CSV-Datei wählen<input type="file" id="importFile" accept=".csv,.txt" style="display:none" onchange="onImportFile(event)"></label><button class="btn" onclick="document.getElementById('importText').value='';document.getElementById('importPreviewWrap').innerHTML=''">Leeren</button></div>
<textarea class="input" id="importText" rows="5" style="width:100%;font-family:monospace;font-size:12px" placeholder="Name;Klub;HCP&#10;Maximilian Fesel;Golfclub Zeltweg;6.2&#10;Lukas Berger;Golfclub Zeltweg;8.1"></textarea>
<div class="toolbar" style="margin-top:10px"><button class="btn primary" onclick="parseImport()">Einlesen &amp; Vorschau anzeigen</button></div>
<div id="importPreviewWrap"></div>
</div>
</section>`}
function bindNav(){document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{currentPage=b.dataset.page;document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(currentPage).classList.add("active");document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===currentPage));document.getElementById("pageTitle").textContent=b.title||({overview:"Übersicht",lineup:"Aufstellung",live:"Live",calendar:"Kalender",members:"Mitglieder",album:"Album",chat:"Chat",results:"Ergebnisse",admin:"Admin"}[currentPage]);if(currentPage==="live")renderLive();if(currentPage==="admin")renderAdmin();if(currentPage==="results")renderResults();})}
function renderAll(){document.getElementById(currentPage).classList.add("active");renderLeader();renderOverview();renderEvents();renderMessages();if(currentPage==="live")renderLive();if(currentPage==="admin")renderAdmin()}
function renderLeader(){document.getElementById("leader").innerHTML=state.teams.slice().sort((a,b)=>b.points-a.points).map((t,i)=>`<div class="lrow"><div class="rank">${i+1}</div><div class="teamname"><i class="dot" style="background:${t.color}"></i>${esc(t.name)}</div><div class="bigscore">${t.points.toFixed(1)}</div><div class="lstatus">${t.live?'<span class="live">● LIVE</span>':''}</div></div>`).join("")}
function renderOverview(){document.getElementById("overviewMatches").innerHTML=duels().map(ms=>{let score=duelScore(ms);return `<div class="match" onclick="openLive(${ms[0].id})"><div class="between small muted"><span>${ms.length} Matches</span><span>${ms.every(m=>m.status==="Beendet")?"Beendet":ms.some(m=>m.status==="LIVE")?"LIVE":"Noch nicht gestartet"}</span></div><div class="versus"><b>${esc(duelTitle(ms))}</b><span class="result">${score[0]} : ${score[1]}</span></div></div>`}).join("")||'<p class="small muted">Keine Teamduelle vorhanden. Neue Paarungen können unter Admin angelegt werden.</p>'}
function renderEvents(){document.getElementById("events").innerHTML=state.events.map((e,i)=>`<div class="event"><div class="time">${e[0]}</div><b>${e[1]}</b><br><span class="small muted">${e[2]} · ${e[3]}</span><br><button class="btn" style="margin-top:7px" onclick="rsvp(this,${i})">${localStorage.getItem("rsvp"+i)||"Zusage"}</button></div>`).join("");document.getElementById("overviewEvents").innerHTML=state.events.slice(0,4).map(e=>`<div class="event"><div class="time">${e[0]}</div><b>${e[1]}</b><br><span class="small muted">${e[2]} · ${e[3]}</span></div>`).join("")}
function rsvp(b,i){b.textContent=b.textContent==="✓ Zugesagt"?"Zusage":"✓ Zugesagt";localStorage.setItem("rsvp"+i,b.textContent)}
function openLive(id){currentPage="live";document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById("live").classList.add("active");document.getElementById("pageTitle").textContent="Live";document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page==="live"));currentMatch=id;renderLive()}
function renderLive(){let s=document.getElementById("matchSelect");s.innerHTML=state.matches.map(m=>`<option value="${m.id}" ${m.id===currentMatch?"selected":""}>${m.format}${m.format==="Klassischer Vierer"&&m.auswahlDrive?" (Auswahl-Drive)":""} · ${m.a} vs. ${m.b}</option>`).join("");s.onchange=()=>{currentMatch=+s.value;renderLive()};let m=state.matches.find(x=>x.id===currentMatch)||state.matches[0];if(!m){s.disabled=true;document.getElementById("liveMatch").innerHTML='<p>Keine Matches vorhanden. Lege unter Admin eine neue Paarung an.</p>';return}s.disabled=false;currentMatch=m.id;let score=m.holes.reduce((a,v)=>a+v,0);let status=score===0?"Alles Gleich":`${Math.abs(score)} ${score>0?"UP für "+teamName(m.teamAId||1):"UP für "+teamName(m.teamBId||2)}`;document.getElementById("liveMatch").innerHTML=`<div class="versus"><b>${esc(m.a)}</b><span class="result">${status}</span><b>${esc(m.b)}</b></div><p class="small muted">${m.format} · Loch für Loch</p><div style="overflow:auto"><div class="scoregrid">${m.holes.map((v,i)=>`<div class="scorebox"><strong>Loch ${i+1}</strong><button onclick="hole(${m.id},${i},1)">${v===1?"●":v===-1?"×":"A"}</button><button onclick="hole(${m.id},${i},-1)">${v===-1?"●":v===1?"×":"B"}</button></div>`).join("")}</div></div><div class="toolbar" style="margin-top:15px"><button class="btn" onclick="resetMatch(${m.id})">Score zurücksetzen</button><button class="btn primary" onclick="finishMatch(${m.id})">Match beenden</button></div>`}
function hole(id,i,v){let m=state.matches.find(x=>x.id===id);m.holes[i]=m.holes[i]===v?0:v;if(m.status!=="Beendet")m.status="LIVE";recalculatePoints();save();renderLive();renderLeader();renderOverview()}
function resetMatch(id){let m=state.matches.find(x=>x.id===id);m.holes=Array(18).fill(0);m.status="Noch nicht gestartet";recalculatePoints();save();renderLeader();renderOverview();renderLive();toast("Score zurückgesetzt")}
function finishMatch(id){let m=state.matches.find(x=>x.id===id);m.status="Beendet";recalculatePoints();save();renderLeader();renderOverview();renderLive();toast("Match beendet und Ergebnis gespeichert")}
function addPlayer(){let n=prompt("Name des neuen Spielers:");if(!n)return;state.players.push([n,1,"—","Aktiv","Mitglied"]);save();location.reload()}
function signResult(){let m1=state.matches.every(m=>m.status==="Beendet");if(!m1){toast("Noch nicht möglich: Nicht alle Matches sind beendet.");return}document.getElementById("sigStatus").textContent="✓ Beide Kapitäne haben unterschrieben · Ergebnis offiziell bestätigt";document.getElementById("sigStatus").className="ok"}
function renderMessages(){document.getElementById("messages").innerHTML=state.messages.map((m,i)=>`<div class="msg ${i===1||i>2?"mine":""}">${esc(m)}</div>`).join("")}
function sendMessage(){let x=document.getElementById("chatInput"),v=x.value.trim();if(!v)return;state.messages.push(v);save();x.value="";renderMessages()}
function chatMode(m){document.getElementById("chatTitle").textContent=m==="team"?"Green Masters · Team-Chat":"Kapitäns-Chat · alle Teams"}
function clamp(v,min,max){v=Math.round(v);if(isNaN(v))v=min;return Math.min(max,Math.max(min,v))}
function hcpVorgabe(hcp,pct){let v=parseFloat(String(hcp).replace(",","."));if(isNaN(v))return "–";let p=isNaN(pct)?100:pct;return Math.round(v*p/100)}
function updateHcpPreview(){
let e=clamp(document.getElementById("adminHcpEinzel").value,0,100);
let d=clamp(document.getElementById("adminHcpDoppel").value,0,100);
let sA=12.4,sB=9.2;
let vE=hcpVorgabe(sA,e),vD1=hcpVorgabe(sA,d),vD2=hcpVorgabe(sB,d);
document.getElementById("hcpPreview").innerHTML=`<b>Formel:</b> Spiel-Vorgabe = Club-HCP × Anteil ÷ 100 (gerundet).<br><b>Vorschau Einzel:</b> Club-HCP ${sA} × ${e}% → <b>${vE}</b> Schläge Vorgabe.<br><b>Vorschau Doppel:</b> Spieler A (HCP ${sA}) × ${d}% = ${vD1} · Spieler B (HCP ${sB}) × ${d}% = ${vD2} → Team-Vorgabe (Summe) = <b>${vD1+vD2}</b>.`
}
function onViererEnabledChange(){let en=document.getElementById("adminViererEnabled").checked;document.getElementById("adminViererMatches").disabled=!en;document.getElementById("adminAuswahlDriveRow").style.display=en?"flex":"none";if(!en)document.getElementById("adminAuswahlDrive").checked=false}
function renderAdmin(){let c=state.config;document.getElementById("adminViererEnabled").checked=c.viererEnabled;document.getElementById("adminViererMatches").value=c.viererMatches;document.getElementById("adminAuswahlDrive").checked=c.auswahlDrive;document.getElementById("adminEinzelMatches").value=c.einzelMatches;document.getElementById("adminHcpEinzel").value=c.hcpEinzelPct;document.getElementById("adminHcpDoppel").value=c.hcpDoppelPct;document.getElementById("nennlisteUrl").value=c.nennlisteUrl||"";onViererEnabledChange();updateHcpPreview();document.getElementById("adminStatus").textContent="";document.getElementById("importPreviewWrap").innerHTML="";document.getElementById("importText").value="";document.getElementById("nennlisteFetchMsg").textContent=""}
function nextMatchId(){return state.matches.reduce((m,x)=>Math.max(m,x.id),0)+1}
function saveAdminConfig(){
let viererEnabled=document.getElementById("adminViererEnabled").checked;
let viererMatches=clamp(document.getElementById("adminViererMatches").value,1,10);
let auswahlDrive=viererEnabled&&document.getElementById("adminAuswahlDrive").checked;
let einzelMatches=clamp(document.getElementById("adminEinzelMatches").value,1,16);
let hcpEinzelPct=clamp(document.getElementById("adminHcpEinzel").value,0,100);
let hcpDoppelPct=clamp(document.getElementById("adminHcpDoppel").value,0,100);
state.config={...state.config,viererEnabled,viererMatches,auswahlDrive,einzelMatches,hcpEinzelPct,hcpDoppelPct};
save();
if(currentMatch&&!state.matches.find(m=>m.id===currentMatch))currentMatch=state.matches[0]?state.matches[0].id:1;
let st=document.getElementById("adminStatus");st.textContent="✓ Konfiguration gespeichert · "+new Date().toLocaleTimeString();st.className="ok small";
toast("Konfiguration gespeichert")
}
function fmtDT(iso){if(!iso)return null;try{let d=new Date(iso);return d.toLocaleDateString("de-AT")+" · "+d.toLocaleTimeString("de-AT",{hour:"2-digit",minute:"2-digit"})+" Uhr"}catch(e){return iso}}
function nennlisteBadgeText(verbose){
let n=state.nennliste;
if(!n||!n.updatedAt)return verbose?"Noch keine Nennliste abgerufen. Trag unten eine Feed-Adresse ein oder füge Daten manuell ein.":"Nennliste: nie abgerufen";
let upd=fmtDT(n.updatedAt),fet=fmtDT(n.fetchedAt);
if(verbose)return `Nennliste zuletzt aktualisiert: <b>${upd}</b> (Stand der Quelle) · zuletzt abgerufen am ${fet}${n.count?` · ${n.count} Spieler in der Quelle`:""}${n.sourceUrl?` · Quelle: ${esc(n.sourceUrl)}`:""}`;
return `Nennliste-Stand: ${upd}`
}
async function fetchNennliste(){
let url=document.getElementById("nennlisteUrl").value.trim();
let msg=document.getElementById("nennlisteFetchMsg");
if(!url){msg.textContent="Bitte zuerst eine Feed-Adresse eintragen.";msg.className="small";msg.style.color="var(--danger)";return}
msg.textContent="Rufe Nennliste ab …";msg.style.color="";msg.className="small muted";
try{
let res=await fetch(url,{cache:"no-store"});
if(!res.ok)throw new Error("HTTP "+res.status);
let raw=await res.text();
let players=[],updatedAt=new Date().toISOString();
let trimmed=raw.trim();
if(trimmed.startsWith("{")||trimmed.startsWith("[")){
let data=JSON.parse(trimmed);
let list=Array.isArray(data)?data:(data.players||data.nennliste||[]);
if(data.updatedAt)updatedAt=data.updatedAt;
players=list.map(r=>({name:r.name||r.Name||"",club:r.club||r.Klub||r.verein||"",hcp:(r.hcp!==undefined?r.hcp:(r.HCP!==undefined?r.HCP:""))+""}))
}else{
players=parseImportCSV(raw)
}
if(!players.length)throw new Error("Keine Spieler in der Quelle gefunden.");
state.config.nennlisteUrl=url;
state.nennliste={updatedAt,fetchedAt:new Date().toISOString(),sourceUrl:url,count:players.length};
save();
document.getElementById("nennlisteStatus").innerHTML=nennlisteBadgeText(true);
msg.textContent="✓ "+players.length+" Spieler gefunden — bitte unten Teams zuordnen und übernehmen.";msg.className="ok small";
renderImportPreviewFromRows(players);
}catch(err){
msg.textContent="Abruf fehlgeschlagen: "+err.message+" (bei golf.at direkt meist CORS-blockiert — Skript/Feed-URL nötig, siehe Chat).";
msg.className="small";msg.style.color="var(--danger)"
}
}
function toast(t){let x=document.createElement("div");x.className="toast";x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2200)}
function onImportFile(e){let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{document.getElementById("importText").value=r.result};r.readAsText(f,"utf-8")}
function parseImportCSV(text){
let lines=text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length);
if(!lines.length)return[];
let delim=text.includes(";")?";":(text.includes("\t")?"\t":",");
let rows=lines.map(l=>l.split(delim).map(c=>c.trim().replace(/^"+|"+$/g,"")));
let first=rows[0].map(c=>c.toLowerCase());
let looksHeader=first.some(c=>/name|spieler|klub|club|verein|hcp|handicap|vorgabe/.test(c));
let colName=0,colClub=1,colHcp=2,colVor=-1,colNach=-1;
if(looksHeader){
first.forEach((c,i)=>{
if(/vorname/.test(c))colVor=i;
else if(/nachname/.test(c))colNach=i;
else if(/name|spieler/.test(c))colName=i;
if(/klub|club|verein/.test(c))colClub=i;
if(/hcp|handicap|vorgabe/.test(c))colHcp=i;
});
rows=rows.slice(1)
}
return rows.filter(r=>r.length&&(r[colName]||(colVor>-1&&r[colVor])||(colNach>-1&&r[colNach]))).map(r=>{
let name=colVor>-1&&colNach>-1?`${r[colVor]||""} ${r[colNach]||""}`.trim():(r[colName]||"");
return{name,club:colClub>-1?(r[colClub]||""):"",hcp:colHcp>-1?(r[colHcp]||""):""}
})
}
function renderImportPreviewFromRows(rows){
let wrap=document.getElementById("importPreviewWrap");
if(!rows.length){wrap.innerHTML='<p class="small" style="color:var(--danger)">Keine Zeilen erkannt. Erwartetes Format je Zeile: Name;Klub;HCP</p>';return}
let teamOptions=state.teams.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join("");
let rowsHtml=rows.map((r,i)=>`<tr><td><input class="input" style="width:100%" data-f="name" data-i="${i}" value="${esc(r.name)}"></td><td><input class="input" style="width:100%" data-f="club" data-i="${i}" value="${esc(r.club)}"></td><td><input class="input" style="width:70px" data-f="hcp" data-i="${i}" value="${esc(r.hcp)}"></td><td><select class="select" data-f="team" data-i="${i}">${teamOptions}</select></td></tr>`).join("");
wrap.innerHTML=`<p class="small muted" style="margin-top:12px">Vorschau · ${rows.length} erkannte Spieler. Werte und Team-Zuordnung bei Bedarf anpassen, dann übernehmen.</p><div class="tablewrap"><table class="table"><thead><tr><th>Name</th><th>Klub</th><th>HCP</th><th>Team-Zuordnung</th></tr></thead><tbody>${rowsHtml}</tbody></table></div><div class="toolbar" style="margin-top:10px"><button class="btn primary" onclick="commitImport()">✓ ${rows.length} Spieler importieren</button></div>`
}
function parseImport(){
let text=document.getElementById("importText").value;
renderImportPreviewFromRows(parseImportCSV(text))
}
function commitImport(){
let wrap=document.getElementById("importPreviewWrap");
let byIndex={};
wrap.querySelectorAll("[data-f]").forEach(el=>{let i=+el.dataset.i,f=el.dataset.f;byIndex[i]=byIndex[i]||{};byIndex[i][f]=el.tagName==="SELECT"?+el.value:el.value});
let added=0;
Object.keys(byIndex).forEach(i=>{let r=byIndex[i];if(!r.name||!r.name.trim())return;state.players.push([r.name.trim(),r.team||state.teams[0].id,(r.hcp||"—").toString().trim()||"—","Aktiv","Mitglied",(r.club||"").trim()]);added++});
save();
currentPage="members";

toast(added+" Spieler importiert und Teams zugeordnet")
}
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));


function renderResults(){document.getElementById("resultsContent").innerHTML=`<h3>Ergebnisse der Teamduelle</h3>${duels().map(ms=>{let score=duelScore(ms);return `<div class="feeditem"><b>${esc(duelTitle(ms))}</b><br>${score[0]} : ${score[1]} · ${ms.filter(m=>m.status==="Beendet").length}/${ms.length} Matches beendet</div>`}).join("")||'<p class="small muted">Keine Teamduelle vorhanden.</p>'}`}
app();
