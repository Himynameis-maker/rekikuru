// 描画の差し替え口。例: WC.Gfx.set('chaser',(c,x,y,s,self)=>c.drawImage(img,x,y,s,s))
WC.Gfx={fns:{},set(k,f){this.fns[k]=f},draw(k,c,x,y,s,st){(this.fns[k]||this.fns._)(c,x,y,s,st||{})}};
const R=col=>(c,x,y,s)=>{c.fillStyle=col;c.fillRect(x+3,y+3,s-6,s-6)};
WC.Gfx.fns._=R('#f0f');
Object.entries({player:'#e83',chaser:'#e4e',runner:'#4c4',foreman:'#fa0',fastchaser:'#f6a',fireball:'#f50',drum:'#a52',hdrum:'#c73',bomb:'#999'}).forEach(([k,v])=>WC.Gfx.fns[k]=R(v));
WC.Gfx.fns.floor=(c,x,y,s)=>{c.fillStyle='#2a6';c.fillRect(x,y+s-5,s,5)};
WC.Gfx.fns.wall=(c,x,y,s,o)=>{c.fillStyle=WC.CONFIG.wall.colors[o.hp]||'#fff';c.fillRect(x,y+3,s,s-6)};
WC.Gfx.fns.ladder=(c,x,y,s,o)=>{c.fillStyle=o.needsBreak?'#ec6':'#89b';c.fillRect(x+8,y,3,s);c.fillRect(x+s-11,y,3,s);for(let i=4;i<s;i+=8)c.fillRect(x+8,y+i,s-16,2)};
WC.Gfx.fns.door=(c,x,y,s,o)=>{c.fillStyle=o.isOpen?'#142':'#4a6';c.fillRect(x+4,y+2,s-8,s-4)};
// 背景〜オブジェクトの描画(ゲームとエディタ共用)。梯子の上下端には足場を描く。
WC.Gfx.terrain=(c,L,s)=>{
 for(let y=0;y<L.h;y++)for(let x=0;x<L.w;x++)
  if(L.floor[y][x]||y==L.h-1||(L.ladder(x,y)&&!(L.ladder(x,y-1)&&L.ladder(x,y+1))))WC.Gfx.draw('floor',c,x*s,y*s,s);
 L.objs.forEach(o=>WC.Gfx.draw(o.kind,c,o.x*s,(o.fy??o.y)*s,s,o))};
WC.Gfx.fns.iron=(c,x,y,s)=>{c.fillStyle='#778';c.fillRect(x+12,y,8,s)};
