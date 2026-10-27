// 爆弾: 叩く(または連鎖)で点火→起爆。起爆時、そのマスにいるキャラは全員異常落下。
// 横方向は、破壊可能なオブジェクトを一撃ずつ連鎖破壊する。次のマスへは0.2秒待って進む。
// 上下方向の隣接オブジェクト、扉、隣の爆弾は従来どおり起爆時に処理する。
WC.Objects.B=class extends WC.Obj{
 constructor(x,y){super(x,y,'bomb');this.lit=false}
 onHit(g,by){this.light(WC.CONFIG.bomb.fuse,true)}
 onBlast(g){this.light(WC.CONFIG.bomb.chainDelay,false)}
 light(t,byPlayer){if(this.lit)return;this.lit=true;this.t=t;this.byPlayer=byPlayer;this.escaped=false}
 hitSide(g,dir){
  const L=g.level;
  let offset=1;
  const hitNext=()=>{
   const x=L.wrap(this.x+dir*offset),y=this.y,o=L.get(x,y);
   if(!o||!o.onBlast)return;
   // 連鎖先は破壊可能な物だけ。扉・爆弾などに当たったらここで止める。
   if(!o.needsBreak)return;
   o.onBlast(g);
   // 今のオブジェクトが実際に消えたときだけ、その隣を0.2秒後に処理する。
   if(L.get(x,y)!==o){
    offset++;
    g.later(.2,hitNext);
   }
  };
  const x=L.wrap(this.x+dir),o=L.get(x,this.y);
  if(!o||!o.onBlast)return;
  // 爆弾に直接隣接する物には、従来どおり通常の爆風を適用する。
  if(!o.needsBreak){o.onBlast(g);return}
  o.onBlast(g);
  if(L.get(x,this.y)!==o){
   offset++;
   g.later(.2,hitNext);
  }
 }
 update(dt,g){if(!this.lit)return;
  const k=g.keys;if(this.byPlayer&&(k.left||k.right||k.up||k.down))this.escaped=true;
  this.t-=dt;if(this.t>0)return;
  const L=g.level;L.del(this.x,this.y);WC.Sound.play('bomb');
  g.actors().forEach(a=>{if(a.x==this.x&&a.y==this.y&&!(a===g.player&&this.escaped))a.startAbn()});
  // 横は左右それぞれ、破壊が成立した場合だけ0.2秒間隔で連鎖。
  this.hitSide(g,1);this.hitSide(g,-1);
  // 上下は従来どおり隣接マスにだけ作用する。
  for(const dy of[-1,1]){const o=L.get(this.x,this.y+dy);o&&o.onBlast&&o.onBlast(g)}
 }
};
