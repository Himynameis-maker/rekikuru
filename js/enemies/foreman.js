// 3: 背景側の敵。壁を無視して接近、同じマスに来ると windup 秒後に殴る。ハンマーで異常落下。
WC.Enemies['3']=class extends WC.Enemies['1']{
 constructor(x,y){super(x,y,'foreman');this.bg=true}
 onHammer(){this.startAbn()}
 decide(g){const p=g.player,c=this.cfg;
  if(p.y==this.y&&p.x==this.x){
   this.busy=c.windup+.3;
   g.later(c.windup,()=>{if(!this.dead&&!this.abn&&this.stun<=0&&p.y==this.y&&p.x==this.x)g.killPlayer()});
   return null}
  if(Math.random()<c.lazy){this.busy=.4;return null}
  return super.decide(g)}
};
