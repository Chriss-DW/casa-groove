import * as THREE from 'three';
import { makeTurntable } from './objects.js?v=3';

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const tracks={
  golden:{title:'Hora dorada',bar:4.8,chords:[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,57]],melody:[76,74,71,67]},
  slow:{title:'Sin prisa',bar:6,chords:[[50,57,60,65],[46,53,57,62],[43,50,53,58],[45,52,57,60]],melody:[77,72,69,65]},
  sideb:{title:'Lado B',bar:3.6,chords:[[48,55,58,63],[44,51,55,60],[41,48,51,56],[43,50,53,58]],melody:[75,70,67,63]},
};

// Original procedural ambient score. An AudioContext is created only by a play gesture.
class AmbientScore{
  constructor(){this.context=null;this.master=null;this.voices=new Set();this.timer=null;this.track='golden';this.bar=0;this.playing=false;this.volume=.35;}
  async start(){
    if(!this.context){
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)throw new Error('Este navegador no admite audio interactivo.');
      this.context=new Audio();
      const compressor=this.context.createDynamicsCompressor();compressor.threshold.value=-20;compressor.ratio.value=3;compressor.connect(this.context.destination);
      this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(compressor);
    }
    await this.context.resume();this.playing=true;this.bar=0;
    this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setTargetAtTime(this.volume*.35,this.context.currentTime,.12);
    this.scheduleBar();this.timer=setInterval(()=>this.scheduleBar(),tracks[this.track].bar*1000);
  }
  voice(note,time,duration,gain,type='sine',pan=0){
    const context=this.context,osc=context.createOscillator(),envelope=context.createGain(),filter=context.createBiquadFilter(),stereo=context.createStereoPanner();
    osc.type=type;osc.frequency.value=440*Math.pow(2,(note-69)/12);filter.type='lowpass';filter.frequency.value=1250;stereo.pan.value=pan;
    envelope.gain.setValueAtTime(0,time);envelope.gain.linearRampToValueAtTime(gain,time+.2);envelope.gain.setTargetAtTime(.0001,time+duration*.45,duration*.18);
    osc.connect(filter);filter.connect(envelope);envelope.connect(stereo);stereo.connect(this.master);
    this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);osc.disconnect();filter.disconnect();envelope.disconnect();stereo.disconnect();};osc.start(time);osc.stop(time+duration);
  }
  scheduleBar(){
    if(!this.playing)return;
    const track=tracks[this.track],now=this.context.currentTime+.06,chord=track.chords[this.bar%track.chords.length];
    chord.forEach((note,index)=>this.voice(note,now+index*.045,track.bar*1.5,.045,index%2?'triangle':'sine',(index-1.5)*.16));
    this.voice(chord[0]-12,now,track.bar*.9,.065,'sine');
    for(let i=0;i<4;i++)this.voice(track.melody[(this.bar+i)%4],now+i*track.bar/4+.25,track.bar*.45,.048,'sine',i%2?.25:-.25);
    this.bar++;
  }
  stop(){
    this.playing=false;clearInterval(this.timer);this.timer=null;
    if(this.context&&this.master){const time=this.context.currentTime;this.master.gain.cancelScheduledValues(time);this.master.gain.setTargetAtTime(0,time,.06);for(const voice of this.voices){try{voice.stop(time+.2);}catch{}}}
  }
  async change(track){this.track=track;if(this.playing){this.stop();await this.start();}}
  setVolume(value){this.volume=value;if(this.master&&this.playing)this.master.gain.setTargetAtTime(value*.35,this.context.currentTime,.05);}
}

const score=new AmbientScore(),play=document.querySelector('#play-music'),mini=document.querySelector('#mini-player');
let playing=false,changePending=false,playerVisible=true,sectionVisible=true;
function updateUI(){
  document.body.classList.toggle('music-playing',playing);
  play.setAttribute('aria-pressed',String(playing));play.querySelector('span').textContent=playing?'Pausar':'Reproducir';play.querySelector('use').setAttribute('href',playing?'#pause':'#play');
  document.querySelector('#playback-state').textContent=playing?'Sonando, a tu ritmo.':'La aguja espera.';
  mini.hidden=!playing||sectionVisible;
}
async function toggle(){
  if(changePending)return;
  changePending=true;play.disabled=true;
  try{if(playing){score.stop();playing=false;}else{await score.start();playing=true;}updateUI();requestPlayerRender();}
  catch(error){document.querySelector('#playback-state').textContent=error.message;score.stop();playing=false;updateUI();document.querySelector('#playback-state').textContent='No pudimos iniciar el audio. Probá de nuevo.';}
  finally{changePending=false;play.disabled=false;}
}
play.addEventListener('click',toggle);mini.addEventListener('click',toggle);
document.querySelector('#volume').addEventListener('input',event=>score.setVolume(Number(event.target.value)/100));
document.querySelectorAll('[data-track]').forEach(button=>button.addEventListener('click',async()=>{
  if(changePending)return;
  changePending=true;
  try{
    await score.change(button.dataset.track);
    document.querySelectorAll('[data-track]').forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',String(other===button));});
    document.querySelector('#track-title').textContent=tracks[button.dataset.track].title;
  }catch{score.stop();playing=false;updateUI();document.querySelector('#playback-state').textContent='No pudimos cambiar el ambiente. Probá reproducir de nuevo.';}
  finally{changePending=false;}
}));
new IntersectionObserver(entries=>{sectionVisible=entries[0].isIntersecting;updateUI();},{threshold:0}).observe(document.querySelector('#musica'));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){score.stop();playing=false;updateUI();}requestPlayerRender();});
window.addEventListener('pagehide',()=>score.stop());

let renderer,scene,camera,deck,frame=0,lastTime=0,speed=0;
function requestPlayerRender(){if(!frame&&renderer&&!document.hidden)frame=requestAnimationFrame(draw);}
function draw(time){
  frame=0;const delta=lastTime?Math.min((time-lastTime)/1000,.05):.016;lastTime=time;
  speed+=(Number(playing)-speed)*(reducedMotion?1:.08);
  if(!reducedMotion)deck.userData.disc.rotation.y-=delta*3.49*speed;
  const target=playing?-.64:0;deck.userData.arm.rotation.y+=(target-deck.userData.arm.rotation.y)*(reducedMotion?1:.08);
  renderer.render(scene,camera);
  if(playerVisible&&((playing&&!reducedMotion)||Math.abs(speed-Number(playing))>.005||Math.abs(target-deck.userData.arm.rotation.y)>.002))requestPlayerRender();
}
try{
  const host=document.querySelector('#record-player');
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  host.append(renderer.domElement);scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffe5bd,0x584333,3));
  const light=new THREE.DirectionalLight(0xffcb8b,5);light.position.set(-3,6,4);scene.add(light);
  const fill=new THREE.DirectionalLight(0xb0bdc7,1.4);fill.position.set(4,3,-2);scene.add(fill);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#9f6743';ctx.fillRect(0,0,256,256);
  for(let y=0;y<256;y++){ctx.strokeStyle=`rgba(45,21,7,${.05+(Math.sin(y*7.9)+1)*.07})`;ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(80,y+3,180,y-3,256,y+1);ctx.stroke();}
  const wood=new THREE.CanvasTexture(canvas);wood.colorSpace=THREE.SRGBColorSpace;
  deck=makeTurntable(new THREE.MeshStandardMaterial({color:'#98613d',map:wood,roughness:.5}));deck.rotation.y=-.18;scene.add(deck);
  camera=new THREE.OrthographicCamera(-2.5,2.5,2,-2,.1,40);camera.position.set(3.6,4.8,5.8);camera.lookAt(0,.25,0);
  new ResizeObserver(()=>{const width=host.clientWidth,height=host.clientHeight,aspect=width/height,vertical=Math.max(3.25,4.4/aspect);renderer.setSize(width,height);camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();requestPlayerRender();}).observe(host);
  new IntersectionObserver(entries=>{playerVisible=entries[0].isIntersecting;if(playerVisible)requestPlayerRender();},{rootMargin:'100px'}).observe(host);
  document.body.dataset.playerReady='true';requestPlayerRender();
}catch(error){
  const host=document.querySelector('#record-player');const message=document.createElement('p');message.className='player-fallback';message.textContent='La vista 3D no está disponible. La música sigue a un clic.';host.append(message);console.warn('Vista del tocadiscos no disponible:',error);
}
