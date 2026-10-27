// 2: プレイヤー無視で巡回。上下は一段だけ移動し、次は横に進めるなら横へ進む。
WC.Enemies['2']=class extends WC.Enemy{
 constructor(x,y){super(x,y,'runner');this.dir=WC.Editor&&WC.Editor.runnerDir<0?-1:1;this.vertical=null;this.horizontalNext=false}
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
  const order=this.vertical===null?[1,-1]:[this.vertical,-this.vertical];
  for(const dy of order){
   if(L.canStep(this.x,this.y,0,dy,this.bg)){
    this.vertical=dy;
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
