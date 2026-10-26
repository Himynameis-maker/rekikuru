// 2: プレイヤー無視で一方向へ。梯子があれば優先して1マス上り、次は必ず横へ。壁で反転。
WC.Enemies['2']=class extends WC.Enemy{
 constructor(x,y){super(x,y,'runner');this.dir=Math.random()<.5?-1:1}
 decide(g){const L=g.level;
  if(!this.side&&L.canStep(this.x,this.y,0,-1)){this.side=true;return[0,-1]}
  this.side=false;
  if(!L.canStep(this.x,this.y,this.dir,0))this.dir*=-1;
  return L.canStep(this.x,this.y,this.dir,0)?[this.dir,0]:null}
};
