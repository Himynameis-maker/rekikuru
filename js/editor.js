// マリメ風エディタ。パレットから選んでマップをタップ/ドラッグで配置。
WC.SPR={P:'player','1':'chaser','2':'runner','←':'runner','→':'runner','↑':'runner','↓':'runner','3':'foreman','4':'fastchaser'};
WC.TOOLS=[
 {ch:'=',k:'floor',n:'床'},{ch:'W',k:'wall',s:{hp:1},n:'壁1'},{ch:'w',k:'wall',s:{hp:2},n:'壁2'},{ch:'V',k:'wall',s:{hp:3},n:'壁3'},
 {ch:'L',k:'ladder',s:{needsBreak:true},n:'梯子'},{ch:'H',k:'ladder',s:{},n:'固梯子'},
 {ch:'O',k:'drum',n:'ドラム缶'},{ch:'I',k:'iron',n:'鉄柱'},{ch:'B',k:'bomb',n:'爆弾'},{ch:'D',k:'door',s:{},n:'扉'},
 {ch:'P',k:'player',n:'プレイヤー'},{ch:'1',k:'chaser',n:'追尾'},{ch:'2',k:'runner',n:'直進↓優先'},{ch:'←',k:'runner',n:'直進←'},{ch:'→',k:'runner',n:'直進→'},{ch:'↑',k:'runner',n:'直進↑優先'},{ch:'↓',k:'runner',n:'直進↓優先'},{ch:'3',k:'foreman',n:'背景敵'},{ch:'4',k:'fastchaser',n:'高速'},
 {ch:' ',k:null,n:'消す'}];
WC.Editor={
 grid:[],tool:'=',
 load(t){const rows=t.replace(/\r/g,'').split('\n').filter(r=>r.length),w=Math.max(...rows.map(r=>r.length));this.grid=rows.map(r=>r.padEnd(w,' ').split(''))},
 text(){return this.grid.map(r=>r.join('')).join('\n')},
 resize(w,h){const g=[];for(let y=0;y<h;y++){g.push([]);for(let x=0;x<w;x++)g[y].push((this.grid[y]||[])[x]||' ')}this.grid=g},
 paint(x,y){const g=this.grid;if(!g[y]||g[y][x]===undefined)return;
  if(this.tool=='P')g.forEach(r=>r.forEach((c,i)=>{if(c=='P')r[i]=' '}));
  g[y][x]=this.tool},
 palette(root){WC.TOOLS.forEach(t=>{const b=document.createElement('button');
   b.innerHTML='<canvas width="36" height="36"></canvas><br>'+t.n;
   const c=b.firstChild.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,36,36);
   if(t.k)WC.Gfx.draw(t.k,c,0,0,36,t.s||{});else{c.fillStyle='#f66';c.font='24px sans-serif';c.fillText('✕',8,27)}
   b.onclick=()=>{this.tool=t.ch;root.querySelectorAll('button').forEach(o=>o.classList.remove('sel'));b.classList.add('sel')};
   root.appendChild(b)});root.firstChild.classList.add('sel')},
 render(c){const s=WC.CONFIG.tile,L=new WC.Level(this.text()),cv=c.canvas;
  if(cv.width!=L.w*s||cv.height!=L.h*s){cv.width=L.w*s;cv.height=L.h*s}
  c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);
  c.strokeStyle='#222';c.beginPath();
  for(let x=0;x<=L.w;x++){c.moveTo(x*s,0);c.lineTo(x*s,cv.height)}
  for(let y=0;y<=L.h;y++){c.moveTo(0,y*s);c.lineTo(cv.width,y*s)}
  c.stroke();WC.Gfx.terrain(c,L,s);
  this.grid.forEach((r,y)=>r.forEach((ch,x)=>{const k=WC.SPR[ch];if(k)WC.Gfx.draw(k,c,x*s,y*s,s,{})}))},
 bind(cv,c){let on=false;
  const at=e=>{const r=cv.getBoundingClientRect();
   this.paint(Math.floor((e.clientX-r.left)/r.width*this.grid[0].length),Math.floor((e.clientY-r.top)/r.height*this.grid.length));this.render(c)};
  cv.addEventListener('pointerdown',e=>{if(!document.body.classList.contains('edit'))return;on=true;cv.setPointerCapture(e.pointerId);at(e)});
  cv.addEventListener('pointermove',e=>{if(on)at(e)});
  ['pointerup','pointercancel'].forEach(t=>cv.addEventListener(t,()=>on=false))}
};
