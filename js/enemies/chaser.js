// 1: 追尾。A* / BFS は使わず、現在位置から見える梯子と直近の移動方向で判断する。
// 左右端を物理的に通過することはできるが、端をまたいだ経路探索はしない。
WC.Enemies['1']=class extends WC.Enemy{
 constructor(x,y,n='chaser'){super(x,y,n);this.bg=false}
 // 異常落下のスタンが終わった瞬間に方向を再判定する。
 update(dt,g){
  const wasStunned=this.stun>0;
  super.update(dt,g);
  if(wasStunned&&this.stun<=0&&!this.abn&&!this.hidden){
   const p=g.player;
   if(this.y===p.y)this.dir=p.x===this.x?this.dir:(p.x>this.x?1:-1);
  }
 }
 // プレイヤーの高さに近づける上下移動ができる梯子を探す。
 // 端を越えて検索しないため、左右ループを利用した経路は組み立てない。
 helpfulLadder(g,x,y,dy){
  const L=g.level;
  return L.ladder(x,y)&&L.canStep(x,y,0,dy,this.bg);
 }
 ladderAhead(g,dy){
  const L=g.level;
  // まず現在位置の梯子を優先する。
  if(this.helpfulLadder(g,this.x,this.y,dy))return 0;
  const p=g.player,dir=p.x===this.x?this.dir:(p.x>this.x?1:-1);
  // プレイヤー側へ向かう同じ高さの列だけを調べる。ループをまたいで探さない。
  for(let x=this.x+dir;x>=0&&x<L.w;x+=dir){
   if(this.helpfulLadder(g,x,this.y,dy))return x-this.x;
   if(x===p.x)break;
  }
  return null;
 }
 decide(g){
  const L=g.level,p=g.player;
  // 同じ高さなら、梯子よりもプレイヤーへ向かう横移動を優先する。
  if(this.y===p.y){
   if(p.x!==this.x)this.dir=p.x>this.x?1:-1;
   if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.dir*=-1;
   return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
  }
  // 高さが違う場合は、まずプレイヤーの高さへ近づく上下移動を試す。
  const dy=p.y<this.y?-1:1;
  if(this.helpfulLadder(g,this.x,this.y,dy))return[0,dy];
  // 今いる列で上下に進めないなら、プレイヤー側にある有効な梯子へ向かう。
  const dx=this.ladderAhead(g,dy);
  if(dx!==null&&dx!==0){
   const dir=dx>0?1:-1;
   if(L.canStep(this.x,this.y,dir,0,this.bg)){this.dir=dir;return[dir,0]}
   this.dir*=-1;
   return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
  }
  // 役立つ梯子が見つからないときは、直近の横方向を維持して歩く。
  if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.dir*=-1;
  return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
 }
};
