// npm run test:e2e … 実ブラウザ(playwright + chromium)での確認。無ければスキップする。
//   準備: npm i -D playwright && npx playwright install chromium
const path=require('path');
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('playwright が無いのでスキップ(npm i -D playwright && npx playwright install chromium)');process.exit(0)}
const url='file://'+path.resolve(__dirname,'..','index.html');
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('  FAIL '+m)}else console.log('  PASS '+m)};
(async()=>{
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:760,height:900}}),errs=[];
 p.on('pageerror',e=>errs.push(e.message));
 await p.goto(url);
 const lit=()=>p.evaluate(()=>{const c=document.getElementById('cv'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]|d[i+1]|d[i+2])n++;return n});
 const mode=()=>p.evaluate(()=>document.body.className);

 console.log('ゲームオーバー後にもう一度プレイしても画面が真っ暗にならない(過去のバグ)');
 await p.evaluate(()=>WC.Editor.load(['   ','P1W','===','   '].join('\n')));   // 敵がすぐ当たるステージ
 for(let r=1;r<=3;r++){
  await p.click('#bPlay',{timeout:3000});await p.waitForTimeout(1200);
  ok(await mode()=='play'&&await lit()>0,`${r}回目: プレイ画面が描画されている`);
  for(let i=0;i<150&&await mode()!='title';i++)await p.waitForTimeout(200);
  ok(await mode()=='title','ゲームオーバーでタイトルへ戻る');
 }

 console.log('エディタ: 左右端の足場は消しても残る / 全消しでエラーが出ない');
 await p.evaluate(()=>WC.Editor.load(['          ','          ','P===  ===W','====O=====','          '].join('\n')));
 await p.click('#bEdit');
 const floorAt=(cx,cy)=>p.evaluate(([cx,cy])=>{const d=document.getElementById('cv').getContext('2d').getImageData(cx*32+12,cy*32+30,1,1).data;return d[1]>140&&d[0]<80},[cx,cy]);
 await p.evaluate(()=>[...document.querySelectorAll('#palette button')].pop().click());   // 最後=消しゴム
 const box=await p.locator('#cv').boundingBox(),cw=box.width/10,ch=box.height/5;
 for(const cx of [0,9])for(let cy=0;cy<5;cy++)await p.mouse.click(box.x+cw*(cx+.5),box.y+ch*(cy+.5));
 ok(await floorAt(0,1)&&await floorAt(9,1)&&await floorAt(0,4),'端を消しても足場が全段に残っている');
 await p.click('#bClear');await p.waitForTimeout(100);
 ok(await floorAt(0,0)&&await floorAt(9,3),'全消し後も端の足場が残っている');

 ok(errs.length==0,'ページエラーなし '+JSON.stringify(errs));
 await b.close();console.log(fails?`\n${fails} 件失敗`:'\n全部OK');process.exit(fails?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
