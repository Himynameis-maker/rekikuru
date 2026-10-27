// ブラウザ無しでゲームを読み込む(vm)。index.html の <script> 順に読む。main.js(DOM配線)だけ除く。
// 乱数は固定(テストが毎回同じ結果になるように)。
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function load(dir=root,seed=1){
 const M=Object.create(Math);M.random=seeded(seed);
 const ctx={console,Math:M,Audio:function(){this.play=()=>Promise.resolve()}};
 ctx.window=ctx;vm.createContext(ctx);
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 for(const m of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)){const s=m[1];if(/main\.js$/.test(s))continue;
  vm.runInContext(fs.readFileSync(path.join(dir,s),'utf8'),ctx,{filename:s})}
 return ctx.WC}
module.exports={load,root};
