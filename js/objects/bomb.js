// 爆弾: 叩く(または連鎖)で点火→起爆。起爆時、そのマスにいるキャラは全員異常落下。
// ただし叩いた本人は、点火から起爆までの猶予(CONFIG.bomb.fuse)の間に方向入力すれば巻き込まれない。
// 起爆時、隣接(上下左右)の壁・壊せる梯子を1ダメージ分破壊、扉を開き、隣の爆弾を連鎖点火。
WC.Objects.B=class extends WC.Obj{
 constructor(x,y){super(x,y,'bomb');this.lit=false}
 onHit(g,by){this.light(WC.CONFIG.bomb.fuse,true)}
 onBlast(g){this.light(WC.CONFIG.bomb.chainDelay,false)}
 light(t,byPlayer){if(this.lit)return;this.lit=true;this.t=t;this.byPlayer=byPlayer;this.escaped=false}
 update(dt,g){if(!this.lit)return;
  const k=g.keys;if(this.byPlayer&&(k.left||k.right||k.up||k.down))this.escaped=true;
  this.t-=dt;if(this.t>0)return;
  const L=g.level;L.del(this.x,this.y);WC.Sound.play('bomb');
  g.actors().forEach(a=>{if(a.x==this.x&&a.y==this.y&&!(a===g.player&&this.escaped))a.startAbn()});
  for(const d of[[1,0],[-1,0],[0,1],[0,-1]]){const o=L.get(L.wrap(this.x+d[0]),this.y+d[1]);o&&o.onBlast&&o.onBlast(g)}}
};
