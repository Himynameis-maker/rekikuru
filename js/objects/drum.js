// O: ドラム缶。常に当たり判定あり(通行不可)。
// 下に鉄柱(I)があるドラム缶は、鉄柱を叩くと fallDelay 秒後に真下へゆっくり落下する。
// 落下中は同じ列にいるプレイヤーは死亡、敵は閉じ込め。着地したら通行不可の障害物として残る。
// 着地先に別のオブジェクトがあると割れて消える。
WC.Objects.O=class extends WC.Obj{
 constructor(x,y){super(x,y,'drum');this.blocks=true;this.fy=y;this.st=0}
 release(g){if(this.st==0){this.st=1;this.t=WC.CONFIG.drum.fallDelay;WC.Sound.play('drumHit')}}
 update(dt,g){const L=g.level;
  if(this.st==1){this.t-=dt;if(this.t<=0){this.st=2;this.blocks=false;
   this.ty=Math.min(this.y+2,L.h-1);while(this.ty<L.h-1&&!L.standable(this.x,this.ty))this.ty++}} // 鉄柱のマスは通り抜ける
  if(this.st==2){this.fy=Math.min(this.ty,this.fy+WC.CONFIG.drum.fallSpeed*dt);
   g.actors().forEach(a=>{if(a.x==this.x&&Math.abs(a.ry-this.fy)<.7){a===g.player?g.killPlayer():a.trap()}});
   if(this.fy>=this.ty){L.del(this.x,this.y);WC.Sound.play('drumLand');
    if(!L.get(this.x,this.ty)){this.y=this.ty;this.fy=this.ty;L.objs.set(this.x+','+this.y,this);this.blocks=true;this.st=3}}}}
};
