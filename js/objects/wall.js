// 壁は背景オブジェクト。通行は妨げない。プレイヤーが立っているマスの壁をハンマーで壊す。
// 鉄柱(I)の上にも載せられる。鉄柱を壊すと壁が落ちてきて、鉄柱が立っていた地面に残る(落下中の壁は壊せない・無害)。
['W','w','V'].forEach(ch=>WC.Objects[ch]=class extends WC.Load{
 constructor(x,y){super(x,y,'wall');this.hp=WC.CONFIG.wall.hp[ch];this.needsBreak=true}
 onHit(g){if(this.st==1||this.st==2)return;this.hp--;WC.Sound.play('wall');if(this.hp<=0)g.level.del(this.x,this.y)}
 onBlast(g){this.onHit(g)}
});
