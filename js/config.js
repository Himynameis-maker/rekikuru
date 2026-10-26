// 全パラメーター。速度の単位は「マス/秒」、時間は秒。カスタムモードのJSONで上書き可。
window.WC={Objects:{},Enemies:{},Levels:{}};
WC.merge=(a,b)=>{for(const k in b)(b[k]&&typeof b[k]=='object'&&!Array.isArray(b[k]))?WC.merge(a[k]??(a[k]={}),b[k]):a[k]=b[k];return a};
WC.CONFIG={
 tile:32,
 colors:{floor:'#2a6',edge:'#39f',bottom:'#d83'},  // 通常/左右ループ端/最下段の足場色
 player:{speed:5,hammerTime:.28,lives:3},
 wall:{hp:{W:1,w:2,V:3},colors:['','#aaa','#d96','#c33']},
 door:{openTime:4,stunAll:4,minHide:1.5,safe:.6},
 drum:{fallDelay:.8,fallSpeed:3},
 bomb:{fuse:.5,chainDelay:.25},
 ladder:{breakInterval:.08},
 fall:{speed:14,stun:3,boost:.15},        // 異常落下: 速度/スタン秒/復帰後の加速(最大2段階)
 enemies:{
  chaser:{speed:3.2},
  fastchaser:{speed:4},
  runner:{speed:3.6},
  foreman:{speed:5,lazy:.35,windup:.5,noDoor:true,harmless:true},
  fireball:{speed:4.5,interval:10,noDoor:true}
 }
};
WC.DEFAULTS=JSON.parse(JSON.stringify(WC.CONFIG));
