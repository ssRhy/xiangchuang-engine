import demoProducts from './demo-data.json' with { type: 'json' };
import fixedCitrus from './citrus-demo.json' with { type: 'json' };
import authoredCopy from './mock-copy.json' with { type: 'json' };
export const citrusDemo=fixedCitrus;
export const categories = ['水果', '茶叶', '蔬菜', '其他农产品'] as const;
export type Category = typeof categories[number];
export type Photo = { id:string; url:string; name:string; role:'整体图'|'细节图'|'包装图'; source:'uploaded'|'example'; sha256?:string };
export type ProductDraft = {
 id:string; source:'uploaded'|'example'; demoCaseId?:'citrus'; name:string; category:Category; origin:string;
 unit:string; price:string; farmer:string; features:string; stock:string; harvest:string;
 deliveryArea:string; shippingFee:string; deliveryMethod:string; dispatchTime:string;
 afterSales:string; certificationEvidence:string; reach:'nearby'|'shipping'; use:'daily'|'gift';
 firstChannel:'wechat'|'xhs'; photos:Photo[];
};
export const newDraft=(id='my-product'):ProductDraft=>({id,source:'uploaded',name:'',category:'水果',origin:'',unit:'',price:'',farmer:'',features:'',stock:'',harvest:'',deliveryArea:'',shippingFee:'',deliveryMethod:'',dispatchTime:'',afterSales:'',certificationEvidence:'',reach:'nearby',use:'daily',firstChannel:'wechat',photos:[]});
export const examples = demoProducts.map(p=>({...p,category:p.category as Category}));
export function exampleDraft(id:string):ProductDraft {
 const e=examples.find(x=>x.id===id)||examples[0];
 return {...newDraft(e.id),...e,source:'example',reach:e.reach as ProductDraft['reach'],use:e.use as ProductDraft['use'],firstChannel:e.firstChannel as ProductDraft['firstChannel'],photos:[{id:e.id,url:`/images/${e.id}-ai.png`,name:`${e.brand} AI 概念图`,role:'整体图',source:'example'}]};
}

export function chars(text:string){return Array.from(text).length;}
export function shorten(text:string,max:number){return chars(text)<=max?text:Array.from(text).slice(0,max-1).join('')+'…';}
export function priceValid(price:string){return price===''||(/^\d+(\.\d{1,2})?$/.test(price)&&Number.isFinite(Number(price))&&Number(price)>=0&&Number(price)<=9999999);}
export function validatePhoto(file:{type:string;size:number},count:number){
 if(count>=3)return '最多选择 3 张照片，请先删除或更换已有照片。';
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))return '请选择 JPEG、PNG 或 WebP 图片；其他格式请先转换后再选择。';
 if(file.size===0||file.size>10*1024*1024)return '照片不能为空，单张大小不能超过 10 MB。';
 return '';
}
export type Content = { xhsTitle:string; xhsBody:string; xhsTags:string; moments:string; group:string; replies:{price:string;shipping:string;dispatch:string;afterSales:string};coverTitle:string;coverSubtitle:string };
export type Guide = {id:string;title:string;what:string;why:string;next:string;path:string};
export type StaticAsset={kind:'scene'|'cover'|'detail'|'moments';url:string;name:string;width:number;height:number;downloadName:string};
export type SalesPlan = {snapshot:ProductDraft;revision:number;content:Content;guides:Guide[];resultSource:'preset'|'mock'|'manual';assets?:StaticAsset[]};
export type CheckIssue = {id:string;level:'blocker'|'warning'|'info';title:string;detail:string;path:string};
export const citrusReference=exampleDraft('citrus');
export const citrusFields=[['name','产品名称'],['category','产品类别'],['origin','产地'],['farmer','怎么称呼你'],['features','产品特点'],['stock','可售数量'],['harvest','采收 / 上市时间'],['reach','销售范围'],['use','购买用途'],['unit','售卖规格'],['price','售价（元）'],['deliveryMethod','配送 / 取货方式'],['deliveryArea','可送 / 发货地区'],['shippingFee','运费说明'],['dispatchTime','发货 / 交付安排'],['afterSales','售后处理方式'],['certificationEvidence','认证 / 奖项证明说明']] as const;
export function demoIssues(p:ProductDraft):CheckIssue[]{
 if(p.demoCaseId!=='citrus')return [];
 const issues:CheckIssue[]=[];
 if(p.photos.length!==2||!citrusDemo.inputs.every(input=>p.photos.some(photo=>photo.source==='uploaded'&&photo.sha256===input.sha256)))issues.push({id:'demo-photos',level:'blocker',title:'请上传资料包里的两张指定照片（可改名或调换顺序）',detail:'退出固定演示后，可继续使用其他照片填写普通产品。',path:'/products'});
 for(const [key,label] of citrusFields){const expected=citrusReference[key];if(String(p[key]??'').trim()!==String(expected).trim())issues.push({id:`demo-${key}`,level:'blocker',title:`演示${label}请填写：${expected===''?'留空':expected==='nearby'?'先卖给附近的人':expected==='daily'?'日常吃 / 日常用':expected}`,detail:'本次成品图和文案按参考资料准备。也可退出固定演示，保留当前资料继续普通流程。',path:'/products'});}
 return issues;
}
export function findMockCopy(p:ProductDraft):Content|null {
 const match=examples.find(e=>citrusFields.every(([key])=>String(p[key]).trim()===String(e[key]).trim()));
 const entry=match&&authoredCopy.entries.find(e=>e.id===match.id);
 return entry?structuredClone(entry.content):null;
}
export function buildPlan(draft:ProductDraft,revision:number):SalesPlan {
 const p={...draft,...Object.fromEntries(citrusFields.map(([key])=>[key,String(draft[key]).trim()])),photos:draft.photos.map(x=>({...x}))};
 if(p.demoCaseId==='citrus'){
  const issues=demoIssues(p);if(issues.length)throw new Error(issues.map(i=>i.title).join('；'));
  const snapshot={...p,...Object.fromEntries(citrusFields.map(([key])=>[key,citrusReference[key]]))};
  const guides=structuredClone(citrusDemo.guides) as Guide[];
  const first=p.firstChannel;guides.sort((a,b)=>a.id===first&&['xhs','wechat'].includes(b.id)?-1:b.id===first&&['xhs','wechat'].includes(a.id)?1:0);
  return {snapshot,revision,resultSource:'preset',content:structuredClone(citrusDemo.content),guides,assets:structuredClone(citrusDemo.assets) as StaticAsset[]};
 }
 const item=p.name||'我家的农产品';
 const replies={price:p.price!==''?`您好，${item}是 ${p.unit}，售价 ¥${p.price}。${p.shippingFee?`运费：${p.shippingFee}。`:'运费还在确认，确认清楚后再与您核对总费用。'}`:'售价还在确认，我会先核清产品规格和成本，确认后再回复您。',shipping:p.deliveryArea&&p.shippingFee?`目前可送地区：${p.deliveryArea}；运费：${p.shippingFee}。请先确认地址是否可达，再安排。`:'请先告诉我收货地区，我核实是否能送达，以及运费后，再给您明确答复。',dispatch:p.dispatchTime?`发货安排：${p.dispatchTime}。确认可售数量和配送信息后，再核对具体安排。`:'发货时间还需确认，我会核实可售数量与配送安排，再给您准确答复。',afterSales:p.afterSales?`售后说明：${p.afterSales}`:'售后处理方式还需要确认。我会先说明具体处理方式，再请您决定是否购买。'};
 const audience=p.reach==='nearby'?(p.use==='gift'?'附近有探亲、走访送礼需求的人':'附近家庭、熟人和社区居民'):(p.use==='gift'?'有家乡礼品需求、且地址在配送范围内的人':'希望了解产地产品、且地址在配送范围内的家庭消费者');
 const guides:Guide[]=[
 {id:'audience',title:'先想清楚，卖给谁',what:`先面向${audience}介绍。`,why:'先找得到、沟通得上的人，比一开始面向所有人更容易起步。',next:p.reach==='nearby'?'列出愿意了解产品的熟人或本地客户，先问需求，不群发打扰。':'先核对发货范围与运输成本，再介绍给能送达的人。',path:'/products'},
 {id:'intro',title:'用几句话，把产品说清楚',what:`介绍“${item}来自哪里、怎么卖、有什么特点”。`,why:'顾客先关心产品、规格、价格和配送，清楚比夸张更有用。',next:'打开图文草稿，核对每一个商品信息；没依据的认证和承诺先不写。',path:'/assets'},
 {id:'photos',title:'先拍这三种照片',what:'整体图看产品，细节图看实物，包装图看准备怎么交付。',why:'清晰的实物照片能帮助顾客理解产品；这里只提供拍摄清单，不自动判断品质。',next:'在自然光下拍摄，背景尽量简单，保留真实大小和外观，不用过度滤镜。',path:'/products'},
 {id:'xhs',title:'小红书，先讲清楚一个故事',what:'用产地与日常场景开头，再写规格、价格和已确认的配送信息。',why:'照片与文字要对应；让感兴趣的人知道你在分享什么。',next:'下载封面与介绍卡，编辑笔记草稿，检查后由你手动发布。',path:'/assets'},
 {id:'wechat',title:'微信，从熟悉的人开始',what:'朋友圈做自然介绍；社群先确认允许商品分享，再发送简短信息。',why:'不同场合用不同表达，避免重复刷屏。',next:'复制朋友圈或社群文案，根据实际情况修改，确认信息后再发。',path:'/assets'},
 {id:'replies',title:'有人来问，先把细节聊明白',what:'准备价格、运费、发货和售后四类回复。',why:'没确认的信息先核实，不急着许诺，减少成交后的误会。',next:'补齐待确认资料，用回复草稿逐项沟通，再确认交易安排。',path:'/assets'}
 ];
 const first=p.firstChannel==='xhs'?'xhs':'wechat';
 guides.sort((a,b)=>a.id===first&&['xhs','wechat'].includes(b.id)?-1:b.id===first&&['xhs','wechat'].includes(a.id)?1:0);
 const content=findMockCopy(p);
 return {snapshot:p,revision,resultSource:content?'mock':'manual',content:content||{xhsTitle:'',xhsBody:'',xhsTags:'',moments:'',group:'',replies,coverTitle:'',coverSubtitle:''},guides};
}
export type AppState = {draft:ProductDraft;revision:number;plan:SalesPlan|null;customized:boolean;checked:boolean;todos:Record<string,boolean>};
export const initialState=():AppState=>({draft:newDraft(),revision:0,plan:null,customized:false,checked:false,todos:{}});
export type Action={type:'edit';patch:Partial<ProductDraft>}|{type:'load';draft:ProductDraft}|{type:'generate';revision?:number}|{type:'copy';key:Exclude<keyof Content,'replies'>;value:string}|{type:'reply';key:keyof Content['replies'];value:string}|{type:'check'}|{type:'todo';id:string;done:boolean}|{type:'reset'};
export function reducer(s:AppState,a:Action):AppState{
 switch(a.type){
 case 'edit':return {...s,draft:{...s.draft,...a.patch},revision:s.revision+1,checked:false,todos:{}};
 case 'load':return {...initialState(),draft:a.draft,revision:s.revision+1};
 case 'generate':if(a.revision!==undefined&&a.revision!==s.revision)return s;return {...s,plan:buildPlan(s.draft,s.revision),customized:false,checked:false,todos:{}};
 case 'copy':return s.plan?{...s,plan:{...s.plan,content:{...s.plan.content,[a.key]:a.value}},customized:true,checked:false,todos:{...s.todos,check:false,publish:false}}:s;
 case 'reply':return s.plan?{...s,plan:{...s.plan,content:{...s.plan.content,replies:{...s.plan.content.replies,[a.key]:a.value}}},customized:true,checked:false,todos:{...s.todos,replies:false,check:false,publish:false}}:s;
 case 'check':return {...s,checked:true};
 case 'todo':return {...s,todos:{...s.todos,[a.id]:a.done}};
 case 'reset':return initialState();
 }
}
export const isStale=(s:AppState)=>!!s.plan&&s.plan.revision!==s.revision;
export function draftIssues(p:ProductDraft):CheckIssue[]{
 const issues:CheckIssue[]=demoIssues(p);
 for(const [key,label] of [['name','产品名称'],['origin','产地'],['unit','售卖规格']] as const){if(!p[key].trim())issues.push({id:key,level:'blocker',title:`请填写${label}`,detail:'内容会直接显示在商品介绍中，暂缺时不能形成发布素材。',path:'/products'});}
 if(!p.photos.length)issues.push({id:'photos',level:'blocker',title:'请至少选择一张产品照片',detail:'自己的产品使用自己的照片；也可先体验演示案例。',path:'/products'});
 if(!priceValid(p.price))issues.push({id:'price-invalid',level:'blocker',title:'售价格式不正确',detail:'请填写非负金额，最多两位小数。',path:'/products'});
 if(p.price==='')issues.push({id:'price',level:'blocker',title:'售价暂未确定',detail:'先核清产品规格、成本和运输费用，再填写售价。本次只提供准备指导，不导出可发布报价素材。',path:'/products'});
 for(const [key,label] of [['stock','可售数量'],['shippingFee','运费说明'],['dispatchTime','发货或交付安排'],['afterSales','售后处理方式']] as const){if(!p[key].trim())issues.push({id:key,level:'warning',title:`待确认：${label}`,detail:'不要代填承诺；先确认，再向顾客说明。',path:'/products'});}
 if(p.reach==='shipping'&&!p.deliveryArea.trim())issues.push({id:'area',level:'warning',title:'待确认：快递可达地区',detail:'核对能否送达后，再向外地顾客介绍。',path:'/products'});
 return issues;
}
export function reviewPlan(s:AppState):CheckIssue[]{
 const issues=draftIssues(s.draft);
 if(!s.plan)return [...issues,{id:'plan',level:'blocker',title:'还没有卖货方案',detail:'填写资料后，先组装一份方案。',path:'/studio'}];
 if(s.plan.resultSource==='manual')issues.push({id:'copy-unavailable',level:'info',title:'当前资料没有匹配的 AI 预写稿',detail:'已保留商品资料和操作指导。可手动编写图文，或使用资料一致的演示案例；不会把旧价格改写到预写稿里。',path:'/assets'});
 if(isStale(s))issues.push({id:'stale',level:'blocker',title:'产品资料已更新，方案待更新',detail:'先更新方案，避免旧价格、旧规格或旧照片被导出。',path:'/studio'});
 const p=s.plan.snapshot,c=s.plan.content;
 const text=[c.xhsTitle,c.xhsBody,c.moments,c.group,...Object.values(c.replies)].join('\n');
 if(chars(c.xhsTitle)>20||!c.xhsTitle.trim())issues.push({id:'title',level:'blocker',title:'小红书标题需为 1—20 字',detail:'请缩短标题，产品全称可以放在正文中。',path:'/assets'});
 const tags=c.xhsTags.trim().split(/\s+/).filter(Boolean);
 if(tags.length<5||tags.length>10||tags.some(t=>!/^#[^#\s]+$/.test(t)))issues.push({id:'tags',level:'blocker',title:'请保留 5—10 个标签',detail:'每个标签以 # 开头，用空格分隔。',path:'/assets'});
 if(chars(c.coverTitle)>15||chars(c.coverSubtitle)>15||!c.coverTitle.trim())issues.push({id:'card-title',level:'blocker',title:'图卡标题或副标题过长 / 为空',detail:'封面标题、副标题分别不超过 15 字。',path:'/assets'});
 const required=[['小红书正文',c.xhsBody],['朋友圈文案',c.moments],['社群文案',c.group]];
 if(p.price!=='')for(const [label,value] of required){if(!value.includes(`¥${p.price}`)||!value.includes(p.unit)||!value.includes(p.name))issues.push({id:`missing-${label}`,level:'blocker',title:`${label}缺少当前名称、规格或价格`,detail:'补回方案中的商品信息，避免跨渠道不一致。',path:'/assets'});}
 const prices=Array.from(text.matchAll(/[¥￥]\s*(\d+(?:\.\d+)?)/g)).map(m=>m[1]);
 if(p.price!==''&&prices.some(v=>Number(v)!==Number(p.price)))issues.push({id:'price-conflict',level:'blocker',title:'文案中出现不同的标价',detail:`当前售价为 ¥${p.price}；检查自行编辑的金额。本规则不替代人工阅读。`,path:'/assets'});
 const weightPattern=/(\d+(?:\.\d+)?)\s*(kg|公斤|千克|斤|g|克)(?![A-Za-z])/gi;
 const expected=Array.from(p.unit.matchAll(weightPattern)).map(m=>`${Number(m[1])}:${({'kg':'kg','公斤':'kg','千克':'kg','斤':'jin','g':'g','克':'g'} as Record<string,string>)[m[2].toLowerCase()]}`);
 const mentioned=Array.from(text.matchAll(weightPattern)).map(m=>`${Number(m[1])}:${({'kg':'kg','公斤':'kg','千克':'kg','斤':'jin','g':'g','克':'g'} as Record<string,string>)[m[2].toLowerCase()]}`);
 if(expected.length&&mentioned.some(v=>!expected.includes(v)))issues.push({id:'unit-conflict',level:'blocker',title:'文案中的重量与售卖规格不一致',detail:`当前规格：${p.unit}。请逐处核对，未覆盖的规格写法仍需人工检查。`,path:'/assets'});
 if(/有机|认证|获奖|国家级|绿色食品/.test(text))issues.push({id:'certification',level:p.certificationEvidence.trim()?'warning':'blocker',title:p.certificationEvidence.trim()?'认证表述需人工核对证明':'认证或奖项表述缺少证明说明',detail:p.certificationEvidence.trim()?'已填写证明说明，但平台没有核验证明真伪；发布前请人工核对。':'删除该表述，或补充可人工核对的证明说明，不能仅凭产品照片确认。',path:p.certificationEvidence.trim()?'/verification':'/products'});
 const commitments:[RegExp,keyof ProductDraft,string][]=[[/包邮|免运费|免费配送/,'shippingFee','包邮或免运费'],[/(\d+\s*(小时|天).{0,4}?(发货|送达))|当天发|次日达/,'dispatchTime','发货或送达时效'],[/包退|包换|无理由|坏果包赔/,'afterSales','售后保证']];
 for(const [pattern,key,label] of commitments)if(pattern.test(text)&&(!p[key]||Array.from(text.matchAll(new RegExp(pattern.source,'g'))).some(m=>!String(p[key]).includes(m[0]))))issues.push({id:`promise-${key}`,level:'blocker',title:`检查未经确认的${label}承诺`,detail:'文案承诺应与农户填写的说明一致；不能从未填写的字段推断。',path:'/assets'});
 if(/全网第一|销量第一|销量冠军|百分之百|100%|治病|降血糖/.test(text))issues.push({id:'overclaim',level:'blocker',title:'文案含有需核实的销量、绝对化或功效表述',detail:'先删除或人工核实；本页面仅检查已列出的关键词，不构成全面审核。',path:'/assets'});
 if(p.source==='example')issues.push({id:'example',level:'info',title:'当前是演示案例',detail:'品牌、价格为演示值，图片为 AI 概念视觉，不是自家商品实拍。',path:'/products'});
 return issues;
}
export function tasks(p:ProductDraft){return [
 {id:'photos',title:'补齐产品照片',detail:'准备整体、细节和包装照片，核对画面与实际交付内容。',path:'/products'},
 {id:'shipping',title:'确认售价、运费与交付方式',detail:p.price===''?'先核清规格、成本和运输费用，再确定售价。':'确认可售数量、配送范围、运费和交付安排。',path:'/products'},
 {id:'check',title:'检查文字和图片',detail:'运行发布前检查，人工核对产品信息与每一句承诺。',path:'/verification'},
 {id:'publish',title:`手动发布${p.firstChannel==='wechat'?'微信内容':'小红书笔记'}`,detail:'复制文字、保存图卡，在自己的账号中核对后发布。',path:'/assets'},
 {id:'replies',title:'准备客户咨询回复',detail:'先回答价格、配送、发货与售后；不确定的内容先核实。',path:'/assets'}
 ];}
export function exportPlan(s:AppState){
 if(!s.plan)return '';
 const p=s.plan.snapshot,c=s.plan.content;
 const checks=reviewPlan(s);
 return [`# ${p.name} · 我的网上卖货方案`, `说明：${s.plan.resultSource==='preset'?'陈叔贡柑固定案例素材':s.plan.resultSource==='mock'?'AI 预先创作的完整文案（Mock）':'商品准备清单（营销文案待填写）'}，不调用在线模型。发布前须人工确认。`,`## 商品资料\n来源：${p.source==='example'?'演示案例（AI 概念图）':'用户自填'}\n${Object.entries(p).filter(([k])=>!['photos','id','source'].includes(k)).map(([k,v])=>`${k}：${v||'待确认'}`).join('\n')}\n照片：${p.photos.map(x=>`${x.name}（${x.role}）`).join('、')}`,`## 我的卖货步骤\n${s.plan.guides.map(g=>`### ${g.title}\n做什么：${g.what}\n为什么：${g.why}\n下一步：${g.next}`).join('\n\n')}`,`## 小红书笔记\n${c.xhsTitle}\n\n${c.xhsBody}\n\n${c.xhsTags}`,...(s.plan.assets?[`## 成品图片\n${s.plan.assets.map(a=>`- ${a.name}（${a.width} × ${a.height}）：${a.downloadName}；本地文件 ${a.url}`).join('\n')}`]:[]),`## 图片卡片摘要\n封面标题：${c.coverTitle}\n副标题：${c.coverSubtitle}\n规格：${p.unit}\n售价：${p.price===''?'待确认':`¥${p.price}`}\n图卡可在页面单独下载 PNG，照片不以临时浏览器地址写入导出文件。`,`## 朋友圈\n${c.moments}`,`## 社群\n${c.group}`,`## 客户回复\n${Object.entries(c.replies).map(([k,v])=>`${k}：${v}`).join('\n\n')}`,`## 发布前检查\n${checks.length?checks.map(i=>`- [${i.level}] ${i.title}：${i.detail}`).join('\n'):'未发现已配置规则中的问题，仍需人工核对。'}`,`## 行动清单\n${tasks(p).map(t=>`- [${s.todos[t.id]?'x':' '}] ${t.title}：${t.detail}`).join('\n')}`].join('\n\n');
}
