// 1: 追尾。BFSで最短経路(落下含む)を選ぶ。
WC.Enemies['1']=class extends WC.Enemy{
 constructor(x,y,n='chaser'){super(x,y,n);this.bg=false}
 decide(g){const p=g.player;return g.level.step(this.x,this.y,p.x,p.y,this.bg)}
};
