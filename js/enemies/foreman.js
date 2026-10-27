// 3: 背景側の敵。チェイサーと同じ追跡判定を使い、時々移動開始前に短く休む。
// ハンマーは爆弾以外の梯子・壁・鉄柱に一撃分だけ作用し、完全破壊時だけプレイヤーを異常落下させる。
WC.Enemies['3']=class extends WC.Enemies['1']{
 constructor(x,y){super(x,y,'foreman');this.bg=false;this._stepsUntilPause=2+Math.random()*3;this._foremanPaused=false;this._foremanResume=false}
 onHammer(){this.startAbn()}
 update(dt,g){
  const wasBusy=this.busy,wasAbn=this.abn;
  super.update(dt,g);
  // 休止時間が終わった次の移動判定で、チェイサーと同じ高さ・梯子判定をやり直す。
  if(this._foremanPaused&&wasBusy>0&&this.busy<=0){this._foremanPaused=false;this._foremanResume=true}
  // 親方は異常落下後にスタンしない。
  if(wasAbn&&!this.abn&&this.stun>0)this.stun=0;
 }
 decide(g){
  const p=g.player,c=this.cfg;
  if(p.y===this.y&&p.x===this.x){
   this.busy=c.windup+.3;
   g.later(c.windup,()=>{
    if(this.dead||this.hidden||this.abn||this.stun>0||p.abn||p.stun>0||p.y!==this.y||p.x!==this.x)return;
    const o=g.level.get(this.x,this.y);
    // 爆弾だけは親方のハンマー対象外。壁の耐久値も通常の一振り分だけ減らす。
    if(o&&o.kind!=='bomb'&&(o.needsBreak||o.destructible||o.isLadder)&&o.onHit){
     o.onHit(g,this);
     // 完全に消えた場合だけプレイヤーを異常落下させる。未破壊なら落下させない。
     if(g.level.get(this.x,this.y)!==o&&!p.abn)p.startAbn();
    }
   });
   return null;
  }
  if(this._foremanResume){
   this._foremanResume=false;
   // 休止終了は追跡判定のトリガーではない。現在の向きのまま通常移動へ戻る。
   return super.decide(g)
  }
  if(this._stepsUntilPause<=0){
   this.busy=.4+Math.random()*.8;
   this._foremanPaused=true;
   this._stepsUntilPause=2+Math.random()*3;
   return null;
  }
  const d=super.decide(g);
  if(d)this._stepsUntilPause--;
  return d;
 }
};
