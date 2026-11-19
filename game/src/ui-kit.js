export const UI = { cream: '#fff3da', muted: '#b3c9c6', gold: '#ffd087', mint: '#88e6c5', red: '#ff9684', navy: '#123744' };
export function createUI(p, buttons = []) {
  const {ctx,text}=p;
  function panel(x,y,w,h,alpha=.90,color='15,42,53') {
    ctx.fillStyle=`rgba(${color},${alpha})`;ctx.beginPath();ctx.roundRect(x,y,w,h,7);ctx.fill();ctx.strokeStyle='#d7e2cb35';ctx.lineWidth=1;ctx.stroke();
  }
  function label(t,x,y,c=UI.muted,size=10){text(t,x,y,size,c,'800');}
  function bar(x,y,w,h,value,color=UI.mint){ctx.fillStyle='#d4e6d32a';ctx.fillRect(x,y,w,h);ctx.fillStyle=color;ctx.fillRect(x,y,w*Math.max(0,Math.min(1,value)),h);}
  function wrap(t,x,y,width,size=18,color=UI.cream,lineHeight=24){ctx.font=`700 ${size}px Arial`;let line='';for(const word of t.split(' ')){if(ctx.measureText(line+word).width>width){text(line,x,y,size,color,'700');y+=lineHeight;line='';}line+=word+' ';}text(line,x,y,size,color,'700');return y;}
  function button(id,t,sub,x,y,w=330,active=false){panel(x,y,w,57,active?.98:.93,active?'225,182,113':'22,59,70');text(t,x+15,y+23,16,active?'#173c48':UI.cream,'900');label(sub,x+15,y+43,active?'#355663':UI.muted,10);buttons.push({id,x,y,w,h:57});}
  return {panel,label,bar,wrap,button,text,ctx};
}
export function drawPortrait(ctx,x,y,size=64,variant=0){
  ctx.save();ctx.translate(x,y);ctx.scale(size/64,size/64);ctx.beginPath();ctx.roundRect(0,0,64,64,4);ctx.clip();
  ctx.fillStyle=variant?'#698b8a':'#a77b67';ctx.fillRect(0,0,64,64);ctx.fillStyle='#284a55';ctx.beginPath();ctx.ellipse(34,66,29,23,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#423b37';ctx.beginPath();ctx.ellipse(32,28,19,24,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c7926d';ctx.fillRect(27,40,12,14);ctx.beginPath();ctx.ellipse(33,28,13,18,-.09,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#533e35';ctx.beginPath();ctx.moveTo(16,26);ctx.lineTo(19,10);ctx.lineTo(36,6);ctx.lineTo(49,15);ctx.lineTo(47,22);ctx.lineTo(33,15);ctx.lineTo(18,29);ctx.fill();
  ctx.strokeStyle='#3b4140';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(23,26);ctx.lineTo(30,25);ctx.moveTo(36,25);ctx.lineTo(43,25);ctx.stroke();ctx.fillStyle='#463e36';ctx.fillRect(26,27,2,2);ctx.fillRect(38,27,2,2);
  ctx.strokeStyle='#9b644f';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(33,27);ctx.lineTo(31,34);ctx.lineTo(35,35);ctx.moveTo(28,39);ctx.lineTo(37,38);ctx.stroke();ctx.fillStyle='#dec593';ctx.beginPath();ctx.arc(47,35,2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#83d6bd';ctx.beginPath();ctx.moveTo(18,52);ctx.lineTo(28,47);ctx.lineTo(34,59);ctx.lineTo(39,47);ctx.lineTo(48,53);ctx.lineTo(43,64);ctx.lineTo(22,64);ctx.fill();ctx.restore();
}
