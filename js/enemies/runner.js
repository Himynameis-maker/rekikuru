// 2: プレイヤー無視で巡回。移動傾向は「下り/上り」を保持し、進行方向に梯子が無い時だけ逆傾向へ切り替える。
WC.Enemies['2']=class extends WC.Enemy{
 constructor(x,y){super(x,y,'runner');this.dir=1;this.vertical=-1}
 decide(g){
  const L=g.level;
  // 進行傾向が下りなら下り梯子を最優先。下り道が無い場合にだけ上りへ切り替える。
  // 上り傾向も同様で、上り道が無ければ下りを探す。
  const order=this.vertical===1?[1,-1]:[-1,1];
  for(const dy of order){
   if(L.canStep(this.x,this.y,0,dy,this.bg)){
    this.vertical=dy;
    return[0,dy];
   }
  }
  // 梯子のない段では水平移動。ドラム缶の上から上がれない足場にぶつかった場合も反転する。
  const nx=L.wrap(this.x+this.dir);
  if(!L.canStep(this.x,this.y,this.dir,0,this.bg)){
   if(!this.bg&&(L.blocked(nx,this.y)||L.onDrum(this.x,this.y)&&L.ground(nx,this.y)))this.dir*=-1;
  }
  return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
 }
};