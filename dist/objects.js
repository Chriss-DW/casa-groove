import * as THREE from 'three';
import { RoundedBoxGeometry } from './assets/RoundedBoxGeometry.js';

const standard = (color, options={}) => new THREE.MeshStandardMaterial({color, roughness:.6, ...options});
function add(parent, geometry, material, position=[0,0,0]) {
  const mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(...position); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function box(parent,size,position,material,radius=.035) {
  return add(parent,new RoundedBoxGeometry(...size,3,Math.min(radius,...size.map(n=>n/2))),material,position);
}
function cylinder(parent,radius,height,position,material) {
  return add(parent,new THREE.CylinderGeometry(radius,radius,height,64),material,position);
}
function labelTexture(title='HORA DORADA') {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#a45036';ctx.fillRect(0,0,512,512);
  ctx.fillStyle='#f2dfb8';ctx.textAlign='center';ctx.font='italic 600 50px Georgia';ctx.fillText('casa groove',256,185);
  ctx.font='18px sans-serif';ctx.fillText(title,256,335);ctx.font='13px sans-serif';ctx.fillText('33⅓ RPM · UN LADO BUENO',256,370);
  ctx.strokeStyle='#e4bd87';ctx.lineWidth=2;ctx.beginPath();ctx.arc(256,256,224,0,Math.PI*2);ctx.stroke();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
export function makeDisc(title) {
  const disc=new THREE.Group();
  const vinyl=standard('#121312',{roughness:.3,metalness:.24});
  cylinder(disc,.86,.035,[0,0,0],vinyl);
  const grooves=standard('#30312d',{metalness:.3,roughness:.42});
  for(let i=0;i<29;i++){
    const ring=add(disc,new THREE.TorusGeometry(.32+i*.0177,.0018,3,128),grooves,[0,.019,0]);ring.rotation.x=-Math.PI/2;
  }
  const label=add(disc,new THREE.CircleGeometry(.29,64),standard('#fff',{map:labelTexture(title)}),[0,.021,0]);label.rotation.x=-Math.PI/2;
  cylinder(disc,.025,.012,[0,.026,0],standard('#cbb38a',{metalness:.7,roughness:.3}));
  return disc;
}
export function makeTurntable(woodMaterial) {
  const group=new THREE.Group();
  const wood=woodMaterial?.clone()||standard('#8e5030');
  const black=standard('#242521',{roughness:.6});
  const metal=standard('#a9a79b',{metalness:.75,roughness:.25});
  box(group,[2.8,.32,2.12],[0,.23,0],wood,.09);
  box(group,[2.64,.04,1.98],[0,.405,0],black,.025);
  for(const x of [-1.08,1.08])for(const z of [-.78,.78])cylinder(group,.11,.12,[x,.05,z],black);
  cylinder(group,.92,.055,[-.37,.455,0],metal);
  const disc=makeDisc();disc.position.set(-.37,.51,0);group.add(disc);
  cylinder(group,.029,.13,[-.37,.54,0],metal);
  const arm=new THREE.Group();arm.position.set(1.01,.53,-.63);group.add(arm);
  cylinder(arm,.12,.09,[0,0,0],metal);
  box(arm,[.045,.045,1.2],[0,.13,.46],metal,.02);
  box(arm,[.12,.07,.23],[-.035,.1,1.05],black,.015).rotation.y=.3;
  box(arm,[.2,.14,.18],[0,.13,-.18],metal,.02);
  const power=cylinder(group,.065,.04,[1.05,.45,.65],metal);
  box(group,[.34,.015,.06],[.62,.435,.68],standard('#baa073'),.003);
  box(group,[.06,.012,.035],[.56,.45,.68],metal,.002);
  box(group,[.14,.025,.045],[-1.1,.44,.75],standard('#b6583b'),.005);
  group.userData.disc=disc;group.userData.arm=arm;group.userData.power=power;
  return group;
}
export function makePendant(){
  const group=new THREE.Group(),metal=standard('#9c7542',{metalness:.65,roughness:.3});
  cylinder(group,.19,.055,[0,2.15,0],metal);
  cylinder(group,.012,.8,[0,1.74,0],standard('#393025'));
  cylinder(group,.12,.16,[0,1.28,0],metal);
  const globe=add(group,new THREE.SphereGeometry(.57,48,32),standard('#dfceb0',{roughness:.23,emissive:'#ffba5f',emissiveIntensity:0}),[0,.72,0]);
  globe.userData.glow=true;group.userData.glow=globe;
  return group;
}
export function makePoster(texture){
  const group=new THREE.Group();
  box(group,[1.7,2.08,.09],[0,1.04,0],standard('#513422'),.012);
  box(group,[1.58,1.96,.016],[0,1.04,.053],standard('#eadfcb'),.002);
  add(group,new THREE.PlaneGeometry(1.39,1.69),standard('#fff',{map:texture}),[0,1.04,.065]);
  return group;
}

export function mountCatalog({lamp,sofa,wood,print,waves}) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  renderer.setSize(660,570);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  const vinyl=new THREE.Group();const record=makeDisc();record.rotation.x=Math.PI/2;record.position.set(.2,1,.14);vinyl.add(record);
  const sleeve=makePoster(waves);sleeve.scale.set(.88,.88,.88);sleeve.position.set(-.25,0,-.2);vinyl.add(sleeve);
  const models={lamp:{model:lamp,height:1.16,span:3.25},pendant:{model:makePendant(),height:1.1,span:2.9},poster:{model:makePoster(print),height:1.05,span:2.9},sofa:{model:sofa,height:.73,span:4.8},vinyl:{model:vinyl,height:1,span:2.8},turntable:{model:makeTurntable(wood),height:.35,span:3.65}};
  let night=false;const lights={lamp:false,pendant:false};
  const catalog=document.querySelector('.catalog');
  function setCardView(id, model) {
    const card=document.querySelector('[data-product="'+id+'"]');
    card.classList.toggle('is-model', model);
    const toggle=card.querySelector('[data-model-toggle]');
    toggle.setAttribute('aria-pressed', String(model));
    toggle.textContent=model?'Volver a la foto':'Ver modelo 3D';
    const button=card.querySelector('[data-lamp]');
    if(button){
      const title=card.querySelector('h3').textContent;
      button.setAttribute('aria-pressed',String(model&&lights[id]));
      button.setAttribute('aria-label',model?(lights[id]?'Apagar ':'Encender ')+title:'Probar luz en 3D de '+title);
      button.querySelector('span').textContent=model?(lights[id]?'Apagar':'Encender'):'Probar luz 3D';
    }
  }
  function renderCard(name){
    const item=models[name],scene=new THREE.Scene(),copy=item.model.clone(true);copy.position.set(0,0,0);
    copy.traverse(object=>{if(object.isMesh){object.material=object.material.clone();if(object.material.emissive){object.material.emissiveIntensity=lights[name]&&object.material.emissive.getHex()!==0?1.9:0;}}});
    scene.add(copy);
    scene.add(new THREE.HemisphereLight(night?0xb0c3d4:0xfff5df,0x6c5c4c,night?.85:3.5));
    const key=new THREE.DirectionalLight(night?0xf4c087:0xffe2bb,night?1:4);key.position.set(3,5,6);scene.add(key);
    if(lights[name]){
      const point=new THREE.PointLight(0xffbb66,30,10,1.7);point.position.set(0,name==='lamp'?1.8:.72,.05);scene.add(point);
      copy.traverse(object=>{if(object.isMesh&&name==='lamp'&&object.geometry.type==='CylinderGeometry'&&object.position.y>1.7){object.material.emissive.set('#ffb84f');object.material.emissiveIntensity=2;}});
    }
    const camera=new THREE.OrthographicCamera(-item.span*660/570/2,item.span*660/570/2,item.span/2,-item.span/2,.1,40);
    const portrait=name==='poster';camera.position.set(portrait?1.4:5,portrait?2:3.8,7);camera.lookAt(0,item.height,0);
    renderer.render(scene,camera);
    let image=document.querySelector(`#${name}-art .model-image`);
    if(!image){image=new Image();image.className='model-image';image.alt='Vista 3D ilustrativa de '+document.querySelector(`[data-product="${name}"] h3`).textContent;image.width=660;image.height=570;document.querySelector(`#${name}-art`).append(image);}
    image.src=renderer.domElement.toDataURL('image/png');
    copy.traverse(object=>{if(object.isMesh)object.material.dispose();});
  }
  const renderAll=()=>Object.keys(models).forEach(renderCard);
  renderAll();
  document.querySelectorAll('[data-model-toggle]').forEach(button=>{
    button.disabled=false;
    button.addEventListener('click',()=>{
      const id=button.dataset.modelToggle;
      setCardView(id,!document.querySelector('[data-product="'+id+'"]').classList.contains('is-model'));
    });
  });
  const nightInput=document.querySelector('#model-night');
  nightInput.disabled=false;
  nightInput.addEventListener('change',()=>{night=nightInput.checked;renderAll();});
  document.querySelectorAll('[data-lamp]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.lamp; lights[id]=!lights[id]; setCardView(id,true);renderCard(id);
  }));
  document.body.dataset.catalogReady='true';
}
