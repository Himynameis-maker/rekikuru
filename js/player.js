// プレイヤーはマスではなく連続座標(rx,ry)で動く(マスの途中・梯子の途中で止まれる)。rx,ry は絵の左上。足は ry+1 の線。
// 敵・爆弾・扉などマス単位の処理は x,y を見るので、毎フレーム「一番近いマス」を x,y に入れて渡す(t は常に1)。
// 通れるか/立てるかは Level.canStep / standable をそのまま使う(ルールは変えず、動きだけ滑らかにする)。
// 異常落下(startAbn)の間だけ、従来のマス移動(Actor)に任せる。
WC.Player=class extends WC.Actor{
 constructor(x,y){super(x,y,WC.CONFIG.player.speed);this.name='player'}
 spd(){return this.abn||this.fast?WC.CONFIG.fall.speed:this.speed}
 // 異常落下に入る(梯子が壊れる)ときは、一番近いマスに揃える。マス移動の途中なら Actor の処理に任せる。
 settle(){if(this.t<1)return super.settle();this.rx=this.tx=this.x;this.ry=this.ty=this.y}
 // 上へ登れるか。梯子の最上段から上は、そこに足場(地面)がある時だけ(何も無い空中の段に出てしまうのを防ぐ)
 can(L,X,y,dy){return L.canStep(X,y,0,dy,false)&&!(dy<0&&L.ladder(X,y)&&!L.ladder(X,y-1)&&!L.ground(X,y-1))}
 snap(L){this.x=this.tx=L.wrap(Math.round(this.rx));this.y=this.ty=Math.round(this.ry)}
 update(dt,g){const L=g.level,wasAbn=this.abn;
  if(this.abn||this.t<1)super.update(dt,g);
  else{this.snap(L);this.free(dt,g);this.snap(L)}
  // プレイヤーは異常落下の着地後にスタンしない。
  if(wasAbn&&!this.abn&&this.stun>0)this.stun=0}
 free(dt,g){const L=g.level,k=g.keys,C=WC.CONFIG.player,X=this.x,Y=this.y;
  if(this.stun>0){this.stun-=dt;return}
  const al=Math.abs(this.ry-Y)<1e-6,mid=L.ladder(X,Y-1)&&L.ladder(X,Y+1); // al=段にぴったりいる(梯子の途中ではない)
  if(al)this.ry=Y;
  // 画面奥(いるマス)を殴る。足場の上か梯子の端でだけ。梯子の途中では振れない。
  if(k.hit&&this.busy<=0&&al&&!mid&&L.standable(X,Y,false)){this.busy=C.hammerTime;g.hit(X,Y,this)}
  if(this.busy>0){this.busy-=dt;return}
  const dx=(k.right?1:0)-(k.left?1:0),dy=(k.down?1:0)-(k.up?1:0),st=this.speed*dt;
  if(dx)this.dir=dx;
  if(!al){ // 段の間(梯子の途中): 上下だけ動く。梯子が壊れて掴まれなくなったら落ちる
   if(L.canStep(X,Math.ceil(this.ry),0,-1,false)){if(dy)this.climb(L,X,dy,st)}else this.fall(L,X,dt);
   return}
  if(!L.standable(X,Y,false)){this.fall(L,X,dt);return} // 足場が無い: 落ちる(横には動けない)
  // 梯子の中心付近で上下キー: 中心へ寄ってから登り降り(canStep が梯子の有無・端のルールを判定)
  const xr=Math.round(this.rx); // X は折り返し後のマス、xr は rx と同じ座標系のマス(端の近くでも距離を正しく測る)
  if(dy&&Math.abs(this.rx-xr)<=C.snap&&this.can(L,X,Y,dy)){
   const d=xr-this.rx,m=Math.min(Math.abs(d),st);this.rx=m>=Math.abs(d)?xr:this.rx+Math.sign(d)*m;
   this.climb(L,X,dy,st-m);return}
  if(dx)this.walk(L,Y,dx,st)}
 // 梯子を a マス分 dy 方向へ。段にぴったり来るたびに「その先へ進めるか」を canStep で確かめる。
 climb(L,X,dy,a){
  while(a>1e-9){const r=this.ry;let n;
   if(Math.abs(r-Math.round(r))<1e-9){const y=Math.round(r);if(!this.can(L,X,y,dy))break;n=y+dy}
   else n=dy<0?Math.floor(r):Math.ceil(r);
   const d=Math.abs(n-r),m=Math.min(a,d);this.ry=m>=d?n:r+dy*m;a-=m}}
 // 足場が無いので下へ(異常落下と同じ速さ)。段の境目ごとに「立てるか」を調べ、立てる段で止まる(ドラム缶・梯子の上にも止まる)。
 fall(L,X,dt){let a=WC.CONFIG.fall.speed*dt;
  while(a>1e-9){const r=this.ry,n=Math.floor(r+1e-9)+1,d=n-r,m=Math.min(a,d);a-=m;this.ry=m>=d?n:r+m;
   if(this.ry==n&&L.standable(X,n,false))break}}
 // 横歩き。体(中心±hw)の先端が新しいマスに入る瞬間に、そのマスへ入れるか canStep で確かめる(ドラム缶・段差など)。
 // 梯子の上からは足場の無い空中へ出ない(梯子から落ちないように)。足場の端からは出られる(中心が端を越えると落ちる)。
 walk(L,Y,dx,a){const hw=Math.min(.49,WC.CONFIG.player.hw),W=L.w,cx=this.rx+.5;
  const tile=v=>dx>0?Math.ceil(v-1e-9)-1:Math.floor(v+1e-9); // 体の端がいるマス(境目ぴったりは手前のマス)
  const t0=tile(cx+dx*hw),t1=tile(cx+dx*(hw+a));let c=cx+dx*a;
  for(let t=t0+dx;dx>0?t<=t1:t>=t1;t+=dx){const from=L.wrap(t-dx),to=L.wrap(t);
   if(!L.canStep(from,Y,dx,0,false)||L.ladder(from,Y)&&!L.standable(to,Y,false)){c=(dx>0?t:t+1)-dx*hw;break}}
  this.rx=c-.5;
  if(this.rx<-1)this.rx+=W;else if(this.rx>=W-1)this.rx-=W} // 左右端はループ。rx は端の外(-1〜)まで連続(半身は Actor.draw が反対側にも描く)
 trap(){}
 paint(c,s,px,py){super.paint(c,s,px,py);if(this.busy>0){c.fillStyle='#ccc';c.fillRect((px+this.dir*.5+.3)*s,(py+.1)*s,s*.4,s*.3)}}
};
