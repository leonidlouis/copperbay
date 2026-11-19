import { makeCar } from './vehicles.js';
import { createMissionState } from './missions.js';
// Reproducible world states photographed by the same renderer used during play.
export function stageShot(state,name){
  state.photography=true;state.screen='play';state.viewMode='3d';state.elapsed=83.4;state.time=17.65;state.toast.time=0;
  Object.assign(state.player,{x:302,y:2430,angle:-Math.PI/2,health:92,armor:76,money:18450,ammo:86,shotgun:true});
  state.camera={x:302,y:2430,heading:-1.51,zoom:1.05};state.upgrades={engine:2,armor:1,nitro:1};state.nitro=78;
  state.stats={...state.stats,carsStolen:14,takedowns:23,missions:4,escapes:7,distance:28400,playTime:4878};
  state.mission=createMissionState(4);state.mission.active=true;state.mission.timer=147;state.heat=4;
  state.cars=state.cars.filter(c=>Math.hypot(c.x-320,c.y-2200)>1300);
  const add=(x,y,type,color,angle=-Math.PI/2,speed=0)=>{const c=makeCar(x,y,type,color,angle);c.speed=speed;c.driver=true;c.cruise=speed;state.cars.push(c);return c;};
  const hero=add(302,2430,'coupe','#ef9876',-1.49,382);hero.hp=108;hero.armorLevel=1;state.player.car=hero;state.player.angle=hero.angle;
  add(365,2387,'patrol','#eeead8',-1.65,360);
  add(277,2272,'patrol','#eeead8',-1.45,340);
  add(350,2055,'patrol','#eeead8',-Math.PI/2,300);
  add(285,1910,'taxi','#edc265',Math.PI/2,120);
  add(348,1770,'van','#64b8b2',-Math.PI/2,130);
  add(290,1630,'coupe','#c5b4ce',Math.PI/2,115);
  add(350,1460,'sedan','#f5dcab',-Math.PI/2,110);
  add(520,2240,'sedan','#76b5ad',Math.PI,120);
  state.roadblocks=[{x:320,y:1280}];
  add(276,1430,'patrol','#eeead8',.15);add(350,1435,'patrol','#eeead8',-.1);
  for(let i=0;i<22;i++)state.peds.push({x:(i%2?407:219)+Math.sin(i*2.3)*8,y:1380+i*43+Math.cos(i*4)*14,hp:70,angle:i%2?Math.PI/2:-Math.PI/2,flee:i%4?0:3,color:['#ebc380','#78c5bc','#db8c96','#d4d8c0'][i%4],seed:i,police:false});
  for(let i=0;i<24;i++)state.effects.skid(302+Math.sin(i/9)*10,2440+i*9,-1.49);
  state.effects.burst(344,2401,'#ffd28b',18,80,12);state.effects.update(.12);
  state.styleScore=1450;state.stylePopup={text:'NEAR MISS',score:450,time:1.65};
  if(name==='2'||name==='onfoot'){
    state.player.car=null;Object.assign(state.player,{x:1040,y:2575,angle:-1.52,muzzle:.1});
    state.camera={x:1040,y:2575,heading:-1.60,zoom:1.1};state.time=16.7;state.heat=2;state.roadblocks=[];state.stylePopup={text:'TAKEDOWN',score:250,time:1.6};
    state.cars=state.cars.filter(c=>Math.hypot(c.x-1040,c.y-2480)>650);
    hero.x=1108;hero.y=2510;hero.angle=-1.3;hero.speed=0;hero.parked=true;if(!state.cars.includes(hero))state.cars.push(hero);
    add(970,2435,'patrol','#e6e9d6',-.25);add(1252,2240,'patrol','#e6e9d6',1.5);
    state.mission=createMissionState(1);state.mission.active=true;state.mission.step=1;state.mission.briefing=true;state.mission.radio=true;state.mission.dialogue=2;
    state.peds.push({x:1035,y:2439,hp:46,enemy:true,police:false,angle:Math.PI/2,color:'#c17c6c',seed:2,cooldown:0});
    state.peds.push({x:1110,y:2400,hp:62,enemy:true,police:false,angle:2.1,color:'#aa7b79',seed:3,cooldown:0});
    state.peds.push({x:950,y:2345,hp:0,enemy:true,police:false,angle:2,color:'#ab7c70',seed:4,cooldown:0});
    state.peds.push({x:969,y:2415,hp:70,police:true,angle:1.4,color:'#6b9cb0',seed:5,cooldown:0});
    state.bullets.push({x:1033,y:2513,angle:-1.60,life:.3,owner:'player',speed:1050});
    state.effects.burst(1036,2441,'#ffd892',18,65,25);state.effects.update(.09);
    state.pickups.push({x:998,y:2535,kind:'ammo',value:40},{x:1018,y:2505,kind:'cash',value:100});
  }
  if(name==='3'||name==='map'){state.mapOpen=true;state.stylePopup=null;}
  if(name==='4'||name==='garage'){
    state.cars=state.cars.filter(c=>c===hero||Math.hypot(c.x-3205,c.y-3195)>650);
    state.player.x=3205;state.player.y=3195;state.player.car=hero;hero.x=3205;hero.y=3195;hero.speed=0;hero.angle=-1.23;hero.color='#72cdb7';hero.hp=158;
    state.player.angle=hero.angle;state.camera={x:3205,y:3195,heading:-.45,zoom:1.05};state.heat=0;state.roadblocks=[];state.stylePopup=null;state.garageOpen=true;state.time=17.2;
    state.mission.index=5;state.mission.active=false;state.mission.lastName='DEAD AIR';state.mission.lastPayout=3600;state.stats.missions=5;state.player.money=22050;
    add(3230,2970,'taxi','#edc26c',Math.PI/2,80);add(3170,2820,'sedan','#b1a5c5',-Math.PI/2,90);
  }
  if(name==='title'){state.screen='title';state.player.x=302;state.player.y=2910;state.heat=0;state.stylePopup=null;}
  return state;
}
