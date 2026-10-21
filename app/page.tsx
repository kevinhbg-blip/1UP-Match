import Home from './cup-client';
import {readPublicBranding} from './site-branding';
import {seoMetadata,siteSchema} from './seo';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:any){
 const params=await searchParams;
 return seoMetadata(await readPublicBranding(),Object.prototype.hasOwnProperty.call(params||{},'token'));
}
export default async function Page(){
 const branding=await readPublicBranding();
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(siteSchema(branding)).replace(/</g,'\\u003c')}}/><Home initialBranding={branding}/></>;
}
