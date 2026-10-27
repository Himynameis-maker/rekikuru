// 3: 背景側の敵。壁を無視して接近、同じマスに来ると windup 秒後に殴る。
// 殴られたプレイヤーは異常落下するだけでミスにはならない(落下中・気絶中は殴られない)。ハンマーで敵側も異常落下。
WC.Enemies['3']=class extends WC.Enemies['1']{
 constructor(x,y){super(x,y,'foreman');this.bg=true}
 onHammer(){this.startAbn()}
 decide(g){const p=g.player,c=this.cfg;
  if(p.y==this.y&&p.x==this.x){
   this.busy=c.windup+.3;
   g.later(c.windup,()=>{if(!this.dead&&!this.abn&&this.stun<=0&&!p.abn&&p.stun<=0&&p.y==this.y&&p.x==this.x)p.startAbn()});
   return null}
  if(Math.random()<c.lazy){this.busy=.4;return null}
  return super.decide(g)}
};
