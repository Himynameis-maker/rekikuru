// ステージ上オブジェクト基底。blocks=通行止め needsBreak=クリア条件 onHit=ハンマー onBlast=爆風
WC.Obj=class{constructor(x,y,kind){this.x=x;this.y=y;this.kind=kind}};

// 鉄柱(I)の上に載せられるオブジェクト(ドラム缶・壁)の共通処理。
// 鉄柱が壊されると fallDelay 秒後に落下を始め、「鉄柱が立っていた地面」まで落ちて、そのマスに残る。
// 着地先に別のオブジェクトがあると割れて消える。落下中に重なったキャラへの効果は crush() で決める。
// st: 0=載っている 1=落下待ち 2=落下中 3=着地済み
WC.Load=class extends WC.Obj{
 constructor(x,y,kind){super(x,y,kind);this.fy=y;this.st=0;this.solid=false}
 release(g){if(this.st==0){this.st=1;this.t=WC.CONFIG.drum.fallDelay;WC.Sound.play('drumHit')}}
 groundY(L){let y=this.y+1;while(y<L.h-1&&!L.floor[y][this.x])y++;return y}
 crush(g,a){}
 update(dt,g){const L=g.level;
  if(this.st==1){this.t-=dt;if(this.t>0)return;this.st=2;this.blocks=false;this.ty=this.groundY(L)}
  if(this.st!=2)return;
  this.fy=Math.min(this.ty,this.fy+WC.CONFIG.drum.fallSpeed*dt);
  g.actors().forEach(a=>{if((a.x==this.x||(a.t<1&&a.tx==this.x))&&Math.abs(a.ry-this.fy)<.7)this.crush(g,a)});
  if(this.fy<this.ty)return;
  L.del(this.x,this.y);
  if(L.get(this.x,this.ty)){this.st=4;return}
  this.y=this.ty;this.fy=this.ty;L.objs.set(this.x+','+this.y,this);this.blocks=this.solid;this.st=3;WC.Sound.play('drumLand')}
};
