'use strict';
(()=>{
 const fine=matchMedia('(hover: hover) and (pointer: fine)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const layer=document.createElement('div');layer.id='paw-trail';layer.setAttribute('aria-hidden','true');layer.setAttribute('inert','');document.body.append(layer);
 const svg='<svg viewBox="0 0 32 32" focusable="false" aria-hidden="true"><ellipse cx="5.8" cy="12" rx="3.3" ry="4.4" transform="rotate(-28 5.8 12)"/><ellipse cx="12" cy="6.4" rx="3.2" ry="4.4" transform="rotate(-10 12 6.4)"/><ellipse cx="20" cy="6.4" rx="3.2" ry="4.4" transform="rotate(10 20 6.4)"/><ellipse cx="26.2" cy="12" rx="3.3" ry="4.4" transform="rotate(28 26.2 12)"/><path d="M16 15c-3 0-4.2 2-6 4.2-1.7 2-3.3 4.7-1.4 6.8 1.7 2 4.1.5 7.4.5s5.7 1.5 7.4-.5c1.9-2.1.3-4.8-1.4-6.8-1.8-2.2-3-4.2-6-4.2Z"/></svg>';
 const prints=new Set(),step=42,maxPrints=22;
 let previous=null,carry=0,foot=0,pending=null,frame=0;
 const enabled=()=>fine.matches&&!reduce.matches&&!document.hidden;
 function remove(print){prints.delete(print);print.remove();}
 function stamp(x,y,angle){
  if(!enabled())return;
  const side=foot++%2?1:-1,rad=angle*Math.PI/180;
  const print=document.createElement('span');print.className='paw-print';print.innerHTML=svg;
  print.style.left=(x-Math.sin(rad)*side*8).toFixed(2)+'px';print.style.top=(y+Math.cos(rad)*side*8).toFixed(2)+'px';
  print.style.setProperty('--paw-angle',(angle+90+side*7).toFixed(1)+'deg');
  prints.add(print);layer.append(print);
  print.addEventListener('animationend',()=>remove(print),{once:true});
  while(prints.size>maxPrints)remove(prints.values().next().value);
 }
 function draw(){
  frame=0;const point=pending;pending=null;if(!point||!enabled())return;
  if(!previous){previous=point;stamp(point.x,point.y,-90);return;}
  const dx=point.x-previous.x,dy=point.y-previous.y,distance=Math.hypot(dx,dy);
  if(distance<.5)return;
  const angle=Math.atan2(dy,dx)*180/Math.PI;
  if(distance>340){stamp(point.x,point.y,angle);carry=0;previous=point;return;}
  let offset=step-carry,count=0;
  while(offset<=distance&&count<8){const t=offset/distance;stamp(previous.x+dx*t,previous.y+dy*t,angle);offset+=step;count++;}
  carry=(carry+distance)%step;previous=point;
 }
 function clear(){
  if(frame)cancelAnimationFrame(frame);frame=0;pending=null;previous=null;carry=0;
  for(const print of prints)print.remove();prints.clear();
 }
 document.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||e.buttons||!enabled()){if(previous||prints.size)clear();return;}
  pending={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(draw);
 },{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{previous=null;carry=0;pending=null;},{passive:true});
 window.addEventListener('scroll',clear,{passive:true});window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);fine.addEventListener('change',clear);reduce.addEventListener('change',clear);
})();
