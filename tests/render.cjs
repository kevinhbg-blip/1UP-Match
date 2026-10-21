const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(mod,path)=>mod._compile(ts.transpile(fs.readFileSync(path,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}),path);
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const model=require('../app/model.ts'),{authDefaults}=require('../app/cup-auth.ts');
const data=authDefaults(model.upgradeEntries(model.seed('owner')));Object.assign(data,{admin:false,adminConfigured:false,canSetupAdmin:true,permissions:{},captainTeam:null});
const shared={data,action:async()=>true,busy:false,copy:()=>{}};
let html=renderToStaticMarkup(React.createElement(require('../app/admin-panel.tsx').default,shared));assert.ok(html.includes('PIN festlegen und öffnen'));assert.ok(!html.includes('Standardregeln speichern'));
data.admin=true;
html=renderToStaticMarkup(React.createElement(require('../app/admin-panel.tsx').default,shared));assert.ok(html.includes('Standardregeln speichern'));assert.ok(html.includes('Kapitänsrechte'));assert.ok(html.includes('Admin-PIN'));
html=renderToStaticMarkup(React.createElement(require('../app/live-overview.tsx').default,{data,open:()=>{}}));assert.ok(html.includes('Matchpunkte'));assert.ok(html.includes('Golden Youngstars'));assert.ok(!html.includes('HCP'));
const m=data.matches[0];m.role='admin';m.verify=false;
html=renderToStaticMarkup(React.createElement(require('../app/player-entry.tsx').default,{match:m,action:()=>{},busy:false}));assert.ok(html.includes('Eine Eingabe zählt sofort'));assert.ok(!html.includes('Gegeneingabe ausständig'));
html=renderToStaticMarkup(React.createElement(require('../app/team-management.tsx').default,shared));assert.ok(html.includes('Mitglieder und Handicaps direkt bearbeiten'));
html=renderToStaticMarkup(React.createElement(require('../app/fixture-results.tsx').default,shared));assert.ok(html.includes('Gemeinsame Ergebnisbestätigung'));
console.log('Passed: rendered password gate, admin settings, compact scoreboard, direct player entry, team management and fixture results.');

const marked={...data.matches[0],role:'playerB',playersA:[{name:'Low',hcp:0}],playersB:[{name:'High',hcp:54}],pa:['Low'],pb:['High'],rules:{allowance:75,hcpMax:36,holes:18},course:{name:'AB',si:Array.from({length:18},(_,i)=>i+1)}};
html=renderToStaticMarkup(React.createElement(require('../app/player-entry.tsx').default,{match:marked,action:()=>{},busy:false}));assert.equal((html.match(/small class="hole-number stroke-circle receives"/g)||[]).length,18);assert.ok(html.includes('+2'));assert.ok(html.includes('¾ 27'));assert.ok(html.includes('HCP 54 (Rechen-HCP 36)'));
marked.role='playerA';html=renderToStaticMarkup(React.createElement(require('../app/player-entry.tsx').default,{match:marked,action:()=>{},busy:false}));assert.ok(html.includes('stroke-circle gives'));assert.ok(html.includes('−2'));
console.log('Passed: received/given stroke circles, multiple strokes per hole, capped HCP 54 → 36 → ¾ 27.');

const equal={...marked,playersA:[{name:'A',hcp:12}],playersB:[{name:'B',hcp:12}]};html=renderToStaticMarkup(React.createElement(require('../app/player-entry.tsx').default,{match:equal,action:()=>{},busy:false}));assert.ok(!html.includes('hole-number stroke-circle'));assert.ok(html.includes('Keine Vorgabeschläge'));
const shifted={...marked,startHole:10,playersA:[{name:'A',hcp:0}],playersB:[{name:'B',hcp:4}]};html=renderToStaticMarkup(React.createElement(require('../app/player-entry.tsx').default,{match:shifted,action:()=>{},busy:false}));assert.equal((html.match(/small class="hole-number stroke-circle/g)||[]).length,3);assert.ok(html.includes(`Loch 1: ${marked.b} erhält 1 Vorgabeschläge`));
console.log('Passed: no circles for equal handicaps; stroke allocation follows physical holes after a shifted start.');

model.generateExamples(data,model.viennaDay());
const LiveOverview=require('../app/live-overview.tsx').default;
data.admin=true;html=renderToStaticMarkup(React.createElement(LiveOverview,{data,daily:true,open:()=>{},action:()=>{},busy:false}));
assert.ok(html.includes('Alle Teamduelle'));assert.ok(html.includes('automatische Aktualisierung alle 5 Sekunden'));assert.equal((html.match(/class="duelboard"/g)||[]).length,3);assert.equal((html.match(/class="boardmatch /g)||[]).length,48);assert.equal((html.match(/Teamduell löschen/g)||[]).length,3);assert.ok(html.includes('Gewonnene Matches'));
data.admin=false;html=renderToStaticMarkup(React.createElement(LiveOverview,{data,daily:true,open:()=>{}}));assert.ok(!html.includes('Teamduell löschen'));
html=renderToStaticMarkup(React.createElement(require('../app/fixture-actions.tsx').DemoControls,{data,action:()=>{},busy:false}));assert.ok(html.includes('Neue Beispieldaten erzeugen'));assert.ok(html.includes('Alle Beispieldaten löschen'));
console.log('Passed: daily page shows three concurrent duels, all 48 matches and six teams; delete buttons are admin-only and example controls render.');

const MatchPlan=require('../app/match-plan.tsx').default;
html=renderToStaticMarkup(React.createElement(MatchPlan,shared));
assert.ok(html.includes('16 von 16 Matches verteilt'));assert.equal((html.match(/aria-label="Gruppe /g)||[]).length,16);assert.ok(html.includes('20 Spieler je Team'));
for(const count of [12,20])assert.ok(html.includes(`value="${count}"`));
const smallFixture={...data.fixtures[0],id:'unstarted-plan',formats:Array(12).fill('Einzel'),matchGroups:['A','A','A','B','B','B','C','C','C','D','D','D'],signatures:{}};
html=renderToStaticMarkup(React.createElement(MatchPlan,{...shared,existing:smallFixture}));assert.ok(html.includes('12 von 12 Matches verteilt'));
const lineupData={...data,admin:true,lineupRelease:{released:false},rosters:{...data.rosters,[model.teams[0]]:[{id:'a',name:'Only group A',hcp:12,group:'A'},{id:'b',name:'Wrong group B',hcp:24,group:'B'}]}};
html=renderToStaticMarkup(React.createElement(require('../app/team-management.tsx').Lineup,{...shared,data:lineupData,team:model.teams[0],f:{...smallFixture,formats:['Einzel'],matchGroups:['A'],lineups:{}}}));
assert.ok(html.includes('Gruppe A'));assert.ok(html.includes('Only group A'));assert.ok(!html.includes('Wrong group B'));
console.log('Passed: planning matrix, 12–20 selectors, saved group totals, player requirements and group-filtered lineup options.');

const {venues,venuePresentation,validateBranding}=require('../app/venues.ts');
const VenueBrand=require('../app/venue-brand.tsx').default;
const VenueSettings=require('../app/venue-settings.tsx').default;
const {seoMetadata,siteSchema,siteUrl}=require('../app/seo.ts');
for(const venue of venues){
 const branding={venueId:venue.id,sponsorName:'Sponsor',sponsorLogo:'data:image/png;base64,AAAA'};
 html=renderToStaticMarkup(React.createElement(VenueBrand,{branding}));
 assert.ok(html.includes(venue.logo));assert.ok(html.includes(venue.name));assert.ok(!html.includes('data:image/png'));
 const meta=seoMetadata(branding);assert.ok(meta.title.includes(venue.name));assert.equal(meta.alternates.canonical,siteUrl+'/');assert.equal(siteSchema(branding).contentLocation.name,venue.name);
 assert.ok(fs.existsSync('public'+venue.logo));
}
html=renderToStaticMarkup(React.createElement(VenueBrand,{branding:{venueId:null,sponsorName:'Sponsor',sponsorLogo:'data:image/png;base64,AAAA'}}));assert.ok(html.includes('Sponsor Logo'));assert.ok(html.includes('data:image/png;base64,AAAA'));
html=renderToStaticMarkup(React.createElement(VenueBrand,{branding:{}}));assert.ok(html.includes('/cup-logo.svg'));assert.ok(!html.includes('Kremstal'));
html=renderToStaticMarkup(React.createElement(VenueSettings,shared));assert.equal((html.match(/<option /g)||[]).length,7);assert.ok(html.includes('Sponsorenlogo'));assert.ok(html.includes('Kein Austragungsort'));
assert.equal(seoMetadata({},true).robots.index,false);assert.equal(seoMetadata({}).robots.index,true);
const robots=require('../app/robots.txt/route.ts').GET();assert.ok(robots.headers.get('Content-Type').includes('text/plain'));
const sitemap=require('../app/sitemap.xml/route.ts').GET();assert.ok(sitemap.headers.get('Content-Type').includes('application/xml'));
assert.throws(()=>validateBranding({venueId:null,sponsorName:'',sponsorLogo:'data:image/svg+xml;base64,AAAA'}));
console.log('Passed: six automatic venue logos, sponsor/site fallbacks, dropdown, metadata, schema and SEO route content types.');
