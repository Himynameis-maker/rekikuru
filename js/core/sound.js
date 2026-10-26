// WC.Sound.files.hit='hit.wav' のように登録すると鳴る。
// イベント名: hit wall ladder bomb door drumHit drumLand fall die clear
WC.Sound={files:{},play(n){const f=this.files[n];if(f)new Audio(f).play().catch(()=>{})}};
