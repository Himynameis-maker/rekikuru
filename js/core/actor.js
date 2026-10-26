// マス移動する全キャラの基底。サブクラスは decide(g)→[dx,dy]|null を実装。
WC.Actor=class{
 constructor(x,y,speed){Object.assign(this,{x,y,tx:x,ty:y,rx:x,ry:y,t:1,speed,dir:1,stun:0,busy:0,lv:0,abn:false,fast:false,hidden:false})}
 spd(){return this.abn||this.fast?WC.CONFIG.fall.speed:this.speed*(1+WC.CONFIG.fall.boost*this.lv)}
 go(x,y,fast=false){this.tx=x;this.ty=y;this.t=0;this.fast=fast}
 sync(){const wr=Math.abs(this.tx-this.x)>1;
  this.rx=wr?(this.t<.5?this.x:this.tx):this.x+(this.tx-this.x)*this.t;this.ry=this.y+(this.ty-this.y)*this.t}
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
 next(g){const L=g.level;
  if(this.abn){if(this.y<L.h-1)this.go(this.x,this.y+1,true);else{this.abn=false;this.fast=false;this.stun=WC.CONFIG.fall.stun;this.lv=Math.min(2,this.lv+1)}return}
  if(!L.standable(this.x,this.y)&&this.y<L.h-1){this.go(this.x,this.y+1,true);return}
  const d=this.decide(g);if(d)this.go(L.wrap(this.x+d[0]),this.y+d[1])}
 draw(c,s){if(this.hidden)return;c.globalAlpha=this.stun>0?.5:1;WC.Gfx.draw(this.name,c,this.rx*s,this.ry*s,s,this);c.globalAlpha=1}
};
