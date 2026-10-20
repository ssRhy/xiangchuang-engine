import {useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {animate,motion,MotionConfig,useMotionValue,useMotionValueEvent,useReducedMotion,useTransform} from 'motion/react';
import type {MotionValue} from 'motion/react';
import {ArrowDown,ArrowRight,Check,ChevronLeft,ChevronRight,Copy,Download,Leaf,MapPin,MessageCircle,Pause,Play,RotateCcw,ScanLine,X} from 'lucide-react';
import {citrusDemo,citrusReference} from './state';
import {fetchStaticPng,staticImageUrl} from './generation';
import {downloadBlob} from './cards';
import {clampStoryTime,storyDuration,storySceneAt,storyScenes,storySceneTime} from './story';
import {FormWalkthrough,DeliveryWalkthrough,AgentWalkthrough} from './StoryWalkthrough';
import './story.css';

const photo=citrusDemo.inputs[0].url;
const detail=citrusDemo.inputs[1].url;
const asset=(kind:string)=>citrusDemo.assets.find(item=>item.kind===kind)!;
const picture=(kind:string)=>staticImageUrl(asset(kind).url);
type ClockProps={time:MotionValue<number>;reduced:boolean};

function Reveal({time,reduced,at=0,className='',children}:{at?:number;className?:string;children:ReactNode}&ClockProps){
 const opacity=useTransform(time,[at,at+.55],[0,1]);
 const y=useTransform(time,[at,at+.65],[26,0]);
 const [shown,setShown]=useState(at<=0);
 useMotionValueEvent(time,'change',value=>setShown(old=>old===(value>=at+.05)?old:value>=at+.05));
 return <motion.div className={className} inert={!reduced&&!shown} aria-hidden={!reduced&&!shown} style={{opacity:reduced?1:opacity,y:reduced?0:y}}>{children}</motion.div>;
}

function Scene({index,active,time,reduced,children,className=''}:{index:number;active:number;className?:string;children:ReactNode}&ClockProps){
 const scene=storyScenes[index];
 const opacity=useTransform(time,index===0?[0,scene.end-.3,scene.end]:[scene.start,scene.start+.3,scene.end-.3,scene.end],[...(index===0?[1,1,0]:[0,1,1,index===storyScenes.length-1?1:0])]);
 return <motion.section className={`film-scene ${className}`} data-scene={scene.id} hidden={active!==index} aria-label={`第 ${index+1} 幕：${scene.title}`} aria-hidden={active!==index} inert={active!==index} style={{opacity:reduced?1:opacity,visibility:active===index?'visible':'hidden'}}>{children}</motion.section>;
}

function Opening({time,reduced}:ClockProps){
 const zoom=useTransform(time,[0,4],[1.15,1]);
 const shift=useTransform(time,[0,4],['2%','0%']);
 const leafX=useTransform(time,[0,4],[-32,18]);
 return <><motion.img className="film-opening-photo" src={photo} alt="陈叔在院子里整理贡柑的演示照片" style={{scale:reduced?1:zoom,x:reduced?0:shift}}/>
  <div className="film-opening-shade"/>
  <motion.div className="film-leaf film-leaf-one" aria-hidden="true" style={{x:reduced?0:leafX}}><Leaf/></motion.div>
  <div className="film-copy film-opening-copy"><Reveal {...{time,reduced}} at={.15}><span className="film-kicker">广东 · 肇庆 / 陈叔的一天</span></Reveal>
   <Reveal {...{time,reduced}} at={.45}><h1>自家的贡柑，<br/><em>开始摘了。</em></h1></Reveal>
   <Reveal {...{time,reduced}} at={1.2}><p>陈叔想把这一箱，卖给附近的人。</p></Reveal>
   <Reveal {...{time,reduced}} at={2.1}><span className="film-small-tag"><span/>跟着一箱贡柑，走完一次卖货准备</span></Reveal>
  </div><span className="film-corner-caption">从家里的好产品开始</span>
 </>;
}

function Questions({time,reduced}:ClockProps){
 const tilt=useTransform(time,[4,8],[-5,-1]);
 return <div className="film-two-column film-questions"><div className="film-copy"><Reveal {...{time,reduced}} at={4.05}><span className="film-kicker">01 / 产品有了，怎么开口卖？</span><h2>种出来了，<br/>还得让人<em>看见。</em></h2></Reveal><Reveal {...{time,reduced}} at={4.5}><p>照片拍好了，陈叔却停在了<br/>“配点什么文字”这一步。</p></Reveal></div>
  <div className="film-question-stage"><motion.div className="film-photo-print" style={{rotate:reduced?0:tilt}}><img src={detail} alt="陈叔手里的贡柑与家庭装纸箱"/><span>这一箱，怎么介绍给邻居？</span></motion.div>
   {['照片拍好了，配什么字？','59 元一盒，怎么介绍清楚？','有人问能不能寄，怎么回？'].map((text,i)=><Reveal key={text} {...{time,reduced}} at={4.7+i*.65} className={`film-question-bubble question-${i}`}><MessageCircle size={18}/><span>{text}</span></Reveal>)}
  </div></div>;
}

function ResultCard({time,reduced,kind,index}:{kind:string;index:number}&ClockProps){
 const x=useTransform(time,[14.7+index*.22,15.7+index*.22,17.35,18],[0,(index-1)*144,(index-1)*144,200]);
 const y=useTransform(time,[14.7+index*.22,15.7+index*.22,17.35,18],[80,index===1?-14:18,index===1?-14:18,40]);
 const rotate=useTransform(time,[14.7+index*.22,15.7+index*.22],[0,(index-1)*10]);
 const opacity=useTransform(time,[14.7+index*.22,15.3+index*.22],[0,1]);
 const scale=useTransform(time,[14.7+index*.22,15.7+index*.22,17.35,18],[.65,1,1,.55]);
 return <motion.figure className={`film-result-card result-${kind}`} style={{x:reduced?(index-1)*144:x,y:reduced?(index===1?-14:18):y,rotate:reduced?0:rotate,opacity:reduced?1:opacity,scale:reduced?1:scale}}><img src={picture(kind)} alt={asset(kind).name}/><figcaption>{asset(kind).name}</figcaption></motion.figure>;
}

function Create({time,reduced}:ClockProps){
 const wipe=useTransform(time,[12.7,14.6],['inset(0 100% 0 0)','inset(0 0% 0 0)']);
 const lineX=useTransform(time,[12.7,14.6],['0%','100%']);
 const lineOpacity=useTransform(time,[12.3,12.7,14.6,14.9],[0,1,1,0]);
 const boardScale=useTransform(time,[12,14.6,15.6],[.96,1,.91]);
 const flash=useTransform(time,[14.4,14.6,14.85],[0,.22,0]);
 return <><div className="film-create-heading"><Reveal {...{time,reduced}} at={12.05}><span className="film-kicker">05 / 视觉素材助手 · 交付宣传图</span><h2>同一箱贡柑，<em>换个方式被看见。</em></h2></Reveal></div>
  <div className="film-create-stage"><motion.div className="film-transform-board" style={{scale:reduced?1:boardScale}}><img src={detail} alt="准备前的贡柑实物照片"/><motion.img className="film-after-photo" src={picture('scene')} alt="准备后的贡柑场景宣传图" style={{clipPath:reduced?'none':wipe}}/><motion.div className="film-scan-track" aria-hidden="true" style={{x:lineX,opacity:reduced?0:lineOpacity}}><span/><ScanLine/></motion.div><span className="film-image-label">实物照片 → 场景宣传图</span></motion.div>
   <div className="film-result-fan">{['cover','detail','moments'].map((kind,index)=><ResultCard key={kind} {...{time,reduced,kind,index}}/>)}</div></div>
  <motion.div className="film-light-flash" aria-hidden="true" style={{opacity:reduced?0:flash}}/>
  <Reveal {...{time,reduced}} at={15.6} className="film-create-caption"><Check size={18}/>小红书封面、商品介绍、朋友圈配图，都准备好了。</Reveal>
 </>;
}

function Phone({time,reduced}:ClockProps){
 const [wechat,setWechat]=useState(false);
 useMotionValueEvent(time,'change',value=>setWechat(value>=21));
 const phoneX=useTransform(time,[18,18.8],[120,0]);
 const phoneRotate=useTransform(time,[18,19.2],[-9,0]);
 const xhsOpacity=useTransform(time,[20.8,21.25],[1,0]);
 const wechatOpacity=useTransform(time,[20.8,21.25],[0,1]);
 const coverScale=useTransform(time,[18,19.15],[1.35,1]);
 return <motion.div className="film-phone" style={{x:reduced?0:phoneX,rotateY:reduced?0:phoneRotate}}><div className="film-phone-island"/>
  <div className="film-phone-screen"><div className="film-phone-status"><span>9:41</span><span>● ● ▰</span></div>
   <motion.div className="film-social film-xhs" aria-hidden={wechat} style={{opacity:reduced?(wechat?0:1):xhsOpacity,visibility:wechat?'hidden':'visible'}}><div className="film-social-nav"><ChevronLeft size={16}/><b>图文笔记预览</b><span>···</span></div><div className="film-social-profile"><span className="film-avatar"><Leaf size={17}/></span><b>种柑的陈叔</b><span className="film-preview-badge">发布预览</span></div><div className="film-xhs-cover"><motion.img src={picture('cover')} alt="进入小红书预览的贡柑封面" style={{scale:reduced?1:coverScale}}/><span>1 / 2</span></div><div className="film-social-body"><h3>{citrusDemo.content.xhsTitle}</h3><p>{citrusDemo.content.xhsBody.split('\n\n')[1]}</p><small>{citrusDemo.content.xhsTags}</small></div><div className="film-social-bottom">♡ 喜欢　☆ 收藏　<MessageCircle size={14}/> 评论</div></motion.div>
   <motion.div className="film-social film-wechat" aria-hidden={!wechat} style={{opacity:reduced?(wechat?1:0):wechatOpacity,visibility:wechat?'visible':'hidden'}}><div className="film-social-nav"><ChevronLeft size={16}/><b>朋友圈预览</b><span>···</span></div><div className="film-moment-post"><span className="film-avatar"><Leaf size={17}/></span><div><b>种柑的陈叔</b><p>{citrusDemo.content.moments.split('\n\n').slice(0,2).join('\n\n')}</p><img src={picture('moments')} alt="进入朋友圈预览的贡柑配图"/><small>刚刚 · 发布预览</small></div></div></motion.div>
  </div><div className="film-phone-home"/>
 </motion.div>;
}

function Publish({time,reduced,seek,save,copy,onSteps}:{seek:(value:number)=>void;save:(kind:string)=>void;copy:()=>void;onSteps:()=>void}&ClockProps){
 const [wechat,setWechat]=useState(false);
 useMotionValueEvent(time,'change',value=>setWechat(value>=21));
 return <div className="film-two-column film-publish"><div className="film-copy"><Reveal {...{time,reduced}} at={18.1}><span className="film-kicker">06 / 文案助手 · 按渠道准备表达</span><h2>邻居刷到的，<br/>是陈叔家的<em>好产品。</em></h2></Reveal><Reveal {...{time,reduced}} at={18.6}><div className="film-channel-switch" aria-label="查看渠道预览"><button className={!wechat?'selected':''} onClick={()=>seek(20)}>小红书</button><button className={wechat?'selected':''} onClick={()=>seek(22)}>朋友圈</button></div><p>{wechat?'熟人之间，自然说清楚怎么卖、怎么拿。':'讲一件日常小事，再把规格和价格说清楚。'}</p></Reveal><Reveal {...{time,reduced}} at={19} className="film-publish-actions"><button className="film-button film-button-light" onClick={()=>save(wechat?'moments':'cover')}><Download size={16}/>{wechat?'下载朋友圈配图':'下载小红书封面'}</button><button className="film-button film-button-outline" onClick={copy}><Copy size={16}/>复制{wechat?'朋友圈文案':'笔记文案'}</button><button className="film-guide-link" onClick={onSteps}>查看发布步骤 <ArrowRight size={14}/></button></Reveal><Reveal {...{time,reduced}} at={19.5}><small className="film-manual-note">保存图文，核对后在自己的账号里手动发布。</small></Reveal></div><div className="film-phone-stage"><div className="film-phone-orbit"/><Phone {...{time,reduced}}/></div></div>;
}

function PublishingGuide({channel,onClose,onDownload}:{channel:'xhs'|'wechat';onClose:()=>void;onDownload:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const old=document.activeElement as HTMLElement|null;dialog.current?.showModal();return()=>{dialog.current?.close();old?.focus();};},[]);
 const steps=channel==='xhs'?['下载小红书封面与商品介绍卡，准备好实物照片。','在自己的小红书账号创建图文笔记，按封面、商品介绍、实物细节的顺序选图。','粘贴笔记标题、正文和标签。核对 3 kg／盒、59 元、本地自提，以及平台当前提示，再自行确认发布。','有人来问时，先确认数量和取货安排，再约定交易。']:['保存朋友圈配图，复制朋友圈文案。','在自己的微信中打开朋友圈，选择配图并粘贴文字，按实际情况修改。','核对 3 kg／盒、59 元、本地自提和售后安排，再自行确认发布。','及时回复感兴趣的朋友，先确认数量，再约取货时间。'];
 return <dialog ref={dialog} className="film-publishing-guide" aria-label={`${channel==='xhs'?'小红书':'朋友圈'}手动发布步骤`} onCancel={event=>{event.preventDefault();event.stopPropagation();onClose();}} onKeyDown={event=>event.stopPropagation()}><button className="film-guide-close" onClick={onClose} aria-label="关闭发布步骤"><X size={22}/></button><span className="film-kicker">保存好图文，接下来这样做</span><h2>{channel==='xhs'?'小红书':'朋友圈'}发布步骤</h2><ol>{steps.map((step,i)=><li key={step}><span>{i+1}</span><p>{step}</p></li>)}</ol><p className="film-guide-note">这里演示发布准备，不会登录账号或自动发帖。</p><div className="film-guide-actions">{channel==='xhs'&&<button className="film-button film-button-outline" onClick={onDownload}><Download size={15}/>下载商品介绍卡</button>}<button className="film-button film-button-light" onClick={onClose}>明白，返回演示 <Check size={16}/></button></div></dialog>;
}

function Reply({time,reduced,onStart}:{onStart:()=>void}&ClockProps){
 const zoom=useTransform(time,[24,30],[1,1.04]);
 return <div className="film-two-column film-reply"><div className="film-copy"><Reveal {...{time,reduced}} at={24.1}><span className="film-kicker">07 / 客服助手 · 按商品资料准备回复</span><h2>接住顾客的<br/><em>第一句问。</em></h2><p>价格、规格、怎么拿。<br/>把每件小事，都说得明白。</p></Reveal><Reveal {...{time,reduced}} at={27.2}><div className="film-ending-tags"><span><Check size={15}/>有图可发</span><span><Check size={15}/>有话可说</span><span><Check size={15}/>有回复可用</span></div><button className="film-button film-button-light" onClick={onStart}>我也来准备一份 <ArrowRight size={17}/></button></Reveal></div><motion.div className="film-chat-board" style={{scale:reduced?1:zoom}}><div className="film-chat-heading"><span className="film-avatar"><Leaf size={21}/></span><div><b>陈叔的卖货小帮手</b><small>客户咨询 · 模拟回复</small></div><span className="film-online-dot"/></div><Reveal {...{time,reduced}} at={24.7} className="film-chat-question"><span>邻居问</span><p>陈叔，一盒多少钱？能寄吗？</p></Reveal><Reveal {...{time,reduced}} at={25.7} className="film-chat-answer"><span><MessageCircle size={15}/>回复草稿</span><p>{citrusDemo.content.replies.price}</p><p>{citrusDemo.content.replies.shipping}</p><small><Check size={14}/>依据当前商品资料准备</small></Reveal><Reveal {...{time,reduced}} at={27.7} className="film-chat-footer"><MapPin size={16}/>先确认数量，再约次日下午自提。</Reveal></motion.div></div>;
}

function Controls({time,playing,ready,active,seek,toggle}:{time:MotionValue<number>;playing:boolean;ready:boolean;active:number;seek:(value:number)=>void;toggle:()=>void}){
 const [position,setPosition]=useState(0);
 useMotionValueEvent(time,'change',value=>setPosition(old=>Math.floor(old*10)===Math.floor(value*10)?old:value));
 const progress=useTransform(time,[0,storyDuration],[0,1]);
 return <footer className="film-controls"><div className="film-control-main"><button className="film-play-button" disabled={!ready} onClick={toggle} aria-label={playing?'暂停演示':position>=storyDuration?'重播演示':'播放演示'}>{playing?<Pause size={20}/>:<Play size={20}/>}</button><div className="film-scrubber"><div className="film-scrubber-track"><motion.span style={{scaleX:progress}}/></div><input aria-label="演示播放进度" type="range" min="0" max={storyDuration} step="0.1" value={position} onChange={event=>seek(Number(event.target.value))} disabled={!ready}/></div><span className="film-time">{String(Math.floor(position)).padStart(2,'0')} / {storyDuration}s</span><button className="film-icon-button" onClick={()=>seek(0)} disabled={!ready} aria-label="回到开头"><RotateCcw size={18}/></button><div className="film-scene-arrows"><button className="film-icon-button" onClick={()=>seek(storySceneTime(active-1))} disabled={!ready||active===0} aria-label="上一幕"><ChevronLeft size={23}/></button><button className="film-icon-button" onClick={()=>seek(storySceneTime(active+1))} disabled={!ready||active===storyScenes.length-1} aria-label="下一幕"><ChevronRight size={23}/></button></div></div><nav className="film-chapters" aria-label="演示章节">{storyScenes.map((scene,index)=><button key={scene.id} aria-current={index===active?'step':undefined} disabled={!ready} onClick={()=>seek(storySceneTime(index))}><span>{String(index+1).padStart(2,'0')}</span>{scene.title}</button>)}</nav></footer>;
}

export default function CitrusStory({onClose,onStart}:{onClose:()=>void;onStart:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const time=useMotionValue(0);
 const createTime=useTransform(time,[storyScenes[5].start,storyScenes[5].end],[12,18]);
 const publishTime=useTransform(time,[storyScenes[6].start,storyScenes[6].end],[18,24]);
 const replyTime=useTransform(time,[storyScenes[7].start,storyScenes[7].end],[24,30]);
 const reduced=!!useReducedMotion();
 const [playing,setPlaying]=useState(!reduced);
 const [active,setActive]=useState(0);
 const [ended,setEnded]=useState(false);
 const [load,setLoad]=useState<'loading'|'ready'|'error'>('loading');
 const [attempt,setAttempt]=useState(0);
 const [seekVersion,setSeekVersion]=useState(0);
 const [message,setMessage]=useState('');
 const [saving,setSaving]=useState(false);
 const [help,setHelp]=useState<'xhs'|'wechat'|null>(null);
 const playback=useRef<ReturnType<typeof animate>|null>(null);
 const actionAbort=useRef(new AbortController());

 useMotionValueEvent(time,'change',value=>{const next=storySceneAt(value);setActive(old=>old===next?old:next);setEnded(old=>old===(value>=storyDuration)?old:value>=storyDuration);});
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  const overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';dialog.current?.showModal();
  return()=>{dialog.current?.close();document.body.style.overflow=overflow;previous?.focus();actionAbort.current.abort();};
 },[]);
 useEffect(()=>{if(reduced)setPlaying(false);},[reduced]);
 useEffect(()=>{
  const pause=()=>{if(document.hidden)setPlaying(false);};
  document.addEventListener('visibilitychange',pause);
  return()=>document.removeEventListener('visibilitychange',pause);
 },[]);
 useEffect(()=>{
  let current=true;const images:HTMLImageElement[]=[];setLoad('loading');
  Promise.all([photo,detail,...citrusDemo.assets.map(item=>staticImageUrl(item.url))].map(src=>new Promise<void>((resolve,reject)=>{
   const image=new Image();images.push(image);image.onload=()=>image.decode().then(()=>resolve(),reject);image.onerror=()=>reject(new Error('图片暂时无法读取'));image.src=src;
  }))).then(()=>{if(current)setLoad('ready');}).catch(()=>{if(current){setLoad('error');setPlaying(false);}});
  return()=>{current=false;for(const image of images){image.onload=null;image.onerror=null;}};
 },[attempt]);
 useEffect(()=>{
  if(!playing||load!=='ready')return;
  const control=animate(time,storyDuration,{duration:Math.max(0,storyDuration-time.get()),ease:'linear',onComplete:()=>setPlaying(false)});
  playback.current=control;
  return()=>{control.stop();if(playback.current===control)playback.current=null;};
 },[playing,load,seekVersion,time]);
 useEffect(()=>{if(!message)return;const timeout=setTimeout(()=>setMessage(''),4000);return()=>clearTimeout(timeout);},[message]);
 const seek=(value:number)=>{playback.current?.stop();time.set(clampStoryTime(value));setPlaying(false);setSeekVersion(old=>old+1);};
 const toggle=()=>{if(time.get()>=storyDuration){time.set(0);setSeekVersion(old=>old+1);}setPlaying(old=>!old);};
 const save=async(kind:string)=>{if(saving)return;setPlaying(false);setSaving(true);try{const item=asset(kind);const blob=await fetchStaticPng(item.url,actionAbort.current.signal);if(actionAbort.current.signal.aborted)return;downloadBlob(blob,item.downloadName);setMessage(`已下载${item.name}，发布前请核对。`);}catch(error){if(!actionAbort.current.signal.aborted)setMessage((error as Error).message);}finally{if(!actionAbort.current.signal.aborted)setSaving(false);}};
 const copy=async()=>{setPlaying(false);const content=publishTime.get()>=21?citrusDemo.content.moments:[citrusDemo.content.xhsTitle,citrusDemo.content.xhsBody,citrusDemo.content.xhsTags].join('\n\n');try{await navigator.clipboard.writeText(content);setMessage('已复制完整文案，请核对后手动发布。');}catch{setMessage('剪贴板暂不可用，可在素材页选中文字复制。');}};
 const clock={time,reduced};
 return createPortal(<MotionConfig reducedMotion="user"><dialog ref={dialog} className="citrus-film" aria-label="陈叔贡柑卖货动画演示" onCancel={event=>{event.preventDefault();onClose();}} onKeyDown={event=>{
  if(load!=='ready'||(event.target as HTMLElement).closest('input,textarea,select,a'))return;
  if(event.key==='ArrowRight'){event.preventDefault();seek(storySceneTime(active+1));}
  if(event.key==='ArrowLeft'){event.preventDefault();seek(storySceneTime(active-1));}
  if(event.code==='Space'&&!(event.target as HTMLElement).closest('button')){event.preventDefault();toggle();}
 }}><div className="film-shell"><header className="film-header"><span className="film-brand"><Leaf size={22}/><b>乡创引擎</b><span>一箱贡柑的卖货故事</span></span><span className="film-demo-label">陈叔演示案例 · {reduced?'静态分幕':`${storyDuration} 秒动画`}</span><button className="film-close" onClick={onClose} aria-label="关闭动画演示">返回工作台 <X size={20}/></button></header>
  <div className="film-stage" tabIndex={0} aria-label="动画画面，空格播放或暂停，左右方向键切换章节" data-active-scene={storyScenes[active].id}>
   <Scene {...clock} index={0} active={active} className="film-opening"><Opening {...clock}/></Scene>
   <Scene {...clock} index={1} active={active}><Questions {...clock}/></Scene>
   <Scene {...clock} index={2} active={active}><FormWalkthrough {...clock} seek={seek}/></Scene>
   <Scene {...clock} index={3} active={active}><DeliveryWalkthrough {...clock} seek={seek}/></Scene>
   <Scene {...clock} index={4} active={active}><AgentWalkthrough {...clock}/></Scene>
   <Scene {...clock} index={5} active={active} className="film-create"><Create time={createTime} reduced={reduced}/></Scene>
   <Scene {...clock} index={6} active={active}><Publish time={publishTime} reduced={reduced} seek={value=>seek(storyScenes[6].start+(value-18)/6*(storyScenes[6].end-storyScenes[6].start))} save={save} copy={copy} onSteps={()=>{setPlaying(false);setHelp(publishTime.get()>=21?'wechat':'xhs');}}/></Scene>
   <Scene {...clock} index={7} active={active}><Reply time={replyTime} reduced={reduced} onStart={onStart}/></Scene>
   {load!=='ready'&&<div className="film-loading" role="status"><Leaf size={34}/><h2>{load==='error'?'图片暂时没准备好':'正在准备陈叔的故事…'}</h2><p>{load==='error'?'检查本地页面连接，再试一次。':'读取本地照片与宣传图，稍等一下。'}</p>{load==='error'&&<button className="film-button film-button-light" onClick={()=>{setAttempt(old=>old+1);setPlaying(!reduced);}}>重新加载</button>}</div>}
   {load==='ready'&&!playing&&<span className="film-paused">{ended?'演示结束 · 可重播或逐幕查看':reduced?'逐幕查看 · 已尊重减少动态效果设置':'已暂停 · 可拖动下方进度'}</span>}
   <span className="film-scene-counter" aria-live="polite">{String(active+1).padStart(2,'0')} <span>/ {String(storyScenes.length).padStart(2,'0')}</span></span>
  </div>
  <Controls time={time} playing={playing} ready={load==='ready'} active={active} seek={seek} toggle={toggle}/>
  <div className="film-footnote"><span>演示人物与图片为概念素材 · 本地预制图文 · 发布预览</span><span><ArrowDown size={12}/>播放 / 暂停 · 逐幕查看</span></div>
  {message&&<div className="film-toast" role="status"><Check size={17}/>{message}<button aria-label="关闭操作提示" onClick={()=>setMessage('')}><X size={16}/></button></div>}
  {help&&<PublishingGuide channel={help} onClose={()=>setHelp(null)} onDownload={()=>save('detail')}/>}
 </div></dialog></MotionConfig>,document.body);
}
