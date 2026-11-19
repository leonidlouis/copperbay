import { ROAD_CENTERS, PLACES, DISTRICTS } from './city.js';
import { missionTarget, STORY } from './missions.js';
import { CREAM, GOLD, MINT, MUTED, RED } from './ui.js';
export function drawMinimap(ui, state, cx, cy, radius) {
  const { ctx, text, circle, poly } = ui, p = state.player, scale = .14, map = (x,y) => ({ x: cx + (x-p.x)*scale, y: cy + (y-p.y)*scale });
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.clip(); ctx.fillStyle='#245868'; ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);
  const land=map(190,190); ctx.fillStyle='#28494f'; ctx.fillRect(land.x,land.y,3790*scale,3790*scale);
  ctx.strokeStyle='#91a89a'; ctx.lineWidth=146*scale; ctx.beginPath();
  for(const v of ROAD_CENTERS) { let a=map(v,190),b=map(v,3980); ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);a=map(190,v);b=map(3980,v);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y); } ctx.stroke();ctx.strokeStyle='#34565c';ctx.lineWidth=106*scale;ctx.stroke();
  const target=missionTarget(state);
  if(target) {
    const t=map(target.x,target.y);ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(t.x,cy);ctx.lineTo(t.x,t.y);ctx.stroke();ctx.setLineDash([]);
    const f=Math.min(1,(radius-9)/(Math.hypot(t.x-cx,t.y-cy)||1)),x=cx+(t.x-cx)*f,y=cy+(t.y-cy)*f;
    poly([{x,y:y-6},{x:x+6,y},{x,y:y+6},{x:x-6,y}],GOLD,CREAM);
  }
  for(const place of Object.values(PLACES)) { const q=map(place.x,place.y);circle(q.x,q.y,2,MINT); }
  for(const c of state.cars) if(c.police && !c.wreck && state.heat) { const q=map(c.x,c.y);circle(q.x,q.y,3.1,RED); }
  ctx.save();ctx.translate(cx,cy);ctx.rotate(p.angle+Math.PI/2);poly([{x:0,y:-8},{x:5,y:6},{x:0,y:3},{x:-5,y:6}],CREAM,'#153e4c');ctx.restore();ctx.restore();
  ctx.strokeStyle='#d5d0ad';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,radius+1,0,Math.PI*2);ctx.stroke();text('N',cx,cy-radius+15,10,CREAM,'900','center');
}
export function drawCityMap(ui,state) {
  const {ctx,text,label,panel,bar,button}=ui;
  ctx.fillStyle='#102e3b';ctx.fillRect(0,0,1280,800);
  label('COPPER BAY  /  THE MERIDIAN FILES',29,36,GOLD,10);text('THE CITY AT YOUR FEET.',28,86,39,CREAM,'900');label('STORY  /  SERVICES  /  LIVE DISPATCH',30,111,MUTED,10);
  button('closeMap','RETURN TO THE STREETS','M / ESC',1021,37,232,true);
  panel(25,143,313,607);label('THE MERIDIAN FILES',43,168,GOLD,10);text('Six jobs. One city.',43,197,24,CREAM,'900');
  STORY.forEach((s,i)=> {
    const y=229+i*75,done=i<state.mission.index,active=i===state.mission.index;
    if(active) {ctx.fillStyle='#355f65';ctx.fillRect(36,y-5,291,67);ctx.fillStyle=GOLD;ctx.fillRect(36,y-5,3,67);}
    text(done?'✓':String(i+1).padStart(2,'0'),49,y+26,19,done?MINT:active?GOLD:'#577a84','900');
    label(done?'DONE':active?'ACTIVE':'LOCKED',87,y+10,done?MINT:active?GOLD:'#71929a',8);
    text(s.name,87,y+29,s.name.length>20?12:14,done||active?CREAM:'#77959b','800');label(`${s.contact}  /  $${s.payout.toLocaleString('en-US')}`,87,y+47,MUTED,8);
  });label('MARA VALE  •  COURIER / CAR THIEF',43,728,MINT,9);
  const mx=355,my=143,mw=630,mh=607;panel(mx,my,mw,mh);ctx.save();ctx.beginPath();ctx.roundRect(mx,my,mw,mh,7);ctx.clip();ctx.fillStyle='#397d88';ctx.fillRect(mx,my,mw,mh);
  for(let x=mx;x<mx+mw;x+=42){ctx.strokeStyle='#b6ded215';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,my);ctx.lineTo(x,my+mh);ctx.stroke();}for(let y=my;y<my+mh;y+=42){ctx.beginPath();ctx.moveTo(mx,y);ctx.lineTo(mx+mw,y);ctx.stroke();}
  const scale=.134, ox=401,oy=177, at=(x,y)=>({x:ox+x*scale,y:oy+y*scale});
  const rect=(x,y,w,d,color)=>{const q=at(x,y);ctx.fillStyle=color;ctx.fillRect(q.x,q.y,w*scale,d*scale);};
  rect(160,175,3820,3805,'#d5caa5');rect(175,188,3790,3780,'#eee0b9');
  for(const r of ROAD_CENTERS){rect(r-85,190,170,3790,'#bfc6ad');rect(190,r-85,3790,170,'#bfc6ad');rect(r-64,190,128,3790,'#5b8587');rect(190,r-64,3790,128,'#5b8587');}
  for(const b of state.city.buildings){rect(b.x,b.y,b.w,b.d,'#b4b299');rect(b.x+10,b.y+10,b.w-20,b.d-20,b.variant==='tower'?'#7ca4a0':b.variant==='warehouse'?'#9caea1':'#c5c3a7');}
  for(const park of state.city.parks)rect(park.x,park.y,park.w,park.d,'#88ad88');
  for(let i=0;i<4;i++)rect(-120,2720+i*260,280,65,'#bbbc9b');
  const p=state.player,t=missionTarget(state),start=at(p.x,p.y);
  if(t){const end=at(t.x,t.y);ctx.strokeStyle='#fff0ba';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(start.x,end.y);ctx.lineTo(end.x,end.y);ctx.stroke();ctx.strokeStyle='#eab96b';ctx.lineWidth=3;ctx.stroke();text('◆',end.x,end.y+5,23,GOLD,'900','center');}
  for(const [k,v]of Object.entries(PLACES)){const q=at(v.x,v.y);ctx.fillStyle=k==='garage'?'#e6b973':'#205862';ctx.beginPath();ctx.roundRect(q.x-7,q.y-8,15,16,3);ctx.fill();text(v.icon,q.x+.5,q.y+4,10,k==='garage'?'#1c4855':CREAM,'900','center');}
  const labels=[['PORT MERIDIAN',900,3370],['CROWN QUARTER',2210,2260],['SAFFRON STRIP',1000,1110],['VERDIGRIS HILLS',3100,640]];
  for(const [name,x,y]of labels){const q=at(x,y);ctx.fillStyle='#143c4ad9';ctx.fillRect(q.x-name.length*3.5,q.y-11,name.length*7+9,18);text(name,q.x+4,q.y+1,10,CREAM,'900','center');}
  for(const c of state.cars)if(c.police&&!c.wreck&&state.heat){const q=at(c.x,c.y);ui.circle(q.x,q.y,3,RED);}
  ui.poly([{x:start.x,y:start.y-9},{x:start.x+6,y:start.y+6},{x:start.x,y:start.y+3},{x:start.x-6,y:start.y+6}],CREAM,'#174c5d',2);
  ctx.save();ctx.translate(382,480);ctx.rotate(-Math.PI/2);text('COPPER SOUND',0,0,17,'#dce4bb88','800','center');ctx.restore();label('N ↑',944,174,CREAM,12);label('250 m ━━━',870,730,'#23545f',9);ctx.restore();
  panel(1002,143,252,607);label('YOUR CITY / YOUR RECORD',1021,169,GOLD,9);text(Math.round(state.stats.missions/6*100)+'%',1021,225,51,MINT,'900');label('STORY COMPLETION',1022,248,MUTED,10);bar(1022,265,213,state.stats.missions/6,MINT,5);
  const seconds=state.stats.playTime||state.elapsed,stats=[['TIME PLAYED',`${Math.floor(seconds/3600)}h ${Math.floor(seconds%3600/60)}m`],['CARS STOLEN',state.stats.carsStolen],['TAKEDOWNS',state.stats.takedowns],['POLICE ESCAPES',state.stats.escapes||0],['DISTANCE',(state.stats.distance/1000).toFixed(1)+' km']];
  stats.forEach(([s,v],i)=>{label(s,1022,309+i*43,MUTED,8);text(String(v),1234,311+i*43,20,CREAM,'900','right');});
  label('MAP LEGEND',1022,550,GOLD,10);[['◆','STORY DESTINATION',GOLD],['G','GARAGE / UPGRADES',MINT],['+','SUPPLY / CLINIC',MINT],['H','SAFEHOUSE / SAVE',CREAM],['•','RESPONDING POLICE',RED]].forEach(([a,b,c],i)=>label(a+'  '+b,1022,581+i*25,c,10));
  label('WANTED LEVEL  '+ '★'.repeat(Math.ceil(state.heat)),30,780,GOLD,10);label('FOUR DISTRICTS. NO LOADING SCREENS.',367,780,MUTED,9);label('CITY NETWORK / ONLINE',1094,780,MINT,8);
}
