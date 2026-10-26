WC.Objects.O=class extends WC.Obj{constructor(x,y){super(x,y,'drum');this.blocks=true}};
// T: 吊りドラム缶。叩くと fallDelay 秒後にゆっくり落下。真下のプレイヤーは死亡、敵は閉じ込め。
WC.Objects.T=class extends WC.Obj{
 constructor(x,y){super(x,y,'hdrum');this.blocks=true;this.fy=y;this.st=0}
 onHit(g){if(this.st==0){this.st=1;this.t=WC.CONFIG.drum.fallDelay;WC.Sound.play('drumHit')}}
 update(dt,g){const L=g.level;
  if(this.st==1){this.t-=dt;if(this.t<=0){this.st=2;this.blocks=false;this.ty=this.y+1;while(this.ty<L.h-1&&!L.standable(this.x,this.ty))this.ty++}}
  if(this.st==2){this.fy=Math.min(this.ty,this.fy+WC.CONFIG.drum.fallSpeed*dt);
   g.actors().forEach(a=>{if(a.x==this.x&&Math.abs(a.ry-this.fy)<.7){a===g.player?g.killPlayer():a.trap()}});
   if(this.fy>=this.ty){L.del(this.x,this.y);this.y=this.ty;L.objs.set(this.x+','+this.y,this);this.blocks=true;this.st=3;WC.Sound.play('drumLand')}}}
};
