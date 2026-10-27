// I: 鉄柱(背景。通行を妨げない)。壁と同様にハンマー一撃で破壊でき、地面は残る。
// 鉄柱の上にドラム缶・壁が載っている場合は、鉄柱が消えると載っていた物が落ちる。
WC.Objects.I=class extends WC.Obj{
 constructor(x,y){super(x,y,'iron');this.needsBreak=true}
 onHit(g){
  const L=g.level,d=L.get(this.x,this.y-1);
  if(d&&d.release&&d.st==0)d.release(g);
  L.del(this.x,this.y);
  WC.Sound.play('wall');
 }
 onBlast(g){this.onHit(g)}
};
