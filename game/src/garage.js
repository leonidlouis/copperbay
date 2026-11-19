import { createUI, UI } from './ui-kit.js';
import { VEHICLE_TYPES } from './vehicles.js';
import { writeSave } from './save.js';
export const UPGRADES = [
  {id:'engine',name:'ENGINE / STREET TUNE',price:900,desc:'+18% acceleration · +12% top speed',max:3},
  {id:'armor',name:'ARMOUR / REINFORCED',price:700,desc:'Reinforced chassis · less collision damage',max:3},
  {id:'nitro',name:'NITRO / COASTAL BOOST',price:1100,desc:'Hold SHIFT · rechargeable overboost',max:1},
  {id:'repair',name:'REPAIR / FULL SERVICE',price:250,desc:'Restore vehicle condition to 100%'},
  {id:'respray',name:'RESPRAY / GHOST FINISH',price:350,desc:'Fresh paint · clear your wanted level'},
];
export function buyUpgrade(state,id){
  const offer=UPGRADES.find(o=>o.id===id),p=state.player,car=p.car;if(!offer||!car)return;
  const level=state.upgrades[id]||0,price=offer.price*(offer.max?level+1:1);
  if(offer.max&&level>=offer.max){state.toast={text:'Already at maximum level',time:3};return;}
  if(p.money<price){state.toast={text:'Not enough cash for this upgrade',time:3};return;}
  p.money-=price;
  if(offer.max)state.upgrades[id]=level+1;
  if(id==='armor'){car.armorLevel=level+1;car.hp=VEHICLE_TYPES[car.type].hp*(1+car.armorLevel*.3);}
  if(id==='repair')car.hp=VEHICLE_TYPES[car.type].hp*(1+(car.armorLevel||0)*.3);
  if(id==='respray'){car.color=['#6cd8c1','#ef9876','#b1a0d2','#f5d08a'][Math.floor(state.elapsed)%4];state.heat=0;state.roadblocks.length=0;}
  if(id==='nitro')state.nitro=100;
  state.audio.sound('cash');state.toast={text:offer.name+' INSTALLED · −$'+price,time:3};writeSave(state);
}
export function drawGarage(p,state,buttons){
  const u=createUI(p,buttons),{ctx,text}=u,car=state.player.car;if(!car)return;
  const shade=ctx.createLinearGradient(760,0,1280,0);shade.addColorStop(0,'#0c2a3800');shade.addColorStop(1,'#0c2a38c9');ctx.fillStyle=shade;ctx.fillRect(0,0,1280,800);
  u.panel(26,24,405,83,.94);text('GHOST CUSTOMS',43,65,32,UI.cream,'900');u.label('PORT MERIDIAN  /  PERFORMANCE & DISCRETION',45,89,UI.gold,10);
  if(state.mission.lastName){u.panel(26,124,450,116,.94);u.label('CHAPTER '+state.stats.missions+' / 06  •  PROGRESS SAVED',43,147,UI.mint,10);text('MISSION PASSED',42,181,31,UI.gold,'900');text(state.mission.lastName+'   +$'+state.mission.lastPayout.toLocaleString('en-US'),44,211,18,UI.cream,'900');}
  u.panel(832,24,421,754,.97);u.label('BUILD YOUR GETAWAY',851,52,UI.gold,11);text('THE NEXT LEVEL.',850,88,31,UI.cream,'900');text('$'+state.player.money.toLocaleString('en-US'),1233,124,27,UI.mint,'900','right');u.label('AVAILABLE CASH',851,121,UI.muted,10);
  UPGRADES.forEach((o,i)=>{const level=state.upgrades[o.id]||0,maxed=o.max&&level>=o.max,price=o.price*(o.max?level+1:1),y=151+i*102;
    u.panel(850,y,384,89,.98,'26,65,74');u.label(o.name,865,y+23,UI.cream,12);text(maxed?'MAX':('$'+price.toLocaleString('en-US')),1216,y+24,18,maxed?UI.mint:UI.gold,'900','right');u.label(o.desc,865,y+45,UI.muted,10);
    if(o.max){for(let k=0;k<o.max;k++){ctx.fillStyle=k<level?UI.mint:'#5a7e82';ctx.fillRect(865+k*30,y+64,24,5);}u.label('LEVEL '+level+' / '+o.max,973,y+70,UI.mint,9);}else u.label(o.id==='repair'?'RESTORE':'CHANGE COLOUR & LOSE HEAT',865,y+70,UI.mint,9);
    u.label(maxed?'INSTALLED':'INSTALL  →',1157,y+70,UI.gold,9);buttons.push({id:'upgrade:'+o.id,x:850,y,w:384,h:89});
  });
  u.button('closeShop','BACK TO THE BAY','E / ESC   •   UPGRADES SAVE AUTOMATICALLY',851,695,382,true);
  u.panel(26,638,450,140,.93);u.label('YOUR VEHICLE',44,664,UI.gold,10);text(VEHICLE_TYPES[car.type].name,43,697,30,UI.cream,'900');
  [['POWER',.48+(state.upgrades.engine||0)*.16],['ARMOUR',.35+(state.upgrades.armor||0)*.2],['NITRO',(state.upgrades.nitro||0)?1:.05]].forEach(([n,v],i)=>{u.label(n,45,721+i*17,UI.muted,9);u.bar(115,714+i*17,222,5,v,i===2?'#99d9ef':UI.mint);});
  u.panel(495,696,302,81,.91);u.label('MERIDIAN FILES',511,719,UI.gold,10);text(state.stats.missions+' OF 6 CHAPTERS COMPLETE',511,744,16,UI.cream,'900');u.bar(511,759,267,4,state.stats.missions/6,UI.gold);
  if(state.toast.time>0){u.panel(490,608,309,71,.95);u.wrap(state.toast.text,505,632,279,13,UI.mint,19);}
}
