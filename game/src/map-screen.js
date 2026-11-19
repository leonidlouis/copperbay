import { ROAD_CENTERS, DISTRICTS, PLACES } from './city.js';
import { STORY, missionTarget } from './missions.js';
import { createUI, UI } from './ui-kit.js';
export function drawCityMap(p,state,buttons){
  const u=createUI(p,buttons),{ctx,text}=u;
  ctx.fillStyle='#102f3e';ctx.fillRect(0,0,1280,800);
  u.label('COPPER BAY  /  THE MERIDIAN FILES',31,38,UI.gold,11);text('THE CITY AT YOUR FEET.',28,87,43,UI.cream,'900');
  u.label('STORY  /  SERVICES  /  LIVE DISPATCH',32,113,UI.muted,11);u.button('closeMap','RETURN TO THE STREETS','M / ESC',1026,37,224,true);
  u.panel(28,143,322,607,.97);u.label('THE MERIDIAN FILES',46,168,UI.gold,12);text('Six jobs. One city.',46,198,23,UI.cream,'900');
  STORY.forEach((story,i)=>{const y=222+i*77,done=i<state.mission.index,active=i===state.mission.index;
    if(active){ctx.fillStyle='#376464';ctx.fillRect(39,y,300,69);ctx.fillStyle=UI.gold;ctx.fillRect(39,y,3,69);}
    text(done?'✓':String(i+1).padStart(2,'0'),52,y+25,17,done?UI.mint:active?UI.gold:'#67898e','900');u.label(done?'DONE':active?'ACTIVE':'LOCKED',91,y+16,done?UI.mint:active?UI.gold:'#78979b',9);text(story.name,91,y+35,story.name.length>21?12:14,active?UI.cream:done?'#e0dfca':'#819a9c','900');u.label(story.contact+'  /  $'+story.payout.toLocaleString('en-US'),91,y+53,UI.muted,9);
  });
  u.label('MARA VALE  •  COURIER / CAR THIEF',47,728,UI.mint,10);
  const x0=378,y0=154,size=580,scale=size/4250,mp=(x,y)=>({x:x0+(x+180)*scale,y:y0+(y+150)*scale});
  ctx.save();ctx.beginPath();ctx.roundRect(368,143,616,607,8);ctx.clip();ctx.fillStyle='#387d88';ctx.fillRect(368,143,616,607);
  ctx.strokeStyle='#90c2bb35';ctx.lineWidth=1;for(let i=0;i<16;i++){ctx.beginPath();ctx.moveTo(368+i*44,143);ctx.lineTo(368+i*44,750);ctx.moveTo(368,143+i*44);ctx.lineTo(984,143+i*44);ctx.stroke();}
  const land=mp(190,190);ctx.fillStyle='#dfd7b6';ctx.fillRect(land.x,land.y,3790*scale,3790*scale);ctx.strokeStyle='#e9e3c1';ctx.lineWidth=5;ctx.strokeRect(land.x,land.y,3790*scale,3790*scale);
  ctx.lineWidth=166*scale;ctx.strokeStyle='#f6e7c4';ctx.beginPath();for(const r of ROAD_CENTERS){let a=mp(r,190),b=mp(r,3970);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);a=mp(190,r);b=mp(3970,r);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}ctx.stroke();ctx.strokeStyle='#8eaaa3';ctx.lineWidth=119*scale;ctx.stroke();
  for(const b of state.city.buildings){const q=mp(b.x,b.y);ctx.fillStyle=b.h>170?'#6c9995':b.variant==='warehouse'?'#b3b3a1':'#c0bfa3';ctx.fillRect(q.x,q.y,b.w*scale,b.d*scale);ctx.strokeStyle='#f3dfba80';ctx.lineWidth=.5;ctx.strokeRect(q.x,q.y,b.w*scale,b.d*scale);}
  for(const park of state.city.parks){const q=mp(park.x,park.y);ctx.fillStyle='#91b286';ctx.fillRect(q.x,q.y,park.w*scale,park.d*scale);}
  for(const l of state.city.landmarks)if(l.type==='crane'){const q=mp(l.x,l.y);ctx.strokeStyle=UI.gold;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x-19,q.y);ctx.lineTo(q.x+15,q.y);ctx.stroke();}
  const target=missionTarget(state),player=mp(state.player.x,state.player.y);
  if(target){const t=mp(target.x,target.y),turn=mp(320,800);ctx.strokeStyle='#314f56';ctx.lineWidth=7;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(turn.x,player.y);ctx.lineTo(turn.x,turn.y);ctx.lineTo(t.x,turn.y);ctx.lineTo(t.x,t.y);ctx.stroke();ctx.strokeStyle='#ffd26e';ctx.lineWidth=3.5;ctx.stroke();ctx.fillStyle='#ffcf77';ctx.beginPath();ctx.arc(t.x,t.y,8,0,Math.PI*2);ctx.fill();text('◆',t.x,t.y+4,15,'#234c57','900','center');}
  for(const [key,place] of Object.entries(PLACES)){const q=mp(place.x,place.y);ctx.fillStyle=key==='garage'?'#e9bf79':'#225f68';ctx.beginPath();ctx.roundRect(q.x-8,q.y-8,16,16,3);ctx.fill();text(place.icon,q.x,q.y+4,10,key==='garage'?'#234c57':UI.cream,'900','center');}
  for(const car of state.cars)if(car.police&&!car.wreck){const q=mp(car.x,car.y);ctx.fillStyle='#e67e6c';ctx.beginPath();ctx.arc(q.x,q.y,3.4,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle=UI.cream;ctx.strokeStyle='#1f5761';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(player.x,player.y-10);ctx.lineTo(player.x+7,player.y+7);ctx.lineTo(player.x,player.y+4);ctx.lineTo(player.x-7,player.y+7);ctx.closePath();ctx.fill();ctx.stroke();
  DISTRICTS.forEach(d=>{const q=mp(d.x,d.y);ctx.fillStyle='#173e4ecf';const w=ctx.measureText(d.name).width+16;ctx.fillRect(q.x-w/2,q.y+18,w,18);text(d.name,q.x,q.y+31,10,UI.cream,'900','center');});
  ctx.save();ctx.translate(396,446);ctx.rotate(-Math.PI/2);text('COPPER SOUND',0,0,17,'#b7d3c4','900','center');ctx.restore();u.label('N ↑',939,175,UI.cream,13);u.label('250 m ━━━━━',861,730,'#355c63',10);ctx.restore();
  u.panel(1002,143,250,607,.98);u.label('YOUR CITY / YOUR RECORD',1020,170,UI.gold,10);
  const percent=Math.round(state.stats.missions/6*100);text(percent+'%',1020,226,52,UI.mint,'900');u.label('STORY COMPLETION',1020,248,UI.muted,11);u.bar(1020,266,211,5,percent/100,UI.mint);
  const time=state.stats.playTime||state.elapsed;const stats=[['TIME PLAYED',`${Math.floor(time/3600)}h ${Math.floor(time/60)%60}m`],['CARS STOLEN',state.stats.carsStolen],['TAKEDOWNS',state.stats.takedowns],['POLICE ESCAPES',state.stats.escapes||0],['DISTANCE',((state.stats.distance||0)/1000).toFixed(1)+' km']];stats.forEach(([tag,value],i)=>{u.label(tag,1020,305+i*43,UI.muted,9);text(String(value),1230,308+i*43,20,UI.cream,'900','right');});
  u.label('MAP LEGEND',1020,549,UI.gold,11);[['◆  STORY DESTINATION',UI.gold],['G  GARAGE / UPGRADES',UI.mint],['+  SUPPLY / CLINIC',UI.cream],['H  SAFEHOUSE / SAVE',UI.cream],['●  RESPONDING POLICE',UI.red]].forEach(([s,c],i)=>u.label(s,1020,579+i*25,c,10));
  u.label('FOUR DISTRICTS. NO LOADING SCREENS.',380,779,UI.muted,10);u.label('WANTED LEVEL  '+ '★'.repeat(Math.ceil(state.heat)),31,779,UI.gold,11);
}
