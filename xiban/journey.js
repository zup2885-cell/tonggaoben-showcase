'use strict';
(()=>{
 const guide=window.PRODUCT_GUIDE;
 const images=new Map([...document.images].map(e=>[e.dataset.embeddedSrc||e.getAttribute('src').split('/').pop(),e.src]));
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lines=s=>esc(s).replace(/\n/g,'<br>');
 const path=(items)=>`<ol class="visual-path">${items.map(([title,body])=>`<li><strong>${esc(title)}</strong><p>${esc(body)}</p></li>`).join('')}</ol>`;
 const tags=(items)=>`<div class="visual-tags">${items.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`;
 const tiles=(items)=>`<div class="visual-tiles">${items.map(([h,p])=>`<div><h5>${esc(h)}</h5><p>${esc(p)}</p></div>`).join('')}</div>`;
 const panel=(title,body,note='')=>`<h4>${esc(title)}</h4>${body}${note?`<p class="visual-note">${esc(note)}</p>`:''}`;
 function visual(card){
  switch(card.visual){
   case 'calendar':return panel('把安排放回同一张表',path([['今日安排','准备 → 拍摄 → 训练'],['档期冲突','看哪里重叠、哪里需要协调'],['新的邀约','确认后，再加入日程']]));
   case 'script':return panel('角色此刻，知道什么？',`<div class="character-note"><strong>剧本写明</strong><p>事件、背景与已知信息</p></div><div class="character-note inference"><strong>人物推断</strong><p>动机、潜台词与表演理解</p></div>`,'回到原文 → 形成角色卡 → 选定演法');
   case 'storyboard':return panel('先看见，再一起调整',`<div class="cat-storyboard">${['造型','分镜','动态预演'].map((t,i)=>`<div><div class="storyboard-picture"><img src="${esc(images.get(['cat-guide.png','cat-lounge.png','cat-toys.png'][i]))}" alt="" loading="lazy"></div><strong>${t}</strong></div>`).join('')}</div>`,'构图、停顿与对白，放到画面里讨论。');
   case 'team':return panel('事情和反馈，都有下一步',path([['团队协作','会议纪要 → 任务 → 执行'],['粉丝沟通','留言 → 草稿 → 人工确认']]),'明确负责人，也明确发布口径。');
   case 'career':return panel('让每一次合作更有依据',path([['邀约 → 决定','接不接，看档期与方向'],['品牌 → 条件','合作前，先核对什么'],['用途 → 授权','哪些范围，需要确认']]));
   case 'life':return panel('出门和回家，都能放心',tiles([['通告','改页与今日待办'],['出行','路线、天气与清单'],['肉肉','健康提醒与托管卡']]));
   case 'self':return panel('状态和方向，都有记录',tiles([['状态','训练、睡眠与嗓音'],['方向','作品画像与年度目标'],['复盘','口碑与表演自评']]));
   default:return '';
  }
 }
 const themes=['light','dark','silver','charcoal','paper'];
 let n=0;
 const card=(c,k)=>{const i=n++;return `<span class="project-anchor" id="${c.id}" aria-hidden="true"></span><article class="project-card story-scene card-${themes[i%themes.length]}" data-card="${c.id}" data-project="${i}" data-module="${esc(c.module)}" style="--i:${i}" aria-labelledby="title-${c.id}"><div class="scene-header"><p class="scene-topic"><span class="project-number">${String(k+1).padStart(2,'0')}</span>${esc(c.module)}</p><h3 class="scene-title" id="title-${c.id}">${lines(c.title)}</h3><p class="scene-lead">${esc(c.lead)}</p><img class="module-mascot" src="${esc(images.get(c.image))}" alt="" loading="lazy"></div><div class="project-mosaic"><div class="project-preview"><div class="card-design">${visual(c)}</div><p class="module-output"><strong>成果</strong>${esc(c.output)}</p></div><aside class="usage-guide" aria-label="${esc(c.module)}的重点用法"><dl>${c.points.map(p=>`<div data-point="${p.id}"><dt>${esc(p.title)}</dt><dd>${esc(p.body)}</dd></div>`).join('')}</dl></aside></div></article>`;};
 document.querySelector('#walkthrough').innerHTML=guide.groups.map((g,j)=>`<section class="guide-section role-section" id="${g.id}" aria-labelledby="role-${g.id}"><div class="role-heading"><p class="role-kicker"><span>${String(j+1).padStart(2,'0')}</span>${esc(g.label)}</p><h3 class="role-title" id="role-${g.id}">${esc(g.title)}</h3><p class="role-pain"><strong>难处</strong>${esc(g.pain)}</p></div><div class="project-stack">${g.cards.map((c,k)=>card(c,k)).join('')}</div></section>`).join('');
 const stacks=[...document.querySelectorAll('.project-stack')].map(e=>({cards:[...e.querySelectorAll('.story-scene')],anchors:[...e.querySelectorAll('.project-anchor')]}));
 const reduceMedia=matchMedia('(prefers-reduced-motion: reduce)'),gallery=document.querySelector('.cat-gallery'),about=document.querySelector('.cat-about');
 const tracks=[...document.querySelectorAll('.gallery-track')],titles=[...document.querySelectorAll('.scroll-title')],rows=[...document.querySelectorAll('.day-flow article')],props=[...document.querySelectorAll('.floating-prop')];
 const paragraph=document.querySelector('.word-reveal');
 for(const node of [...paragraph.childNodes]){if(node.nodeType!==Node.TEXT_NODE)continue;const fragment=document.createDocumentFragment();for(const char of node.textContent){const span=document.createElement('span');span.className='reveal-char';span.textContent=char;fragment.append(span);}node.replaceWith(fragment);}
 const letters=[...paragraph.querySelectorAll('.reveal-char')],pointer={x:0,y:0};let scheduled=false;
 const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
 function requestDraw(){if(!scheduled){scheduled=true;requestAnimationFrame(draw);}}
 function draw(){
  scheduled=false;const h=innerHeight,reduce=reduceMedia.matches;
  const galleryBox=gallery.getBoundingClientRect(),aboutBox=about.getBoundingClientRect(),paragraphBox=paragraph.getBoundingClientRect();
  const titleBoxes=titles.map(e=>e.getBoundingClientRect()),rowBoxes=rows.map(e=>e.getBoundingClientRect());
  const stackMetrics=stacks.map(s=>({anchors:s.anchors.map(e=>e.getBoundingClientRect().top),tops:s.cards.map((e,i)=>Math.min(24+i*8,h-e.offsetHeight-24))}));
  const galleryP=clamp((h-galleryBox.top)/(h+galleryBox.height));tracks.forEach((e,i)=>e.style.setProperty('--gallery-shift',reduce?'0px':((galleryP-.5)*(i===0?-240:240)).toFixed(2)+'px'));
  titles.forEach((e,i)=>{const p=reduce?1:clamp((h*.92-titleBoxes[i].top)/(h*.34));e.style.opacity='1';e.style.transform=`translateY(${(1-p)*16}px) scale(${.965+p*.035})`;});
  const revealP=reduce?1:clamp((h*.83-paragraphBox.top)/(h*.39));letters.forEach((e,i)=>{const p=clamp((revealP-i/Math.max(1,letters.length-1)*.66)/.34);e.style.opacity=String(.9+p*.1);});
  const drift=(h*.5-(aboutBox.top+aboutBox.height*.5))/(h+aboutBox.height);
  props.forEach((e,i)=>{const distance=Number(e.dataset.drift),turn=Number(e.dataset.turn),direction=i%2?1:-1;const x=reduce?0:pointer.x*(8+i*2)*direction,y=reduce?0:drift*distance+pointer.y*(5+i);e.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${reduce?0:(drift*turn+pointer.x*direction*2).toFixed(2)}deg)`;});
  rows.forEach((e,i)=>{const p=reduce?1:clamp((h*.94-rowBoxes[i].top)/(h*.22));e.style.opacity='1';e.style.transform=`translateY(${(1-p)*14}px)`;});
  stacks.forEach((s,j)=>{const {anchors,tops}=stackMetrics[j];s.cards.forEach((e,i)=>{
   const p=reduce?1:clamp((h*.92-anchors[i])/(h*.48));e.style.setProperty('--scene-lift',((1-p)*18).toFixed(2)+'px');
   const covered=!reduce&&innerWidth>760&&i<s.cards.length-1?clamp((tops[i]-anchors[i])/Math.max(1,anchors[i+1]-anchors[i])):0;
   const eased=covered*covered*(3-2*covered);
   e.style.setProperty('--stack-top',tops[i].toFixed(2)+'px');e.style.setProperty('--stack-scale',(1-eased*.045).toFixed(4));e.style.setProperty('--stack-shade',(1-eased*.14).toFixed(4));
  });});
 }
 about.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduceMedia.matches)return;const r=about.getBoundingClientRect();pointer.x=clamp((e.clientX-r.left)/r.width*2-1,-1,1);pointer.y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);requestDraw();},{passive:true});
 window.addEventListener('scroll',requestDraw,{passive:true});window.addEventListener('resize',requestDraw);reduceMedia.addEventListener('change',requestDraw);document.fonts.ready.then(requestDraw);
 document.addEventListener('load',e=>{if(e.target instanceof HTMLImageElement)requestDraw();},true);
 // 三种身份分开看：一次只显示一个板块
 const roleIds=guide.groups.map(g=>g.id),roleSections=roleIds.map(id=>document.getElementById(id));
 const switcher=document.createElement('nav');switcher.className='role-switch';switcher.setAttribute('aria-label','切换身份');
 switcher.innerHTML=guide.groups.map(g=>`<a href="#${g.id}"><img src="${esc(images.get(g.image))}" alt=""><span>${esc(g.label)}</span></a>`).join('');
 document.body.append(switcher);
 new IntersectionObserver(es=>es.forEach(e=>switcher.classList.toggle('on',e.isIntersecting)),{rootMargin:'0px 0px -40% 0px'}).observe(document.getElementById('features'));
 const roleOf=hash=>{const id=hash.replace('#','');if(roleIds.includes(id))return id;const g=guide.groups.find(g=>g.cards.some(c=>c.id===id));return g?g.id:null;};
 function showRole(id,scroll){
  roleSections.forEach(s=>{s.hidden=s.id!==id;});
  document.querySelectorAll('a[href^="#"]').forEach(a=>{if(roleIds.includes(a.hash.slice(1)))a.setAttribute('aria-current',String(a.hash.slice(1)===id));});
  history.replaceState(null,'','#'+id);
  if(scroll)document.getElementById(id).scrollIntoView({behavior:reduceMedia.matches?'auto':'smooth'});
  requestDraw();
 }
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');const id=a&&roleIds.includes(a.hash.slice(1))?a.hash.slice(1):null;if(!id)return;e.preventDefault();showRole(id,true);});
 window.addEventListener('hashchange',()=>{const id=roleOf(location.hash);if(id)showRole(id,true);});
 const startHash=location.hash,startRole=roleOf(startHash);
 showRole(startRole||roleIds[0],false);
 if(startRole){const jump=()=>document.getElementById(startHash.slice(1))?.scrollIntoView({behavior:'instant'});if(document.readyState==='complete')setTimeout(jump);else addEventListener('load',()=>setTimeout(jump),{once:true});}
 else history.replaceState(null,'',location.pathname+location.search+startHash);
 requestDraw();
})();
