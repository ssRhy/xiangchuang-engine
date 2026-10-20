import type {ProductDraft} from './state.ts';
export const customerQuestions=['一盒多少钱？有多重？','能寄快递吗？运费多少？','什么时候能拿到？','收到有问题怎么办？'];
export function mockCustomerReply(p:ProductDraft,question:string):string{
 const q=question.trim();if(!q)return '请先输入顾客的问题。';
 const answers:string[]=[];
 if(/价格|钱|贵|便宜|优惠|折扣|几斤|多重|规格|斤|公斤|重量|一盒|一箱|售价/.test(q)||(/多少/.test(q)&&!/运费/.test(q)))answers.push(p.unit&&p.price!==''?`您好，${p.name}是 ${p.unit}，售价 ¥${p.price}。${/便宜|优惠|折扣|贵/.test(q)?'优惠还没有确认，我先跟您核实，不擅自答应降价。':''}`:'规格或售价还需要确认，我核实后再给您准确报价。');
 if(/快递|配送|送|寄|运费|邮费|包邮|自提|地址|哪里|外地/.test(q)){
  const pickup=p.deliveryMethod==='本地自提';
  answers.push([pickup?'这次只做本地自提，暂不提供配送。':p.deliveryMethod?`交付方式：${p.deliveryMethod}。`:'配送方式还没有确定。',p.deliveryArea?`范围：${p.deliveryArea}。`:'您先告诉我所在地区，我确认能否交付。',p.shippingFee?`运费安排：${p.shippingFee}。`:'运费还需要核实，确认后再跟您核对总费用。'].join(''));
 }
 if(/什么时候|多久|几天|几号|哪天|时间|发货|拿到|能拿|取货|今天|明天|后天|到货/.test(q))answers.push(p.dispatchTime?`交付安排：${p.dispatchTime}。具体时间先跟您确认。`:'发货或取货时间还没有确定，我先核实数量和安排，再回复您。');
 if(/售后|坏|破损|退|赔|问题|不符/.test(q))answers.push(p.afterSales?`遇到问题这样处理：${p.afterSales}`:'售后处理方式还需要确认。您先保留照片和具体情况，我核实后跟您协商，不先承诺退赔。');
 if(/产地|哪里种|来自/.test(q))answers.push(p.origin?`这份${p.name}来自${p.origin}。`:'产地还需要核实，我确认后再告诉您。');
 if(/数量|库存|还有|几盒|要\d|要[一二三四五六七八九十]/.test(q))answers.push(p.stock?`资料中的可售数量是${p.stock}，我会再核实您要的数量，确认后再约交付。`:'可售数量还需要核实，您先告诉我要几份，我确认后再回复。');
 if(/认证|有机|农药|功效|保健|甜不甜|口感|保证/.test(q))answers.push('这方面我先核实，手头没有确认的依据，不能凭照片保证。可以先给您看商品细节，再把能确认的信息说明白。');
 return answers.length?answers.join('\n\n'):`您好，您问的这件事我先核实一下。关于${p.name||'这份产品'}，您可以先告诉我想买的数量、所在地区和关心的细节，我确认清楚后再回复，不让您白等。`;
}
