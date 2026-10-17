/* Reuse the GitHub club tools and their existing storage without copying data. */
if(new URLSearchParams(location.search).get('embedded')==='1'){
 document.body.classList.add('embedded');
 const section=new URLSearchParams(location.search).get('section');
 page=['calendar','chat','album','admin'].includes(section)?section:'calendar';
 views.admin=function(){return (admin()?sponsorAdmin():empty('Clubpartner werden in der lokalen Admin-Ansicht verwaltet.'))+'<section class="panel"><h2>Sicherung & Datenübernahme</h2><p>Die vollständige Offline-App enthält JSON-Sicherung und Wiederherstellung, CSV- und Feed-Import, Mitgliedergruppen sowie die bisherige lokale Turnierverwaltung.</p><a class="btn primary" href="/offline/" target="_blank" rel="noopener">Offline-App und Datenverwaltung öffnen ↗</a></section>'};
 const clubRender=render;
 render=function(){clubRender();const bar=document.createElement('div');bar.className='toolbar local-view';const name=document.createElement('span');name.textContent=session.name+' · '+tn(session.teamId)+' · lokale '+session.role+'-Ansicht';bar.append(name);const button=document.createElement('button');button.className='btn';button.textContent='Lokale Ansicht wechseln';button.onclick=changeSession;bar.append(button);document.querySelector('.page').prepend(bar);};
 render();
}
