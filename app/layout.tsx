import './globals.css';
import {siteUrl} from './seo';
export const metadata={metadataBase:new URL(siteUrl),title:'Club Ryder Cup | Golden Youngstars',description:'Live-Scores, Spielplan und Ergebnisse des Club Ryder Cups.',icons:{icon:'/favicon.svg',apple:'/apple-touch-icon.png'},formatDetection:{telephone:false}};
export const viewport={width:'device-width',initialScale:1,themeColor:'#173c30'};
export default function Layout({children}:any){return <html lang="de-AT"><body>{children}</body></html>}
