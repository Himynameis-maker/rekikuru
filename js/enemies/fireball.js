// 5: ファイヤーボール。Game側のタイマーで左右端から出現し反対端で消える。
WC.Fireball=class extends WC.Enemy{
 constructor(x,y,dir){super(x,y,'fireball');this.dir=dir;this.nowrap=true}
 update(dt,g){this.rx+=this.dir*this.speed*dt;this.x=Math.round(this.rx);if(this.rx<-.6||this.rx>g.level.w-.4)this.dead=true}
 startAbn(){} trap(){}
};
