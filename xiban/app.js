'use strict';
(()=>{
 const cat=document.querySelector('#hero-cat'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let visible=true;
 function update(){if(reduce.matches||!visible||document.hidden)cat.pause();else cat.play().catch(()=>{});}
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){visible=entry.isIntersecting;update();}},{threshold:.05});
 observer.observe(cat);reduce.addEventListener('change',update);document.addEventListener('visibilitychange',update);update();
 if(location.hash.startsWith('#chapter='))history.replaceState(null,'',location.pathname+location.search+'#home');
})();
