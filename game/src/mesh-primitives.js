// Small, indexed-looking meshes authored as polygons for the shared geometry stream.
export function ellipsoid(r,x,y,z,rx,ry,rz,color,segments=10,rings=6){
  for(let j=0;j<rings;j++){
    const a=-Math.PI/2+j*Math.PI/rings,b=a+Math.PI/rings;
    for(let i=0;i<segments;i++){const u=i*Math.PI*2/segments,v=u+Math.PI*2/segments;
      const p=(a,u)=>[x+Math.cos(a)*Math.cos(u)*rx,y+Math.cos(a)*Math.sin(u)*ry,z+Math.sin(a)*rz];
      r.face([p(a,u),p(a,v),p(b,v),p(b,u)],color);
    }
  }
}
export function limb(r,a,b,radius,color,sides=7,endRadius=radius){
  const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d)||1,n=d.map(v=>v/len);
  const helper=Math.abs(n[2])>.9?[1,0,0]:[0,0,1];let u=[n[1]*helper[2]-n[2]*helper[1],n[2]*helper[0]-n[0]*helper[2],n[0]*helper[1]-n[1]*helper[0]],ul=Math.hypot(...u)||1;u=u.map(v=>v/ul);const v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]];
  const point=(p,angle,rad)=>p.map((x,i)=>x+Math.cos(angle)*u[i]*rad+Math.sin(angle)*v[i]*rad);
  const capA=[],capB=[];
  for(let i=0;i<sides;i++){const q=i*Math.PI*2/sides,t=q+Math.PI*2/sides,A=point(a,q,radius),B=point(a,t,radius),C=point(b,t,endRadius),D=point(b,q,endRadius);r.face([A,B,C,D],color);capA.push(A);capB.push(D);}
  r.face(capA,color);r.face(capB,color);
}
