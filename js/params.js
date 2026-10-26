// WC.CONFIG の数値を自動でスライダー化。項目を足せば自動で増える。
WC.Params={
 build(root){root.innerHTML='';
  const walk=(o,box)=>{for(const k in o){const v=o[k];if(k=='tile'||k=='colors')continue;
   if(typeof v=='number'){
    const d=this.def(o,k),l=document.createElement('label'),i=document.createElement('input'),out=document.createElement('output');
    i.type='range';i.min=d>=1?1:0;i.max=Math.max(2,d*3);i.step=Number.isInteger(d)?1:.05;i.value=v;out.textContent=v;
    i.oninput=()=>{o[k]=+i.value;out.textContent=i.value};
    l.append(k+' ',i,out);box.appendChild(l)}
   else if(v&&typeof v=='object'&&!Array.isArray(v)){const dt=document.createElement('details');dt.innerHTML='<summary>'+k+'</summary>';box.appendChild(dt);walk(v,dt)}}};
  walk(WC.CONFIG,root)},
 def(o,k){const find=(a,b)=>a===o?b:null;let r;const rec=(a,b)=>{if(a===o){r=b[k];return}for(const x in a)if(a[x]&&typeof a[x]=='object'&&b&&b[x])rec(a[x],b[x])};rec(WC.CONFIG,WC.DEFAULTS);return r??o[k]},
 reset(){WC.merge(WC.CONFIG,WC.DEFAULTS)}
};
