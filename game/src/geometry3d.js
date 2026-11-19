// WebGL2 depth testing, directional light, warm fog and fine surface texture.
// Canvas projection remains available on systems without WebGL2.
export function createGeometry3D(){
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;
  const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,preserveDrawingBuffer:false,premultipliedAlpha:false});
  if(!gl)return null;
  const skyCanvas=document.createElement('canvas');skyCanvas.width=1280;skyCanvas.height=800;
  const skyContext=skyCanvas.getContext('2d',{alpha:false});
  for(const [layer,z] of [[skyCanvas,0],[canvas,1]]){
    layer.setAttribute('aria-hidden','true');layer.style.cssText=`position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:${z}`;document.body.prepend(layer);
  }
  function setVisible(visible){canvas.style.display=skyCanvas.style.display=visible?'block':'none';}

  const rendererInfo=gl.getExtension('WEBGL_debug_renderer_info');
  const software=rendererInfo && /SwiftShader|llvmpipe|Software/i.test(gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL));
  const playWidth=software?640:1280;
  const vertex=`#version 300 es
  precision highp float;
  layout(location=0) in vec3 aWorld;
  layout(location=1) in vec3 aColor;
  layout(location=2) in vec3 aNormal;
  uniform vec4 uCamera; uniform vec2 uForward;
  out vec3 vColor; out vec3 vWorld; out float vDepth; out vec3 vNormal;
  void main(){
    float n=3.0,f=5000.0;
    vec2 delta=aWorld.xy-uCamera.xy;
    float depth=dot(delta,uForward),dz=aWorld.z-uCamera.z;
    float cs=cos(uCamera.w),sn=sin(uCamera.w);
    vec3 aCamera=vec3(dot(delta,vec2(-uForward.y,uForward.x)),dz*cs+depth*sn,depth*cs-dz*sn);
    gl_Position=vec4(aCamera.x*1.28125,aCamera.y*2.05+aCamera.z*.1,(f+n)/(f-n)*aCamera.z-2.0*f*n/(f-n),aCamera.z);
    vColor=aColor;vWorld=aWorld;vDepth=aCamera.z;vNormal=aNormal;
  }`;
  const fragment=`#version 300 es
  precision highp float;
  in vec3 vColor; in vec3 vWorld; in float vDepth; in vec3 vNormal;
  out vec4 fragColor;
  void main(){
    vec3 normal=normalize(vNormal);
    float light=max(0.0,dot(normal,normalize(vec3(-.65,-.4,.8))));
    float horizontal=abs(normal.z);
    vec3 shade=vec3(.78,.86,.88)+light*vec3(.25,.19,.09);
    vec3 color=vColor*shade;
    
    float depthFog=clamp((vDepth-220.0)*.00023,0.0,.85);
    vec3 fog=vec3(.94,.79,.62);
    color=mix(color,fog,depthFog);
    
    fragColor=vec4(color,1.0);
  }`;
  function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;}
  const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(let i=0;i<3;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,36,i*12);}
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
  const cameraLocation=gl.getUniformLocation(program,'uCamera'), forwardLocation=gl.getUniformLocation(program,'uForward');
  const staticBuffer=gl.createBuffer(),shadowBuffer=gl.createBuffer();
  let data=[],shadows=[],camera,staticCount=0,shadowCount=0,buildingStatic=false,groups=new Map(),ranges=[],shadowRanges=[];
  const colors=new Map();
  function begin(view,photography=false){data=[];shadows=[];camera=view;
    const width=photography?2560:playWidth,height=width*5/8;
    if(canvas.width!==width){canvas.width=width;canvas.height=height;}
  }
  function beginStatic(){buildingStatic=true;data=[];shadows=[];groups=new Map();}
  function endStatic(){
    ranges=[];shadowRanges=[];
    for(const g of groups.values()){
      if(g.data.length){ranges.push({first:data.length/9,count:g.data.length/9,bounds:g.bounds});for(const value of g.data)data.push(value);}
      if(g.shadows.length){shadowRanges.push({first:shadows.length/9,count:g.shadows.length/9,bounds:g.bounds});for(const value of g.shadows)shadows.push(value);}
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);staticCount=data.length/9;
    gl.bindBuffer(gl.ARRAY_BUFFER,shadowBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(shadows),gl.STATIC_DRAW);shadowCount=shadows.length/9;
    data=[];shadows=[];groups.clear();buildingStatic=false;
  }
  function visible(bounds){
    const points=[];for(const x of [bounds[0],bounds[3]])for(const y of [bounds[1],bounds[4]])for(const z of [bounds[2],bounds[5]])points.push(camera.cameraPoint([x,y,z]));
    return !points.every(p=>p[2]<3)&&!points.every(p=>p[2]>3400)&&!points.every(p=>p[0]<-p[2]*.86)&&!points.every(p=>p[0]>p[2]*.86)&&!points.every(p=>p[1]>p[2]*.6)&&!points.every(p=>p[1]<-p[2]*.6);
  }
  function bind(buffer){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);for(let i=0;i<3;i++)gl.vertexAttribPointer(i,3,gl.FLOAT,false,36,i*12);}
  function polygon(vertices,color){
    if(vertices.length<3)return;
    let rgb=colors.get(color);
    if(!rgb){if(color[0]==='#'){const n=parseInt(color.slice(1),16);rgb=[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];}else rgb=[.8,.7,.5];colors.set(color,rgb);}
    const a=vertices[0],b=vertices[1],c=vertices[2],u=b.map((v,i)=>v-a[i]),v=c.map((x,i)=>x-a[i]);
    let normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...normal)||1;normal=normal.map(x=>x/len);
    // Model face windings are intentionally two-sided. Light their exposed side.
    
    let target=color==='#000001'?shadows:data;
    if(buildingStatic){
      const center=vertices.reduce((a,p)=>[a[0]+p[0]/vertices.length,a[1]+p[1]/vertices.length],[0,0]),key=Math.floor(center[0]/480)+':'+Math.floor(center[1]/480);
      let group=groups.get(key);if(!group){group={data:[],shadows:[],bounds:[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity]};groups.set(key,group);}
      for(const p of vertices)for(let i=0;i<3;i++){group.bounds[i]=Math.min(group.bounds[i],p[i]);group.bounds[i+3]=Math.max(group.bounds[i+3],p[i]);}
      target=color==='#000001'?group.shadows:group.data;
    }
    if(color==='#000001')rgb=[.67,.72,.75];
    for(let i=1;i<vertices.length-1;i++)for(const p of [vertices[0],vertices[i],vertices[i+1]])target.push(...p,...rgb,...normal);
  }
  function finish(ctx){
    const started=performance.now();
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    gl.uniform4f(cameraLocation,camera.x,camera.y,camera.height,camera.pitch);gl.uniform2f(forwardLocation,camera.forward.x,camera.forward.y);
    bind(staticBuffer);for(const range of ranges)if(visible(range.bounds))gl.drawArrays(gl.TRIANGLES,range.first,range.count);
    bind(buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,data.length/9);
    if(shadowCount){gl.enable(gl.BLEND);gl.blendFunc(gl.ZERO,gl.SRC_COLOR);gl.depthMask(false);bind(shadowBuffer);for(const range of shadowRanges)if(visible(range.bounds))gl.drawArrays(gl.TRIANGLES,range.first,range.count);gl.depthMask(true);gl.disable(gl.BLEND);}
    const submitted=performance.now();
    return {submitMs:submitted-started,rasterMs:performance.now()-submitted,staticTriangles:staticCount/3,dynamicTriangles:data.length/27};
  }
  return {begin,beginStatic,endStatic,polygon,finish,skyContext,setVisible};
}
