import {siteUrl} from '../seo';
export function GET(){return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /*?token=\nDisallow: /*&token=\nSitemap: ${siteUrl}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}})}
