import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clampStoryTime,storyDuration,storySceneAt,storyScenes,storySceneTime,storyTypedText} from './story.ts';

test('eight scenes include form operations and agent roles in one continuous 60-second timeline',()=>{
 assert.equal(storyScenes.length,8);assert.equal(storyDuration,60);
 assert.deepEqual(storyScenes.slice(2,5).map(scene=>scene.id),['form','delivery','agents']);
 for(let i=1;i<storyScenes.length;i++)assert.equal(storyScenes[i-1].end,storyScenes[i].start);
 for(let i=0;i<storyScenes.length;i++){
  assert.equal(storySceneAt(storyScenes[i].start),i);
  assert.equal(storySceneAt(storySceneTime(i)),i);
  assert.equal(storySceneAt(storyScenes[i].end-.001),i);
 }
});
test('seeking to the end keeps the last scene and out-of-range seeks stay safe',()=>{
 assert.equal(storySceneAt(60),7);assert.equal(storySceneAt(99),7);assert.equal(storySceneAt(-1),0);
 assert.equal(clampStoryTime(Infinity),0);assert.equal(clampStoryTime(NaN),0);
 assert.equal(clampStoryTime(-9),0);assert.equal(clampStoryTime(99),60);
 assert.equal(storySceneTime(-1),3.1);assert.equal(storySceneTime(99),59.1);
});
test('form text follows the playhead and can rewind without leaking future values',()=>{
 assert.equal(storyTypedText('贡柑家庭装',10,11,13),'');
 assert.equal(storyTypedText('贡柑家庭装',12,11,13),'贡柑');
 assert.equal(storyTypedText('贡柑家庭装',13,11,13),'贡柑家庭装');
 assert.equal(storyTypedText('贡柑家庭装',11,11,13),'');
 assert.equal(storyTypedText('59',22,18,19),'59');
});
