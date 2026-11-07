(()=>{"use strict";
const $=s=>document.querySelector(s),canvas=$("#view"),ctx=canvas.getContext("2d");
const MAP=["1111111111111111","1000000000000001","1022200000333001","1000200000003001","1000200440003001","1000000440000001","1000000000000001","1000550000660001","1000500000060001","1000500000060001","1000000000000001","1000000000000001","1000000000000001","1000000000000001","1000000000000001","1111111111111111"].map(x=>x.split("").map(Number));
const MW=16,MH=16,FOV=Math.PI/3,TAU=Math.PI*2;
let player={x:1.5,y:1.5,a:0,hp:100},ammo=36,reserve=108,kills=0,active=false,paused=false,won=false,keys={},last=0,shotFlash=0,damageFlash=0,hitTimer=0,moveSpeed=2.65,turnSpeed=2.2;
let enemies=[],zbuffer=new Float32Array(960),touchTurn=0,touchLookX=null;
const spawn=()=>{enemies=[{x:8.5,y:3.5,hp:2,alive:true,phase:0},{x:12.5,y:5.5,hp:2,alive:true,phase:1},{x:5.5,y:8.5,hp:2,alive:true,phase:2},{x:10.5,y:9.5,hp:2,alive:true,phase:3},{x:3.5,y:12.5,hp:2,alive:true,phase:4},{x:13.5,y:12.5,hp:2,alive:true,phase:5}]};
const wall=(x,y)=>{let ix=Math.floor(x),iy=Math.floor(y);return ix<0||iy<0||ix>=MW||iy>=MH||MAP[iy][ix]!==0};
function reset(){player={x:1.5,y:1.5,a:0,hp:100};ammo=36;reserve=108;kills=0;spawn();won=false;updateHUD();$("#objective").textContent="OBJECTIVE: CLEAR THE SECTOR";$("#status").textContent="SYSTEMS ONLINE";$("#end").classList.add("hidden");}
function show(id){$(id).classList.remove("hidden")}function hide(id){$(id).classList.add("hidden")}
function updateHUD(){$("#health").textContent=Math.max(0,Math.ceil(player.hp));$("#healthbar").style.width=Math.max(0,player.hp)+"%";$("#ammo").textContent=ammo;$("#kills").textContent=kills+" / 6";$("#killbar").style.width=(kills/6*100)+"%"}
function cast(a){let sin=Math.sin(a),cos=Math.cos(a),dist=0,hit=0,side=0;while(dist<20){dist+=.025;let x=player.x+cos*dist,y=player.y+sin*dist;if(wall(x,y)){hit=MAP[Math.floor(y)]?.[Math.floor(x)]||1;side=Math.abs((x%1)-.5)>Math.abs((y%1)-.5)?1:0;break}}return{dist,hit,side}}
function drawWorld(){let w=canvas.width,h=canvas.height,half=h/2;ctx.fillStyle="#77817a";ctx.fillRect(0,0,w,half);ctx.fillStyle="#373a32";ctx.fillRect(0,half,w,half);
 let grad=ctx.createLinearGradient(0,half,0,h);grad.addColorStop(0,"#4b4b3d");grad.addColorStop(1,"#191b17");ctx.fillStyle=grad;ctx.fillRect(0,half,w,half);
 for(let x=0;x<w;x++){let angle=player.a+(x/w-.5)*FOV,r=cast(angle),d=Math.max(.05,r.dist*Math.cos(angle-player.a));zbuffer[x]=d;let line=Math.min(h,h/d*.78),top=(h-line)/2;let shade=Math.max(35,190-d*17)*(r.side?.78:1);let colors={1:[105,105,91],2:[118,83,62],3:[73,107,112],4:[116,104,72],5:[93,110,77],6:[110,72,59]};let c=colors[r.hit]||colors[1];let texture=(Math.floor((x+(r.side?0:Math.sin(d)*18))/12)%2)*9;ctx.fillStyle=`rgb(${Math.max(0,Math.min(255,shade*c[0]/120-texture))},${Math.max(0,Math.min(255,shade*c[1]/120-texture))},${Math.max(0,Math.min(255,shade*c[2]/120-texture))})`;ctx.fillRect(x,top,1,line);
 if(x%40===0){ctx.fillStyle="#15171355";ctx.fillRect(x,top,2,line)}
 }
 drawEnemies();
 // weapon silhouette
 ctx.fillStyle="#11130f";ctx.fillRect(w*.43,h*.83,w*.14,h*.17);ctx.fillStyle="#65695b";ctx.fillRect(w*.465,h*.78,w*.07,h*.18);ctx.fillStyle="#9ca18a";ctx.fillRect(w*.48,h*.77,w*.04,h*.07);ctx.fillStyle="#252820";ctx.fillRect(w*.47,h*.87,w*.06,h*.13);
 if(shotFlash>0){ctx.fillStyle="#f5d77a";ctx.beginPath();ctx.arc(w*.5,h*.75,shotFlash*25,0,TAU);ctx.fill();shotFlash=Math.max(0,shotFlash-.08)}
 if(damageFlash>0){ctx.fillStyle=`rgba(210,40,30,${damageFlash*.23})`;ctx.fillRect(0,0,w,h);damageFlash=Math.max(0,damageFlash-.02)}
}
function drawEnemies(){let list=enemies.filter(e=>e.alive).map(e=>({e,d:Math.hypot(e.x-player.x,e.y-player.y)})).sort((a,b)=>b.d-a.d);for(let {e,d} of list){let angle=Math.atan2(e.y-player.y,e.x-player.x)-player.a;while(angle>Math.PI)angle-=TAU;while(angle<-Math.PI)angle+=TAU;if(Math.abs(angle)>FOV*.75)continue;let sx=(.5+angle/FOV)*canvas.width,size=Math.min(canvas.height*1.1,canvas.height/(d*.9)),sy=canvas.height/2-size*.48;if(sx<0||sx>=canvas.width)continue;let zi=Math.max(0,Math.min(zbuffer.length-1,Math.floor(sx)));if(d>zbuffer[zi]+.15)continue;ctx.save();ctx.translate(sx,sy);ctx.scale(size/90,size/90);
 // original mechanical sentry silhouette, no gore
 ctx.fillStyle="#1b201c";ctx.fillRect(-24,10,48,54);ctx.fillStyle="#68796b";ctx.fillRect(-19,4,38,40);ctx.fillStyle="#9eae8b";ctx.fillRect(-14,10,28,18);ctx.fillStyle="#e45d43";ctx.fillRect(-11,16,7,5);ctx.fillRect(4,16,7,5);ctx.fillStyle="#252a22";ctx.fillRect(-29,24,10,35);ctx.fillRect(19,24,10,35);ctx.fillStyle="#a5a58b";ctx.fillRect(-16,55,12,14);ctx.fillRect(4,55,12,14);ctx.fillStyle="#d7ff42";ctx.fillRect(-5,32,10,5);ctx.restore();}}
function move(dt){
 let forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);
 let strafe=(keys.d?1:0)-(keys.a?1:0);
 let turn=(keys.arrowright?1:0)-(keys.arrowleft?1:0)+touchTurn;
 player.a=(player.a+turn*turnSpeed*dt+TAU)%TAU;
 const len=Math.hypot(forward,strafe)||1;
 const f=forward/len,side=strafe/len;
 const dx=(Math.cos(player.a)*f-Math.sin(player.a)*side)*moveSpeed*dt;
 const dy=(Math.sin(player.a)*f+Math.cos(player.a)*side)*moveSpeed*dt;
 const radius=.18;
 if(!wall(player.x+dx+Math.sign(dx)*radius,player.y))player.x+=dx;
 if(!wall(player.x,player.y+dy+Math.sign(dy)*radius))player.y+=dy;
}
function updateEnemies(dt){for(let e of enemies){if(!e.alive)continue;let dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy);if(d<7){let step=.5*dt;if(d>1.2){let nx=e.x+dx/d*step,ny=e.y+dy/d*step;if(!wall(nx,e.y))e.x=nx;if(!wall(e.x,ny))e.y=ny;}e.phase+=dt;if(e.phase>2.4&&d<5){e.phase=0;player.hp-=5;damageFlash=1;updateHUD();if(player.hp<=0)finish(false)}}}}
function fire(){if(!active||paused||won)return;if(ammo<=0){$("#status").textContent="MAGAZINE EMPTY";return}ammo--;shotFlash=1;let target=null,best=999;for(let e of enemies){if(!e.alive)continue;let dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx)-player.a;while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;if(Math.abs(a)<.11&&d<best){let wallHit=cast(Math.atan2(dy,dx));if(wallHit.dist>d-.25){best=d;target=e}}}if(target){target.hp--;hitTimer=.25;show("#hit");setTimeout(()=>hide("#hit"),180);if(target.hp<=0){target.alive=false;kills++;$("#status").textContent="HOSTILE DISABLED";if(kills===6){$("#objective").textContent="OBJECTIVE COMPLETE";setTimeout(()=>finish(true),500)}}}else $("#status").textContent="SHOT FIRED";updateHUD()}
function reload(){if(!active||paused||won)return;if(ammo>=36||reserve<=0){$("#status").textContent=reserve<=0?"NO RESERVE AMMO":"MAGAZINE FULL";return}let need=36-ammo,take=Math.min(need,reserve);ammo+=take;reserve-=take;$("#status").textContent="MAGAZINE RELOADED";updateHUD()}
function finish(win){if(won)return;won=true;paused=true;$("#end-kicker").textContent=win?"SECTOR COMPLETE":"RUN TERMINATED";$("#end-title").innerHTML=win?"SECTOR CLEARED<span>.</span>":"SYSTEM FAILURE<span>.</span>";$("#end-copy").textContent=win?"All six security units are offline. The exit is unlocked.":"Your armor is depleted. Restart the run and try another route.";show("#end")}
function frame(t){if(!active){requestAnimationFrame(frame);return}let dt=Math.min(.05,(t-last)/1000||0);last=t;if(!paused&&!won){move(dt);updateEnemies(dt)}drawWorld();requestAnimationFrame(frame)}
function start(){reset();hide("#boot");hide("#pause");hide("#end");$("#game").classList.remove("hidden");active=true;paused=false;last=performance.now();canvas.focus?.();$("#status").textContent="WASD / TOUCH TO MOVE";requestAnimationFrame(frame)}
$("#start").onclick=start;$("#again").onclick=start;$("#restart").onclick=start;$("#pause-btn").onclick=()=>{if(!active||won)return;paused=true;show("#pause")};$("#resume").onclick=()=>{paused=false;hide("#pause");last=performance.now()};
window.addEventListener("keydown",e=>{let k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();keys[k]=true;if(k===" "||k==="enter")fire();if(k==="escape"&&active&&!won){paused=!paused;paused?show("#pause"):hide("#pause")}});
window.addEventListener("keyup",e=>{keys[e.key.toLowerCase()]=false});
canvas.addEventListener("click",()=>{if(document.pointerLockElement!==canvas&&canvas.requestPointerLock)canvas.requestPointerLock()});
document.addEventListener("mousemove",e=>{if(document.pointerLockElement===canvas&&!paused){player.a=(player.a+e.movementX*.0025+TAU)%TAU}});
canvas.addEventListener("pointerdown",e=>{if(e.pointerType==="touch"){touchLookX=e.clientX;canvas.setPointerCapture?.(e.pointerId)}});
canvas.addEventListener("pointermove",e=>{if(e.pointerType==="touch"&&touchLookX!==null&&!paused){let dx=e.clientX-touchLookX;player.a=(player.a+dx*.009+TAU)%TAU;touchLookX=e.clientX}});
canvas.addEventListener("pointerup",e=>{if(e.pointerType==="touch")touchLookX=null});
canvas.addEventListener("pointercancel",()=>touchLookX=null);
$("#fire").addEventListener("pointerdown",e=>{e.preventDefault();fire()});
$("#reload").addEventListener("pointerdown",e=>{e.preventDefault();reload()});
window.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="r")reload()});
$$("[data-key]").forEach(b=>{
 const k=b.dataset.key;
 b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);keys[k]=true;$("#status").textContent="MOVING"});
 const release=()=>{keys[k]=false};
 b.addEventListener("pointerup",release);
 b.addEventListener("pointercancel",release);
 b.addEventListener("lostpointercapture",release);
});
$("#look-left").addEventListener("pointerdown",e=>{e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);touchTurn=-1});$("#look-right").addEventListener("pointerdown",e=>{e.preventDefault();e.currentTarget.setPointerCapture?.(e.pointerId);touchTurn=1});["pointerup","pointercancel","pointerleave"].forEach(ev=>{ $("#look-left").addEventListener(ev,()=>touchTurn=0);$("#look-right").addEventListener(ev,()=>touchTurn=0)});
window.addEventListener("pointerup",()=>{for(const k of ["w","a","s","d"])keys[k]=false;touchTurn=0});
window.addEventListener("pointercancel",()=>{for(const k of ["w","a","s","d"])keys[k]=false;touchTurn=0});
window.addEventListener("blur",()=>{keys={};touchTurn=0;touchLookX=null});document.addEventListener("visibilitychange",()=>{if(document.hidden){keys={};touchTurn=0;touchLookX=null}});
})();