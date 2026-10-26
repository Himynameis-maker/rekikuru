WC.Player=class extends WC.Actor{
 constructor(x,y){super(x,y,WC.CONFIG.player.speed);this.name='player'}
 spd(){return this.abn||this.fast?WC.CONFIG.fall.speed:this.speed}
 update(dt,g){const L=g.level;
  if(g.keys.hit&&this.t>=1&&this.busy<=0&&this.stun<=0&&!this.abn&&!this.hidden&&L.standable(this.x,this.y)){
   this.busy=WC.CONFIG.player.hammerTime;g.hit(L.wrap(this.x+this.dir),this.y,this)}
  super.update(dt,g)}
 decide(g){const k=g.keys,L=g.level,dx=(k.right?1:0)-(k.left?1:0),dy=(k.down?1:0)-(k.up?1:0);
  if(dx)this.dir=dx;
  if(dy&&L.canStep(this.x,this.y,0,dy))return[0,dy];
  if(dx&&L.canStep(this.x,this.y,dx,0))return[dx,0];
  return null}
 trap(){}
 draw(c,s){super.draw(c,s);if(this.busy>0){c.fillStyle='#ccc';c.fillRect((this.rx+this.dir*.7+.25)*s,(this.ry+.3)*s,s*.4,s*.3)}}
};
