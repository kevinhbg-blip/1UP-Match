'use client';
import {useState} from 'react';
import {venuePresentation} from './venues';
export default function VenueBrand({branding}:any) {
 const p=venuePresentation(branding),[failed,F]=useState('');
 const logo=failed===p.logo?'/cup-logo.svg':p.logo;
 return <div className="venuebrand"><span className="venue-kicker">{p.label}</span><div className="venue-logo-frame"><img src={logo} alt={failed===p.logo?'Club Ryder Cup – Ersatzlogo':p.alt} width={220} height={220} fetchPriority="high" onError={()=>F(p.logo)}/></div><div className="venue-name">{p.website?<a href={p.website} target="_blank" rel="noopener noreferrer">{p.name} ↗</a>:p.name}</div><span className="venue-caption">{p.caption}</span></div>;
}
