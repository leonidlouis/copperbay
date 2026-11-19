import { VEHICLE_TYPES } from './vehicles.js';
import { writeSave } from './save.js';
import { CREAM, GOLD, MINT, MUTED } from './ui.js';
export const UPGRADES = [
  {id:'engine',name:'ENGINE / STREET TUNE',desc:'+18% acceleration • +12% top speed',price:1200,max:3},
  {id:'armor',name:'ARMOUR / REINFORCED',desc:'Reinforced chassis • less collision damage',price:1400,max:3},
  {id:'nitro',name:'NITRO / COASTAL BOOST',desc:'Hold SHIFT • rechargeable overboost',price:1800,max:1},
  {id:'repair',name:'REPAIR / FULL SERVICE',desc:'Restore vehicle condition to 100%',price:250,max:0},
  {id:'respray',name:'RESPRAY / GHOST FINISH',desc:'Fresh paint • clear your wanted level',price:350,max:0},
];
export function upgradePrice(item, level) { return item.price + (item.id==='engine'?750:item.id==='armor'?600:0)*level; }
export function buyUpgrade(state,id) {
  const item=UPGRADES.find(x=>x.id===id),car=state.player.car;if(!item||!car)return;
  const level=state.upgrades[id]||0;if(item.max&&level>=item.max)return;
  const price=upgradePrice(item,level);if(state.player.money<price){state.toast={text:'Not enough cash. Finish a job or find a cash drop.',time:3};return;}
  state.player.money-=price;
  if(item.max)state.upgrades[id]=level+1;
  if(id==='repair')car.hp=VEHICLE_TYPES[car.type].hp;
  if(id==='respray'){state.paintIndex=(state.paintIndex||0)+1;car.color=['#79dfc1','#ed9175','#edc779','#7bc7dd','#c3a7c6'][state.paintIndex%5];state.heat=0;state.roadblocks.length=0;}
  if(id==='nitro')car.nitro=100;
  state.audio.sound('cash');state.toast={text:item.name+' • installed',time:3};writeSave(state);
}
export function drawGarage(ui,state) {
  const {ctx,text,label,panel,bar,button}=ui,p=state.player,car=p.car;
  const glow=ctx.createLinearGradient(780,0,1280,0);glow.addColorStop(0,'#12364200');glow.addColorStop(1,'#12364266');ctx.fillStyle=glow;ctx.fillRect(0,0,1280,800);
  panel(24,24,410,86);label('PORT MERIDIAN / PERFORMANCE & DISCRETION',42,49,MINT,9);text('GHOST CUSTOMS',40,84,33,CREAM,'900');
  if(state.mission.lastName) {panel(24,130,451,128);label(`CHAPTER ${state.stats.missions} / 06  •  PROGRESS SAVED`,42,153,MINT,10);text('MISSION PASSED',40,192,32,GOLD,'900');text(`${state.mission.lastName}  +$${state.mission.lastPayout.toLocaleString('en-US')}`,42,228,20,CREAM,'900');}
  panel(24,647,450,130);label('YOUR VEHICLE',42,670,GOLD,10);text(car?VEHICLE_TYPES[car.type].name:'NO VEHICLE',41,704,31,CREAM,'900');
  [['POWER',.55+(state.upgrades.engine||0)*.15,MINT],['ARMOUR',.4+(state.upgrades.armor||0)*.2,MINT],['NITRO',state.upgrades.nitro?1:0,'#8bd4ee']].forEach(([s,v,c],i)=>{label(s,43,724+i*17,c,8);bar(114,719+i*17,223,v,c,5);});
  panel(493,696,307,81);label('MERIDIAN FILES',510,719,GOLD,9);text(`${state.stats.missions} OF 6 CHAPTERS COMPLETE`,510,746,15,CREAM,'900');bar(510,759,269,state.stats.missions/6,GOLD,4);
  panel(833,24,422,753,.98);label('BUILD YOUR GETAWAY',853,51,GOLD,10);text('THE NEXT LEVEL.',851,88,32,CREAM,'900');label('AVAILABLE CASH',853,120,MUTED,9);text('$'+p.money.toLocaleString('en-US'),1235,124,28,MINT,'900','right');
  UPGRADES.forEach((u,i)=>{
    const y=150+i*101,level=state.upgrades[u.id]||0,maxed=u.max&&level>=u.max;
    panel(851,y,385,89,.8);label(u.name,866,y+22,CREAM,12);text(maxed?'MAX':'$'+upgradePrice(u,level).toLocaleString('en-US'),1221,y+22,18,maxed?MINT:GOLD,'900','right');label(u.desc,866,y+46,MUTED,10);
    if(u.max){for(let k=0;k<u.max;k++){ctx.fillStyle=k<level?MINT:'#4d6e77';ctx.fillRect(866+k*29,y+65,23,4);}label(`LEVEL ${level} / ${u.max}`,974,y+70,MINT,8);}else label(u.id==='repair'?'RESTORE':'CHANGE COLOUR & LOSE HEAT',866,y+71,MINT,8);
    text(maxed?'INSTALLED':'INSTALL →',1220,y+71,9,GOLD,'800','right');ui.buttons?.push({id:'upgrade-'+u.id,x:851,y,w:385,h:89});
  });
  if(state.toast.time>0)label(state.toast.text.slice(0,54),853,679,MINT,9);
  button('closeGarage','BACK TO THE BAY','E / ESC  •  UPGRADES SAVE AUTOMATICALLY',852,696,384,true);
}
