import * as THREE from 'three';
import {configurations,defaultArtwork,validArtwork,footprint,artworkWarnings} from './artwork-data.js';
export function createArtwork({scene,host,formatLength,formatArea,isImperial,trees,inside,onChange,onFocus,onSelect,camera,controls,canvas,treeMeshes}){
 const $=s=>document.querySelector(s),group=new THREE.Group();scene.add(group);let a=structuredClone(defaultArtwork),labels=[],isSelected=false,drag=null;
 try{const saved=JSON.parse(localStorage.getItem('parallels-artwork-v2'));if(validArtwork(saved))a=saved;else{const old=JSON.parse(localStorage.getItem('parallels-artwork-v1'));if(validArtwork(old))a={...old,x:defaultArtwork.x,z:defaultArtwork.z,rotation:defaultArtwork.rotation};}}catch{}
 function persist(){try{localStorage.setItem('parallels-artwork-v2',JSON.stringify(a));}catch{}onChange();}
 function mat(color,more={}){return new THREE.MeshStandardMaterial({color,roughness:.65,...more});}
 function box(w,h,d,x,y,z,color='#43434a'){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 function stroke(points,color='#84649d',opacity=1){const m=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(([x,y,z])=>new THREE.Vector3(x,y,z))),new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));group.add(m);return m;}
 function label(text,x,y,z,small=false){const el=document.createElement('span');el.className='dim '+(small?'art-number':'art-dim');el.textContent=text;$('#artwork-labels').append(el);labels.push({el,p:new THREE.Vector3(x,y,z),small});}
 function rebuild(){labels.forEach(l=>l.el.remove());labels=[];while(group.children.length){const c=group.children[0];group.remove(c);c.traverse(n=>{n.geometry?.dispose();if(Array.isArray(n.material))n.material.forEach(m=>m.dispose());else n.material?.dispose();});}group.position.set(a.x,0,a.z);group.rotation.y=a.rotation*Math.PI/180;group.visible=a.visible;
 const c=configurations[a.config],half=c.width/2+.6,depth=a.throw+.8;
 const envelope=new THREE.Mesh(new THREE.PlaneGeometry(half*2,depth+.9),new THREE.MeshBasicMaterial({color:isSelected?'#dca33a':'#9672be',transparent:true,opacity:isSelected?.25:.17,side:THREE.DoubleSide,depthWrite:false}));envelope.rotation.x=-Math.PI/2;envelope.position.set(0,.095,(depth-.9)/2);group.add(envelope);
 stroke([[-half,.11,-.9],[half,.11,-.9],[half,.11,depth],[-half,.11,depth],[-half,.11,-.9]],isSelected?'#b77613':'#84649d');
 // Schematic primary supports; not structural dimensions from the rider.
 for(const x of [-c.width/2-.25,c.width/2+.25]){box(.25,a.bottom+c.height+.5,.25,x,(a.bottom+c.height+.5)/2,-.4);box(.7,.08,.7,x,.04,-.4);}
 box(c.width+.8,.25,.25,0,a.bottom+c.height+.3,-.4);
 // Exact artwork plane and panel division (20 panels / 1,500 mirrors in either configuration).
 box(c.width,c.height,.07,0,a.bottom+c.height/2,0,'#3f4051');
 const cols=Math.round(c.width/.1),rows=Math.round(c.height/.1),mirrors=new THREE.InstancedMesh(new THREE.BoxGeometry(.052,.052,.014),mat('#c9d8e2',{metalness:.8,roughness:.22}),cols*rows),dummy=new THREE.Object3D();let k=0;
 for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){dummy.position.set(-c.width/2+(col+.5)*c.width/cols,a.bottom+(r+.5)*c.height/rows,.045);dummy.rotation.set(.08,((col+r)%3-1)*.08,0);dummy.updateMatrix();mirrors.setMatrixAt(k++,dummy.matrix);}group.add(mirrors);
 const panelWidth=a.config==='wide'?.5:1.5,panelHeight=a.config==='wide'?1.5:.5;
 for(let x=-c.width/2;x<=c.width/2+.01;x+=panelWidth)stroke([[x,a.bottom,.06],[x,a.bottom+c.height,.06]],'#8b91a2',.8);
 for(let y=a.bottom;y<=a.bottom+c.height+.01;y+=panelHeight)stroke([[-c.width/2,y,.06],[c.width/2,y,.06]],'#8b91a2',.8);
 let count=0;
 for(let row=0;row<c.rows;row++)for(let col=0;col<c.cols;col++){
  count++;const cx=-c.width/2+(col+.5)*c.sectionWidth,cy=a.bottom+(row+.5)*c.sectionHeight;
  // Two stacked emitters share a schematic tower in the tall version.
  box(.38,.24,.48,cx,cy,a.throw,'#524563');if(row===0){const top=a.bottom+c.height-c.sectionHeight/2;box(.16,top,.16,cx,top/2,a.throw,'#77717d');box(.65,.09,.65,cx,.045,a.throw,'#544e5c');}
  const lens=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),new THREE.MeshBasicMaterial({color:'#d2b2ff'}));lens.position.set(cx,cy,a.throw-.26);group.add(lens);
  if(a.beams){const left=cx-c.sectionWidth/2,right=cx+c.sectionWidth/2,low=cy-c.sectionHeight/2,high=cy+c.sectionHeight/2;
   for(const [x,y] of [[left,low],[right,low],[left,high],[right,high],[cx,cy]])stroke([[cx,cy,a.throw-.26],[x,y,.08]],'#a779df',.65);
   const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cx,cy,a.throw-.26),new THREE.Vector3(left,low,.08),new THREE.Vector3(right,high,.08)]);const fan=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#a779df',transparent:true,opacity:.055,side:THREE.DoubleSide,depthWrite:false}));group.add(fan);
  }
  if(row===0)label(c.rows===1?`L${count}`:`L${count} / L${count+c.cols}`,cx,.2,a.throw+.45,true);
 }
 label(`PARALLELS · ${formatLength(c.width)} × ${formatLength(c.height)} high`,0,.2,-2.2);
 // Ground arrows make the firing direction unambiguous in plan view.
 if(a.beams){for(let col=0;col<c.cols;col++){const x=-c.width/2+(col+.5)*c.sectionWidth,z=a.throw*.48;stroke([[x,.15,z+1.1],[x,.15,z-1.1]],'#8051aa');stroke([[x-.25,.15,z-.7],[x,.15,z-1.1],[x+.25,.15,z-.7]],'#8051aa');}}
 const heading=['north','west','south','east'][Math.round(((a.rotation%360)+360)%360/90)%4];
 label(`Lasers face ${heading}`,0,.2,a.throw+4);
 // Physical throw dimension, explicitly an assumption.
 stroke([[c.width/2+.35,.18,0],[c.width/2+.35,.18,a.throw]],'#84649d');
 label(`Laser distance ${formatLength(a.throw)}*`,c.width/2+3,.2,a.throw/2);labels.at(-1).el.classList.add('art-throw');
 $('#art-summary').textContent=`${formatLength(c.width)} wide × ${formatLength(c.height)} high · 4 lasers · 20 panels · 1,500 mirrors. Planning envelope: ${formatLength(c.width+1.2)} × ${formatLength(a.throw+1.7)} (${formatArea((c.width+1.2)*(a.throw+1.7))}).`;
 updateWarning();
 }
 function updateWarning(){const warn=artworkWarnings(a,trees(),inside);$('#art-clearance').textContent=a.visible?(warn.join(' ')||'Proposed envelope fits within the site and clears estimated tree canopies. This is a geometric planning check.'):'Artwork hidden.';$('#art-clearance').classList.toggle('warning',warn.length>0&&a.visible);}
 function fields(){const el=$('#art-fields');el.replaceChildren();const f=isImperial()?1/.3048:1,u=isImperial()?'ft':'m';
 for(const [key,title,min,max,angle] of [['x','Across from upper-left',-20,100],['z','Along from upper-left',-20,100],['rotation','Rotation',-360,360,true],['throw','Laser distance*',2,30],['bottom','Panel bottom height*',0,10]]){const l=document.createElement('label');l.textContent=`${title} (${angle?'°':u})`;const input=document.createElement('input');input.type='number';input.value=(a[key]*(angle?1:f)).toFixed(angle?0:2);input.min=min*(angle?1:f);input.max=max*(angle?1:f);input.step=angle?15:isImperial()?.5:.25;input.onchange=()=>{const v=Number(input.value)/(angle?1:f);if(!Number.isFinite(v)||v<min||v>max){fields();return;}a[key]=v;rebuild();persist();};l.append(input);el.append(l);}
 const note=document.createElement('p');note.textContent='*Assumed for this proposal; confirm for the four-laser installation.';el.append(note);
 $('#art-config').value=a.config;$('#art-visible').checked=a.visible;$('#art-beams').checked=a.beams;
 }

 function select(value){isSelected=value&&a.visible;$('.artwork-controls').classList.toggle('art-is-selected',isSelected);$('#art-select').textContent=isSelected?'Whole artwork selected':'Select whole artwork';$('#art-select').setAttribute('aria-pressed',String(isSelected));$('#art-deselect').hidden=!isSelected;$('#art-selection-status').textContent=isSelected?'Selected together: panel wall, supports and all 4 lasers. Drag to move; arrow keys nudge the whole group.':'Click a panel, laser or purple footprint to select the whole installation.';if(isSelected)onSelect();rebuild();}
 $('#art-select').onclick=()=>{if(!a.visible){a.visible=true;$('#art-visible').checked=true;persist();}select(true);};$('#art-deselect').onclick=()=>select(false);
 const pickRay=new THREE.Raycaster(),mouse=new THREE.Vector2(),floor=new THREE.Plane(new THREE.Vector3(0,1,0),0);pickRay.params.Line.threshold=.12;
 function aim(e){const rect=canvas.getBoundingClientRect();mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);pickRay.setFromCamera(mouse,camera);}
 function floorPoint(){return pickRay.ray.intersectPlane(floor,new THREE.Vector3());}
 function consume(e){e.stopImmediatePropagation();e.preventDefault();}
 canvas.addEventListener('pointerdown',e=>{if(drag||e.button!==0||!a.visible)return;aim(e);group.updateWorldMatrix(true,true);const hit=pickRay.intersectObject(group,true)[0];if(!hit)return;const treeHit=pickRay.intersectObjects(treeMeshes().filter(m=>{let n=m;while(n){if(!n.visible)return false;n=n.parent;}return true}))[0];if(treeHit&&treeHit.distance<hit.distance)return;const p=floorPoint();if(!p)return;consume(e);select(true);drag={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,offsetX:a.x-p.x,offsetZ:a.z-p.z,moved:false,controlsEnabled:controls.enabled};controls.enabled=false;canvas.setPointerCapture(e.pointerId);canvas.focus({preventScroll:true});canvas.style.cursor='grabbing';},true);
 canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointerId)return;consume(e);if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<4)return;aim(e);const p=floorPoint();if(!p)return;drag.moved=true;const step=isImperial()?.3048:1,snap=v=>$('#art-snap').checked?Math.round(v/step)*step:v;a.x=Math.max(-20,Math.min(100,snap(p.x+drag.offsetX)));a.z=Math.max(-20,Math.min(100,snap(p.z+drag.offsetZ)));group.position.set(a.x,0,a.z);updateWarning();},true);
 function finishDrag(e){if(!drag||e.pointerId!==drag.pointerId)return;consume(e);const previous=drag;drag=null;controls.enabled=previous.controlsEnabled;canvas.style.cursor='grab';if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);fields();if(previous.moved)persist();}
 canvas.addEventListener('pointerup',finishDrag,true);canvas.addEventListener('pointercancel',finishDrag,true);canvas.addEventListener('lostpointercapture',e=>{if(drag&&e.pointerId===drag.pointerId){controls.enabled=drag.controlsEnabled;drag=null;canvas.style.cursor='grab';fields();persist();}},true);
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Site model. Click the artwork to select panels and all four lasers together; drag to move.');
 canvas.addEventListener('keydown',e=>{if(!isSelected)return;if(e.key==='Escape'){select(false);return;}const delta={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(!delta)return;consume(e);const step=(isImperial()?.3048:1)*(e.shiftKey?5:1);a.x=Math.max(-20,Math.min(100,a.x+delta[0]*step));a.z=Math.max(-20,Math.min(100,a.z+delta[1]*step));refresh();persist();});
 $('#art-config').onchange=e=>{a.config=e.target.value;rebuild();fields();persist();};$('#art-visible').onchange=e=>{a.visible=e.target.checked;if(!a.visible)select(false);else rebuild();persist();};$('#art-beams').onchange=e=>{a.beams=e.target.checked;rebuild();persist();};$('#art-reset').onclick=()=>{a=structuredClone(defaultArtwork);refresh();persist();};$('#art-focus').onclick=()=>onFocus(a);
 function refresh(){rebuild();fields();}
 refresh();return {refresh,updateWarning,deselect:()=>{if(isSelected)select(false);},get:()=>structuredClone(a),set(v){a=validArtwork(v)?structuredClone(v):structuredClone(defaultArtwork);refresh();persist();},update(camera,width,height,dimensions){for(const l of labels){const world=group.localToWorld(l.p.clone()),v=world.project(camera);l.el.style.display=a.visible&&(l.small||dimensions)&&v.z<1?'block':'none';l.el.style.left=`${(v.x+1)/2*width}px`;l.el.style.top=`${(1-v.y)/2*height}px`;}}};
}
