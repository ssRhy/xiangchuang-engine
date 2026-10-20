import {useLayoutEffect,useRef,useState} from 'react';
import type {ReactNode,RefObject} from 'react';
import {motion,useMotionValueEvent,useTransform} from 'motion/react';
import type {MotionValue} from 'motion/react';
import {ArrowRight,Bot,Camera,Check,ChevronDown,FileCheck2,ImagePlus,Leaf,MousePointer2,PenLine,ScanLine,Sparkles} from 'lucide-react';
import {citrusDemo,citrusReference as product} from './state';
import {storyTypedText} from './story';
import './story-walkthrough.css';

type Clock={time:MotionValue<number>;reduced:boolean};
function useTimelineScroll(time:MotionValue<number>,reduced:boolean,start:number,end:number){
 const ref=useRef<HTMLDivElement>(null);
 const sync=(value:number)=>{const element=ref.current;if(!element||reduced)return;const progress=Math.max(0,Math.min(1,(value-start)/(end-start)));element.scrollTop=progress*(element.scrollHeight-element.clientHeight);};
 useMotionValueEvent(time,'change',sync);
 useLayoutEffect(()=>sync(time.get()));
 return ref;
}
function useReached(time:MotionValue<number>,at:number,reduced=false){
 const [reached,setReached]=useState(false);
 useMotionValueEvent(time,'change',value=>setReached(old=>old===(value>=at)?old:value>=at));
 return reduced||reached;
}
function DemoField({time,reduced,label,value,at,end,select=false}:{label:string;value:string;at:number;end:number;select?:boolean}&Clock){
 const [text,setText]=useState('');
 const started=useReached(time,at),finished=useReached(time,end);
 const focused=started&&!finished;
 useMotionValueEvent(time,'change',valueAt=>{const next=select?(valueAt>=end?value:''):storyTypedText(value,valueAt,at,end);setText(old=>old===next?old:next);});
 return <div className={`walk-field ${focused&&!reduced?'walk-focused':''}`} data-field={label}><span>{label}</span><div className="walk-field-value"><span title={value}>{(reduced?value:text)||<small>{select?'请选择':'请填写'}</small>}</span>{focused&&!reduced&&!select&&<i/>}{select&&<ChevronDown size={13}/>}</div></div>;
}
function Window({step,children,footer,bodyRef}:{step:number;children:ReactNode;footer:ReactNode;bodyRef:RefObject<HTMLDivElement|null>}){
 return <div className="walk-window"><div className="walk-window-bar"><span><Leaf size={14}/>乡创引擎 / 我的产品与照片</span><small>操作演示</small></div><div className="walk-step-nav">{['产品和照片','怎么卖与怎么送','确认资料'].map((name,index)=><span key={name} className={index===step?'current':index<step?'finished':''}><i>{index<step?<Check size={11}/>:index+1}</i>{name}</span>)}</div><div ref={bodyRef} className="walk-window-content">{children}</div><div className="walk-window-footer">{footer}</div></div>;
}
function Pointer({time,reduced,points,x,y,clicks}:{points:number[];x:string[];y:string[];clicks:number[]}&Clock){
 const left=useTransform(time,points,x),top=useTransform(time,points,y);
 const opacity=useTransform(time,[points[0],points[0]+.2,points.at(-1)!-.1,points.at(-1)!],[0,1,1,0]);
 const pulse=useTransform(time,clicks,clicks.map((_,index)=>index%3===1?1:.1));
 return <div className="walk-pointer-clip" aria-hidden="true"><motion.div className="walk-pointer-track" style={{x:left,y:top,opacity:reduced?0:opacity}}><motion.span className="walk-click-ring" style={{scale:pulse,opacity:pulse}}/><MousePointer2 size={26}/></motion.div></div>;
}

export function FormWalkthrough({time,reduced,seek}:{seek:(value:number)=>void}&Clock){
 const uploaded=useReached(time,9.7,reduced);
 const clickNext=useReached(time,15.8,reduced);
 const basicDone=useReached(time,14.4,reduced);
 const extraDone=useReached(time,15.1,reduced);
 const bodyRef=useTimelineScroll(time,reduced,12.4,15.5);
 return <div className="film-two-column film-walkthrough"><div className="film-copy"><span className="film-kicker">02 / 陈叔只需要填自己知道的事</span><h2>选两张照片，<br/>说清<em>这是什么。</em></h2><ol className="walk-instructions"><li className={uploaded?'done':''}><span>1</span><div><b>选照片</b><p>上传整体图和细节图，保留实物外观。</p></div></li><li className={basicDone?'done':''}><span>2</span><div><b>填产品资料</b><p>贡柑家庭装、广东肇庆、种柑的陈叔。</p></div></li><li className={clickNext?'done':''}><span>3</span><div><b>点击下一步</b><p>接着确认规格、售价和取货安排。</p></div></li></ol><span className="walk-simulation-note">画面演示操作，不会改动你的实际填写。</span></div>
  <div className="walk-editor-stage"><Window bodyRef={bodyRef} step={0} footer={<><span>1 / 3 · 产品和照片</span><button className={clickNext?'walk-button clicked':'walk-button'} onClick={()=>seek(19.8)}>下一步 <ArrowRight size={14}/></button></>}><div className="walk-photo-label"><Camera size={15}/>先选我家的产品照片 <small>整体图 + 细节图</small></div><div className="walk-upload-row">{citrusDemo.inputs.map(input=><div className="walk-upload-tile" key={input.role}>{uploaded?<><img src={input.url} alt={`已选择${input.role}`}/><span><Check size={12}/>{input.role}已选好</span></>:<><ImagePlus size={24}/><span>选择{input.role}</span></>}</div>)}</div><div className="walk-field-grid"><DemoField {...{time,reduced}} label="产品名称 *" value={product.name} at={10.5} end={11.8}/><DemoField {...{time,reduced}} label="产品类别 *" value={product.category} at={11.9} end={12.25} select/><DemoField {...{time,reduced}} label="产地 *" value={product.origin} at={12.4} end={13.3}/><DemoField {...{time,reduced}} label="怎么称呼你" value={product.farmer} at={13.4} end={14.4}/></div><div className="walk-confirmed-feature"><Check size={13}/>{basicDone?product.features:"补充产品特点，再填可售数量和上市时间"}</div><div className="walk-extra-facts">{extraDone?`可售数量：${product.stock}　·　采收 / 上市：${product.harvest}`:"可售数量、采收 / 上市时间按实际补充"}</div></Window>
  <Pointer {...{time,reduced}} points={[8.4,9.1,9.5,10.5,11.9,12.4,13.4,15.1,16.4]} x={['40%','25%','25%','22%','72%','22%','72%','84%','84%']} y={['32%','35%','35%','58%','58%','75%','75%','94%','94%']} clicks={[8.4,9.2,9.6,11.8,12.05,12.3,15.5,15.8,16.4]}/></div>
 </div>;
}

export function DeliveryWalkthrough({time,reduced,seek}:{seek:(value:number)=>void}&Clock){
 const confirm=useReached(time,23.5);
 const bodyRef=useTimelineScroll(time,reduced,confirm?24.6:20.4,confirm?25.3:22.5);
 const dropdownStarted=useReached(time,19.3),dropdownFinished=useReached(time,20.15);
 const dropdownOpen=dropdownStarted&&!dropdownFinished;
 const clicked=useReached(time,25.4,reduced);
 const ready=useReached(time,22.8,reduced);
 const priceDone=useReached(time,19,reduced);
 const buttonScale=useTransform(time,[25.2,25.4,25.7],[1,.96,1]);
 return <div className="film-two-column film-walkthrough walk-delivery"><div className="film-copy"><span className="film-kicker">03 / 价格和交付，由陈叔确认</span><h2>怎么卖、怎么拿，<br/><em>点选就明白。</em></h2><ol className="walk-instructions"><li className={priceDone?'done':''}><span>1</span><div><b>填规格和售价</b><p>{product.unit}，¥{product.price}。</p></div></li><li className={ready?'done':''}><span>2</span><div><b>选择交付选项</b><p>本地自提、无运费，再约次日下午。</p></div></li><li className={clicked?'done':''}><span>3</span><div><b>核对后点击生成</b><p>把确认过的资料，交给卖货小帮手。</p></div></li></ol><div className="walk-step-buttons"><button onClick={()=>seek(22.9)}>看规格与交付</button><button onClick={()=>seek(26)}>看确认与生成</button></div></div>
  <div className="walk-editor-stage"><Window bodyRef={bodyRef} step={confirm?2:1} footer={<><span>{confirm?'3 / 3 · 确认资料':'2 / 3 · 怎么卖与怎么送'}</span>{confirm?<motion.button className={`walk-button ${clicked?'clicked':''}`} style={{scale:reduced?1:buttonScale}} onClick={()=>seek(28)}>{clicked?'资料已确认，开始准备':'生成我的卖货方案'} <Sparkles size={14}/></motion.button>:<button className="walk-button" onClick={()=>seek(26)}>下一步 <ArrowRight size={14}/></button>}</>}>
   {!confirm?<><div className="walk-choice-line"><span><Check size={11}/>先卖给附近的人</span><span><Check size={11}/>日常吃</span><span><Check size={11}/>先做小红书</span></div><div className="walk-field-grid"><DemoField {...{time,reduced}} label="售卖规格 *" value={product.unit} at={17.3} end={18.2}/><DemoField {...{time,reduced}} label="售价（元） *" value={product.price} at={18.3} end={18.9}/><div className="walk-dropdown-anchor"><DemoField {...{time,reduced}} label="配送 / 取货方式" value={product.deliveryMethod} at={19.1} end={20.1} select/>{dropdownOpen&&!reduced&&<div className="walk-dropdown-menu"><span className="chosen">本地自提 <Check size={12}/></span><span>同城配送</span><span>快递配送</span></div>}</div><DemoField {...{time,reduced}} label="运费安排" value={product.shippingFee} at={20.15} end={20.65} select/></div><DemoField {...{time,reduced}} label="可送 / 自提范围" value={product.deliveryArea} at={20.7} end={21.2} select/><DemoField {...{time,reduced}} label="发货 / 交付时间" value={product.dispatchTime} at={21.25} end={21.9} select/><DemoField {...{time,reduced}} label="售后处理方式" value={product.afterSales} at={21.95} end={22.65} select/></>:<><div className="walk-confirm-heading"><img src={citrusDemo.inputs[1].url} alt="待确认的贡柑照片"/><div><span>再看一遍，就可以生成了</span><h3>{product.name}</h3><p>{product.origin} · {product.unit}</p><strong>¥{product.price}</strong></div></div><dl className="walk-confirm-facts"><div><dt>交付方式</dt><dd>{product.deliveryMethod}</dd></div><div><dt>运费安排</dt><dd>{product.shippingFee}</dd></div><div><dt>交付时间</dt><dd>{product.dispatchTime}</dd></div></dl><div className="walk-facts-note"><FileCheck2 size={17}/><p>规格、价格和自提安排已确认。<br/>没有提供的认证与承诺，不替陈叔编。</p></div>{clicked&&<div className="walk-sent-status" role="status"><Check size={15}/>这份商品资料已交给卖货小帮手</div>}</>}
  </Window><Pointer {...{time,reduced}} points={[17.2,17.7,18.3,19.3,19.8,20.4,21.5,22.3,23.2,24.1,25.3,26.5]} x={['21%','21%','71%','22%','29%','72%','50%','50%','84%','42%','76%','76%']} y={['32%','32%','32%','51%','61%','51%','75%','84%','94%','46%','94%','94%']} clicks={[19.2,19.5,19.8,22.8,23.1,23.4,25.15,25.4,25.8]}/></div>
 </div>;
}

const agentRoles=[
 {name:'商品整理助手',Icon:FileCheck2,task:'把农户填写的资料整理成商品档案',result:'贡柑 · 3 kg / 盒 · ¥59 · 本地自提',at:27.6},
 {name:'文案创作助手',Icon:PenLine,task:'围绕家庭分享场景，分别准备渠道表达',result:'小红书笔记 + 朋友圈 / 社群完整文案',at:29.1},
 {name:'视觉素材助手',Icon:ImagePlus,task:'围绕这份商品，准备对应宣传素材',result:'场景宣传图 + 封面 + 介绍卡 + 朋友圈图',at:30.6},
 {name:'检查与客服助手',Icon:ScanLine,task:'核对规格价格，准备有依据的咨询回复',result:'规则检查 + 价格、配送、交付、售后回复',at:32.1},
] as const;
function AgentRole({role,index,time,reduced}:{role:typeof agentRoles[number];index:number}&Clock){
 const done=useReached(time,role.at+.9,reduced);
 const working=useReached(time,role.at,reduced)&&!done;
 const opacity=useTransform(time,[role.at-.25,role.at+.25],[.25,1]);
 const x=useTransform(time,[role.at-.25,role.at+.25],[16,0]);
 const Icon=role.Icon;
 return <motion.div className={`walk-agent-role ${done?'done':working?'working':''}`} style={{opacity:reduced?1:opacity,x:reduced?0:x}}><div className="walk-agent-role-icon"><Icon size={21}/></div><div><span>AGENT 0{index+1}</span><h3>{role.name}</h3><p>{role.task}</p><small>{role.result}</small></div><span className="walk-agent-state">{done?<Check size={17}/>:working?'准备中':'待接力'}</span></motion.div>;
}
export function AgentWalkthrough({time,reduced}:Clock){
 const progress=useTransform(time,[27.5,33.3],[0,1]);
 const boardRef=useTimelineScroll(time,reduced,29.5,33.3);
 return <div className="film-two-column film-walkthrough walk-agents"><div className="film-copy"><span className="film-kicker">04 / AI Agent 协作流程演示</span><h2>陈叔填事实，<br/><em>助手们准备表达。</em></h2><p>从一份商品资料出发，<br/>把图、文、检查和回复接起来。</p><div className="walk-agent-source"><span className="walk-agent-source-icon"><Bot size={26}/></span><div><b>乡创引擎 · 卖货小帮手</b><small>输入：陈叔确认的商品资料</small></div></div><div className="walk-agent-progress"><motion.span style={{scaleX:progress}}/></div><p className="walk-agent-boundary">此处模拟 Agent 分工；当前演示读取本地预制图文，并使用规则检查和模拟回复。</p></div><div ref={boardRef} className="walk-agent-board">{agentRoles.map((role,index)=><AgentRole key={role.name} {...{time,reduced,role,index}}/>)}<div className="walk-agent-handoff"><Check size={15}/>准备好图文，再由陈叔核对并手动发布。</div></div></div>;
}
