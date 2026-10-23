'use strict';
(()=>{
 const cards=[...document.querySelectorAll('.depth-card')],viewport=document.querySelector('#card-viewport'),guide=document.querySelector('#how-to');
 const labels=['先选你的入口','把通告落实好','安心准备下一场','接之前先看档期','提醒和交接'];
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const panel=document.querySelector('#demo-panel'),track=document.querySelector('#deck-track');
 let active=-1,progress=0,target=null,lastTime=0,frameId=0,visible=false,wheelSnapTimer=0,touchY=null,metrics={cardW:336,cardH:211};
 const mouse={x:0,y:0};
 const follow={x:0,y:0};
 const pointer={inside:false,x:0,y:0};
 const detail=document.querySelector('#card-detail'),detailContent=document.querySelector('#detail-content'),detailSheet=detail.querySelector('.detail-sheet');
 let detailDesign=null,detailHome=null;
 function frozenClone(){const clone=panel.cloneNode(true);clone.removeAttribute('id');clone.removeAttribute('role');clone.removeAttribute('aria-live');clone.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));clone.inert=true;clone.setAttribute('aria-hidden','true');return clone;}
 for(const mode of ['schedule','lines','conflict']){state.demo=mode;renderDemo();document.querySelector(`[data-demo-dock="${mode}"]`).append(frozenClone());}
 state.demo='schedule';renderDemo();document.querySelector('[data-demo-dock="schedule"]').replaceChildren(panel);
 cards.forEach((card,i)=>{
  const face=card.querySelector('.card-face'),design=document.createElement('div');design.className='card-design';while(face.firstChild)design.append(face.firstChild);face.append(design);
  for(const depth of [-.73,0,.73]){const slice=document.createElement('div');slice.className='card-depth-slice';slice.style.setProperty('--slice-depth',depth+'px');card.insertBefore(slice,face);}
  const back=document.createElement('div');back.className='card-back';back.setAttribute('aria-hidden','true');back.innerHTML='<img src="./assets/cat-guide.png" alt=""><div class="card-back-band"></div>';card.insertBefore(back,card.firstChild);
 });
 function mountDemo(index){const mode={1:'schedule',2:'lines',3:'conflict'}[index];if(!mode)return;const dock=document.querySelector(`[data-demo-dock="${mode}"]`);if(panel.parentElement!==dock){panel.parentElement.replaceChildren(frozenClone());dock.replaceChildren(panel);}state.demo=mode;renderDemo();}
 function updateActive(index){if(index===active)return;active=index;mountDemo(active);cards.forEach((card,i)=>{card.classList.toggle('is-active',i===active);card.setAttribute('aria-hidden',String(i!==active));card.querySelector('.card-face').inert=i!==active;});document.querySelectorAll('[data-card-go]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.cardGo)===active)));document.querySelector('#deck-live').textContent=`第 ${active+1} 张，共5张：${labels[active]}`;document.querySelector('#reset-demo').hidden=active===0||active===4;}
 function virtualProgress(){const rounded=Math.round(progress),diff=progress-rounded;return rounded+Math.sign(diff)*Math.pow(Math.abs(diff)*2,4.2)/2;}
 function setVirtualProgress(value){const rounded=Math.round(value),diff=value-rounded;progress=rounded+Math.sign(diff)*Math.pow(Math.abs(diff)*2,1/4.2)/2;}
 function handlePointer(e){
  if(e.pointerType==='touch'||detail.open){releasePointer();return;}
  const r=viewport.getBoundingClientRect();
  if(!visible||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){releasePointer();return;}
  const scale=innerWidth>760?r.width/1536:1;
  if(pointer.inside){
   const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
   if(dx||dy){
    clearTimeout(wheelSnapTimer);target=null;
    // Keep movement proportional to the original projected distance between neighboring cards.
    const spacing=(metrics.cardH+36)*1350/(1350-220)*scale;
    setVirtualProgress(virtualProgress()+dy/spacing);
    follow.x=Math.max(-r.width*.18,Math.min(r.width*.18,follow.x+dx*.28));
    follow.y=Math.max(-r.height*.08,Math.min(r.height*.08,follow.y+dy*.08));
   }
  }
  pointer.inside=true;pointer.x=e.clientX;pointer.y=e.clientY;
  const projection=1350/(1350-400),halfW=metrics.cardW*scale*projection/2,halfH=metrics.cardH*scale*projection/2;
  mouse.x=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2-follow.x)/halfW));
  mouse.y=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2-follow.y)/halfH));
  render(0);
 }
 function openDetail(index){
  if(detail.open)return;clearTimeout(wheelSnapTimer);
  target=null;
  const base=Math.round(progress);let delta=index-((base%5)+5)%5;if(delta>2)delta-=5;if(delta< -2)delta+=5;
  progress=base+delta;updateActive(index);releasePointer();mouse.x=0;mouse.y=0;render(0);
  detailDesign=cards[index].querySelector('.card-design');detailHome=detailDesign.parentElement;
  detailSheet.className='detail-sheet '+[...cards[index].classList].find(x=>/^card-(light|dark|silver|charcoal|paper)$/.test(x));
  document.querySelector('#detail-title').textContent=labels[index];document.querySelector('#detail-reset').hidden=index===0||index===4;
  detailContent.append(detailDesign);detail.showModal();document.body.classList.add('card-detail-open');document.querySelector('#detail-close').focus({preventScroll:true});
 }
 detail.addEventListener('close',()=>{if(detailDesign&&detailHome)detailHome.append(detailDesign);detailDesign=null;detailHome=null;document.body.classList.remove('card-detail-open');releasePointer();});
 detail.addEventListener('click',e=>{if(e.target===detail)detail.close();});
 document.querySelector('#detail-close').addEventListener('click',()=>detail.close());document.querySelector('#detail-reset').addEventListener('click',()=>reset());
 function resize(){const desktop=window.innerWidth>760,w=desktop?1536:window.innerWidth,h=desktop?1113.6:window.innerHeight;viewport.style.setProperty('--scene-scale',String(desktop?viewport.clientWidth/1536:1));let cardW=Math.round(w*.16+130);cardW=Math.round(cardW*Math.min(1,Math.max(.65,h/850)));cardW=Math.min(336,Math.max(150,cardW));metrics={cardW,cardH:Math.round(cardW/1.5925)};cards.forEach(card=>{card.style.width=metrics.cardW+'px';card.style.height=metrics.cardH+'px';card.style.marginLeft= -metrics.cardW/2+'px';card.style.marginTop= -metrics.cardH/2+'px';card.style.setProperty('--design-scale',String(metrics.cardW/336));});render(0);}
 function render(dt){
  const step=Math.min(dt,50)/(1000/60);
  if(target!==null){const difference=target-progress,advance=.021*step;if(Math.abs(difference)<=advance||reduce){progress=target;target=null;}else progress+=Math.sign(difference)*advance;}
  track.style.setProperty('--follow-x',follow.x.toFixed(2)+'px');track.style.setProperty('--follow-y',follow.y.toFixed(2)+'px');
  const rounded=Math.round(progress),diff=progress-rounded;
  const easedDiff=Math.sign(diff)*Math.pow(Math.abs(diff)*2,4.2)/2;
  const virtualActiveIndex=rounded+easedDiff;
  updateActive(((rounded%5)+5)%5);
  for(let i=0;i<5;i++){
   const card=cards[i];let offset=i-virtualActiveIndex;while(offset>2.5)offset-=5;while(offset< -2.5)offset+=5;
   const a=Math.abs(offset),sign=Math.sign(offset),h=window.innerWidth>760?1113.6:viewport.clientHeight,cardH=metrics.cardH,D=1350,gap=36,peekAmount=-55;
   let y=0,z=0,rot=0;
   if(a<=1){const t=a,e=t*t*(3-2*t);y=-sign*e*(cardH+gap);z=400+e*(220-400);rot=e*132;}
   else if(a<=2){const t=a-1,e=t*t*(3-2*t),sEnd=D/(D-(-60)),yEnd=(h/2-peekAmount)/sEnd-cardH/2;y=-sign*((cardH+gap)+e*(yEnd-(cardH+gap)));z=220+e*(-60-220);rot=132+e*(175-132);}
   else{const t=Math.min(a-2,1),e=t*t*(3-2*t),s2=D/(D-(-60)),y2=(h/2-peekAmount)/s2-cardH/2,s3=D/(D-(-250)),y3=(h/2+100)/s3+cardH/2;y=-sign*(y2+e*(y3-y2));z=-60+e*(-250-(-60));rot=175+e*(195-175);}
   const centerFactor=Math.max(0,1-a),rotX=-sign*rot-mouse.y*12*centerFactor,rotY=mouse.x*15*centerFactor;
   card.style.zIndex=String(Math.round(z));card.style.opacity='1';card.style.visibility=a>3?'hidden':'visible';card.style.transform=`translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(-3deg)`;
  }
 }
 function tick(time){const dt=lastTime?time-lastTime:1000/60;lastTime=time;render(dt);frameId=requestAnimationFrame(tick);}
 function choose(index){clearTimeout(wheelSnapTimer);const base=Math.round(progress),desired=((index%5)+5)%5;let delta=desired-((base%5)+5)%5;if(delta>2)delta-=5;if(delta< -2)delta+=5;target=base+delta;if(reduce){progress=target;target=null;render(0);}}
 document.addEventListener('click',e=>{
  const choice=e.target.closest('[data-card-go]');if(choice){choose(Number(choice.dataset.cardGo));return;}
  const card=e.target.closest('.depth-card');if(card){if(e.target.closest('button,input'))return;openDetail(Number(card.dataset.card));return;}
  const link=e.target.closest('a[href="#how-to"],a[href="#features"],a[href="#demo"]');if(link){e.preventDefault();const hash=link.getAttribute('href');if(hash==='#how-to')choose(0);else choose(1);history.replaceState(null,'',location.pathname+location.search+hash);guide.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});}
 });
 document.querySelector('#deck-prev').addEventListener('click',()=>choose(active-1));document.querySelector('#deck-next').addEventListener('click',()=>choose(active+1));
 viewport.addEventListener('wheel',e=>{
  if(detail.open||Math.abs(e.deltaY)<Math.abs(e.deltaX)||e.ctrlKey)return;
  if((active===0&&e.deltaY<0)||(active===4&&e.deltaY>0))return;
  e.preventDefault();clearTimeout(wheelSnapTimer);target=null;releasePointer();
  const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewport.clientHeight:1);
  const rounded=Math.round(progress),diff=progress-rounded,lap=Math.floor(rounded/5)*5;
  const current=rounded+Math.sign(diff)*Math.pow(Math.abs(diff)*2,4.2)/2-lap;
  const next=Math.max(0,Math.min(4,current+Math.max(-.8,Math.min(.8,delta/160))));
  const nearest=Math.round(next),offset=next-nearest;
  progress=lap+nearest+Math.sign(offset)*Math.pow(Math.abs(offset)*2,1/4.2)/2;render(0);
  wheelSnapTimer=setTimeout(()=>{target=Math.round(progress);},140);
 },{passive:false});
 window.addEventListener('pointermove',handlePointer,{passive:true});
 function releasePointer(){pointer.inside=false;}
 document.addEventListener('mouseleave',releasePointer);window.addEventListener('blur',releasePointer);window.addEventListener('scroll',releasePointer,{passive:true});
 viewport.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY;},{passive:true});viewport.addEventListener('touchend',e=>{if(touchY===null)return;const dy=touchY-e.changedTouches[0].clientY;touchY=null;if(Math.abs(dy)>65)choose(active+(dy>0?1:-1));},{passive:true});
 document.addEventListener('keydown',e=>{if(detail.open)return;if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest('input,textarea,select'))return;const r=guide.getBoundingClientRect();if(r.top>innerHeight*.5||r.bottom<innerHeight*.4)return;if(e.key==='ArrowDown'||e.key==='ArrowRight'){e.preventDefault();choose(active+1);}if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();choose(active-1);}});
 document.querySelector('#privacy-switch').addEventListener('change',e=>{document.querySelector('#privacy-result').textContent=e.target.checked?'地点、酒店、私密理由：已清空':'完整备份：保留地点、酒店与私密理由';});
 const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting;},{threshold:.1});io.observe(viewport);
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden)releasePointer();});
 resize();if(location.hash==='#features'||location.hash==='#demo')choose(1);frameId=requestAnimationFrame(tick);
 // Deterministic capture support; the normal carousel has no autonomous playback.
 window.__cardReference={pose:(value,x=0,y=0)=>{clearTimeout(wheelSnapTimer);target=null;progress=value;mouse.x=x;mouse.y=y;follow.x=0;follow.y=0;releasePointer();render(0);},metrics:()=>({...metrics,perspective:1350,progress,virtualProgress:virtualProgress(),follow:{...follow},mode:'pointer'}),stop:()=>cancelAnimationFrame(frameId)};
})();
