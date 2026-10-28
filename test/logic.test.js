// npm test … ゲームロジックのテスト(依存なし)。仕様(docs/SPEC.md)をそのまま検証する。
const {load}=require('./harness');
let WC,fails=0,count=0;
const ok=(c,m)=>{count++;if(!c){fails++;console.log('  FAIL '+m)}};
const test=(name,fn)=>{WC=load();console.log(name);try{fn()}catch(e){fails++;console.log('  ERROR '+(e.stack||e))}};

// ---- ヘルパー ----
// 壊すもの(壁)が1つも無いとクリア扱いで止まるので、テスト用ステージには壁を置くこと。
const mk=rows=>{const g=new WC.Game(rows.join('\n'));g.keys={};g.state='play';g.timers=[];g.enemies=[];return g};
const run=(g,sec,keys)=>{if(keys)g.keys=keys;for(let i=0;i<Math.round(sec*60);i++)g.update(1/60);g.keys={}};
// x のマスに止まるまで歩く(到着の瞬間に次の一歩を決めるので、目的地へ向かう一歩の間だけキーを押す)
const goTo=(g,x)=>{let n=0;while(!(g.player.x==x&&g.player.t>=1)&&n++<3000){g.keys=g.player.tx<x?{right:true}:g.player.tx>x?{left:true}:{};g.update(1/60)}g.keys={}};
const hit=g=>{g.keys={hit:true};g.update(1/60);g.keys={}};
const objs=g=>[...g.level.objs.values()];
const put=(a,x,y)=>{a.x=a.tx=a.rx=x;a.y=a.ty=a.ry=y};
const allEdges=L=>{for(let y=0;y<L.h;y++)if(!L.floor[y][0]||!L.floor[y][L.w-1])return false;return true};

test('鉄柱の上のドラム缶: 鉄柱の地面に落ちる/鉄柱は壊れる/地面は残る',()=>{
 let g=mk(['         ','   O     ','P==I====W','         ','=========','         ','=========','         ']);
 goTo(g,3);hit(g);
 ok(!objs(g).find(o=>o.kind=='iron'),'叩くと鉄柱が壊れる');
 ok(g.level.floor[2][3],'鉄柱のマスの地面は残る');
 g.keys={right:true};run(g,.5);run(g,2);
 const d=objs(g).find(o=>o.kind=='drum');
 ok(d&&d.x==3&&d.y==2&&d.st==3,'ドラム缶は鉄柱の地面(3,2)に着地(1つ下の段ではない)');
 ok(d&&d.blocks,'着地したドラム缶は通行止め');ok(g.state=='play','離れていれば無事');
 g=mk(['         ','   O     ','P==I====W','         ','=========','         ']);
 goTo(g,3);hit(g);run(g,1.5);ok(g.state=='dead'||g.state=='ready','落下地点に残ると死ぬ');
});
test('鉄柱の上の壁: 落ちて残る/無害/壊せる',()=>{
 const g=mk(['         ','   W     ','P==I====W','         ','=========','         ']);
 ok(g.level.floor[1][3]===false,'鉄柱の上の壁は自前の地面を持たない');
 goTo(g,3);hit(g);run(g,2);
 const w=objs(g).find(o=>o.kind=='wall'&&o.x==3);
 ok(w&&w.y==2&&w.st==3,'壁は(3,2)に着地');ok(g.state=='play','落ちる壁は無害');ok(!g.level.blocked(3,2),'壁は通行を妨げない');
 goTo(g,3);hit(g);ok(!objs(g).find(o=>o.kind=='wall'&&o.x==3),'着地した壁は壊せる');
});
test('梯子: 自動足場を作らず、壊しても既存の地面だけ残る',()=>{
 const g=mk(['         ','  ====== ','     L   ','     L   ','  ====== ','         ','W        ']);
 ok(!g.level.floor[2][5]&&!g.level.floor[3][5],'梯子マス自体には自動足場を作らない');
 objs(g).filter(o=>o.isLadder)[0].brk(g);run(g,1);
 ok(objs(g).filter(o=>o.isLadder).length==0,'連鎖して全部壊れる');
 ok(g.level.floor[1][5]&&g.level.floor[4][5],'明示的に置いた上下の足場は残る');
});
test('親方: ドラム缶をすり抜けず、上に乗れる',()=>{
 let g=mk(['          ','          ','  3O====W ','==========']);
 const e=new WC.Enemies['3'](2,2);g.enemies=[e];put(g.player,0,2);
 e.dir=1;run(g,1);
 ok(e.x!==3,'親方は横からドラム缶を通り抜けない');
 g=mk(['          ','          ','   O====W ','==========','          ']);
 const f=new WC.Enemies['3'](3,0);g.enemies=[f];put(g.player,0,3);
 run(g,1);
 ok(f.y===1&&f.x===3,'親方は落下してドラム缶の一つ上に乗る');
});
test('ドラム缶: 通行止め/めり込まない/異常落下でも止まる',()=>{
 let g=mk(['         ','         ','P==O====W','         ','=========','         ']);
 run(g,2,{right:true});ok(g.player.x==2,'横から入れない');
 g=mk(['         ','         ','    O   W','         ','=========','         ']);
 put(g.player,4,0);run(g,1);ok(!(g.player.x==4&&g.player.y==2),'上から落ちてもめり込まない(上に立つ)');
 g=mk(['         ','         ','   O    W','=========','         ','=========','         ']);
 put(g.player,3,0);g.player.startAbn();run(g,1);ok(!(g.player.x==3&&g.player.y>=2),'異常落下はドラム缶を突き抜けない');
});
test('段差: ドラム缶の上から足場へ上がれない(詰み)/片側が空いていれば出られる/同じ高さは渡れる',()=>{
 const pit=['          ','          ','P=== ====W','====O=====','          '];
 let g=mk(pit);goTo(g,4);ok(g.player.x==4&&g.player.y==2,'ドラム缶の上に立つ(降りるのは可)');
 run(g,3,{left:true});ok(g.player.x==4,'左の足場へ上がれない');
 run(g,3,{right:true});ok(g.player.x==4,'右の足場へ上がれない');
 run(g,1,{up:true});run(g,1,{down:true});ok(g.player.x==4&&g.player.y==2,'梯子が無ければ縦にも出られない=詰み');
 g=mk(['          ','          ','P===  ===W','====O=====','          ']);goTo(g,4);
 run(g,.4,{right:true});ok(g.player.x>=5&&g.player.y==3,'片側が空いていれば歩いて落ちて出られる');
 g=mk(['           ','           ','P===  ====W','====OO=====','           ']);goTo(g,4);
 run(g,1,{right:true});ok(g.player.x==5&&g.player.y==2,'隣のドラム缶の上へは渡れる(同じ高さ)');
 g=mk(pit);const e=new WC.Enemies['1'](4,2);g.enemies=[e];put(g.player,0,2);g.killPlayer=()=>{};
 run(g,3);ok(e.x==4&&e.y==2,'敵も同じ段差で詰む');
});
test('左右端の足場は全段・消せない',()=>{
 ok(allEdges(new WC.Level(['          ','    L     ','P   L    W','    L     ','          '].join('\n'))),'端の文字が空白でも全段が地面');
 ok(allEdges(new WC.Level(WC.Levels.sample)),'サンプルステージも');
 ok(new WC.Level('     \n     ').floor[0][2]===false,'内側の空白は地面ではない(端だけ特別)');
});
test('左右ループ: 連続して動く/またいで当たる/火の玉はループしない',()=>{
 let g=mk(['          ','          ','P===  ====','          ','==========','          ']);
 g.level.objs.set('9,2',new WC.Objects.W(9,2));
 let prev=null,maxJump=0,minRx=9;g.keys={left:true};
 for(let i=0;i<60;i++){g.update(1/60);const rx=g.player.rx;minRx=Math.min(minRx,rx);
  if(prev!=null){let d=Math.abs(rx-prev);d=Math.min(d,g.level.w-d);maxJump=Math.max(maxJump,d)}prev=rx}
 ok(minRx<=-.5,'端の外(rx<0)まで連続して動く');ok(maxJump<.2,'1フレームの移動が小さい(ワープしない)');
 const ch=new WC.Enemies['1'](9,2);g.player.rx=-.4;ch.rx=9;ok(g.near(g.player,ch)<.65,'端をまたいで接触判定');
 const fb=new WC.Fireball(0,2,1);fb.rx=-.3;g.player.rx=9;ok(g.near(fb,g.player)>.65,'火の玉はループしない');
});
test('追尾敵: 有効な梯子がない時はプレイヤー方向に関係なく現在の向きを維持する',()=>{
 for(const Enemy of [WC.Enemies['1'],WC.Enemies['3']]){
  const g=mk(['          ','  ======W ','  H       ','==========']);
  const e=new Enemy(2,1);g.enemies=[e];put(g.player,7,0);put(e,2,1);e.dir=-1;
  e.arrive(g);
  const d=e.decide(g);
  ok(e.dir===-1,'有効な梯子がないのでプレイヤーが右にいても左向きを維持する');
  ok(d&&d[0]===-1,'現在の向きに歩き続ける');
 }
});
test('追尾敵: 複数の有効な梯子がある時は敵自身に最も近い梯子を選ぶ',()=>{
 const g=mk(['          ','          ','==========','          ']);
 const e=new WC.Enemies['1'](5,2);put(e,5,2);put(g.player,9,0);
 // 梯子探索の候補条件だけを固定し、距離の優先順位を独立して検証する。
 e.helpfulLadder=(game,x,y,dy)=>x===3||x===8;
 g.level.ladder=()=>false;
 g.level.canStep=()=>true;
 g.level.dest=(x,y,dx,dy)=>[x+dx,y];
 const dx=e.ladderAhead(g,-1);
 ok(dx===-2,'敵から2マスの左梯子を、3マス先の右梯子より優先する');
 // 左右同距離なら、左にドラム缶があっても左梯子を選ぶ。
 put(e,5,2);put(g.player,9,0);
 e.helpfulLadder=(game,x,y,dy)=>x===3||x===7;
 g.level.objs.set('2,2',{kind:'drum',x:2,y:2});
 const tiedLeftDrum=e.ladderAhead(g,-1);
 ok(tiedLeftDrum===-2,'左にドラム缶があっても同距離なら左梯子を選ぶ');
 // ドラム缶が敵の右側でも同じく左梯子を選ぶ。
 g.level.objs.delete('2,2');
 g.level.objs.set('8,2',{kind:'drum',x:8,y:2});
 const tiedRightDrum=e.ladderAhead(g,-1);
 ok(tiedRightDrum===-2,'右にドラム缶があっても同距離なら左梯子を選ぶ');
});
test('ドラム缶上の敵: 足場へ上がれずぶつかったら反転する',()=>{
 const g=mk(['          ','          ','====  == W','====O=====','W         ']);
 for(const Enemy of [WC.Enemies['1'],WC.Enemies['2'],WC.Enemies['3'],WC.Enemies['4']]){
  const e=new Enemy(4,2);put(e,4,2);e.dir=-1;
  if(Enemy===WC.Enemies['2'])e.vertical=1;
  const d=e.decide(g);
  ok(e.dir===1&&d&&d[0]===1,'ドラム缶上で足場に阻まれたら反転して進む');
 }
});
test('直進敵: 縦移動は一段だけ。次は横を優先し、逆向きしかなければ切り替える',()=>{
 let g=mk(['          ','  H       ','  H       ','  H       ','==========']);
 let e=new WC.Enemies['2'](2,1);g.enemies=[e];put(e,2,1);
 ok(e.vertical===null,'初期状態では上下傾向が未確定');
 let d=e.decide(g);ok(d&&d[0]===0&&d[1]===1,'梯子を実際に下る移動を選ぶ');
 ok(e.vertical===1,'初回に下った時点で下り傾向が決まる');
 d=e.decide(g);ok(d&&d[0]===1&&d[1]===0,'縦に一段移動した次は、梯子があっても横へ進む');
 e.horizontalNext=false;put(e,2,3);d=e.decide(g);ok(d&&d[0]===0&&d[1]===-1,'下り梯子がなく上り梯子だけなら上る');
 ok(e.vertical===-1,'逆向きに上った後は上り傾向へ切り替わる');
 WC.Editor.runnerDir=-1;const left=new WC.Enemies['2'](2,3);WC.Editor.runnerDir=1;const right=new WC.Enemies['2'](2,3);
 ok(left.dir===-1&&right.dir===1,'ステージ全体の開始方向設定が直進敵に適用される');
});
test('追尾と親方: 通常落下の着地時にプレイヤーと同じ高さならプレイヤー側へ歩く',()=>{
 for(const Enemy of [WC.Enemies['1'],WC.Enemies['3']]){
  const g=mk(['          ','  1       ','          ','P========W','          ']);
  const e=new Enemy(2,1);g.enemies=[e];g.killPlayer=()=>{};
  put(g.player,7,3);put(e,2,1);
  run(g,1.5);
  ok(e.y===3,'通常落下してプレイヤーと同じ高さに着地する');
  ok(e.dir===1,'着地イベントでプレイヤー側(右)を向く');
 }
});
test('裏側の敵(親方)に殴られたら異常落下でミスではない',()=>{
 const g=mk(['         ','         ','P==3====W','         ','=========','         ','=========','         ']);
 g.enemies=g.level.spawns.map(s=>new s.E(s.x,s.y));
 const lives=g.lives;let fell=false;
 for(let i=0;i<60*6;i++){g.update(1/60);if(g.player.abn)fell=true}
 ok(fell,'異常落下した');ok(g.lives==lives&&g.state!='dead','残機は減らない');ok(g.player.y>2,'下の段へ落ちた');
});
test('火の玉: 床の多い段すべてに出る/当たるとミス',()=>{
 const L=new WC.Level(WC.Levels.sample);ok(L.fireRows().length>=4,'サンプルで複数の段');
 const g=new WC.Game(WC.Levels.sample);g.keys={};g.killPlayer=()=>{};const rows={};
 for(let i=0;i<60*65;i++){g.update(1/60);for(const e of g.enemies)if(e.name=='fireball'&&!e.seen){e.seen=1;rows[e.y]=1}}
 ok(Object.keys(rows).length>=2,'複数の段に出現した');
 const g3=new WC.Game(WC.Levels.sample);g3.keys={};g3.enemies=[];g3.state='play';g3.timers=[];
 put(g3.player,10,8);g3.enemies.push(new WC.Fireball(0,8,1));for(let i=0;i<360&&g3.state=='play';i++)g3.update(1/60);
 ok(g3.state=='dead','同じ段のプレイヤーに当たるとミス');
});
test('親方: 壁を完全破壊した時だけ互いを異常落下させ、爆弾は叩かない',()=>{
 let g=mk(['          ','          ','P w====W  ','==========']);
 let e=new WC.Enemies['3'](2,2);g.enemies=[e];put(g.player,0,2);
 g.hit(2,2,g.player);
 ok(!e.abn,'耐久2の壁を一撃で壊せない間は親方を落とさない');
 g.level.del(2,2);
 g.level.objs.set('2,2',new WC.Objects.W(2,2));
 g.level.get(2,2).hp=1;
 g.hit(2,2,g.player);
 ok(e.abn,'壁を完全破壊した一振りで親方が異常落下する');
 g=mk(['          ','          ','P B====W  ','==========']);
 e=new WC.Enemies['3'](2,2);g.enemies=[e];put(g.player,0,2);
 g.hit(2,2,g.player);
 ok(!e.abn&&g.level.get(2,2).lit,'爆弾を叩いても親方は落下しない');
});
test('親方: ハンマーで完全破壊した時だけプレイヤーを異常落下させ、落下後にスタンしない',()=>{
 const g=mk(['          ','          ','P W====W  ','==========']);
 const e=new WC.Enemies['3'](2,2);g.enemies=[e];put(g.player,2,2);
 e.decide(g);
 run(g,.55);
 ok(g.player.abn,'親方が壁を完全破壊したらプレイヤーは異常落下する');
 run(g,1);
 ok(!g.player.abn&&g.player.stun===0,'プレイヤーは着地後にスタンしない');
 const h=mk(['          ','          ','P W====W  ','==========']);
 const f=new WC.Enemies['3'](2,2);h.enemies=[f];put(h.player,0,2);
 f.startAbn();run(h,2);
 ok(!f.abn&&f.stun===0,'親方も着地後にスタンしない');
});
test('爆弾: 横方向は破壊成立時だけ0.2秒間隔で連鎖し、鉄も消える',()=>{
 const g=mk(['          ','          ','PBWIW    W','==========','          ']);
 const b=g.level.get(1,2),iron=g.level.get(3,2);
 ok(!!b&&!!iron,'爆弾と鉄柱が配置されている');
 const clearBefore=objs(g).filter(o=>o.needsBreak).length;
 b.light(0,false);b.update(1,g);
 ok(!g.level.get(2,2),'最初の壁は起爆時に破壊される');
 ok(g.level.get(3,2)===iron&&!!g.level.get(4,2),'隣の鉄と壁は間隔待ちで残る');
 ok(g.timers.length===1,'次の破壊までタイマーを一つ予約する');
 g.timers.shift().fn();
 ok(!g.level.get(3,2)&&!!g.level.get(4,2),'次の間隔で鉄柱が消え、さらに隣の壁は待つ');
 ok(g.timers.length===1,'鉄の破壊後も次の間隔を予約する');
 g.timers.shift().fn();
 ok(!g.level.get(4,2),'さらに0.2秒後に隣の壁も破壊される');
 ok(!iron.needsBreak,'鉄柱は破壊可能だがクリア条件の数には含めない');
 ok(objs(g).filter(o=>o.needsBreak).length===clearBefore-2,'破壊された壁だけクリア対象数が減る');
});
test('梯子の横から一段上の実在する足場へ移動でき、梯子先端に自動足場を作らない',()=>{
 const game=mk(['          ','   H=     ','   H      ','   H      ','==========']);
 const L=game.level;
 ok(!L.floor[1][3]&&L.floor[3][3],'上端に足場を作らず、下端には自動足場を作る');
 ok(L.ground(4,1),'明示的に置いた足場は地面として扱う');
 ok(L.canStep(4,2,0,-1),'梯子の横のマスから上の実在する足場へ登れる');
});
test('ランダム操作で壊れない(例外・不正な位置が出ない)',()=>{
 const K=['left','right','up','down','hit'];
 for(let n=0;n<40;n++){const g=new WC.Game(WC.Levels.sample);let done=false;g.onOver=g.onClear=()=>done=true;let cur={};
  for(let i=0;i<60*60&&!done;i++){if(i%12==0){cur={};cur[K[Math.random()*5|0]]=true;cur[K[Math.random()*5|0]]=true}
   g.keys=cur;g.update(1/60);
   for(const a of g.actors()){if(a.t>=1&&!a.bg&&a.name!='fireball'&&!a.abn&&g.level.blocked(a.x,a.y)){ok(false,`${a.name} が通行止めオブジェクトの中にいる (${a.x},${a.y})`);return}
    if(!isFinite(a.rx)||!isFinite(a.ry)){ok(false,'座標がNaN');return}}}}
 ok(true,'40ゲーム');
});
test('エディタの全パレットが読み込める',()=>{
 for(const t of WC.TOOLS)if(t.ch!==' '&&t.ch!=='='){const L=new WC.Level('  '+t.ch+'  \n=====');ok(L.objs.size>0||L.spawns.length>0||L.player.x==2,`${t.n}(${t.ch})`)}
});
test('追尾敵: 高さが違うだけでは梯子を探し直さず、指定イベント時だけ再判定する',()=>{
 const g=mk(['          ','          ','P=======W ','==========']);
 const e=new WC.Enemies['1'](4,2);g.enemies=[e];put(g.player,1,0);put(e,4,2);e.dir=1;
 let searches=0;
 e.helpfulLadder=()=>false;
 e.ladderAhead=()=>{searches++;return -2};
 e._chaserRecheck=false;
 const ordinary=e.decide(g);
 ok(searches===0,'通常歩行中は梯子探索を呼ばない');
 ok(e.dir===1&&ordinary&&ordinary[0]===1,'高さが違っても現在の右向きを維持する');
 e._chaserRecheck=true;
 const triggered=e.decide(g);
 ok(searches===1,'指定イベント後だけ梯子を再探索する');
 ok(e.dir===-1&&triggered&&triggered[0]===-1,'再判定で有効な梯子の方向へ向く');
});
test('追尾敵: 梯子マスで「判定→ドラム缶で反転→再判定」が往復する時は、その場で止まる',()=>{
 // 梯子の上端マス(4,1)。左(2,1)に離れたドラム缶があるので判定は右、右隣(5,1)もドラム缶で塞がれ反転→また右、の繰り返し。
 const rows=['P========','  O==O   ','    L    ','====W===='];
 let g=mk(rows);let e=new WC.Enemies['1'](4,1);g.enemies=[e];put(g.player,0,0);e._chaserRecheck=true;
 const seen=new Set();for(let i=0;i<240;i++){g.update(1/60);seen.add(e.x+','+e.y)}
 ok(seen.size===1&&e.x===4&&e.y===1,'梯子マスから一歩も動かない(左へ動き出さない)');
 // 左にドラム缶が無ければ往復にならないので、普通に左へ歩く
 g=mk(['P========','   ==O   ','    L    ','====W=====']);e=new WC.Enemies['1'](4,1);g.enemies=[e];put(g.player,0,0);e._chaserRecheck=true;
 for(let i=0;i<60;i++)g.update(1/60);
 ok(e.x!==4||e.y!==1,'往復にならない配置では止まらない');
 // 梯子の無いマスでは従来どおりドラム缶で反転して歩く
 g=mk(['P========','  O==O   ','         ','====W=====']);e=new WC.Enemies['1'](4,1);g.enemies=[e];put(g.player,0,0);e._chaserRecheck=true;
 for(let i=0;i<60;i++)g.update(1/60);
 ok(e.x!==4,'梯子マスでなければ止まらない(従来どおり反転して歩く)');
});
console.log(fails?`\n${fails} 件失敗 / ${count} 件`:`\n全部OK (${count} 件)`);process.exit(fails?1:0);
