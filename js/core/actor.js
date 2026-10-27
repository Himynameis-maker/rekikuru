// マス移動する全キャラの基底。サブクラスは decide(g)→[dx,dy]|null を実装。
WC.Actor=class{
 constructor(x,y,speed){Object.assign(this,{x,y,tx:x,ty:y,rx:x,ry:y,t:1,speed,dir:1,stun:0,busy:0,lv:0,abn:false,fast:false,hidden:false})}
 spd(){return this.abn||this.fast?WC.CONFIG.fall.speed:this.speed*(1+WC.CONFIG.fall.boost*this.lv)}
 go(x,y,fast=false){this.tx=x;this.ty=y;this.t=0;this.fast=fast}
 sync(){let d=this.tx-this.x;if(Math.abs(d)>1)d=d>0?-1:1; // 左右端をまたぐ移動は端の外側(-1 や w)へ連続して動く(描画側で反対側にも半身を出す)
  this.rx=this.x+d*this.t;this.ry=this.y+(this.ty-this.y)*this.t}
 settle(){if(this.t<1){if(this.t>=.5){this.x=this.tx;this.y=this.ty}this.tx=this.x;this.ty=this.y;this.t=1;this.sync()}}
 startAbn(){if(this.abn||this.hidden)return;this.settle();this.abn=true;this.fast=true;WC.Sound.play('fall')}
 arrive(g){}
 decide(g){return null}
 update(dt,g){
  if(this.stun>0){this.stun-=dt;return}
  if(this.hidden){if(this.exitAfter)this.exit(g);return}
  if(this.busy>0){this.busy-=dt;return}
  if(this.t<1){this.t=Math.min(1,this.t+dt*this.spd());this.sync();if(this.t<1)return;this.x=this.tx;this.y=this.ty;this.sync();this.arrive(g)}
  if(!this.hidden)this.next(g)}
 next(g){const L=g.level; // 落下はドラム缶にめり込まず、その上で止まる(背景側の敵は無視)
  if(this.abn){if(this.y<L.h-1&&(this.bg||!L.blocked(this.x,this.y+1)))this.go(this.x,this.y+1,true);else{ this.abn=false;this.fast=false;this.stun=WC.CONFIG.fall.stun;this.lv=Math.min(2,this.lv+1)}return}
  if(!L.standable(this.x,this.y,this.bg)&&this.y<L.h-1){this.go(this.x,this.y+1,true);return}
  const d=this.decide(g);if(d)this.go(L.wrap(this.x+d[0]),this.y+d[1])}
 // 左右端をまたぐとき、はみ出した半身を反対側の端にも描く(シームレスなループ)
 draw(c,s){if(this.hidden)return;const W=c.canvas.width/s;c.globalAlpha=this.stun>0?.5:1;
  for(const o of this.nowrap?[0]:[0,-W,W]){const px=this.rx+o;if(px>-1&&px<W)this.paint(c,s,px,this.ry)}
  c.globalAlpha=1}
 paint(c,s,px,py){WC.Gfx.draw(this.name,c,px*s,py*s,s,this)}
};
