'use client';
import {useState} from 'react';

const sections=[['calendar','Kalender'],['chat','Chats'],['album','Album'],['admin','Clubpartner & Sicherung']];
export default function ClubArea(){
 const [section,setSection]=useState('calendar');
 return <section className="club-area"><div className="club-intro"><div><h3>Das Clubleben an einem Ort</h3><p>Termine, Zusagen, Team- und Kapitänschat, Fotos und Clubpartner.</p></div><a className="outline" href="/offline/" target="_blank" rel="noopener">Offline-App öffnen ↗</a></div><p className="storage-hint">Diese Clubfunktionen werden auf diesem Gerät gespeichert. Die Turnierdaten im Match-Center werden gemeinsam über den Server verwaltet. Zum Übernehmen bisheriger Browserdaten die JSON-Sicherung in der Offline-App importieren.</p><div className="club-tabs" role="group" aria-label="Clubbereich">{sections.map(([id,label])=><button key={id} className={section===id?'active':''} onClick={()=>setSection(id)}>{label}</button>)}</div><iframe key={section} title={sections.find(s=>s[0]===section)?.[1]} src={'/offline/?embedded=1&section='+section} className="club-frame"/></section>;
}
