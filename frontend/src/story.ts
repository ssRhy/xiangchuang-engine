export const storyScenes = [
  {id:'orchard',title:'陈叔的贡柑',start:0,end:4},
  {id:'questions',title:'卖货前的三个问题',start:4,end:8},
  {id:'form',title:'上传照片与填资料',start:8,end:17},
  {id:'delivery',title:'选交付并确认生成',start:17,end:27},
  {id:'agents',title:'AI Agent 怎么帮忙',start:27,end:35},
  {id:'create',title:'从照片到宣传图',start:35,end:43},
  {id:'publish',title:'小红书与朋友圈',start:43,end:52},
  {id:'reply',title:'接住顾客的第一句问',start:52,end:60},
] as const;
export const storyDuration=storyScenes.at(-1)!.end;
export function clampStoryTime(value:number){return Number.isFinite(value)?Math.max(0,Math.min(storyDuration,value)):0;}
export function storySceneAt(value:number){const index=storyScenes.findIndex(scene=>clampStoryTime(value)<scene.end);return index<0?storyScenes.length-1:index;}
export function storySceneTime(index:number){return storyScenes[Math.max(0,Math.min(storyScenes.length-1,index))].end-.9;}
export function storyTypedText(value:string,time:number,start:number,end:number){return value.slice(0,Math.floor(Math.max(0,Math.min(1,(time-start)/(end-start)))*value.length));}
