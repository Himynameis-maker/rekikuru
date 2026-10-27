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
 // 到着イベントだけを処理する。プレイヤーと同じ高さになっただけでは向きを変えない。
 arrive(g){
  super.arrive(g);
  if(this.hidden||this.abn)return;
  const p=g.player,L=g.level;
  if(this._chaserNormalFalling){
   this._chaserNormalFalling=false;
   if(this.y===p.y){
    // 通常落下の着地先がプレイヤーと同じ高さなら、その着地イベントでプレイヤー側へ向き直る。
    if(p.x!==this.x)this.dir=p.x>this.x?1:-1;
   }else{
    // 高さが違う場合は、有効な梯子があればそちらへ向きを合わせる。
    const dy=p.y<this.y?-1:1,dx=this.ladderAhead(g,dy);
    if(dx!==null&&dx!==0){
     const dir=dx>0?1:-1;
     if(L.canStep(this.x,this.y,dir,0,this.bg))this.dir=dir;
    }
   }
  }
  // 梯子の先端の一つ上のマスに到着した瞬間も、プレイヤーとの高さを再判定する。
  if(L.ladder(this.x,this.y+1)&&!L.ladder(this.x,this.y)){
   this._chaserAtLadderTip=true;
   if(this.y===p.y&&p.x!==this.x)this.dir=p.x>this.x?1:-1;
  }
  // 梯子のマスに到着したイベントで、同じ高さならプレイヤー側へ向き直る。
  if(L.ladder(this.x,this.y)&&this.y===p.y&&p.x!==this.x)this.dir=p.x>this.x?1:-1;
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
   if(!this.abn&&!this.hidden&&this.y===p.y&&p.x!==this.x)this.dir=p.x>this.x?1:-1;
  }
 }
 // 障害物が実際に進行方向の隣マスを塞いでいる場合だけ反転する。
 reverseIfObstacle(g){
  const L=g.level,nx=L.wrap(this.x+this.dir);
  if(!this.bg&&L.blocked(nx,this.y))this.dir*=-1;
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
  if(this.helpfulLadder(g,this.x,this.y,dy))return 0;
  const dir=p.x===this.x?this.dir:(p.x>this.x?1:-1);
  // 現在の水平列だけをプレイヤー側へ検索し、左右端を越えて探さない。
  for(let x=this.x+dir;x>=0&&x<L.w;x+=dir){
   if(this.helpfulLadder(g,x,this.y,dy))return x-this.x;
   if(x===p.x)break;
  }
  return null;
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
   if(L.canStep(this.x,this.y,dir,0,this.bg)){this.dir=dir;return[dir,0]}
   // 実際に障害物が塞いでいる場合だけ反転する。段差などの制限では向きを保つ。
   if(!this.bg&&L.blocked(L.wrap(this.x+dir),this.y))this.dir=-dir;
   return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
  }
  // 有効な梯子が見つからない場合は直近の水平方向を維持する。
  if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.reverseIfObstacle(g);
  return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
 }
};
