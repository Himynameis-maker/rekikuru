// 1: 追尾。経路探索はせず、同じ水平列で見つかる梯子と直近の移動方向で判断する。
// 左右端をまたいだ経路探索は行わない。実際の移動自体は Level.wrap に従う。
WC.Enemies['1']=class extends WC.Enemy{
 constructor(x,y,n='chaser'){super(x,y,n);this.bg=false}
 // 落下開始を明示的に記録する。Actor.fast は通常落下後も残るため、
 // fast だけで着地を判定すると、その後の横移動でも落下後処理が誤発火する。
 next(g){
  const L=g.level;
  const startsNormalFall=!this.abn&&!this.hidden&&!L.standable(this.x,this.y,this.bg)&&this.y<L.h-1;
  if(startsNormalFall)this._chaserNormalFalling=true;
  super.next(g);
 }
 // 向きの変更は、着地・梯子到着などの到着イベント内だけで行う。
 // decide() は歩行中の向きを変更せず、次の移動先だけを返す。
 turnTowardPlayer(g){
  const p=g.player;
  if(p.x!==this.x)this.dir=p.x>this.x?1:-1;
 }
 arrive(g){
  super.arrive(g);
  if(this.hidden||this.abn)return;
  const p=g.player,L=g.level;
  if(this._chaserNormalFalling){
   this._chaserNormalFalling=false;
   if(this.y===p.y){
    // 通常落下の着地イベントで、同じ高さならプレイヤー側へ向き直る。
    this.turnTowardPlayer(g);
   }else{
    // 着地イベントでは向きを変えず、次の正規の判断タイミングまで現在の向きを保つ。
    // 梯子の選択は decide() が行うが、梯子が後方でも歩行中に反転しない。
   }
  }
  // 梯子の先端の一つ上のマスに到着したイベント。
  if(L.ladder(this.x,this.y+1)&&!L.ladder(this.x,this.y)){
   this._chaserAtLadderTip=true;
   if(this.y===p.y)this.turnTowardPlayer(g);
   else if(p.x!==this.x){
    // 高さが違う場合、別の梯子がないことだけを理由に方向転換しない。
    // 後方の梯子を目指す場合も、障害物など正規の反転地点まで現在の向きを保つ。
   }
  }
  // 梯子のマスに到着したイベントで、同じ高さならプレイヤー側へ向き直る。
  if(L.ladder(this.x,this.y)&&this.y===p.y)this.turnTowardPlayer(g);
 }
 // この敵自身が異常落下を始めた場合に限り、スタン復帰時の再判定を有効にする。
 startAbn(){
  if(!this.abn&&!this.hidden)this._chaserFallStun=true;
  super.startAbn();
 }
 update(dt,g){
  const wasStunned=this.stun>0;
  super.update(dt,g);
  const p=g.player;
  if(wasStunned&&this.stun<=0&&this._chaserFallStun){
   this._chaserFallStun=false;
   if(!this.abn&&!this.hidden&&this.y===p.y)this.turnTowardPlayer(g);
  }
 }
 // 障害物が実際に進行方向の隣マスを塞いでいる場合だけ反転する。
 reverseIfObstacle(g){
  const L=g.level,nx=L.wrap(this.x+this.dir);
  // ドラム缶の上から普通の足場へは上がれない。この段差も壁と同じく反転理由にする。
  if(!this.bg&&(L.blocked(nx,this.y)||L.onDrum(this.x,this.y)&&L.ground(nx,this.y)))this.dir*=-1;
 }
 helpfulLadder(g,x,y,dy){
  const L=g.level;
  // 通常の梯子上に加え、先端の一つ上から梯子へ降りる移動も有効とする。
  const onLadder=L.ladder(x,y);
  const aboveLadder=!onLadder&&L.ladder(x,y+1);
  return (onLadder||aboveLadder)&&L.canStep(x,y,0,dy,this.bg);
 }
 ladderAhead(g,dy){
  const L=g.level,p=g.player;
  // 現在地の梯子・先端上で上下移動できるなら、別の梯子を探さない。
  if((L.ladder(this.x,this.y)||(!L.ladder(this.x,this.y)&&L.ladder(this.x,this.y+1)))&&L.canStep(this.x,this.y,0,dy,this.bg))return 0;
  // 梯子の途中の横から上段へ登れる場合。検索時は左右端を越えて反対側へ回り込まない。
  if(dy<0&&!L.ladder(this.x,this.y)&&!L.ladder(this.x,this.y+1)&&L.canStep(this.x,this.y,0,dy,this.bg)){
   const sides=[-1,1].filter(d=>this.x+d>=0&&this.x+d<L.w&&L.ladder(this.x+d,this.y));
   if(sides.length){
    const preferred=p.x===this.x?this.dir:(p.x>this.x?1:-1);
    return sides.includes(preferred)?preferred:sides[0];
   }
  }
  // 高さを一段でもプレイヤー側へ近づけられる梯子を、歩いて到達できる範囲から探す。
  // 候補探索では x=0 と x=L.w-1 を壁として扱い、Level.wrap() による迂回はしない。
  const candidates=[];
  for(let x=0;x<L.w;x++){
   if(x===this.x||!this.helpfulLadder(g,x,this.y,dy))continue;
   const dir=x>this.x?1:-1;
   let cx=this.x,reachable=true;
   while(cx!==x){
    const nx=cx+dir;
    if(nx<0||nx>=L.w||!L.canStep(cx,this.y,dir,0,this.bg)){reachable=false;break}
    // 横移動後に落下するマスは「歩いて到達できる同じ足場」の候補に含めない。
    const next=L.dest(cx,this.y,dir,0,this.bg);
    if(!next||next[0]!==nx||next[1]!==this.y){reachable=false;break}
    cx=nx;
   }
   if(reachable)candidates.push({x,distance:Math.abs(x-this.x),dir});
  }
  if(!candidates.length)return null;
  const towardPlayer=p.x===this.x?this.dir:(p.x>this.x?1:-1);
  candidates.sort((a,b)=>a.distance-b.distance||(a.dir===towardPlayer?-1:b.dir===towardPlayer?1:0));
  return candidates[0].x-this.x;
 }
 decide(g){
  const L=g.level,p=g.player;
  // 先端の一つ上に着いたら高さを判定する。支えがなければ強制的に梯子へ一マス戻る。
  if(this._chaserAtLadderTip){
   this._chaserAtLadderTip=false;
   if(!L.ground(this.x,this.y)&&!L.blocked(this.x,this.y+1)&&L.ladder(this.x,this.y+1))return[0,1];
  }
  if(this.y===p.y){
   // 高さが同じという理由だけでは方向転換しない。梯子到着時の判定は arrive() が担当。
   if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.reverseIfObstacle(g);
   return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
  }
  const dy=p.y<this.y?-1:1;
  if(this.helpfulLadder(g,this.x,this.y,dy))return[0,dy];
  const dx=this.ladderAhead(g,dy);
  if(dx!==null&&dx!==0){
   const dir=dx>0?1:-1;
   // 高さが変わっただけでは歩行中に反転しない。
   // 選んだ梯子が現在の進行方向にある場合だけ、そのまま向かって進む。
   // 梯子が後方なら現在の向きを維持し、障害物など正規の反転地点で向きを変える。
   if(dir===this.dir&&L.canStep(this.x,this.y,dir,0,this.bg))return[dir,0];
   if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.reverseIfObstacle(g);
   return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
  }
  // 有効な梯子が見つからない場合は直近の水平方向を維持する。
  if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.reverseIfObstacle(g);
  return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
 }
};
