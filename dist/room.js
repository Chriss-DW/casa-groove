import * as THREE from 'three';
import { OrbitControls } from './assets/OrbitControls.js';
import { RoundedBoxGeometry } from './assets/RoundedBoxGeometry.js';
import { mountCatalog } from './objects.js?v=4';

const host = document.querySelector('#room');
const status = document.querySelector('#status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let toastTimer;
function announce(message) {
  status.textContent = message;
  status.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => status.classList.remove('visible'), 3500);
}

try {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4.8, 4.8, 4, -4, .1, 80);
  const homePosition = new THREE.Vector3(8, 6.5, 10);
  const homeTarget = new THREE.Vector3(0, 1.15, 0);
  camera.position.copy(homePosition);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(homeTarget);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = .09;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minAzimuthAngle = -.05;
  controls.maxAzimuthAngle = Math.PI / 2.5;
  controls.minPolarAngle = .7;
  controls.maxPolarAngle = 1.35;
  controls.update();

  const hemi = new THREE.HemisphereLight(0xfff5db, 0x8b876d, 3.1);
  scene.add(hemi);
  const sunlight = new THREE.DirectionalLight(0xffe5bb, 4.5);
  sunlight.position.set(1, 7, 5);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunlight.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: .1, far: 25 });
  sunlight.shadow.normalBias = .025;
  sunlight.shadow.bias = -.0002;
  sunlight.shadow.radius = 5;
  scene.add(sunlight);
  const lampLight = new THREE.PointLight(0xffaf53, 0, 8, 1.8);
  lampLight.position.set(2.18, 1.85, -1.13);
  scene.add(lampLight);
  const fill = new THREE.DirectionalLight(0xffe8ce, 1.1);
  fill.position.set(-4, 3, 2);
  scene.add(fill);

  // Small deterministic material textures, drawn locally; no remote imagery.
  let seed = 410;
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function texture(painter, size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    painter(canvas.getContext('2d'), size);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return map;
  }
  const fabric = texture((ctx, size) => {
    ctx.fillStyle = '#dad6c9'; ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 26000; i++) {
      const tone = Math.floor(125 + random() * 100);
      ctx.fillStyle = `rgba(${tone},${tone},${tone},.23)`;
      ctx.fillRect(random() * size, random() * size, 1, 2);
    }
  });
  fabric.wrapS = fabric.wrapT = THREE.RepeatWrapping;
  fabric.repeat.set(3, 3);
  const wood = texture((ctx, size) => {
    ctx.fillStyle = '#ad7447'; ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y++) {
      ctx.strokeStyle = `rgba(${random() > .5 ? '60,30,10' : '235,184,115'},${.05 + random() * .17})`;
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.bezierCurveTo(size / 3, y + random() * 10, size * .7, y - random() * 8, size, y);
      ctx.stroke();
    }
  });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .8, ...extra });
  const woodMat = material('#b78356', { map: wood, roughness: .55 });
  const darkWood = material('#69452f', { map: wood, roughness: .6 });
  const sofaMat = material('#536148', { map: fabric, roughness: 1 });
  const creamMat = material('#efdec0');
  const orangeMat = material('#d05f2d', { roughness: .36, metalness: .13 });
  const brassMat = material('#b29963', { metalness: .7, roughness: .3 });
  const room = new THREE.Group();
  scene.add(room);
  function mesh(geometry, mat, parent, x = 0, y = 0, z = 0) {
    const item = new THREE.Mesh(geometry, mat);
    item.position.set(x, y, z); item.castShadow = true; item.receiveShadow = true;
    parent.add(item); return item;
  }
  function box(parent, dimensions, position, mat, radius = .02) {
    const geometry = radius ? new RoundedBoxGeometry(...dimensions, 3, Math.min(radius, ...dimensions.map(v => v / 2))) : new THREE.BoxGeometry(...dimensions);
    return mesh(geometry, mat, parent, ...position);
  }
  function cylinder(parent, top, bottom, height, position, mat) {
    return mesh(new THREE.CylinderGeometry(top, bottom, height, 48), mat, parent, ...position);
  }
  const floor = material('#d5b282', { map: wood, roughness: .9 });
  box(room, [6.25, .18, 4.9], [0, -.1, 0], darkWood, .035);
  for (let i = 0; i < 12; i++) box(room, [.515, .035, 4.85], [-2.84 + i * .516, .006, 0], floor, .003);
  const wall = material('#e4cdae', { roughness: 1 });
  const sideWall = material('#c69472', { roughness: 1 });
  box(room, [6.25, 3.75, .15], [0, 1.87, -2.38], wall, .008);
  box(room, [.15, 3.75, 4.9], [-3.05, 1.87, 0], sideWall, .008);
  box(room, [6.12, .09, .04], [0, .08, -2.28], darkWood, .005);
  box(room, [.04, .09, 4.7], [-2.95, .08, 0], darkWood, .005);

  // A recessed window with warm sky and a simple solid-wood frame.
  const glass = material('#d3dfc3', { emissive: '#c7c9a0', emissiveIntensity: .22, roughness: .6 });
  box(room, [.045, 1.85, 2.0], [-2.95, 2.35, -.15], glass, .005);
  for (const z of [-1.2, -.15, .9]) box(room, [.09, 2.0, .07], [-2.89, 2.35, z], creamMat, .005);
  for (const y of [1.39, 2.35, 3.31]) box(room, [.09, .07, 2.17], [-2.89, y, -.15], creamMat, .005);
  box(room, [.25, .07, 2.25], [-2.83, 1.37, -.15], creamMat, .01);

  // Original geometric flower print, painted onto the room's framed poster.
  const print = texture((ctx, size) => {
    ctx.fillStyle = '#eee3c8'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#30332a';
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if ((x + y) % 2 === 0) ctx.fillRect(34 + x * 74, 34 + y * 74, 74, 74);
    ctx.save(); ctx.translate(size / 2, size / 2);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4); ctx.fillStyle = '#eee3c8'; ctx.strokeStyle = '#30332a'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(0, -108, 46, 90, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#dcaa3c'; ctx.beginPath(); ctx.arc(0, 0, 74, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#30332a';
    for (const x of [-24, 24]) { ctx.beginPath(); ctx.ellipse(x, -12, 7, 16, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 10, 27, .12, Math.PI - .12); ctx.stroke(); ctx.restore();
  });
  box(room, [1.5, 1.62, .07], [.05, 2.56, -2.26], darkWood, .01);
  const mainPrint = mesh(new THREE.PlaneGeometry(1.36, 1.47), material('#ffffff', { map: print }), room, .05, 2.56, -2.216);
  const smallPrint = texture((ctx, size) => {
    ctx.fillStyle = '#ad553c'; ctx.fillRect(0, 0, size, size); ctx.strokeStyle = '#e3c491'; ctx.lineWidth = 19;
    for (let x = -200; x < 700; x += 65) { ctx.beginPath(); ctx.moveTo(x, size); ctx.bezierCurveTo(x + 250, 320, x - 100, 100, x + 190, -40); ctx.stroke(); }
  });
  box(room, [.77, 1.05, .055], [-1.31, 2.5, -2.27], darkWood, .005);
  mesh(new THREE.PlaneGeometry(.66, .94), material('#ffffff', { map: smallPrint }), room, -1.31, 2.5, -2.235);

  const sofa = new THREE.Group(); sofa.position.set(-.17, .07, -1.25); room.add(sofa);
  box(sofa, [3.55, .19, 1.35], [0, .32, 0], darkWood, .05);
  for (const x of [-1.48, 1.48]) for (const z of [-.45, .45]) cylinder(sofa, .055, .045, .27, [x, .15, z], darkWood);
  box(sofa, [3.46, .7, .32], [0, 1.02, -.55], sofaMat, .15);
  for (const x of [-1.63, 1.63]) box(sofa, [.38, .74, 1.45], [x, .75, .01], sofaMat, .18);
  for (let i = -1; i <= 1; i++) {
    box(sofa, [.96, .27, 1.05], [i * 1.0, .59, .12], sofaMat, .12);
    const cushion = box(sofa, [.97, .63, .28], [i * 1.0, 1.01, -.36], sofaMat, .12);
    cushion.rotation.x = -.1;
  }
  const pillow = box(sofa, [.52, .51, .2], [-1.12, .96, .03], material('#d0a04a', { map: fabric }), .13);
  pillow.rotation.set(-.25, .1, -.22);
  const pillow2 = box(sofa, [.49, .48, .19], [1.12, .96, .02], material('#e2ccb1', { map: fabric }), .13);
  pillow2.rotation.set(-.2, -.15, .2);

  // Checker rug: actual geometry so its proportions remain stable in 3D.
  const rugCream = material('#e8ddc4', { map: fabric, roughness: 1 });
  const rugDark = material('#393d31', { map: fabric, roughness: 1 });
  box(room, [3.95, .025, 2.35], [.1, .045, .72], rugCream, .025);
  for (let x = 0; x < 8; x++) for (let z = 0; z < 5; z++) {
    box(room, [.48, .012, .45], [-1.58 + x * .48, .063, -.17 + z * .45], (x + z) % 2 ? rugDark : rugCream, .004);
  }
  const table = new THREE.Group(); table.position.set(.15, .08, .78); room.add(table);
  box(table, [2.0, .15, 1.02], [0, .58, 0], woodMat, .075);
  for (const x of [-.68, .68]) for (const z of [-.3, .3]) {
    const leg = cylinder(table, .055, .075, .56, [x, .28, z], darkWood); leg.rotation.z = x > 0 ? -.08 : .08;
  }
  const book = box(table, [.58, .045, .4], [-.3, .69, -.04], material('#bd6d4e'), .008); book.rotation.y = -.15;
  const book2 = box(table, [.5, .035, .34], [-.29, .73, -.04], creamMat, .005); book2.rotation.y = -.15;
  cylinder(table, .095, .075, .13, [.45, .74, .12], creamMat);
  cylinder(table, .077, .077, .006, [.45, .808, .12], material('#52341f'));
  const handle = mesh(new THREE.TorusGeometry(.057, .016, 10, 24), creamMat, table, .55, .76, .12); handle.rotation.y = Math.PI / 2;

  const lamp = new THREE.Group(); lamp.position.set(2.18, .035, -1.13); room.add(lamp);
  cylinder(lamp, .32, .35, .065, [0, .06, 0], brassMat);
  cylinder(lamp, .028, .035, 1.78, [0, .96, 0], brassMat);
  const profile = [new THREE.Vector2(0, .52), new THREE.Vector2(.13, .51), new THREE.Vector2(.3, .44), new THREE.Vector2(.46, .3), new THREE.Vector2(.57, .13), new THREE.Vector2(.6, .02), new THREE.Vector2(.59, 0)];
  mesh(new THREE.LatheGeometry(profile, 64), orangeMat, lamp, 0, 1.82, 0);
  const underside = material('#ffe8aa', { emissive: '#ffbc55', emissiveIntensity: .05 });
  cylinder(lamp, .585, .585, .025, [0, 1.82, 0], underside);

  const cabinet = new THREE.Group(); cabinet.position.set(-2.37, 0, -.8); room.add(cabinet);
  box(cabinet, [.82, .67, 1.45], [0, .48, 0], woodMat, .02);
  for (const z of [-.37, .37]) {
    box(cabinet, [.03, .5, .66], [.425, .48, z], darkWood, .003);
    cylinder(cabinet, .018, .018, .12, [.45, .51, z], brassMat).rotation.z = Math.PI / 2;
  }
  for (const x of [-.29, .29]) for (const z of [-.58, .58]) cylinder(cabinet, .035, .03, .2, [x, .11, z], darkWood);
  box(cabinet, [.65, .08, .55], [0, .87, .13], darkWood, .01);
  cylinder(cabinet, .23, .23, .02, [0, .92, .13], material('#252621', { roughness: .4 }));
  cylinder(cabinet, .065, .065, .022, [0, .934, .13], material('#c5a34d'));
  box(cabinet, [.025, .025, .29], [.2, .96, .17], brassMat, .01).rotation.y = -.3;

  // A small plant, sculpted from curved leaf surfaces.
  const plant = new THREE.Group(); plant.position.set(2.4, .03, 1.2); room.add(plant);
  cylinder(plant, .27, .19, .47, [0, .25, 0], material('#ba775a'));
  cylinder(plant, .24, .24, .018, [0, .49, 0], darkWood);
  const leafMat = material('#526947', { side: THREE.DoubleSide, roughness: .9 });
  for (let i = 0; i < 9; i++) {
    const angle = i * 2.4, height = .45 + random() * .45;
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .48, 0), new THREE.Vector3(Math.cos(angle) * .15, height + .3, Math.sin(angle) * .15), new THREE.Vector3(Math.cos(angle) * .4, height + .35, Math.sin(angle) * .4)]);
    mesh(new THREE.TubeGeometry(curve, 12, .012, 5, false), leafMat, plant);
    const leaf = mesh(new THREE.SphereGeometry(1, 16, 12), leafMat, plant, Math.cos(angle) * .4, height + .35, Math.sin(angle) * .4);
    leaf.scale.set(.15, .035, .29); leaf.rotation.set(.4, -angle, .3);
  }

  let requested = false;
  let animatingUntil = 0;
  let lightNight = false;
  let targetLight = .5;
  let lightBlend = .5;
  const day = new THREE.Color('#c5b08d'), night = new THREE.Color('#39332d');
  const stage = document.querySelector('.room-stage');
  function render() {
    requested = false;
    controls.update();
    lightBlend += (targetLight - lightBlend) * (reducedMotion ? 1 : .07);
    if (Math.abs(lightBlend - targetLight) < .002) lightBlend = targetLight;
    sunlight.intensity = THREE.MathUtils.lerp(4, .13, lightBlend);
    sunlight.color.set(lightBlend > .2 ? '#ffc789' : '#fff2d5');
    hemi.intensity = THREE.MathUtils.lerp(2.8, .7, lightBlend);
    fill.intensity = THREE.MathUtils.lerp(1.1, .35, lightBlend);
    lampLight.intensity = lightBlend * 22;
    underside.emissiveIntensity = .05 + lightBlend * 2;
    glass.emissiveIntensity = .22 * (1 - lightBlend);
    stage.style.setProperty('--room-color', day.clone().lerp(night, lightBlend).getStyle());
    renderer.render(scene, camera);
    if (lightBlend !== targetLight || performance.now() < animatingUntil) requestRender();
  }
  function requestRender() {
    if (!requested) { requested = true; requestAnimationFrame(render); }
  }
  controls.addEventListener('change', requestRender);
  controls.addEventListener('start', () => { animatingUntil = performance.now() + 1200; requestRender(); });
  controls.addEventListener('end', () => { animatingUntil = performance.now() + 1200; requestRender(); });
  function resize() {
    const width = host.clientWidth, height = host.clientHeight;
    renderer.setSize(width, height);
    const aspect = width / height, vertical = Math.max(7.45, 8.7 / aspect);
    camera.left = -vertical * aspect / 2; camera.right = vertical * aspect / 2;
    camera.top = vertical / 2; camera.bottom = -vertical / 2;
    camera.updateProjectionMatrix(); requestRender();
  }
  new ResizeObserver(resize).observe(host);
  function setLight(mode) {
    lightNight = mode === 'night'; targetLight = mode === 'night' ? 1 : mode === 'sunset' ? .5 : 0;
    document.querySelector('.room-section').dataset.mode = mode;
    document.querySelectorAll('[data-light]').forEach(button => {
      const active = button.dataset.light === mode;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    announce(mode === 'night' ? 'La sala, de noche.' : mode === 'sunset' ? 'La hora dorada, en tu sala.' : 'Abrimos las ventanas. Luz de mañana.');
    requestRender();
  }
  document.querySelectorAll('[data-light]').forEach(button => button.addEventListener('click', () => setLight(button.dataset.light)));
  document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
    sofaMat.color.set(button.dataset.color);
    document.querySelectorAll('[data-color]').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    announce(button.getAttribute('aria-label') + '. Tu rincón, a tu manera.'); requestRender();
  }));
  function selectButton(group, button) {
    document.querySelectorAll(group).forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  }
  document.querySelectorAll('[data-wall]').forEach(button => button.addEventListener('click', () => {
    wall.color.set(button.dataset.wall); sideWall.color.set(button.dataset.wall).multiplyScalar(.83);
    selectButton('[data-wall]', button); requestRender(); announce(button.getAttribute('aria-label'));
  }));
  document.querySelectorAll('[data-rug]').forEach(button => button.addEventListener('click', () => {
    rugDark.color.set(button.dataset.rug); selectButton('[data-rug]', button); requestRender(); announce('Alfombra en tono ' + button.textContent.toLowerCase() + '.');
  }));
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => {
    mainPrint.material.map = button.dataset.print === 'waves' ? smallPrint : print; mainPrint.material.needsUpdate = true;
    selectButton('[data-print]', button); requestRender(); announce('Cuadro ' + button.textContent + '.');
  }));
  document.querySelector('#reset-room').addEventListener('click', () => {
    sofaMat.color.set('#536148');wall.color.set('#e4cdae');sideWall.color.set('#c69472');rugDark.color.set('#393d31');mainPrint.material.map=print;mainPrint.material.needsUpdate=true;
    for (const attribute of ['color','wall','rug','print']) selectButton(`[data-${attribute}]`,document.querySelector(`[data-${attribute}]`));
    camera.position.copy(homePosition);controls.target.copy(homeTarget);controls.update();setLight('sunset');requestRender();announce('Tu sala volvió al punto de partida.');
  });
  function turnView(direction) {
    const offset = camera.position.clone().sub(controls.target), spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta = THREE.MathUtils.clamp(spherical.theta + direction * .18,controls.minAzimuthAngle,controls.maxAzimuthAngle);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();requestRender();
  }
  document.querySelector('#view-left').addEventListener('click', () => turnView(-1));
  document.querySelector('#view-right').addEventListener('click', () => turnView(1));
  document.querySelector('#reset-view').addEventListener('click', () => {
    camera.position.copy(homePosition); controls.target.copy(homeTarget); controls.update(); requestRender(); announce('La sala volvió a su vista inicial.');
  });
  document.querySelector('#save-scene').addEventListener('click', () => {
    renderer.render(scene, camera);
    const link = document.createElement('a');
    link.download = 'mi-rincon-casa-groove.png'; link.href = renderer.domElement.toDataURL('image/png'); link.click();
    announce('Tu rincón se guardó como imagen PNG.');
  });
  const raycaster = new THREE.Raycaster();
  let down = [0, 0];
  renderer.domElement.addEventListener('pointerdown', event => { down = [event.clientX, event.clientY]; });
  renderer.domElement.addEventListener('pointerup', event => {
    if (Math.hypot(event.clientX - down[0], event.clientY - down[1]) > 5) return;
    const bounds = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), camera);
    const hit = raycaster.intersectObject(room, true)[0];
    if (!hit) return;
    let parent = hit.object;
    while (parent && parent !== lamp) parent = parent.parent;
    if (parent === lamp) setLight(lightNight ? 'day' : 'night');
  });

  mountCatalog({ lamp, sofa, wood: woodMat, print, waves: smallPrint });
  resize(); render();
  document.querySelector('#loading').hidden = true;
  document.body.dataset.sceneReady = 'true';
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); document.querySelector('#fallback').hidden = false;
    announce('Se interrumpió la vista 3D. Recargá la página para volver a abrirla.');
  });
} catch (error) {
  document.querySelector('#loading').hidden = true;
  document.querySelector('#fallback').hidden = false;
  document.querySelectorAll('[data-color], [data-light], [data-wall], [data-rug], [data-print], [data-lamp], [data-catalog-light], [data-catalog-view="model"], #reset-room, #view-left, #view-right, #reset-view, #save-scene').forEach(button => button.disabled = true);
  console.error('No se pudo abrir la sala 3D:', error);
}
