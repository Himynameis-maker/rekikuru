(()=>{
 const $=id=>document.getElementById(id),cv=$('cv'),c=cv.getContext('2d'),E=WC.Editor,K={};
 const KEYS={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'hit',KeyZ:'hit'};
 let G=null,mode='title',testing=false,last=0,mt;
 const msg=t=>{$('msg').textContent=t;clearTimeout(mt);mt=setTimeout(()=>$('msg').textContent='',2000)};
 function setMode(m){mode=m;document.body.className=m;
  if(m=='title'){G=null;cv.width=640;cv.height=480;c.fillStyle='#000';c.fillRect(0,0,640,480)}
  if(m=='edit'){G=null;sizes();E.render(c)}}
 function play(text,test){testing=test;G=new WC.Game(text);G.keys=K;
  const back=()=>setMode(test?'edit':'title');G.onOver=back;if(test)G.onClear=back;
  cv.width=G.level.w*WC.CONFIG.tile;cv.height=G.level.h*WC.CONFIG.tile;setMode('play')}
 function sizes(){$('cw').value=E.grid[0].length;$('ch').value=E.grid.length}
 E.load(WC.Levels.sample);E.palette($('palette'));E.bind(cv,c);WC.Params.build($('pbody'));
 $('bPlay').onclick=()=>play(E.text(),false);
 $('bEdit').onclick=()=>setMode('edit');
 $('bBack').onclick=()=>setMode(mode=='play'&&testing?'edit':'title');
 $('bTest').onclick=()=>E.text().includes('P')?play(E.text(),true):msg('プレイヤー(P)を置いてね');
 $('bClear').onclick=()=>{E.grid.forEach(r=>r.fill(' '));E.render(c)};
 $('cw').onchange=$('ch').onchange=()=>{E.resize(Math.min(40,Math.max(8,+$('cw').value||20)),Math.min(30,Math.max(6,+$('ch').value||15)));sizes();E.render(c)};
 $('bSave').onclick=()=>{try{localStorage.setItem('wc1',JSON.stringify({level:E.text(),cfg:WC.CONFIG}));msg('保存した')}catch(e){msg('保存できない環境。コード欄をコピーしてね')}};
 $('bLoad').onclick=()=>{try{const d=JSON.parse(localStorage.getItem('wc1'));E.load(d.level);WC.merge(WC.CONFIG,d.cfg);WC.Params.build($('pbody'));sizes();E.render(c);msg('読み込んだ')}catch(e){msg('保存データなし')}};
 $('pReset').onclick=()=>{WC.Params.reset();WC.Params.build($('pbody'))};
 $('code').ontoggle=()=>{if($('code').open)$('lv').value=E.text()};
 $('lvLoad').onclick=()=>{if($('lv').value.trim()){E.load($('lv').value);sizes();E.render(c);msg('読み込んだ')}};
 addEventListener('keydown',e=>{const k=KEYS[e.code];if(k&&mode=='play'&&document.activeElement.tagName!='TEXTAREA'){K[k]=true;e.preventDefault()}});
 addEventListener('keyup',e=>{const k=KEYS[e.code];if(k)K[k]=false});
 // タッチ操作: 十字パッドは指のスライドで方向が変わる
 const dp=$('dpad'),dir=e=>{const r=dp.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5,h=Math.abs(x)>Math.abs(y);
  K.left=h&&x<-.1;K.right=h&&x>.1;K.up=!h&&y<-.1;K.down=!h&&y>.1};
 dp.onpointerdown=e=>{dp.setPointerCapture(e.pointerId);dir(e);e.preventDefault()};
 dp.onpointermove=e=>{if(e.buttons)dir(e)};
 dp.onpointerup=dp.onpointercancel=()=>{K.left=K.right=K.up=K.down=false};
 const hb=$('hbtn');hb.onpointerdown=e=>{K.hit=true;e.preventDefault()};hb.onpointerup=hb.onpointercancel=hb.onpointerleave=()=>{K.hit=false};
 (function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;if(mode=='play'&&G){G.update(dt);G.draw(c)}requestAnimationFrame(loop)})(0);
 setMode('title');
})();
