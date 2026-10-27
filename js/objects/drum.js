// O: ドラム缶。常に当たり判定のある1マス分の障害物(横からも縦からも入れない。上から落ちてきたキャラは上に乗る)。
// 鉄柱(I)の上に載せると、鉄柱を叩いて壊したとき fallDelay 秒後に、鉄柱が立っていた地面へ落ちて、通行止めの障害物としてそこに残る。
// 落下中は同じ列にいるプレイヤーは死亡、敵は閉じ込め(撃破)。
WC.Objects.O=class extends WC.Load{
 constructor(x,y){super(x,y,'drum');this.solid=this.blocks=true}
 crush(g,a){a===g.player?g.killPlayer():a.trap()}
};
