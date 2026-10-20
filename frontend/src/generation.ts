import type {StaticAsset} from './state.ts';
// Version both preview and download URLs so saved browser plans cannot reuse broken PNGs.
export function staticImageUrl(url:string){return `${url}${url.includes('?')?'&':'?'}v=20261019-cjk2`;}
const abortError=()=>new DOMException('已取消准备','AbortError');
function wait(ms:number,signal:AbortSignal){return new Promise<void>((resolve,reject)=>{
 if(signal.aborted){reject(abortError());return;}
 const cancel=()=>{clearTimeout(timer);reject(abortError());};
 const timer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve();},ms);signal.addEventListener('abort',cancel,{once:true});
});}
export async function fileFingerprint(file:{arrayBuffer:()=>Promise<ArrayBuffer>}){
 const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function fetchStaticPng(url:string,signal?:AbortSignal,fetcher:typeof fetch=fetch){
 const response=await fetcher(staticImageUrl(url),{signal,cache:'no-cache'});
 if(!response.ok)throw new Error('图片暂时无法读取，请重新准备方案。');
 const blob=await response.blob();const bytes=new Uint8Array(await blob.slice(0,8).arrayBuffer());
 if(bytes.length!==8||![137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))throw new Error('成品图片无法读取，请重试。');
 return blob;
}
export async function prepareDemoAssets(assets:StaticAsset[],signal:AbortSignal,onStep:(step:number)=>void,{fetcher=fetch,phaseMs=400}:{fetcher?:typeof fetch;phaseMs?:number}={}){
 if(signal.aborted)throw abortError();
 await Promise.all([Promise.all(assets.map(a=>fetchStaticPng(a.url,signal,fetcher))), (async()=>{for(let step=0;step<3;step++){if(signal.aborted)throw abortError();onStep(step);await wait(phaseMs,signal);}})()]);
 if(signal.aborted)throw abortError();
}
