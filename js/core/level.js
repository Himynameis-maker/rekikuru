WC.Level=class{
 constructor(text){
  const rows=text.replace(/\r/g,'').split('\n').filter(r=>r.length);
  this.h=rows.length;this.w=Math.max(...rows.map(r=>r.length));
  this.floor=[];this.objs=new Map();this.spawns=[];this.player={x:1,y:1};
  const at=(x,y)=>(rows[y]||'')[x]||' ',lad=c=>c=='L'||c=='H';
  rows.forEach((r,y)=>{this.floor[y]=[];for(let x=0;x<this.w;x++){
   const ch=at(x,y),O=WC.Objects[ch],E=WC.Enemies[ch];
   if(O)this.objs.set(x+','+y,new O(x,y,ch));
   if(E)this.spawns.push({E,x,y});
   if(ch=='P')this.player={x,y};
   // 地面(floor)はオブジェクトとは別レイヤー。オブジェクトが壊れても地面は残る。
   //  ・梯子は上下の端のマスだけ地面を持つ(途中のマスは持たない)
   //  ・鉄柱(I)の真上に載っているドラム缶・壁は、自前の地面を持たない(鉄柱ごと宙に浮いている)
   //  ・左右端の列は全段が足場(1マス幅)。消せない(文字が空白でも足場になる)
   // 梯子の上下端だけ床を持つ。縦に連結した梯子の途中には床を作らない。
   // 床線の描画位置(上端/下端)は Gfx.terrain 側で分ける。
   this.floor[y][x]=x==0||x==this.w-1||ch!=' '&&(lad(ch)?(!lad(at(x,y-1))||!lad(at(x,y+1))):!('OWwV'.includes(ch)&&at(x,y+1)=='I'))}});
 }
 get(x,y){return this.objs.get(x+','+y)}
 del(x,y){this.objs.delete(x+','+y)}
 wrap(x){return(x+this.w)%this.w}
 ladder(x,y){const o=this.get(x,y);return!!(o&&o.isLadder)}
 blocked(x,y){const o=this.get(x,y);return!!(o&&o.blocks)}
 // 立てるマスか。通行止めオブジェクト(ドラム缶)の真上も足場になる(bg=背景側の敵は無視)。
 standable(x,y,bg){return y>=this.h-1||this.floor[y][x]||this.ladder(x,y)||(!bg&&this.blocked(x,y+1))||(!this.ladder(x,y)&&this.ladder(x,y+1))}
 // ドラム缶の上に立っているか。ドラム缶の天面は通常の床より少し低い。
 onDrum(x,y){return y<this.h-1&&!this.floor[y][x]&&!this.ladder(x,y)&&this.blocked(x,y+1)}
 // 梯子ではない普通の足場(床)のマスか
 ground(x,y){return(y>=this.h-1||this.floor[y][x])&&!this.ladder(x,y)}
 // 火の玉が飛ぶ段: 横幅の半分以上が地面の段と最下段
 fireRows(){const r=[];for(let y=0;y<this.h;y++)if(y==this.h-1||this.floor[y].filter(Boolean).length*2>=this.w)r.push(y);return r}
 canStep(x,y,dx,dy,bg){
  const nx=this.wrap(x+dx),ny=y+dy;
  if(ny<0||ny>=this.h)return false;
  if(!bg&&this.blocked(nx,ny))return false;
  // 梯子の先端の一つ上では、横の足場へ移るのは許可する。
  // 現在地にも移動先にも足場がなければ、空中へ横移動できない。
  if(dx&&!this.ladder(x,y)&&this.ladder(x,y+1)&&!this.ground(x,y)&&!this.ground(nx,y)&&(!bg?!this.blocked(x,y+1):true))return false;
  if(dx&&!bg&&this.onDrum(x,y)&&this.ground(nx,ny))return false; // ドラム缶の上から隣の足場へは上がれない
  // 梯子の最上段から、その一つ上のマスへ登ることを許可する。
  if(dy<0&&this.ladder(x,y)&&ny>=0&&!this.ladder(x,ny))return true;
  // 梯子の最上段の横にいる場合も、上の足場へ一段上がれる。
  // 梯子の途中から壁登りできないよう、横の梯子がこの段で終わることを確認する。
  if(dy<0&&this.ground(x,ny)&&[-1,1].some(d=>this.ladder(this.wrap(x+d),y)&&!this.ladder(this.wrap(x+d),y-1)))return true;
  return dy?this.ladder(x,ny):true}
 dest(x,y,dx,dy,bg){ // 1歩+落下後のマス
  if(!this.canStep(x,y,dx,dy,bg))return null;
  const nx=this.wrap(x+dx);let ny=y+dy;
  if(!dy)while(ny<this.h-1&&!this.standable(nx,ny,bg))ny++;
  return[nx,ny]}
 step(sx,sy,gx,gy,bg){ // BFSで最初の一歩[dx,dy]を返す
  const seen=new Set([sx+','+sy]),q=[[sx,sy,null]];
  for(let i=0;i<q.length;i++){const[x,y,f]=q[i];
   if(x==gx&&y==gy&&f)return f;
   for(const d of[[0,-1],[0,1],[-1,0],[1,0]]){
    const n=this.dest(x,y,d[0],d[1],bg);if(!n)continue;
    const k=n[0]+','+n[1];if(seen.has(k))continue;seen.add(k);q.push([n[0],n[1],f||d])}}
  return null}
};
