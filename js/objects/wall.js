// 壁は背景オブジェクト。通行は妨げない。プレイヤーが立っているマスの壁をハンマーで壊す。
['W','w','V'].forEach(ch=>WC.Objects[ch]=class extends WC.Obj{
 constructor(x,y){super(x,y,'wall');this.hp=WC.CONFIG.wall.hp[ch];this.needsBreak=true}
 onHit(g){this.hp--;WC.Sound.play('wall');if(this.hp<=0)g.level.del(this.x,this.y)}
 onBlast(g){this.onHit(g)}
});
