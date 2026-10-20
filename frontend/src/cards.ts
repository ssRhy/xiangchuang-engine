import type { SalesPlan } from './state.ts';
import {shorten} from './state.ts';
export type CardKind='cover'|'detail';
function imageFrom(src:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('照片无法读取，请返回产品资料重新选择。'));img.src=src;});}
function wrap(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number,lineHeight:number,maxLines:number){
 const lines:string[]=[];let line='';
 for(const char of Array.from(text.replace(/\s+/g,' '))){if(ctx.measureText(line+char).width>width&&line){lines.push(line);line=char;}else line+=char;}
 if(line)lines.push(line);
 const visible=lines.slice(0,maxLines);
 if(lines.length>maxLines){let last=visible[maxLines-1];while(last&&ctx.measureText(last+'…').width>width)last=last.slice(0,-1);visible[maxLines-1]=last+'…';}
 visible.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));return visible.length*lineHeight;
}
function round(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,color:string){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();}
function botanical(ctx:CanvasRenderingContext2D){ctx.strokeStyle='#8caa8a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(890,50);ctx.quadraticCurveTo(935,145,1010,200);ctx.stroke();for(let i=0;i<5;i++){ctx.save();ctx.translate(905+i*19,85+i*20);ctx.rotate(-.5);ctx.beginPath();ctx.ellipse(0,0,13,32,0,0,Math.PI*2);ctx.fillStyle=i%2?'#c9d7bf':'#a9bd9e';ctx.fill();ctx.restore();}}
export async function renderCard(canvas:HTMLCanvasElement,plan:SalesPlan,kind:CardKind){
 canvas.width=1080;canvas.height=1440;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('当前浏览器无法生成图片卡片。');
 const p=plan.snapshot,c=plan.content;
 const photo=p.photos[kind==='detail'&&p.photos.length>1?1:0];if(!photo)throw new Error('请先选择产品照片。');
 const img=await imageFrom(photo.url);
 ctx.fillStyle='#f5f4e9';ctx.fillRect(0,0,1080,1440);round(ctx,32,32,1016,1376,20,'#faf9f0');botanical(ctx);
 ctx.fillStyle='#55745e';ctx.font='500 22px sans-serif';ctx.fillText('乡土好物 / FROM OUR HOME',76,99);
 ctx.fillStyle='#244f3b';ctx.font='600 58px sans-serif';
 if(kind==='cover'){
 wrap(ctx,c.coverTitle,76,210,900,79,2);
 ctx.fillStyle='#7b8a71';ctx.font='28px sans-serif';wrap(ctx,c.coverSubtitle,78,361,900,40,1);
 }else{
 ctx.font='600 54px sans-serif';wrap(ctx,p.name,76,200,900,70,2);ctx.fillStyle='#7b8a71';ctx.font='26px sans-serif';wrap(ctx,`来自 ${p.origin}`,78,354,900,38,1);
 }
 const y=411,h=659,w=928;
 round(ctx,76,y,w,h,10,'#e8ecdf');
 const scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);
 ctx.save();ctx.beginPath();ctx.roundRect(76,y,w,h,10);ctx.clip();ctx.drawImage(img,76+(w-img.naturalWidth*scale)/2,y+(h-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);ctx.restore();
 ctx.fillStyle='#244f3b';ctx.font='500 34px sans-serif';
 wrap(ctx,kind==='cover'?p.name:p.unit,78,1130,625,45,2);
 ctx.textAlign='right';ctx.font='600 51px sans-serif';ctx.fillText(p.price===''?'售价待确认':`¥${p.price}`,1000,1141);ctx.textAlign='left';
 ctx.fillStyle='#7b8a71';ctx.font='26px sans-serif';
 wrap(ctx,kind==='cover'?p.unit:p.features||'了解规格与交付方式，再决定购买。',78,1234,920,37,2);
 ctx.strokeStyle='#d7decc';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(76,1328);ctx.lineTo(1004,1328);ctx.stroke();
 ctx.fillStyle='#84927c';ctx.font='20px sans-serif';ctx.fillText(shorten(p.farmer||'我家的农产品',24),78,1369);
 ctx.textAlign='right';ctx.font='17px sans-serif';ctx.fillText(p.source==='example'?'演示案例 · AI 概念视觉，非实拍':'产品资料由农户填写 · 发布前请核对',1004,1369);ctx.textAlign='left';
}
export async function cardBlob(plan:SalesPlan,kind:CardKind){
 const canvas=document.createElement('canvas');await renderCard(canvas,plan,kind);
 return new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('图片导出失败，请重试。')),'image/png'));
}
export function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
