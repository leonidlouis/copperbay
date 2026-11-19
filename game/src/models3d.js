import { ellipsoid, limb } from './mesh-primitives.js';
import { VEHICLE_TYPES } from './vehicles.js';
// Procedural vehicles and articulated characters share the city's world units.
export function drawCar3D(r, car, state) {
  const spec=VEHICLE_TYPES[car.type], L=spec.d/2, W=spec.w/2, c=Math.cos(car.angle),s=Math.sin(car.angle);
  const v=(x,y,z)=>[car.x+x*c-y*s,car.y+x*s+y*c,z];
  const box=(x,y,w,d,h,color,z=0)=>{const a=v(x,y,z);r.box(a[0],a[1],w,d,h,color,z,car.angle);};
  const color=car.wreck?'#5d6262':car.color;
  r.face([v(-L-3,-W-3,.9),v(L+5,-W-3,.9),v(L+8,W+5,.9),v(-L-4,W+5,.9)],'#384f52');
  box(0,0,L*1.94,W*1.84,5,'#263c45',3);
  box(0,0,L*1.9,W*1.95,4,color,5);
  // Eight-point bevels produce a sculpted body instead of a rectangular sprite.
  const outline=[[-L+4,-W], [L-7,-W],[L,-W+5],[L,W-5],[L-7,W],[-L+4,W],[-L,W-4],[-L,-W+4]];
  for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];r.face([v(a[0],a[1],7),v(b[0],b[1],7),v(b[0]*.98,b[1]*.95,17),v(a[0]*.98,a[1]*.95,17)],color);}
  r.face(outline.map(a=>v(a[0]*.98,a[1]*.95,17)),car.police?'#f2e9d4':color);
  const van=car.type==='van', roofZ=van?37:25, roofBack=van?-L+6:-13, roofFront=van?L-9:9;
  r.face([v(-21,-W+3,17),v(17,-W+3,17),v(roofFront,-W+5,roofZ),v(roofBack,-W+5,roofZ)],'#315764');
  r.face([v(-21,W-3,17),v(roofBack,W-5,roofZ),v(roofFront,W-5,roofZ),v(17,W-3,17)],'#3f7180');
  r.face([v(17,-W+3,17),v(17,W-3,17),v(roofFront,W-5,roofZ),v(roofFront,-W+5,roofZ)],'#88b8bd');
  r.face([v(-21,W-3,17),v(-21,-W+3,17),v(roofBack,-W+5,roofZ),v(roofBack,W-5,roofZ)],'#244855');
  r.face([v(roofBack,-W+5,roofZ),v(roofFront,-W+5,roofZ),v(roofFront,W-5,roofZ),v(roofBack,W-5,roofZ)],car.police?'#e8e9db':color);
  for(const side of [-1,1]){
    box(-2,side*(W-2),1.1,1.2,roofZ-17,color,17);
    box(10,side*(W+2),5,4,3,color,19);
    box(-6,side*(W+.1),6,.8,1.2,'#d9d6be',16);
    for(const x of [-L*.63,L*.62]){
      const radius=6.4;
      for(let i=0;i<10;i++){const a=i*Math.PI/5,b=(i+1)*Math.PI/5;
        const A=v(x+Math.cos(a)*radius,side*(W+1.2),7+Math.sin(a)*radius),B=v(x+Math.cos(b)*radius,side*(W+1.2),7+Math.sin(b)*radius);
        r.face([A,B,v(x,side*(W+1.3),7)],'#172d38');
        const C=v(x+Math.cos(a)*3.5,side*(W+1.5),7+Math.sin(a)*3.5),D=v(x+Math.cos(b)*3.5,side*(W+1.5),7+Math.sin(b)*3.5);
        r.face([C,D,v(x,side*(W+1.6),7)],i%2?'#b3c4c2':'#75969b');
      }
    }
  }
  box(-L-.3,0,1,W*1.8,2,'#203941',5);box(L+.1,0,1,W*1.7,2,'#f0dfba',8);
  for(const side of [-1,1]){box(-L-.5,side*W*.67,1,7,3,'#ff7062',12);box(L+.5,side*W*.66,1,7,3,'#fff2bf',12);}
  box(-L-.9,0,.4,9,3,'#f2e9c8',8.2);
  if(car.type==='coupe'){
    box(-24,0,3,W*2.08,1.3,'#344c50',21);for(const side of [-1,1])box(-24,side*10,2,1,4,'#354e54',17);
    box(-L-.6,0,1,W*1.78,1.3,'#ff8e77',13);
    box(-L-1.1,0,.5,8,1,'#526c6d',15);
    r.face([v(15,-3,17.1),v(L-3,-3,17.1),v(L-3,-1.5,17.1),v(15,-1.5,17.1)],'#e8c6a0');
    r.face([v(15,3,17.1),v(L-3,3,17.1),v(L-3,1.5,17.1),v(15,1.5,17.1)],'#e8c6a0');
    for(const side of [-1,1])box(-L-1,side*8,2,3,2,'#16313b',4);
  }
  if(car.police){
    box(-2,0,9,24,2,'#203844',roofZ+.2);
    box(-2,-7,7,8,3,'#ff615d',roofZ+2);box(-2,7,7,8,3,'#72d6ff',roofZ+2);
    box(0,W+.2,23,.6,7,'#e9e8d2',8);box(0,-W-.2,23,.6,7,'#e9e8d2',8);
    for(const side of [-1,1])r.face([v(-3,side*(W+.8),10),v(0,side*(W+.8),14),v(3,side*(W+.8),10),v(0,side*(W+.8),8)],'#d2ab60');
    // Siren reflections are projected onto the road around responding cars.
    for(const side of [-1,1])r.face([v(-12,side*18,1),v(13,side*18,1),v(22,side*33,1),v(-21,side*33,1)],side===1?'#619fab':'#b07d77');
  }
  if(car.type==='taxi')box(0,0,12,7,4,'#f7db82',roofZ);
  if(car===state.player.car && state.nitroActive){for(const side of [-1,1])r.face([v(-L,side*8-2,5),v(-L-24,side*8,6),v(-L,side*8+2,7)],'#9fe9ff');}
}
export function drawPerson3D(r, ped, state, hero) {
  if(ped.hp<=0){ellipsoid(r,ped.x,ped.y,3,12,4,3,ped.color||'#b88169',8,3);return;}
  const a=ped.angle||0,c=Math.cos(a),s=Math.sin(a),v=(x,y,z)=>[ped.x+x*c-y*s,ped.y+x*s+y*c,z];
  const skin=hero?'#b97c58':ped.seed%3?'#d5a17a':'#805f50',shirt=hero?'#ec9a6e':ped.police?'#35576a':ped.color||'#bc7d72';
  const stride=hero?(state.walking?Math.sin(state.elapsed*13)*3:0):Math.sin(state.elapsed*5+(ped.seed||0))*2.4;
  const depth=r.project(ped.x,ped.y).depth;
  if(!hero&&depth>340){
    for(const side of [-1,1]){const leg=v(0,side*2.4,0);r.box(leg[0],leg[1],3.6,3.5,15,'#344e5b',0,a);const arm=v(0,side*6,15);r.box(arm[0],arm[1],3,3,12,shirt,15,a);}
    r.box(ped.x,ped.y,7,10,13,shirt,14,a);
    ellipsoid(r,ped.x,ped.y,32,3.1,3.2,4.5,skin,depth>650?6:8,3);
    r.box(ped.x,ped.y,5,6,2,'#4b4037',35,a);
    if(ped.police||ped.enemy){const gun=v(11,-4,24);r.box(gun[0],gun[1],8,2,2,'#263e4a',24,a);r.text3d(ped.police?'CBPD':'VOSS SECURITY',ped.x,ped.y,44,3,ped.police?'#b4e5ff':'#ffb59d','#25414d');}
    return;
  }
  const at=(x,y,z)=>v(x,y,z),bone=(A,B,rad,col,end=rad)=>limb(r,A,B,rad,col,7,end);
  r.face([v(-5,-5,.5),v(7,-5,.5),v(22,8,.5),v(1,9,.5)],'#85988c');
  for(const side of [-1,1]){
    const step=side*stride;bone(at(0,side*2.6,16),at(step*.5,side*2.8,9),2.1,'#344d5a',1.8);bone(at(step*.5,side*2.8,9),at(step,side*3.2,2.6),1.9,'#2e4859',1.4);
    const foot=at(step+1.3,side*3.2,1.8);ellipsoid(r,...foot,3,1.8,1.7,hero?'#eee0c1':'#30434b',8,3);
  }
  // Rounded shoulders, fitted torso and a narrower waist give each silhouette weight.
  const body=at(0,0,21);ellipsoid(r,...body,4.3,6,8,shirt,10,5);
  const neck=at(0,0,28);ellipsoid(r,...neck,2.1,2.1,3,skin,8,4);
  const head=at(0,0,32);ellipsoid(r,...head,3.2,3.3,4.5,skin,10,6);
  const hair=at(-.7,0,34);ellipsoid(r,...hair,3.1,3.6,3,hero?'#3a312e':ped.police?'#284557':'#4a3d32',10,5);
  if(hero){const tail=at(-3,0,29);ellipsoid(r,...tail,1.7,2.4,4,'#3a312e',8,4);}
  const armed=hero||ped.enemy||ped.police;
  if(armed){bone(at(0,-5,25),at(6,-6,23),2,shirt,1.7);bone(at(6,-6,23),at(13,-4,25),1.6,skin,1.3);bone(at(0,5,25),at(6,5,23),2,shirt,1.7);bone(at(6,5,23),at(13,-2,25),1.6,skin,1.3);
    const gun=at(16,-4,26);r.box(gun[0],gun[1],9,2.4,2.3,'#243b49',26,a);
    const grip=at(13,-4,23);r.box(grip[0],grip[1],2.5,2.3,4,'#233a47',23,a);
    if(hero&&ped.muzzle>0){for(let i=0;i<6;i++){const t=i*Math.PI/3;r.face([at(20,-4,26),at(27+Math.cos(t)*3,-4+Math.sin(t)*6,26),at(22,-4,31)],i%2?'#fff3bb':'#ffd17d');}}
  }else for(const side of [-1,1]){bone(at(0,side*5,25),at(stride*side,side*6,19),1.8,shirt,1.5);bone(at(stride*side,side*6,19),at(stride*side*1.6,side*6,13),1.4,skin,1.1);}
  if(ped.enemy||ped.police)r.text3d(ped.police?'CBPD':'VOSS SECURITY',ped.x,ped.y,44,3,ped.police?'#b4e5ff':'#ffb59d','#25414d');
}
export function drawHelicopter3D(r,state){
  const p=state.player,c=Math.cos(state.camera.heading??p.angle),s=Math.sin(state.camera.heading??p.angle);
  const x=p.x+c*480-s*35,y=p.y+s*480+c*35,z=120;
  r.box(x,y,35,58,23,'#36596a',z,-.25);r.box(x-3,y-27,26,16,16,'#83bac6',z+5,-.25);
  r.box(x,y+52,7,75,7,'#496b76',z+10,-.25);r.box(x,y+85,26,5,11,'#dfcfad',z+14);
  r.box(x,y,4,4,10,'#385a63',z+24);
  for(const side of [-1,1]){r.box(x+side*17,y,3,68,3,'#2c4954',z-8);r.box(x+side*16,y,2,2,12,'#294c57',z-8);}
  const a=state.elapsed*27,dx=Math.cos(a)*65,dy=Math.sin(a)*65;
  r.line([x-dx,y-dy,z+35],[x+dx,y+dy,z+35],5,'#36525d');r.line([x+dy,y-dx,z+35],[x-dy,y+dx,z+35],4,'#466874');
  r.text3d('AIR 01  ·  TRACKING',x,y,z+55,7,'#fff0ce','#234759');
}
