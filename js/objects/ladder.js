['L','H'].forEach(ch=>WC.Objects[ch]=class extends WC.Obj{
 constructor(x,y){super(x,y,'ladder');this.isLadder=true;this.needsBreak=ch=='L'}
 onHit(g){if(this.needsBreak)this.brk(g)}
 onBlast(g){this.onHit(g)}
 brk(g){const L=g.level;if(L.get(this.x,this.y)!==this)return;
  L.del(this.x,this.y);WC.Sound.play('ladder');
  g.actors().forEach(a=>{if(a.x==this.x&&a.y==this.y){a.settle();if(a!==g.player)a.startAbn()}}); // 掴まっていた敵は異常落下、プレイヤーはその場から真下へ
  [-1,1].forEach(d=>g.later(WC.CONFIG.ladder.breakInterval,()=>{const o=L.get(this.x,this.y+d);o&&o.isLadder&&o.needsBreak&&o.brk(g)}))}
});
