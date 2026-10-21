// Official MEHR.grün club directory, verified 2026-10-21.
export const venueSource = 'https://www.mehr-gruen.at/';
export const venues = [
  {id:'kremstal',name:'Golf Resort Kremstal',town:'Kematen an der Krems',website:'https://www.golfresort-kremstal.at/',logo:'/venues/kremstal.png'},
  {id:'herzog-tassilo',name:'Golfclub Herzog Tassilo',town:'Bad Hall',website:'https://gcherzogtassilo.at/',logo:'/venues/herzog-tassilo.png'},
  {id:'staerk-ansfelden',name:'Golfclub Stärk Linz.Ansfelden',town:'Ansfelden',website:'https://ansfelden.golf-staerk.at/',logo:'/venues/staerk-ansfelden.png'},
  {id:'metzenhof',name:'Golfpark Metzenhof',town:'Kronstorf',website:'https://www.metzenhof.at/',logo:'/venues/metzenhof.png'},
  {id:'wels',name:'Golfclub Wels',town:'Weyerbach',website:'https://www.golfclub-wels.at/',logo:'/venues/wels.png'},
  {id:'linz-luftenberg',name:'Golf Club Linz-Luftenberg',town:'Luftenberg',website:'https://www.gclinz-luftenberg.at/',logo:'/venues/linz-luftenberg.png'},
];
export type Branding = {venueId:string|null;sponsorName:string;sponsorLogo:string};
export const defaultBranding:Branding = {venueId:null,sponsorName:'',sponsorLogo:''};
export function publicBranding(value:any):Branding {
  return {venueId:venues.some(v=>v.id===value?.venueId)?value.venueId:null,sponsorName:typeof value?.sponsorName==='string'?value.sponsorName:'',sponsorLogo:typeof value?.sponsorLogo==='string'?value.sponsorLogo:''};
}
export function validateBranding(value:any):Branding {
  if(!value||!(value.venueId===null||venues.some(v=>v.id===value.venueId)))throw Error('Bitte einen Golfplatz aus der Liste oder keinen Austragungsort wählen.');
  if(typeof value.sponsorName!=='string'||value.sponsorName.length>80)throw Error('Sponsorenname: maximal 80 Zeichen.');
  if(typeof value.sponsorLogo!=='string'||value.sponsorLogo.length>150000||(value.sponsorLogo&&!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value.sponsorLogo)))throw Error('Sponsorenlogo als PNG, JPG oder WebP, maximal 110 KB.');
  return {venueId:value.venueId,sponsorName:value.sponsorName.trim(),sponsorLogo:value.sponsorLogo};
}
export function venuePresentation(value:any) {
  const b=publicBranding(value),venue=venues.find(v=>v.id===b.venueId);
  if(venue)return {name:venue.name,caption:venue.town,label:'AUSTRAGUNGSORT',logo:venue.logo,alt:venue.name+' Logo',website:venue.website,venue};
  if(b.sponsorLogo)return {name:b.sponsorName||'Unser Sponsor',caption:'Gemeinsam für den nächsten Punkt.',label:'UNTERSTÜTZT VON',logo:b.sponsorLogo,alt:(b.sponsorName||'Sponsor')+' Logo',website:null,venue:null};
  return {name:'Club Ryder Cup',caption:'TEAMSPIRIT MEETS MATCHPLAY',label:'DIE TEAMS. DER CUP.',logo:'/cup-logo.svg',alt:'Club Ryder Cup – Seitenlogo',website:null,venue:null};
}
