import * as THREE from 'three';

// ─── Cenas ────────────────────────────────────────────────────────────────────
const scenes = [
  /*{
    id: 'sala', label: 'Modelo', image: 'public/assets/test.jpg',
    floorPos: { x: 80, y: 70 },
    hotspots: [
      { theta: Math.PI / 4,  phi: Math.PI / 2, targetScene: 'cozinha', label: 'Ir para Cozinha' },
      {
        theta: -Math.PI / 2, phi: Math.PI / 2.5, type: 'info',
        label: 'Sala de Estar',
        info: {
          title: 'Sala de Estar',
          image: 'public/assets/test.jpg',
          text: 'Ampla sala com pé-direito de 3m, vigas aparentes e janelas piso-teto. Iluminação embutida Philips Hue e sofá em L com vista para o jardim. Área de 32m².',
        },
      },
    ],
  },
  /*{
    id: 'quarto', label: 'Sprint 2', image: 'public/assets/teste2.png',
    floorPos: { x: 120, y: 110 },
    hotspots: [
      { theta: Math.PI,      phi: Math.PI / 2, targetScene: 'banheiro', label: 'Ir para Banheiro' },
      { theta: 0,            phi: Math.PI / 2, targetScene: 'cozinha',  label: 'Voltar para Cozinha' },
      {
        theta: Math.PI / 2, phi: Math.PI / 2.5, type: 'info',
        label: 'Suíte Master',
        info: {
          title: 'Suíte Master',
          image: 'public/assets/teste2.png',
          text: 'Suíte master com closet planejado e banheiro privativo. Cama king size, ar-condicionado inverter e cortinas blackout. Área de 28m².',
        },
      },
    ],
  },
  {
    id: 'banheiro', label: 'Sprint 3', image: 'public/assets/teste3.png',
    floorPos: { x: 80, y: 110 },
    hotspots: [
      { theta: Math.PI,      phi: Math.PI / 2, targetScene: 'sala',    label: 'Voltar para a Sala' },
      { theta: Math.PI / 2,  phi: Math.PI / 2, targetScene: 'garagem', label: 'Ir para Garagem' },
      {
        theta: -Math.PI / 2, phi: Math.PI / 2.5, type: 'info',
        label: 'Banheiro',
        info: {
          title: 'Banheiro',
          image: 'public/assets/teste3.png',
          text: 'Banheiro com ducha de chuva, banheira de imersão e revestimento em mármore Carrara. Aquecimento a gás com timer programável.',
        },
      },
    ],
  },
  {
    id: 'garagem', label: 'Sprint 3/4', image: 'public/assets/salaifscP.png',
    floorPos: { x: 40, y: 110 },
    hotspots: [
      { theta: Math.PI,      phi: Math.PI / 2, targetScene: 'sala', label: 'Voltar para a Sala' },
      {
        theta: 0, phi: Math.PI / 2.5, type: 'info',
        label: 'Garagem',
        info: {
          title: 'Garagem',
          image: 'public/assets/salaifscP.png',
          text: 'Foto tirada com camera do Vitor.',
        },
      },
    ],
  },
  {
    id: 'quarto2', label: 'Sprint 3/4', image: 'public/assets/salaCifsc.png',
    floorPos: { x: 40, y: 110 },
    hotspots: [
      { theta: Math.PI,      phi: Math.PI / 2, targetScene: 'sala', label: 'Voltar para a Sala' },
      {
        theta: 0, phi: Math.PI / 2.5, type: 'info',
        label: 'Garagem',
        info: {
          title: 'Garagem',
          image: 'public/assets/salaifscP.png',
          text: 'Foto tirada com camera do IFSC.',
        },
      },
    ],
  },*/
  {
    id: 'quarto3', label: 'Sala 1', image: 'public/assets/sala1museu.png',
    floorPos: { x: 40, y: 110 },
    hotspots: [
      { theta: Math.PI,      phi: Math.PI / 2, targetScene: 'sala', label: 'Voltar para a Sala' },
      {
        theta: 0, phi: Math.PI / 2.5, type: 'info',
        label: 'Garagem',
        info: {
          title: 'Garagem',
          image: 'public/assets/salaifscP.png',
          text: 'Foto tirada com camera do IFSC.',
        },
      },
    ],
  },
  {
    id: 'quarto4', label: 'Sala 2', image: 'public/assets/sala2museu.jpg',
    floorPos: { x: 40, y: 110 },
    hotspots: [
      { theta: Math.PI,      phi: Math.PI / 2, targetScene: 'sala', label: 'Voltar para a Sala' },
      {
        theta: 0, phi: Math.PI / 2.5, type: 'info',
        label: 'Garagem',
        info: {
          title: 'Garagem',
          image: 'public/assets/salaifscP.png',
          text: 'Foto tirada com camera do IFSC.',
        },
      },
    ],
  },
];

// Conexões para a planta baixa
const floorConnections = [
  ['sala','cozinha'],['sala','banheiro'],
  ['cozinha','quarto'],['quarto','banheiro'],['banheiro','garagem'],
];

// ─── Estado ───────────────────────────────────────────────────────────────────
let currentSceneId = null;
let autoRotating   = false;
const navHistory   = [];

// ─── Three.js ────────────────────────────────────────────────────────────────
const threeScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.7;
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1);
const material = new THREE.MeshBasicMaterial();
threeScene.add(new THREE.Mesh(geometry, material));

// ─── Textura / cache ──────────────────────────────────────────────────────────
const loader  = new THREE.TextureLoader();
const texCache = {};

function preload(url) {
  if (texCache[url]) return;
  loader.load(url, tex => { tex.encoding = THREE.sRGBEncoding; texCache[url] = tex; });
}

function getTexture(url, cb) {
  if (texCache[url]) { cb(texCache[url]); return; }
  loader.load(url, tex => { tex.encoding = THREE.sRGBEncoding; texCache[url] = tex; cb(tex); });
}

// ─── Crossfade ────────────────────────────────────────────────────────────────
const fadeEl = document.getElementById('fade-overlay');
function fadeIn(cb)  { fadeEl.classList.add('fading'); setTimeout(cb, 400); }
function fadeOut()   { setTimeout(() => fadeEl.classList.remove('fading'), 50); }

// ─── Hotspots ────────────────────────────────────────────────────────────────
const hotspotObjects = [];

function sphericalToVec3(theta, phi, r = 400) {
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.cos(theta)
  );
}

function makeArrowTex() {
  const sz = 128, c = document.createElement('canvas');
  c.width = c.height = sz;
  const ctx = c.getContext('2d');
  ctx.beginPath();
  ctx.arc(sz/2, sz/2, sz/2-4, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(10,10,15,0.75)'; ctx.fill();
  ctx.strokeStyle = '#58aa47'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#58aa47';
  const cx = sz/2;
  ctx.beginPath();
  ctx.moveTo(cx,22); ctx.lineTo(cx+20,58); ctx.lineTo(cx+9,58);
  ctx.lineTo(cx+9,98); ctx.lineTo(cx-9,98); ctx.lineTo(cx-9,58);
  ctx.lineTo(cx-20,58); ctx.closePath(); ctx.fill();
  return new THREE.CanvasTexture(c);
}

const arrowTex = makeArrowTex();

function makeInfoTex() {
  const sz = 128, c = document.createElement('canvas');
  c.width = c.height = sz;
  const ctx = c.getContext('2d');
  // fundo + borda branca
  ctx.beginPath();
  ctx.arc(sz/2, sz/2, sz/2-4, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(15, 11, 10, 0.82)'; ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
  // letra "i"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 68px serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('i', sz/2, sz/2 + 4);
  return new THREE.CanvasTexture(c);
}

const infoTex = makeInfoTex();

function createHotspots(data) {
  data.forEach(h => {
    const tex = h.type === 'info' ? infoTex : arrowTex;
    const mat    = new THREE.SpriteMaterial({ map: tex, sizeAttenuation: true, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(sphericalToVec3(h.theta, h.phi));
    sprite.scale.set(40, 40, 1);
    sprite.userData = { ...h };
    threeScene.add(sprite);
    hotspotObjects.push(sprite);
  });
}

function clearHotspots() {
  hotspotObjects.forEach(o => threeScene.remove(o));
  hotspotObjects.length = 0;
}

// ─── Planta baixa ────────────────────────────────────────────────────────────
const floorCanvas = document.getElementById('floormap');
const fCtx = floorCanvas.getContext('2d');

function drawFloorplan(activeId) {
  const W = floorCanvas.width, H = floorCanvas.height;
  fCtx.clearRect(0, 0, W, H);

  fCtx.strokeStyle = 'rgba(94, 73, 73, 0.48)'; fCtx.lineWidth = 2;
  floorConnections.forEach(([a, b]) => {
    const sa = scenes.find(s => s.id === a), sb = scenes.find(s => s.id === b);
    if (!sa || !sb) return;
    fCtx.beginPath();
    fCtx.moveTo(sa.floorPos.x, sa.floorPos.y);
    fCtx.lineTo(sb.floorPos.x, sb.floorPos.y);
    fCtx.stroke();
  });

  scenes.forEach(s => {
    const active = s.id === activeId;
    fCtx.beginPath();
    fCtx.arc(s.floorPos.x, s.floorPos.y, active ? 9 : 6, 0, Math.PI*2);
    fCtx.fillStyle = active ? '#58aa47' : 'rgba(114, 106, 106, 0.35)';
    fCtx.fill();
    fCtx.font = `${active ? 'bold ' : ''}9px "DM Mono", monospace`;
    fCtx.fillStyle = active ? '#58aa47' : 'rgba(235, 228, 228, 0.45)';
    fCtx.textAlign = 'center';
    fCtx.fillText(s.label, s.floorPos.x, s.floorPos.y - 13);
  });

  const pos = scenes.find(s => s.id === activeId)?.floorPos;
  if (pos) {
    fCtx.save();
    fCtx.translate(pos.x, pos.y);
    fCtx.rotate(-camera.rotation.y);
    fCtx.beginPath();
    fCtx.moveTo(0, 0); fCtx.arc(0, 0, 18, -0.6, 0.6); fCtx.closePath();
    fCtx.fillStyle = 'rgba(119, 161, 91, 0.43)'; fCtx.fill();
    fCtx.restore();
  }
}

// ─── Bússola ──────────────────────────────────────────────────────────────────
const compassNeedle = document.getElementById('compass-needle');
function updateCompass() {
  compassNeedle.style.transform = `rotate(${THREE.MathUtils.radToDeg(-camera.rotation.y)}deg)`;
}

// ─── UI ───────────────────────────────────────────────────────────────────────
function updateUI(sceneId) {
  const data = scenes.find(s => s.id === sceneId);
  document.getElementById('breadcrumb').textContent = data?.label ?? '—';
  document.querySelectorAll('.map-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.scene === sceneId)
  );
  const backBtn = document.getElementById('back-btn');
  navHistory.length > 0 ? backBtn.classList.add('visible') : backBtn.classList.remove('visible');

  // pré-carrega vizinhos
  data?.hotspots?.forEach(h => {
    const nb = scenes.find(s => s.id === h.targetScene);
    if (nb) preload(nb.image);
  });

  // salva estado na URL
  const url = new URL(location.href);
  url.searchParams.set('scene', sceneId);
  url.searchParams.set('yaw', camera.rotation.y.toFixed(3));
  history.replaceState({}, '', url);
}

// ─── Carregar cena ────────────────────────────────────────────────────────────
const loadingEl = document.getElementById('loading');

function loadScene(sceneId, push = true) {
  if (sceneId === currentSceneId) return;
  const data = scenes.find(s => s.id === sceneId);
  if (!data) return;

  if (push && currentSceneId) navHistory.push(currentSceneId);

  fadeIn(() => {
    loadingEl.classList.remove('hidden');
    clearHotspots();
    getTexture(data.image, tex => {
      material.map = tex; material.needsUpdate = true;
      createHotspots(data.hotspots);
      currentSceneId = sceneId;
      updateUI(sceneId);
      loadingEl.classList.add('hidden');
      fadeOut();
    });
  });
}

// ─── Raycaster ────────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse2d   = new THREE.Vector2();

function getHits(cx, cy) {
  mouse2d.x = (cx / innerWidth)  *  2 - 1;
  mouse2d.y = (cy / innerHeight) * -2 + 1;
  raycaster.setFromCamera(mouse2d, camera);
  return raycaster.intersectObjects(hotspotObjects);
}

function onTap(cx, cy) {
  const hits = getHits(cx, cy);
  if (!hits.length) return;
  const ud = hits[0].object.userData;
  if (ud.type === 'info')      openPopup(ud.info);
  else if (ud.targetScene)     loadScene(ud.targetScene);
}

// ─── Mouse ────────────────────────────────────────────────────────────────────
let isDragging = false, prevM = {x:0,y:0}, downM = {x:0,y:0};

renderer.domElement.addEventListener('mousedown', e => {
  isDragging = true;
  prevM = downM = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mouseup', e => {
  if (!isDragging) return; isDragging = false;
  if (Math.hypot(e.clientX - downM.x, e.clientY - downM.y) < 5) onTap(e.clientX, e.clientY);
});
window.addEventListener('mousemove', e => {
  if (!isDragging) {
    document.body.classList.toggle('cursor-pointer', getHits(e.clientX, e.clientY).length > 0);
    return;
  }
  camera.rotation.y -= (e.clientX - prevM.x) * 0.005;
  camera.rotation.x  = Math.max(-Math.PI/2, Math.min(Math.PI/2,
    camera.rotation.x - (e.clientY - prevM.y) * 0.005));
  prevM = { x: e.clientX, y: e.clientY };
});

// ─── Touch ────────────────────────────────────────────────────────────────────
let prevT = null, downT = null;
window.addEventListener('touchstart',  e => { prevT = downT = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
window.addEventListener('touchend',    e => {
  if (!downT) return;
  const t = e.changedTouches[0];
  if (Math.hypot(t.clientX - downT.x, t.clientY - downT.y) < 5) onTap(t.clientX, t.clientY);
  prevT = downT = null;
});
window.addEventListener('touchmove',  e => {
  e.preventDefault();
  if (!prevT) return;
  const t = e.touches[0];
  camera.rotation.y -= (t.clientX - prevT.x) * 0.005;
  camera.rotation.x  = Math.max(-Math.PI/2, Math.min(Math.PI/2,
    camera.rotation.x - (t.clientY - prevT.y) * 0.005));
  prevT = { x: t.clientX, y: t.clientY };
}, { passive: false });

// ─── Scroll zoom ─────────────────────────────────────────────────────────────
window.addEventListener('wheel', e => {
  camera.fov = Math.max(30, Math.min(100, camera.fov + e.deltaY * 0.05));
  camera.updateProjectionMatrix();
});

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ─── Pop-up de informação ─────────────────────────────────────────────────────
function openPopup(info) {
  document.getElementById('popup-title').textContent = info.title;
  document.getElementById('popup-text').textContent  = info.text;
  const img = document.getElementById('popup-img');
  img.src = info.image ?? '';
  img.style.display = info.image ? 'block' : 'none';
  document.getElementById('info-popup').classList.add('open');
}

document.getElementById('popup-close').addEventListener('click', () => {
  document.getElementById('info-popup').classList.remove('open');
});
document.getElementById('info-popup').addEventListener('click', e => {
  if (e.target === e.currentTarget)
    e.currentTarget.classList.remove('open');
});

// ─── Toolbar ─────────────────────────────────────────────────────────────────
document.getElementById('btn-fullscreen').addEventListener('click', () => {
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});

const btnAuto = document.getElementById('btn-autorotate');
btnAuto.addEventListener('click', () => {
  autoRotating = !autoRotating;
  btnAuto.classList.toggle('active', autoRotating);
});

document.getElementById('btn-share').addEventListener('click', () => {
  const url = new URL(location.href);
  url.searchParams.set('scene', currentSceneId);
  url.searchParams.set('yaw', camera.rotation.y.toFixed(3));
  navigator.clipboard.writeText(url.toString()).then(() => {
    const tip = document.querySelector('#btn-share .tooltip');
    tip.textContent = '✓ Link copiado!';
    setTimeout(() => { tip.textContent = 'Copiar link desta cena'; }, 2000);
  });
});

// ─── Voltar ───────────────────────────────────────────────────────────────────
document.getElementById('back-btn').addEventListener('click', () => {
  if (!navHistory.length) return;
  loadScene(navHistory.pop(), false);
});

// ─── Minimap ─────────────────────────────────────────────────────────────────
function buildMinimap() {
  const nav = document.getElementById('minimap');
  scenes.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'map-btn';
    btn.dataset.scene = s.id;
    btn.textContent = s.label;
    btn.addEventListener('click', () => loadScene(s.id));
    nav.appendChild(btn);
  });
}

// ─── Restaurar pela URL ───────────────────────────────────────────────────────
function getInitialScene() {
  const p = new URLSearchParams(location.search);
  const id  = p.get('scene'), yaw = parseFloat(p.get('yaw'));
  if (id && scenes.find(s => s.id === id)) {
    if (!isNaN(yaw)) camera.rotation.y = yaw;
    return id;
  }
  return scenes[0].id;
}

// ─── Loop ────────────────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const t = Date.now() * 0.002;
  hotspotObjects.forEach((o, i) => { const s = 40 + Math.sin(t + i) * 5; o.scale.set(s, s, 1); });
  if (autoRotating && !isDragging) camera.rotation.y += 0.0015;
  updateCompass();
  drawFloorplan(currentSceneId);
  renderer.render(threeScene, camera);
}

// ─── Init ────────────────────────────────────────────────────────────────────
buildMinimap();
loadScene(getInitialScene(), false);
animate();