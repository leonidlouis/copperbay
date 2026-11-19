// Photography only stages live world entities and screens; every pixel is a game render.
import { makeCar } from './vehicles.js';
import { createMissionState } from './missions.js';
export function stageShot(state, name) {
  state.photograph=true;state.screen='play';state.elapsed=74.4;state.time=17.63;state.viewMode='chase';state.toast.time=0;
  Object.assign(state.player,{x:348,y:2435,angle:-Math.PI/2,money:18450,ammo:86,health:92,armor:78,shotgun:true});
  state.camera={x:348,y:2435,zoom:1,heading:-Math.PI/2};
  state.mission=createMissionState(4);Object.assign(state.mission,{active:true,elapsed:147});
  state.upgrades={engine:2,armor:1,nitro:1};state.stats={...state.stats,carsStolen:14,takedowns:23,missions:4,distance:28400,escapes:7,playTime:4860};
  state.cars=state.cars.filter(c=>c.x>1000);
  const add=(x,y,type,color,angle=-Math.PI/2,speed=0)=>{const c=makeCar(x,y,type,color,angle);c.speed=speed;c.driver=true;state.cars.push(c);return c;};
  const hero=add(348,2435,'coupe','#ed9978',-Math.PI/2,382);hero.nitro=78;state.player.car=hero;
  add(294,2354,'patrol','#e2ead9',-Math.PI/2,340);
  add(350,2201,'patrol','#e2ead9',-Math.PI/2,320);
  const block=add(291,1970,'patrol','#e2ead9',.15,0);block.parked=true;
  add(349,2055,'van','#67b8b1',-Math.PI/2,120);add(289,2127,'taxi','#edc66d',Math.PI/2,90);
  add(350,1870,'sedan','#ccbacd',-Math.PI/2,100);add(290,1810,'coupe','#a0cab1',Math.PI/2,90);
  add(350,1700,'taxi','#edc66d',-Math.PI/2,130);add(289,1550,'van','#e3d0a6',Math.PI/2,90);
  state.heat=4;state.lastCrime=state.elapsed;state.helicopter={x:410,y:1965,z:120,angle:-1.2};
  state.peds=state.peds.filter(p=>p.x>1000);
  for(let i=0;i<27;i++)state.peds.push({x:i%2?409+(i%3)*2:204+(i%4)*3,y:1510+i*34,hp:70,angle:i%2?Math.PI/2:-Math.PI/2,flee:i%6===0?3:0,color:['#e5b77d','#df99a6','#7fc6b7','#b2a1c6'][i%4],seed:i,police:false,cooldown:1});
  for(let i=0;i<36;i++)state.effects.skid(348+Math.sin(i/12)*5,2450+i*8,-Math.PI/2);
  state.effects.burst(310,2341,'#ffdc97',26,100,14);state.effects.update(.2);
  state.combo={time:2.7,score:450,label:'NEAR MISS',multiplier:2};
  if(name==='2'||name==='onfoot') {
    Object.assign(state.player,{car:null,x:1105,y:2545,angle:-1.98,muzzle:.1});state.camera={x:1105,y:2545,zoom:1.4,heading:-Math.PI/2};state.time=16.7;state.heat=2;
    state.mission=createMissionState(1);Object.assign(state.mission,{active:true,step:1,briefing:true,dialogue:2,radio:true,elapsed:83});
    hero.x=1210;hero.y=2495;hero.angle=-1.8;hero.speed=0;hero.parked=true;
    add(811,2440,'patrol','#e2ead9',Math.PI/2,0);add(1250,2395,'patrol','#e2ead9',-Math.PI/2,0);
    for(let i=0;i<3;i++)state.peds.push({x:1057+i*48,y:2395+i%2*25,hp:65,enemy:true,police:false,angle:Math.PI/2,color:'#b9766d',seed:i,cooldown:i?1:0});
    for(let i=0;i<9;i++)state.peds.push({x:913+i*31,y:2290,hp:70,angle:0,color:['#e7bd7e','#a4bdb9','#bc9bae'][i%3],seed:i+40,police:false,cooldown:1});
    state.peds.push({x:864,y:2415,hp:100,police:true,angle:0,color:'#6393a4',seed:41,cooldown:1});
    state.bullets.push({x:1105,y:2465,angle:-Math.PI/2,life:.5,owner:'player',speed:1050},{x:1099,y:2425,angle:Math.PI/2,life:.4,owner:'enemy',speed:1050});
    state.effects.burst(1106,2418,'#ffd38a',24,80,20);state.effects.update(.08);state.pickups.push({x:1060,y:2510,kind:'ammo',value:40},{x:1050,y:2478,kind:'cash',value:100});
    state.combo={time:2.8,score:250,label:'TAKEDOWN',multiplier:2};
  }
  if(name==='3'||name==='map') state.mapOpen=true;
  if(name==='4'||name==='garage') {
    state.garageOpen=true;state.time=17.4;state.heat=0;state.combo.time=0;state.player.money=22050;
    Object.assign(hero,{x:350,y:3205,angle:-.95,color:'#79d9bd',speed:0,hp:120});state.player.x=hero.x;state.player.y=hero.y;
    state.camera={x:hero.x,y:hero.y,zoom:1,heading:hero.angle};
    add(292,3030,'taxi','#e7c06b',Math.PI/2,60);
    Object.assign(state.mission,{index:5,active:false,lastName:'DEAD AIR',lastPayout:3600});state.stats.missions=5;
    for(let i=0;i<10;i++)state.peds.push({x:407+(i%3)*4,y:2770+i*32,hp:65,angle:0,color:['#e0af7e','#a0c5b6','#bf91a8'][i%3],seed:i+55,cooldown:1});
  }
  if(name==='title'){state.screen='title';state.time=17.4;}
  return state;
}
