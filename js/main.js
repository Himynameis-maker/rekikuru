(()=>{
 const cv=document.getElementById('cv'),c=cv.getContext('2d'),$=id=>document.getElementById(id);
 const KEYS={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'hit',KeyZ:'hit'};
 let G,last=0;
 function start(text,cfg){
  try{if(cfg.trim())WC.merge(WC.CONFIG,JSON.parse(cfg))}catch(e){alert('JSONエラー: '+e.message);return}
  G=new WC.Game(text);cv.width=G.level.w*WC.CONFIG.tile;cv.height=G.level.h*WC.CONFIG.tile}
 addEventListener('keydown',e=>{const k=KEYS[e.code];if(k&&G&&document.activeElement.tagName!='TEXTAREA'){G.keys[k]=true;e.preventDefault()}});
 addEventListener('keyup',e=>{const k=KEYS[e.code];if(k&&G)G.keys[k]=false});
 $('run').onclick=()=>{$('run').blur();start($('lv').value,$('cfg').value)};
 $('reset').onclick=()=>location.reload();
 $('lv').value=WC.Levels.sample;$('cfg').value='{\n  "player":{"speed":5},\n  "enemies":{"chaser":{"speed":3.2}}\n}';
 start(WC.Levels.sample,'');
 (function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;G.update(dt);G.draw(c);requestAnimationFrame(loop)})(0);
})();
