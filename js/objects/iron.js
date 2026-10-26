// I: 鉄柱(背景。通行を妨げない)。立っているマスで叩くと、真上に乗っているドラム缶が落ちる。
WC.Objects.I=class extends WC.Obj{
 constructor(x,y){super(x,y,'iron')}
 onHit(g){const d=g.level.get(this.x,this.y-1);if(d&&d.release)d.release(g)}
};
