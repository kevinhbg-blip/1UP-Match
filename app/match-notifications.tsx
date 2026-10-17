'use client';
import {useEffect,useRef,useState} from 'react';
import {score} from './model';
export default function MatchNotifications({data,open}:any){
 const [queue,Q]=useState<any[]>([]),seen=useRef(new Set<string>()),dialog=useRef<HTMLDialogElement>(null);
 const team=data?.captainTeam;
 useEffect(()=>{
  Q([]);seen.current=new Set();
 },[team]);
 useEffect(()=>{
  if(!team)return;
  const fresh:any[]=[];
  for(const m of data.matches){
   if(m.a!==team&&m.b!==team)continue;
   const r=score(m);if(!r.end)continue;
   const key=`cup-result-v1:${team}:${m.id}:${r.d}:${r.n}`;
   let stored=false;try{stored=localStorage.getItem(key)==='seen'}catch{}
   if(stored||seen.current.has(key))continue;
   seen.current.add(key);fresh.push({id:m.id,key,a:m.a,b:m.b,pa:m.pa,pb:m.pb,label:r.label,winner:r.winner});
  }
  if(fresh.length)Q(q=>[...q,...fresh]);
 },[data,team]);
 const current=queue[0];
 useEffect(()=>{if(current&&!dialog.current?.open)dialog.current?.showModal();else if(!current)dialog.current?.close()},[current]);
 function dismiss(){if(current)try{localStorage.setItem(current.key,'seen')}catch{}Q(q=>q.slice(1));}
 return <dialog ref={dialog} className="result-notification" aria-labelledby="match-notice-title" onCancel={e=>{e.preventDefault();dismiss()}}>{current&&<><p className="eyebrow">ERGEBNISMELDUNG · {queue.length>1?`${queue.length} neue Ergebnisse`:'MEIN TEAM'}</p><h2 id="match-notice-title">Match entschieden</h2><p>{current.a} gegen {current.b}</p><p>{current.pa.join(' & ')} gegen {current.pb.join(' & ')}</p><h3>{current.winner?`${current.winner} gewinnt · ${current.label}`:'Match geteilt'}</h3><p>Das Matchergebnis liegt vor. Die Bestätigung des gesamten Teamduells erfolgt weiterhin separat.</p><div className="actions"><button autoFocus className="gold" onClick={()=>{const m=data.matches.find((m:any)=>m.id===current.id);dismiss();if(m)open(m)}}>Match ansehen</button><button className="outline" onClick={dismiss}>Schließen</button></div></>}</dialog>;
}
