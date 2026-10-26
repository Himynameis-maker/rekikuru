WC.Level=class{
 constructor(text){
  const rows=text.replace(/\r/g,'').split('\n').filter(r=>r.length);
  this.h=rows.length;this.w=Math.max(...rows.map(r=>r.length));
  this.floor=[];this.objs=new Map();this.spawns=[];this.player={x:1,y:1};
  rows.forEach((r,y)=>{this.floor[y]=[];for(let x=0;x<this.w;x++){
   const ch=r[x]||' ';this.floor[y][x]=!' LH'.includes(ch);
   const O=WC.Objects[ch],E=WC.Enemies[ch];
   if(O)this.objs.set(x+','+y,new O(x,y,ch));
   if(E)this.spawns.push({E,x,y});
   if(ch=='P')this.player={x,y}}});
  this.objs.forEach(o=>{if(o.kind=='drum'&&this.get(o.x,o.y+1)?.kind=='iron')this.floor[o.y][o.x]=false});
 }
 get(x,y){return this.objs.get(x+','+y)}
 del(x,y){this.objs.delete(x+','+y)}
 wrap(x){return(x+this.w)%this.w}
 ladder(x,y){const o=this.get(x,y);return!!(o&&o.isLadder)}
 blocked(x,y){const o=this.get(x,y);return!!(o&&o.blocks)}
 standable(x,y){return y>=this.h-1||this.floor[y][x]||this.ladder(x,y)}
 canStep(x,y,dx,dy,bg){
  const nx=this.wrap(x+dx),ny=y+dy;
  if(ny<0||ny>=this.h)return false;
  if(!bg&&this.blocked(nx,ny))return false;
  return dy?this.ladder(x,ny):true}
 dest(x,y,dx,dy,bg){ // 1歩+落下後のマス
  if(!this.canStep(x,y,dx,dy,bg))return null;
  const nx=this.wrap(x+dx);let ny=y+dy;
  if(!dy)while(ny<this.h-1&&!this.standable(nx,ny))ny++;
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
