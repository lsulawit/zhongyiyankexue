/* Lightweight dependency-free WebGL 3D renderer. Offline / GitHub Pages compatible.
   Procedural globe / iris / pupil / corneal sheen; drag or arrow buttons to orbit. */
(()=>{'use strict';
 const canvas=document.getElementById('eye3d');if(!canvas)return;
 const stage=canvas.parentElement;
 const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 let mode='eye',yaw=-.11,pitch=.06,auto=0,active=true,raf=0,drag=false,lastX=0,lastY=0;
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false})||canvas.getContext('experimental-webgl',{alpha:true,antialias:true});
 if(!gl){fallback();return;}
 const vs=`attribute vec3 aPos;attribute vec3 aNormal;attribute vec2 aUV;
 uniform mat4 uMVP;uniform mat4 uModel;varying vec2 vUV;varying vec3 vNormal;varying vec3 vPos;
 void main(){vUV=aUV;vNormal=normalize((uModel*vec4(aNormal,0.0)).xyz);vPos=(uModel*vec4(aPos,1.0)).xyz;gl_Position=uMVP*vec4(aPos,1.0);}`;
 const fs=`precision mediump float;varying vec2 vUV;varying vec3 vNormal;varying vec3 vPos;
 uniform sampler2D uTex;uniform float uAlpha;uniform float uGloss;uniform vec3 uTint;
 void main(){vec3 n=normalize(vNormal);vec3 view=normalize(vec3(0.0,0.0,5.0)-vPos);
 float dif=max(0.0,dot(n,normalize(vec3(-0.4,0.75,1.0))));
 float fill=max(0.0,dot(n,normalize(vec3(0.8,-0.4,0.3))));
 vec3 h=normalize(normalize(vec3(-0.4,0.75,1.0))+view);
 float spec=pow(max(0.0,dot(n,h)),64.0)*uGloss;
 float fres=pow(1.0-max(0.0,dot(n,view)),2.5);
 vec4 base=texture2D(uTex,vUV);
 vec3 rgb=base.rgb*uTint*(0.56+0.43*dif+0.17*fill)+vec3(0.86,0.96,1.0)*spec;
 rgb+=vec3(0.22,0.59,0.68)*fres*uGloss*0.15;
 gl_FragColor=vec4(rgb,base.a*uAlpha);}`;
 const lvs=`attribute vec3 aPos;uniform mat4 uMVP;void main(){gl_Position=uMVP*vec4(aPos,1.0);}`;
 const lfs=`precision mediump float;uniform vec4 uColor;void main(){gl_FragColor=uColor;}`;
 function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 function program(v,f){const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,v));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
 let meshP,lineP;try{meshP=program(vs,fs);lineP=program(lvs,lfs);}catch(e){console.warn('3D init',e);fallback();return;}
 const mp={pos:gl.getAttribLocation(meshP,'aPos'),nor:gl.getAttribLocation(meshP,'aNormal'),uv:gl.getAttribLocation(meshP,'aUV'),mvp:gl.getUniformLocation(meshP,'uMVP'),model:gl.getUniformLocation(meshP,'uModel'),tex:gl.getUniformLocation(meshP,'uTex'),alpha:gl.getUniformLocation(meshP,'uAlpha'),gloss:gl.getUniformLocation(meshP,'uGloss'),tint:gl.getUniformLocation(meshP,'uTint')};
 const lp={pos:gl.getAttribLocation(lineP,'aPos'),mvp:gl.getUniformLocation(lineP,'uMVP'),col:gl.getUniformLocation(lineP,'uColor')};
 function tex(draw,size=1024){const c=document.createElement('canvas');c.width=size;c.height=size;const cx=c.getContext('2d');draw(cx,size);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.generateMipmap(gl.TEXTURE_2D);return t;}
 let randomSeed=5739;function random(){randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;}
 const white=tex((c,s)=>{c.fillStyle='#e9f5f7';c.fillRect(0,0,s,s);const gg=c.createLinearGradient(0,0,0,s);gg.addColorStop(0,'#bdc9df');gg.addColorStop(.25,'#fafbfa');gg.addColorStop(.7,'#e6f4f4');gg.addColorStop(1,'#b9c6e4');c.fillStyle=gg;c.fillRect(0,0,s,s);for(let i=0;i<105;i++){const x=random()*s,y=random()*s,len=20+random()*90;c.strokeStyle=`rgba(${175+Math.round(random()*40)},${72+Math.round(random()*52)},${97+Math.round(random()*30)},${.07+random()*.15})`;c.lineWidth=.6+random()*1.6;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+len*.2,y-12,x+len*.5,y+12,x+len,y+random()*20);c.stroke();}});
 const iris=tex((c,s)=>{const mid=s/2;const bg=c.createRadialGradient(mid,mid,s*.11,mid,mid,s*.49);bg.addColorStop(0,'#151c26');bg.addColorStop(.24,'#285779');bg.addColorStop(.52,'#65bfc5');bg.addColorStop(.69,'#a3be89');bg.addColorStop(.83,'#436985');bg.addColorStop(.98,'#1b3453');c.fillStyle=bg;c.fillRect(0,0,s,s);
  for(let i=0;i<4200;i++){const ang=random()*Math.PI*2,r=.15+random()*.33,x=mid+Math.cos(ang)*s*r,y=mid+Math.sin(ang)*s*r,len=4+random()*s*.10;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(ang)*len,y+Math.sin(ang)*len);const col=random();c.strokeStyle=col<.26?'rgba(249,225,137,.21)':col<.53?'rgba(8,41,73,.29)':col<.8?'rgba(117,230,211,.26)':'rgba(16,75,96,.41)';c.lineWidth=.35+random()*2.6;c.stroke();}
  for(let i=0;i<95;i++){const r=s*(.17+random()*.3);c.beginPath();c.arc(mid,mid,r,0,Math.PI*2);c.strokeStyle=`rgba(16,52,85,${.025+random()*.08})`;c.lineWidth=1+random()*3;c.stroke();}});
 const pupil=tex((c,s)=>{const grad=c.createRadialGradient(s*.45,s*.42,0,s*.5,s*.5,s*.57);grad.addColorStop(0,'#01040d');grad.addColorStop(.72,'#020a16');grad.addColorStop(.96,'#0b1d31');c.fillStyle=grad;c.fillRect(0,0,s,s);});
 const glow=tex((c,s)=>{const g=c.createRadialGradient(s*.42,s*.32,0,s*.5,s*.5,s*.75);g.addColorStop(0,'rgba(247,255,255,.88)');g.addColorStop(.21,'rgba(198,252,255,.28)');g.addColorStop(1,'rgba(157,235,255,0)');c.fillStyle=g;c.fillRect(0,0,s,s);});
 // Soft retinal photograph-like educational illustration with naturally branching vessels.
 const retinaTexture=tex((c,s)=>drawFundus(c,s),1024);
 function drawFundus(c,s){const h=s/2;const bg=c.createRadialGradient(h*.8,h*.78,10,h,h,s*.72);bg.addColorStop(0,'#cb745b');bg.addColorStop(.32,'#a44442');bg.addColorStop(.61,'#763039');bg.addColorStop(.86,'#390e26');bg.addColorStop(1,'#150b20');c.fillStyle=bg;c.fillRect(0,0,s,s);for(let i=0;i<1600;i++){const x=random()*s,y=random()*s;c.fillStyle=`rgba(255,${72+Math.floor(random()*105)},${45+Math.floor(random()*100)},${random()*.034})`;c.fillRect(x,y,1+random()*4,1+random()*4);}const dx=s*.36,dy=s*.48;const disc=c.createRadialGradient(dx,dy,0,dx,dy,s*.126);disc.addColorStop(0,'#f7ddba');disc.addColorStop(.64,'#edb889');disc.addColorStop(.84,'#ce866f');disc.addColorStop(1,'rgba(171,90,67,0)');c.fillStyle=disc;c.beginPath();c.arc(dx,dy,s*.126,0,Math.PI*2);c.fill();const mc=c.createRadialGradient(s*.655,s*.52,0,s*.655,s*.52,s*.15);mc.addColorStop(0,'rgba(65,15,35,.75)');mc.addColorStop(.5,'rgba(85,21,43,.35)');mc.addColorStop(1,'rgba(79,15,40,0)');c.fillStyle=mc;c.beginPath();c.arc(s*.655,s*.52,s*.15,0,Math.PI*2);c.fill();
  function branch(x,y,angle,len,depth,width){if(depth<=0||len<6)return;const nx=x+Math.cos(angle)*len,ny=y+Math.sin(angle)*len;c.lineCap='round';c.strokeStyle=`rgba(81,17,35,${.6+depth*.043})`;c.lineWidth=width+2;c.beginPath();c.moveTo(x,y);const xx=x+Math.cos(angle)*len*.58+Math.sin(angle)*len*.07,yy=y+Math.sin(angle)*len*.58-Math.cos(angle)*len*.07;c.quadraticCurveTo(xx,yy,nx,ny);c.stroke();c.strokeStyle=`rgba(223,96,75,${.28+depth*.026})`;c.lineWidth=Math.max(1,width*.38);c.stroke();branch(nx,ny,angle+(random()-.5)*.28,len*(.65+random()*.13),depth-1,width*.67);if(depth>=2)branch(nx,ny,angle+(random()>.5?1:-1)*(.25+random()*.5),len*(.45+random()*.25),depth-2,width*.47)}
  for(let i=0;i<11;i++){const a=(i/11)*Math.PI*2;branch(dx,dy,a,85+random()*62,4,5+random()*6)}
 }
 window.OQ_fundusPaint=(ctx,w,h)=>{ctx.save();ctx.clearRect(0,0,w,h);const tc=document.createElement('canvas');tc.width=1024;tc.height=1024;drawFundus(tc.getContext('2d'),1024);ctx.drawImage(tc,0,0,w,h);ctx.restore();};
 function geometry(verts,norms,uvs,idx){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);const n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(norms),gl.STATIC_DRAW);const u=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,u);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uvs),gl.STATIC_DRAW);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);return{b,n,u,ib,count:idx.length};}
 function sphere(r=1.25,lat=42,lon=84){let v=[],n=[],uv=[],ix=[];for(let a=0;a<=lat;a++){let th=a*Math.PI/lat;for(let b=0;b<=lon;b++){let ph=b*Math.PI*2/lon;let x=Math.sin(th)*Math.cos(ph),y=Math.cos(th),z=Math.sin(th)*Math.sin(ph);v.push(r*x,r*y,r*z);n.push(x,y,z);uv.push(b/lon,1-a/lat);if(a<lat&&b<lon){let k=a*(lon+1)+b;ix.push(k,k+lon+1,k+1,k+1,k+lon+1,k+lon+2)}}}return geometry(v,n,uv,ix);}
 // Convex circular surface in the plane of pupil, warped to match globe curvature.
 function disk(rad,z0,segments=128,levels=18){let v=[],n=[],uv=[],ix=[];for(let i=0;i<=levels;i++){let R=i/levels;for(let j=0;j<=segments;j++){const a=Math.PI*2*j/segments,x=Math.cos(a)*R*rad,y=Math.sin(a)*R*rad,z=z0-Math.pow(R,2)*.075;v.push(x,y,z);n.push(x*.2,y*.2,1);uv.push(.5+Math.cos(a)*R*.495,.5+Math.sin(a)*R*.495);if(i<levels&&j<segments){const k=i*(segments+1)+j;ix.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}}}return geometry(v,n,uv,ix);}
 const sclera=sphere(1.23),irisDisk=disk(.545,1.27),pupilDisk=disk(.21,1.31),corneaDisk=disk(.63,1.34),retinaDisk=disk(1.12,.18);
 function I(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
 function mul(a,b){const out=Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)out[i*4+j]+=a[i*4+k]*b[k*4+j];return out;}
 function tr(x,y,z){const m=I();m[3]=x;m[7]=y;m[11]=z;return m;}
 function ry(v){const c=Math.cos(v),s=Math.sin(v);return[c,0,s,0,0,1,0,0,-s,0,c,0,0,0,0,1];}
 function rx(v){const c=Math.cos(v),s=Math.sin(v);return[1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1];}
 function scale(x,y,z){return[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1];}
 // GLSL matrices are column-major; convert row-major helpers before upload.
 function col(m){return new Float32Array([m[0],m[4],m[8],m[12],m[1],m[5],m[9],m[13],m[2],m[6],m[10],m[14],m[3],m[7],m[11],m[15]]);}
 function persp(fovy,aspect,near,far){const f=1/Math.tan(fovy/2);return[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),2*far*near/(near-far),0,0,-1,0];}
 function render(ts=0){if(ts&&ts-(render.lastFrame||0)<32){if(active&&!reduced)raf=requestAnimationFrame(render);return;}if(ts)render.lastFrame=ts;const w=Math.max(1,Math.floor(canvas.clientWidth)),h=Math.max(1,Math.floor(canvas.clientHeight)),ratio=Math.min(1.8,window.devicePixelRatio||1);if(canvas.width!==Math.floor(w*ratio)||canvas.height!==Math.floor(h*ratio)){canvas.width=Math.floor(w*ratio);canvas.height=Math.floor(h*ratio);}gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  if(active&&!reduced)auto+=.004;
  const p=persp(.74,w/h,.1,50);const v=tr(0,0,-4.85);const moving=mul(ry(yaw+(active&&!drag&&!reduced?Math.sin(auto)*.11:0)),rx(pitch));
  const normEye=mode==='eye'||mode==='slit';const axis=mul(v,moving);
  function draw(mesh,texture,model,alpha,gloss,tint){gl.useProgram(meshP);const full=mul(p,mul(v,model));gl.uniformMatrix4fv(mp.mvp,false,col(full));gl.uniformMatrix4fv(mp.model,false,col(model));gl.uniform1f(mp.alpha,alpha);gl.uniform1f(mp.gloss,gloss);gl.uniform3f(mp.tint,...tint);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(mp.tex,0);[[mp.pos,mesh.b,3],[mp.nor,mesh.n,3],[mp.uv,mesh.u,2]].forEach(([at,b,n])=>{gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,n,gl.FLOAT,false,0,0)});gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.ib);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);}
  function line(vertices,rgba,model=I()){gl.useProgram(lineP);gl.uniformMatrix4fv(lp.mvp,false,col(mul(p,mul(v,model))));gl.uniform4fv(lp.col,rgba);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STREAM_DRAW);gl.enableVertexAttribArray(lp.pos);gl.vertexAttribPointer(lp.pos,3,gl.FLOAT,false,0,0);gl.drawArrays(gl.LINE_STRIP,0,vertices.length/3);gl.deleteBuffer(b);}
  const ring=Array.from({length:171},(_,i)=>{const a=i/170*Math.PI*2;return[Math.cos(a)*1.8,Math.sin(a)*.37,Math.sin(a)*1.5];}).flat();line(ring,[.39,.91,.86,.27],mul(ry(.28),rx(-.26)));
  const ring2=Array.from({length:160},(_,i)=>{const a=i/159*Math.PI*2;return[Math.cos(a)*1.55,Math.sin(a)*1.69,Math.sin(a)*.4];}).flat();line(ring2,[.8,.55,1,.18],mul(ry(.72),rx(.28)));
  if(normEye){draw(sclera,white,moving,1,.74,[1,1,1]);gl.disable(gl.DEPTH_TEST);
    // Face layers rotate together as a rigid globe.
    draw(irisDisk,iris,moving,1,.32,[.98,1,1]);draw(pupilDisk,pupil,moving,1,.83,[1,1,1]);draw(corneaDisk,glow,moving,.16,1,[1,1,1]);gl.enable(gl.DEPTH_TEST);
    // curved eyelid rims 3d
    const lidTop=[],lidBot=[];for(let j=0;j<=64;j++){const x=-1.14+2.28*j/64;const q=Math.sqrt(Math.max(0,1-(x/1.2)**2));lidTop.push(x,.79*q-.14,.86*q+.05);lidBot.push(x,-.69*q-.12,.85*q+.05);}line(lidTop,[.87,.48,.55,.8],moving);line(lidBot,[.7,.49,.59,.65],moving);
    // focal light ray for slit lamp scene
    if(mode==='slit'){const beam=[];for(let i=0;i<=30;i++){const y=-1.3+i*2.6/30;beam.push(-.065,y,1.54)}line(beam,[.53,1,.84,.9],moving);}
  }else{
    // Behind-the-eye view: a realistic curved retinal atlas disc to explore
    const back=mul(moving,ry(Math.PI*.09));draw(sclera,white,back,.3,.32,[.18,.34,.4]);gl.disable(gl.DEPTH_TEST);draw(retinaDisk,retinaTexture,back,1,.04,[1.02,1.03,1.05]);gl.enable(gl.DEPTH_TEST);
  }
  if(active&&!reduced)raf=requestAnimationFrame(render);
 }
 function turn(d){yaw=Math.max(-1.2,Math.min(1.2,yaw+d));renderOnce();}
 function renderOnce(){if(reduced||!active)render();}
 function reset(){yaw=-.11;pitch=.06;renderOnce();}
 canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)>0||Math.abs(dy)>0){yaw=Math.max(-1.45,Math.min(1.45,yaw+dx*.009));pitch=Math.max(-.7,Math.min(.7,pitch+dy*.007));lastX=e.clientX;lastY=e.clientY;renderOnce();}});
 canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
 document.getElementById('turn-left').addEventListener('click',()=>turn(-.18));document.getElementById('turn-right').addEventListener('click',()=>turn(.18));document.getElementById('reset-view').addEventListener('click',reset);
 document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active)render();else cancelAnimationFrame(raf)});
 window.OQ_3D={setMode(m){mode=(m==='fundus')?'fundus':(m==='slit'?'slit':'eye');document.getElementById('stage-label-title').textContent=m==='fundus'?'RETINAL FUNDUS':m==='slit'?'SLIT-LAMP VIEW':'HUMAN EYE';document.getElementById('stage-label-subtitle').textContent=m==='fundus'?'ภาพจอประสาทตาจำลอง 3 มิติ':m==='slit'?'ศึกษากระจกตาและม่านตา':'ลากเพื่อหมุนโมเดล 3 มิติ';reset();},reset};
 render();
 function fallback(){const ctx=canvas.getContext('2d');if(!ctx){canvas.style.display='none';stage.style.background='radial-gradient(circle at 50% 48%,#79c6cb,#d5f5f1 16%,#203d64 36%,#111c38 72%)';window.OQ_3D={setMode:()=>{}};return;}function paint(){canvas.width=canvas.clientWidth||440;canvas.height=canvas.clientHeight||330;const c=ctx,w=canvas.width,h=canvas.height,x=w/2,y=h/2,r=Math.min(w,h)*.36;const bg=c.createRadialGradient(x-r*.22,y-r*.3,r*.1,x,y,r);bg.addColorStop(0,'#fff');bg.addColorStop(.8,'#d2e6ee');bg.addColorStop(1,'#526b9f');c.fillStyle=bg;c.beginPath();c.arc(x,y,r,0,7);c.fill();const iris=c.createRadialGradient(x,y,2,x,y,r*.47);iris.addColorStop(0,'#06131b');iris.addColorStop(.29,'#1b4d6e');iris.addColorStop(.66,'#74c7be');iris.addColorStop(1,'#1b405d');c.fillStyle=iris;c.beginPath();c.arc(x,y,r*.47,0,7);c.fill();c.fillStyle='#030c18';c.beginPath();c.arc(x,y,r*.2,0,7);c.fill();c.fillStyle='#fffc';c.beginPath();c.ellipse(x-r*.17,y-r*.18,r*.13,r*.065,-.6,0,7);c.fill();}paint();window.addEventListener('resize',paint);document.getElementById('turn-left').disabled=true;document.getElementById('turn-right').disabled=true;document.getElementById('reset-view').disabled=true;window.OQ_3D={setMode:()=>{}};}
})();
