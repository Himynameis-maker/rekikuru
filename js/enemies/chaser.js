// 1: 追尾。経路探索はせず、同じ水平列で見つかる梯子と直近の移動方向で判断する。
// 左右端をまたいだ経路探索は行わない。実際の移動自体は Level.wrap に従う。
WC.Enemies['1']=class extends WC.Enemy{
 constructor(x,y,n='chaser'){super(x,y,n);this.bg=false}
 // 梯子のマスに到着したイベントでのみ、同じ高さならプレイヤー側へ向き直る。
 arrive(g){
  super.arrive(g);
  if(this.hidden||this.abn)return;
  const p=g.player,L=g.level;
  if(L.ladder(this.x,this.y)&&this.y===p.y&&p.x!==this.x)this.dir=p.x>this.x?1:-1;
 }
 // 異常落下のスタンから復帰した瞬間だけ方向を再判定する。
 update(dt,g){
  const wasStunned=this.stun>0;
  super.update(dt,g);
  const p=g.player;
  if(wasStunned&&this.stun<=0&&!this.abn&&!this.hidden&&this.y===p.y&&p.x!==this.x){
   this.dir=p.x>this.x?1:-1;
  }
 }
 helpfulLadder(g,x,y,dy){
  const L=g.level;
  return L.ladder(x,y)&&L.canStep(x,y,0,dy,this.bg);
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
  if(this.y===p.y){
   // 高さが同じという理由だけでは方向転換しない。梯子到着時の判定は arrive() が担当。
   if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.dir*=-1;
   return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
  }
  const dy=p.y<this.y?-1:1;
  if(this.helpfulLadder(g,this.x,this.y,dy))return[0,dy];
  const dx=this.ladderAhead(g,dy);
  if(dx!==null&&dx!==0){
   const dir=dx>0?1:-1;
   if(L.canStep(this.x,this.y,dir,0,this.bg)){this.dir=dir;return[dir,0]}
   // 梯子へ向かう方向が障害物で塞がれている場合は、その反対へ向き直る。
   this.dir=-dir;
   return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
  }
  // 有効な梯子が見つからない場合は直近の水平方向を維持する。
  if(!L.canStep(this.x,this.y,this.dir,0,this.bg))this.dir*=-1;
  return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
 }
};
