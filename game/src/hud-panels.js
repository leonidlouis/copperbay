import { createUI, UI, drawPortrait } from './ui-kit.js';
import { currentMission, missionObjective, missionTarget } from './missions.js';
import { districtAt } from './city.js';
import { VEHICLE_TYPES } from './vehicles.js';
import { distance, clamp } from './math.js';
export function createHudPanels(p, minimap) {
  const u=createUI(p),{ctx,text}=u;
  function weapons(state){
    const slots=[['1','PISTOL','86'],['2','UNARMED','∞'],['3','SCATTERGUN',state.player.shotgun?'24':'LOCKED']];
    slots.forEach(([key,name,ammo],i)=>{const x=26+i*115,y=294,active=(i===0&&state.player.weapon==='PISTOL')||(i===1&&state.player.weapon==='FISTS')||(i===2&&state.player.weapon==='SCATTERGUN');u.panel(x,y,109,45,.86);if(active){ctx.fillStyle=UI.gold;ctx.fillRect(x,y,3,45);}u.label(key,x+9,y+14,UI.gold,10);u.label(name,x+9,y+35,active?UI.cream:UI.muted,9);
      ctx.fillStyle=active?UI.cream:'#8ca4a7';if(i===1){ctx.fillRect(x+46,y+8,15,12);ctx.fillRect(x+43,y+13,6,10);}else{ctx.fillRect(x+41,y+9,i===0?27:43,5);ctx.fillRect(x+45,y+13,7,10);}text(i===0?String(state.player.ammo):ammo,x+100,y+20,11,UI.muted,'800','right');});
  }
  function draw(state){
    const pl=state.player,m=state.mission,story=currentMission(state),target=missionTarget(state),district=districtAt(pl.x,pl.y);
    const top=ctx.createLinearGradient(0,0,0,135);top.addColorStop(0,'#123b5070');top.addColorStop(1,'#123b5000');ctx.fillStyle=top;ctx.fillRect(0,0,1280,135);
    text('COPPER BAY',26,49,30,UI.cream,'900','left','Arial Black, Arial');u.label('THE MERIDIAN FILES',28,69,UI.gold,10);ctx.fillStyle=UI.gold;ctx.fillRect(27,80,49,2);
    u.panel(480,24,316,38,.65);text(district.name+'  /  '+String(Math.floor(state.time)).padStart(2,'0')+':'+String(Math.floor(state.time%1*60)).padStart(2,'0'),638,48,11,UI.cream,'800','center');
    u.panel(26,99,345,181,.92);u.label(`CHAPTER ${String(Math.min(m.index+1,6)).padStart(2,'0')} / 06    •    ${story.name}`,42,121,UI.gold,10);
    u.wrap(missionObjective(state),42,151,309,19,UI.cream,24);
    u.label('STAGE '+String(m.step+1).padStart(2,'0')+' / '+String(story.steps.length).padStart(2,'0'),42,208,UI.mint,10);
    const timer=m.timer>0?m.timer:state.elapsed,minutes=Math.floor(timer/60);text(`${String(minutes).padStart(2,'0')}:${String(Math.floor(timer%60)).padStart(2,'0')}`,352,208,18,UI.gold,'900','right');
    u.bar(42,219,309,4,(m.step+.55)/story.steps.length,UI.gold);u.label('NEXT',42,246,UI.gold,9);
    const next=story.steps[m.step+1]?.text||'Collect payout · Next chapter';u.wrap(next,80,246,273,11,UI.muted,15);
    text('$'+Math.floor(pl.money).toLocaleString('en-US'),1250,49,31,UI.mint,'900','right');
    for(let i=0;i<5;i++)text('★',1113+i*30,88,27,i<Math.ceil(state.heat)?UI.gold:'#668b925e','900','center');
    u.label(state.heat>0?(state.unseen>3?'SEARCHING / BREAK LINE OF SIGHT':'WANTED / PURSUIT AUTHORIZED'):'NO ACTIVE WARRANT',1007,113,state.heat?UI.red:UI.mint,10);
    u.panel(1007,130,245,state.heat?179:71,.9);
    u.label('POLICE RESPONSE',1022,151,UI.cream,11);u.label('LIVE',1210,151,UI.red,9);u.bar(1022,160,214,2,1,state.heat?UI.red:UI.mint);
    const police=state.cars.filter(c=>c.police&&!c.wreck).sort((a,b)=>distance(a,pl)-distance(b,pl));
    if(state.heat>0){
      const rows=[['UNIT 09',police[0]&&distance(police[0],pl)<130?'RAMMING':'PURSUIT',police[0]],['UNIT 12','PURSUIT',police[1]],['UNIT 18',state.roadblocks.length?'ROADBLOCK':'INTERCEPT',police[2]]];
      rows.forEach(([name,status,car],i)=>{const y=184+i*27;u.label(name,1022,y,UI.muted,10);text(status,1092,y,10,i===0?UI.red:UI.gold,'900');text(car?Math.round(distance(car,pl))+' m':'EN ROUTE',1237,y,10,UI.cream,'800','right');});
      u.label(state.heat>=3?'AIR 01     TRACKING FROM ABOVE':'DISPATCH     GROUND UNITS ACTIVE',1022,283,UI.mint,10);u.bar(1022,294,214,3,1-clamp(state.unseen/(8+Math.ceil(state.heat)*2),0,1),UI.red);
    }else u.label('ALL UNITS / STANDING BY',1022,180,UI.mint,10);
    weapons(state);
    minimap(state,127,636,87);
    u.panel(24,733,207,65,.94);
    text(district.tag,127,750,14,UI.cream,'900','center');
    const values=[['HEALTH',pl.health/100,UI.mint],['ARMOUR',pl.armor/100,'#8fcde3'],['RESPECT',Math.min(1,((state.stats.missions||0)*14+(state.stats.takedowns||0))/100),UI.gold]];
    values.forEach(([name,v,col],i)=>{const y=765+i*12;u.label(name,29,y,col,9);u.bar(85,y-6,133,4,v,col);});
    if(!m.briefing){u.panel(252,662,270,79,.9);u.label('◉  FREE BAY RADIO  /  88.4 FM',268,683,UI.mint,10);text('SALT IN THE SIGNAL',268,707,17,UI.cream,'900');u.label('SOL NAVARRO  •  COASTAL ELECTRO',268,726,UI.muted,9);for(let i=0;i<13;i++){ctx.fillStyle=UI.mint;ctx.fillRect(491+i*1.5,704-Math.sin(i*2+state.elapsed)*5,1,7+Math.sin(i+state.elapsed)*4);}}
    if(pl.car){const spec=VEHICLE_TYPES[pl.car.type];u.panel(1031,637,221,145,.92);u.label(spec.name,1047,658,UI.gold,11);text(String(Math.round(Math.abs(pl.car.speed)*.23)).padStart(3,'0'),1044,717,63,UI.cream,'900');u.label('KM/H',1181,714,UI.muted,11);text('D'+Math.min(6,1+Math.floor(Math.abs(pl.car.speed)/85)),1233,681,17,UI.mint,'900','right');
      u.label('CONDITION',1047,739,UI.muted,9);u.bar(1112,733,123,5,pl.car.hp/(spec.hp*(1+(pl.car.armorLevel||0)*.3)),UI.mint);u.label('NITRO',1047,761,'#8fd4f0',9);u.bar(1112,755,123,5,state.nitro/100,'#8fd4f0');
    }else{u.panel(1040,676,212,106,.9);u.label('MARA VALE / ON FOOT',1056,699,UI.gold,10);text(pl.weapon,1056,725,19,UI.cream,'900');text(String(pl.ammo).padStart(3,'0'),1234,760,29,UI.cream,'900','right');u.label('ROUNDS',1056,758,UI.muted,10);}
    u.panel(551,746,450,36,.78);text(pl.car?'WASD drive   SPACE drift   SHIFT nitro   E exit':'WASD move   SHIFT sprint   LMB fire   E steal',776,769,11,UI.cream,'700','center');u.label('V  CAMERA     M  MAP     K  SAVE',572,795,UI.muted,9);
    if(target&&!state.mapOpen){const d=Math.round(distance(pl,target));u.panel(553,690,447,42,.83);text('◆  '+d+' m    /    '+(pl.car?'FOLLOW THE GOLD ROUTE':'RECOVER THE MISSING PAGES'),776,716,12,UI.gold,'800','center');}
    if(state.stylePopup){text('+'+state.stylePopup.score,934,382,37,UI.gold,'900','right');text(state.stylePopup.text+'  × 2.0',934,408,14,UI.cream,'900','right');u.bar(809,420,125,3,Math.min(1,state.stylePopup.time/2),UI.gold);}
    if(state.toast.time>0&&!m.briefing){const w=Math.min(680,state.toast.text.length*6.3+35);u.panel(640-w/2,85,w,34,.90);text(state.toast.text,640,107,12,UI.cream,'700','center');}
    if(state.saved>0)u.label('✓ LOCAL SAVE',890,646,UI.mint,11);
    if(!pl.car&&!state.mapOpen&&!state.shopOpen&&!m.briefing){const aim=state.pointer||{x:675,y:390};ctx.strokeStyle='#fff5d8';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(aim.x,aim.y,5,0,Math.PI*2);ctx.moveTo(aim.x-12,aim.y);ctx.lineTo(aim.x-7,aim.y);ctx.moveTo(aim.x+7,aim.y);ctx.lineTo(aim.x+12,aim.y);ctx.stroke();}
  }
  function dialogue(state){const story=currentMission(state),m=state.mission;u.panel(254,560,713,118,.96);drawPortrait(ctx,268,575,82,m.index%2);u.label((m.radio?'RADIO LINK / ':'CONTACT / ')+story.contact,367,586,UI.gold,12);u.label(story.role.toUpperCase(),367,605,UI.mint,10);u.wrap('“'+story.dialogue[m.dialogue]+'”',367,633,560,17,UI.cream,22);u.label('ENTER  CONTINUE  /  '+(m.dialogue+1)+' OF '+story.dialogue.length,367,662,UI.muted,9);}
  return {draw,dialogue};
}
