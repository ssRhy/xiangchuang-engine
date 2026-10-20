import {citrusReference,examples} from './state.ts';
import type {ProductDraft} from './state.ts';
export const fulfillmentFields=[['deliveryMethod','配送 / 取货方式'],['deliveryArea','可送 / 自提范围'],['shippingFee','运费安排'],['dispatchTime','发货 / 交付时间'],['afterSales','售后处理方式']] as const;
export type FulfillmentField=typeof fulfillmentFields[number][0];
export function fulfillmentOptions(d:ProductDraft,key:FulfillmentField):string[]{
 const pickup=d.deliveryMethod==='本地自提';
 const values:Record<FulfillmentField,string[]>={
  deliveryMethod:['本地自提','同城约定交付','快递配送'],
  deliveryArea:pickup?['本地约定自提点','村口约定自提点']:['同城约定地点','广东省内','具体地区先与顾客确认'],
  shippingFee:pickup?['自提无运费，暂不提供配送']:['每单 6 元，不含在商品售价中','每单 8 元，不含在商品售价中','每单 10 元，不含在商品售价中','运费由买家承担，按实际费用另行确认','商品售价已含运费'],
  dispatchTime:pickup?['双方确认数量后，约定次日下午自提','双方确认数量后，另约自提时间']:['确认订单后 2 天内发货，具体送达时间以承运方为准','确认订单后 3 天内发货，具体送达时间以承运方为准','与顾客确认时间后安排交付'],
  afterSales:pickup?['自提时当面核对数量和外观，发现问题及时与卖家协商。']:['收货如有破损，请保留照片并联系卖家，核对情况后协商处理。','收到包装破损或商品不符时，请保留照片联系卖家，核对后协商处理。']
 };
 // Preserve loaded example values and the exact facts used by fixed image cards.
 const reference=d.demoCaseId==='citrus'?citrusReference:examples.find(e=>d.source==='example'&&e.id===d.id);
 return [...new Set([...(reference&&(key==='deliveryMethod'||reference.deliveryMethod===d.deliveryMethod)?[reference[key]]:[]),...values[key],d[key]].filter(Boolean))];
}
export function deliveryMethodPatch(d:ProductDraft,value:string):Partial<ProductDraft>{
 if(value===d.deliveryMethod)return {};
 return {deliveryMethod:value,deliveryArea:'',shippingFee:'',dispatchTime:'',afterSales:''};
}
