// 2: プレイヤー無視で巡回。上下の傾向は初期状態では未確定で、初めて梯子を実際に移動した向きで決まる。
WC.Enemies['2']=class extends WC.Enemy{
 constructor(x,y){super(x,y,'runner');this.dir=1;this.vertical=null;this.firstVertical=null}
 decide(g){
  const L=g.level;
  // 初回は上下の傾向を持たない。両方向に梯子がある場合だけ下りを選ぶ(単なる優先順位)。
  // ↑/↓配置は初回の選択方向だけ指定し、実際に移動するまでは傾向を確定しない。
  const order=this.vertical===null?(this.firstVertical===null?[1,-1]:[this.firstVertical,-this.firstVertical]):[this.vertical,-this.vertical];
  for(const dy of order){
   if(L.canStep(this.x,this.y,0,dy,this.bg)){
    this.vertical=dy;
    this.firstVertical=null;
    return[0,dy];
   }
  }
  // 傾向と逆向きの梯子しか使えない場合は、その向きへ進んで傾向も切り替える。
  // 梯子のない段では水平移動。ドラム缶上から足場へ上がれない場合も反転する。
  const nx=L.wrap(this.x+this.dir);
  if(!L.canStep(this.x,this.y,this.dir,0,this.bg)){
   if(!this.bg&&(L.blocked(nx,this.y)||L.onDrum(this.x,this.y)&&L.ground(nx,this.y)))this.dir*=-1;
  }
  return L.canStep(this.x,this.y,this.dir,0,this.bg)?[this.dir,0]:null;
 }
};
// エディタで初期方向を指定。↑/↓は傾向の固定ではなく、初回に使う梯子の選択方向。
WC.Enemies['←']=class extends WC.Enemies['2']{constructor(x,y){super(x,y);this.dir=-1}};
WC.Enemies['→']=class extends WC.Enemies['2']{constructor(x,y){super(x,y);this.dir=1}};
WC.Enemies['↑']=class extends WC.Enemies['2']{constructor(x,y){super(x,y);this.firstVertical=-1}};
WC.Enemies['↓']=class extends WC.Enemies['2']{constructor(x,y){super(x,y);this.firstVertical=1}};
