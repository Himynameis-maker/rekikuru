// 2: プレイヤー無視で巡回。上下は一段だけ移動し、次は横に進めるなら横へ進む。
WC.Enemies['2']=class extends WC.Enemy{
 constructor(x,y){super(x,y,'runner');this.dir=1;this.vertical=null;this.firstVertical=null;this.horizontalNext=false}
 decide(g){
  const L=g.level;
  // 縦に一段移動した直後は、梯子より横移動を優先する。
  if(this.horizontalNext){
   this.horizontalNext=false;
   const nx=L.wrap(this.x+this.dir);
   if(!L.canStep(this.x,this.y,this.dir,0,this.bg)){
    if(!this.bg&&(L.blocked(nx,this.y)||L.onDrum(this.x,this.y)&&L.ground(nx,this.y)))this.dir*=-1;
   }
   if(L.canStep(this.x,this.y,this.dir,0,this.bg))return[this.dir,0];
  }
  // 初回は上下の傾向を持たない。両方向に梯子がある場合だけ下りを先に試す。
  // ↑/↓配置は初回の選択方向だけ指定し、実際に移動するまでは傾向を確定しない。
  const order=this.vertical===null?(this.firstVertical===null?[1,-1]:[this.firstVertical,-this.firstVertical]):[this.vertical,-this.vertical];
  for(const dy of order){
   if(L.canStep(this.x,this.y,0,dy,this.bg)){
    this.vertical=dy;
    this.firstVertical=null;
    this.horizontalNext=true;
    return[0,dy];
   }
  }
  // 梯子が使えないときは横移動。壁やドラム缶上の段差で進めなければ反転する。
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
