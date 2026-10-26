WC.Game=class{
 constructor(text){this.text=text;this.lives=WC.CONFIG.player.lives;this.keys={};this.epoch=0;this.load()}
 load(){const L=this.level=new WC.Level(this.text);
  this.player=new WC.Player(L.player.x,L.player.y);
  this.enemies=L.spawns.map(s=>new s.E(s.x,s.y));
  this.timers=[];this.epoch++;this.state='play';this.fireT=WC.CONFIG.enemies.fireball.interval}
 later(t,fn){this.timers.push({t,fn})}
 actors(){return[this.player,...this.enemies.filter(e=>!e.hidden&&!e.dead)]}
 hit(x,y,by){WC.Sound.play('hit');
  const o=this.level.get(x,y);if(o&&o.onHit)o.onHit(this,by);
  this.enemies.forEach(e=>{if(!e.hidden&&e.x==x&&e.y==y&&e.onHammer)e.onHammer(this)})}
 killPlayer(){if(this.state!='play')return;this.state='dead';WC.Sound.play('die');this.lives--;
  this.later(1.2,()=>{if(this.lives>0)this.load();else this.state='over'})}
 checkAllHidden(){const es=this.enemies.filter(e=>!e.noDoor&&!e.dead);
  if(es.length&&es.every(e=>e.hidden)){
   this.level.objs.forEach(o=>{if(o.kind=='door')o.force=true});
   es.forEach(e=>{e.stun=WC.CONFIG.door.stunAll;e.exitAfter=true})}}
 onExit(){this.level.objs.forEach(o=>{if(o.kind=='door'&&o.force){o.force=false;o.open=WC.CONFIG.door.openTime}})}
 update(dt){
  const run=this.timers,ep=this.epoch;this.timers=[];
  for(const tm of run){tm.t-=dt;if(tm.t<=0)tm.fn();else if(ep==this.epoch)this.timers.push(tm);if(ep!=this.epoch)return}
  if(this.state!='play')return;
  const L=this.level,p=this.player;
  [...L.objs.values()].forEach(o=>o.update&&o.update(dt,this));
  p.update(dt,this);
  this.enemies.forEach(e=>e.update(dt,this));
  this.enemies=this.enemies.filter(e=>!e.dead);
  if(p.t>=1)this.enemies.forEach(e=>{if(e.hidden&&e.x==p.x&&e.y==p.y)e.exit(this)}); // 扉に触れると出てくる
  for(const e of this.enemies)if(!e.hidden&&!e.harmless&&!e.abn&&e.stun<=0&&Math.hypot(e.rx-p.rx,e.ry-p.ry)<.65){this.killPlayer();break}
  this.fireT-=dt;
  if(this.fireT<=0){this.fireT=WC.CONFIG.enemies.fireball.interval;
   const ys=[];L.floor.forEach((r,y)=>{if(r[0]&&r[L.w-1])ys.push(y)});
   if(ys.length){const left=Math.random()<.5;this.enemies.push(new WC.Fireball(left?0:L.w-1,ys[Math.random()*ys.length|0],left?1:-1))}}
  if(this.state=='play'&&![...L.objs.values()].some(o=>o.needsBreak)){this.state='clear';WC.Sound.play('clear');this.later(2,()=>this.load())}}
 draw(c){const s=WC.CONFIG.tile,L=this.level;
  c.fillStyle='#000';c.fillRect(0,0,L.w*s,L.h*s);
  for(let y=0;y<L.h;y++)for(let x=0;x<L.w;x++)if(L.floor[y][x])WC.Gfx.draw('floor',c,x*s,y*s,s);
  L.objs.forEach(o=>WC.Gfx.draw(o.kind,c,o.x*s,(o.fy??o.y)*s,s,o));
  this.enemies.forEach(e=>e.draw(c,s));this.player.draw(c,s);
  c.fillStyle='#fff';c.font='14px monospace';
  c.fillText(`LIVES ${this.lives}  LEFT ${[...L.objs.values()].filter(o=>o.needsBreak).length}`,6,14);
  const m={dead:'MISS',clear:'CLEAR!',over:'GAME OVER'}[this.state];
  if(m){c.font='32px monospace';c.textAlign='center';c.fillText(m,L.w*s/2,L.h*s/2);c.textAlign='left'}}
};
