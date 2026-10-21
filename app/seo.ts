import {venuePresentation} from './venues';
export const siteUrl='https://golden-youngstars-cup.clevercalf5.chatgpt.site';
export function seoMetadata(branding:any,privateLink=false){
 const p=venuePresentation(branding);
 const title=p.venue?`Club Ryder Cup · ${p.venue.name} | Golden Youngstars`:'Club Ryder Cup | Golden Youngstars – Live-Scores';
 const description=`Club Ryder Cup${p.venue?' im '+p.venue.name:''}: Live-Scores Loch für Loch, Spielplan und Ergebnisse. Golden Youngstars und fünf weitere Teams im Einzel und Doppel.`;
 return {title,description,alternates:{canonical:siteUrl+'/'},robots:privateLink?{index:false,follow:false}:{index:true,follow:true},openGraph:{type:'website',locale:'de_AT',siteName:'Golden Youngstars · Club Ryder Cup',url:siteUrl+'/',title,description,images:[{url:siteUrl+'/social-card.png',width:1200,height:630,alt:'Club Ryder Cup – Live-Scores, Spielplan und Ergebnisse'}]},twitter:{card:'summary_large_image',title,description,images:[siteUrl+'/social-card.png']}};
}
export function siteSchema(branding:any){
 const p=venuePresentation(branding);
 return {'@context':'https://schema.org','@type':'WebSite','@id':siteUrl+'/#website',url:siteUrl+'/',name:'Golden Youngstars · Club Ryder Cup',description:seoMetadata(branding).description,inLanguage:'de-AT',about:{'@type':'SportsTeam',name:'Golden Youngstars',sport:'Golf'},...(p.venue?{contentLocation:{'@type':'GolfCourse',name:p.venue.name,url:p.venue.website,address:{'@type':'PostalAddress',addressLocality:p.venue.town,addressCountry:'AT'}}}:{})};
}
