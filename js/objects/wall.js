['W','w','V'].forEach(ch=>WC.Objects[ch]=class extends WC.Obj{
 constructor(x,y){super(x,y,'wall');this.hp=WC.CONFIG.wall.hp[ch];this.blocks=this.needsBreak=true}
 onHit(g){this.hp--;WC.Sound.play('wall');if(this.hp<=0)g.level.del(this.x,this.y)}
 onBlast(g){this.onHit(g)}
});
