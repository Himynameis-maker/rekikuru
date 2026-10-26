WC.Objects.D=class extends WC.Obj{
 constructor(x,y){super(x,y,'door');this.open=0;this.force=false}
 get isOpen(){return this.open>0||this.force}
 onHit(g){this.open=WC.CONFIG.door.openTime;WC.Sound.play('door')}
 onBlast(g){this.onHit(g)}
 update(dt){if(this.open>0)this.open-=dt}
};
