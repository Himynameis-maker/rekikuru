// 1: 追尾。経路探索はせず、同じ水平列で見つかる梯子と直近の移動方向で判断する。
// 左右端をまたいだ経路探索は行わない。実際の移動自体は Level.wrap に従う。
WC.Enemies['1']=class extends WC.Enemy{
 constructor(x,y,n='chaser'){super(x,y,n);this.bg=false;this._chaserRecheck=true}
 // READY終了＝ゲーム開始も、追跡判定を許可するイベントとして扱う。
 onGameStart(g){this._chaserRecheck=true}
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
 // 敵と同じ高さの左側にドラム缶があれば右、なければ左を選ぶ。
 barrelFallbackDir(g){
  const L=g.level;
  const hasDrumLeft=[...L.objs.values()].some(o=>o.kind==='drum'&&o.y===this.y&&o.x<this.x);
  return hasDrumLeft?1:-1;
 }
 // 同じ高さでプレイヤーとの間にドラム缶があるかを調べる。
 drumBetweenPlayer(g){
  const L=g.level,p=g.player;
  const left=Math.min(this.x,p.x),right=Math.max(this.x,p.x);
  return p.y===this.y&&[...L.objs.values()].some(o=>o.kind==='drum'&&o.y===this.y&&o.x>left&&o.x<right);
 }
 hasLadderAtHeight(g){
  const L=g.level;
  for(let x=0;x<L.w;x++)if(L.ladder(x,this.y))return true;
  return false;
 }
 arrive(g){
  super.arrive(g);
  if(this.hidden||this.abn)return;
  const p=g.player,L=g.level;
  if(this._chaserNormalFalling&&L.standable(this.x,this.y,this.bg)){
   this._chaserNormalFalling=false;
   this._chaserRecheck=true;
   // 足場に実際に着地した瞬間だけ追跡判定を許可する。
   if(this.y===p.y)this.turnTowardPlayer(g);
  }
  // 梯子の先端の一つ上のマスに到着したイベント。
  if(L.ladder(this.x,this.y+1)&&!L.ladder(this.x,this.y)){
   this._chaserAtLadderTip=true;
   this._chaserRecheck=true;
   if(this.y===p.y)this.turnTowardPlayer(g);
  }
  // 梯子マスへの到着時だけ追跡判定を許可する。
  if(L.ladder(this.x,this.y)){
   this._chaserRecheck=true;
   if(this.y===p.y)this.turnTowardPlayer(g);
  }
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
   if(!this.abn&&!this.hidden){
    this._chaserRecheck=true;
    if(this.y===p.y)this.turnTowardPlayer(g);
   }
  }
 }
 // dir 方向の隣マスが障害物で塞がれているか。
 // ドラム缶の上から普通の足場へは上がれない。この段差も壁と同じく塞がれている扱いにする。
 obstacleAt(g,dir){
  const L=g.level,nx=L.wrap(this.x+dir);
  return !this.bg&&(L.blocked(nx,this.y)||L.onDrum(this.x,this.y)&&L.ground(nx,this.y));
 }
 // 障害物が実際に進行方向の隣マスを塞いでいる場合だけ反転する。
 reverseIfObstacle(g){if(this.obstacleAt(g,this.dir))this.dir*=-1}
 // 梯子マス(梯子の上、または梯子先端の一つ上)。ここは向きを判定し直すトリガーのマス。
 onLadderTrigger(g){
  const L=g.level;
  return L.ladder(this.x,this.y)||(!L.ladder(this.x,this.y)&&L.ladder(this.x,this.y+1));
 }
 // 追跡判定の結果としての向きを返す(this.dir は書き換えない)。cur=判定で向きが決まらない時に維持する向き。
 chooseDir(g,cur){
  const p=g.player,dy=p.y<this.y?-1:1;
  if(this.y===p.y){
   // 同じ高さでプレイヤーとの間にドラム缶があれば、プレイヤーから遠ざかる。
   // ドラム缶がなければ従来どおりプレイヤー側へ向く。
   if(this.drumBetweenPlayer(g))return p.x>this.x?-1:1;
   return p.x!==this.x?(p.x>this.x?1:-1):cur;
  }
  const dx=this.ladderAhead(g,dy);
  // プレイヤーの高さへ近づける梯子がない場合に限り、ドラム缶で向きを決める。
  if(dx===null)return this.barrelFallbackDir(g);
  return dx===0?cur:(dx>0?1:-1);
 }
 // 指定位置が、プレイヤーのいる高さへ進むために使える梯子マスかを判定する。
 // 候補として認めるのは「敵と同じ高さにある梯子」だけ。
 // 梯子の先端の一つ上は梯子そのものではないため、横方向の探索候補にはしない。
 // プレイヤーの高さへ進める梯子候補を判定する。
 // 同じ高さの梯子は上下方向へ進める場合に候補。
 // 一段下の梯子は、プレイヤーが下にいる場合だけ候補。
 // 一段上の梯子は、敵の位置から登って到達できないため候補にしない。
 helpfulLadder(g,x,y,dy){
  const L=g.level;
  const sameLevel=L.ladder(x,y);
  const oneBelow=dy>0&&L.ladder(x,y+1);
  return (sameLevel||oneBelow)&&L.canStep(x,y,0,dy,this.bg);
 }
 ladderAhead(g,dy){
  const L=g.level;
  // 現在位置からそのままプレイヤー側へ梯子を進めるなら、横方向の探索は不要。
  if(this.helpfulLadder(g,this.x,this.y,dy))return 0;
  const candidates=[];
  for(let x=0;x<L.w;x++){
   if(x===this.x||!this.helpfulLadder(g,x,this.y,dy))continue;
   const dir=x>this.x?1:-1;
   let cx=this.x,reachable=true;
   // 同じ高さを横移動して候補位置まで到達できるかを調べる。
   // 落下するかどうかは経路の可否に含めない。
   while(cx!==x){
    if(!L.canStep(cx,this.y,dir,0,this.bg)){
     reachable=false;
     break;
    }
    cx+=dir;
   }
   if(reachable)candidates.push({x,distance:Math.abs(x-this.x),dir});
  }
  if(!candidates.length)return null;
  candidates.sort((a,b)=>a.distance-b.distance||(a.dir===-1?-1:b.dir===-1?1:0));
  return candidates[0].x-this.x;
 }
 decide(g){
  const L=g.level,p=g.player;
  // 先端の一つ上に着いたら高さを判定する。支えがなければ強制的に梯子へ一マス戻る。
  if(this._chaserAtLadderTip){
   this._chaserAtLadderTip=false;
   if(!L.ground(this.x,this.y)&&!L.blocked(this.x,this.y+1)&&L.ladder(this.x,this.y+1))return[0,1];
  }
  const dy=p.y<this.y?-1:1;
  // 現在使っている梯子で上下に近づけるなら、そのまま使い続ける。
  if(this.y!==p.y&&this.helpfulLadder(g,this.x,this.y,dy))return[0,dy];
  // 追跡判定は指定イベントでのみ行う。高さが違うだけでは梯子を探し直さない。
  if(this._chaserRecheck){
   this._chaserRecheck=false;
   this.dir=this.chooseDir(g,this.dir);
  }
  // 梯子マスは向きの再判定トリガー。判定の向きが障害物に塞がれ、反転した向きで再判定しても
  // また元の向きになる場合は、反転と再判定が際限なく入れ替わる(実質ブルブル)ので、その場で止まる。
  // 毎フレーム判定し直すため再判定を予約し続け、状況が変われば(プレイヤーの移動など)自然に抜ける。
  if(this.obstacleAt(g,this.dir)&&this.onLadderTrigger(g)&&this.chooseDir(g,-this.dir)===this.dir){
   this._chaserRecheck=true;
   return null;
  }
  // 通常歩行中は現在の向きを維持する。反転は障害物に塞がれた場合だけ。
  if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.reverseIfObstacle(g);
  return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
 }
};
