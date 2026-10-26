// 敵基底。CONFIG.enemies[name] を this.cfg に持つ。扉に入る処理もここ。
WC.Enemy=class extends WC.Actor{
 constructor(x,y,name){const c=WC.CONFIG.enemies[name];super(x,y,c.speed);this.name=name;this.cfg=c;this.noDoor=!!c.noDoor;this.harmless=!!c.harmless}
 arrive(g){const d=g.level.get(this.x,this.y);
  if(!this.noDoor&&!this.abn&&d&&d.kind=='door'&&d.isOpen){this.hidden=true;this.door=d;g.checkAllHidden()}}
 exit(g){this.hidden=false;this.door=null;this.exitAfter=false;g.onExit()}
 trap(){this.dead=true}
};
