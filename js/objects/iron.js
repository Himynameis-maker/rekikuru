// I: 鉄柱(背景。通行を妨げない。地面とは別物なので壊れても地面は残る)。
// 立っているマスで叩くと、真上にドラム缶・壁が載っている場合に限って鉄柱が壊れ、載っていた物が落ちる。
// 何も載っていない鉄柱はただの背景。
WC.Objects.I=class extends WC.Obj{
 constructor(x,y){super(x,y,'iron')}
 onHit(g){const L=g.level,d=L.get(this.x,this.y-1);
  if(d&&d.release&&d.st==0){L.del(this.x,this.y);d.release(g)}}
};
