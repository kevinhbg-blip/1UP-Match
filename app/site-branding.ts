import {env} from 'cloudflare:workers';
import {defaultBranding,publicBranding} from './venues';
// Deliberately serialize branding only; never send stored auth/lineups to SSR.
export async function readPublicBranding(){
 try{
  const row=await env.DB?.prepare('SELECT data FROM cup WHERE id=?').bind('main').first<{data:string}>();
  return row?publicBranding(JSON.parse(row.data).branding):{...defaultBranding};
 }catch{return {...defaultBranding};}
}
