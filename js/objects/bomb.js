// 叩く→隣接(上下左右)の壁・壊せる梯子を1ダメージ分破壊、扉を開く、隣の爆弾を連鎖。
// 連鎖先の爆弾は周囲(±1マス同段)のキャラを異常落下させる。
WC.Objects.B=class extends WC.Obj{
 constructor(x,y){super(x,y,'bomb')}
 onHit(g){this.fire(g,false)}
 onBlast(g){this.fire(g,true)}
 fire(g,chain){if(this.fired)return;this.fired=true;
  g.later(chain?WC.CONFIG.bomb.chainDelay:0,()=>{const L=g.level;L.del(this.x,this.y);WC.Sound.play('bomb');
   if(chain)g.actors().forEach(a=>{if(a.y==this.y&&Math.abs(a.x-this.x)<=1)a.startAbn()});
   for(const d of[[1,0],[-1,0],[0,1],[0,-1]]){const o=L.get(L.wrap(this.x+d[0]),this.y+d[1]);o&&o.onBlast&&o.onBlast(g)}})}
};
