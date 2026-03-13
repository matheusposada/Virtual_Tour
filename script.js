import * as THREE from 'three';

// ─── Configuração das cenas ───────────────────────────────────────────────────
// Cada cena tem nome, imagem e seus próprios hotspots.
// Adicione quantas cenas quiser aqui — o resto do código não precisa mudar.
const scenes = [
  {
    id: 'sala',
    label: 'Sala',
    image: 'public/assets/test.jpg',
    hotspots: [
      {
        // Posição em coordenadas esféricas (theta = horizontal, phi = vertical)
        // theta: 0 = frente, Math.PI = atrás, Math.PI/2 = direita
        // phi:   0 = topo, Math.PI/2 = horizonte, Math.PI = base
        theta: Math.PI / 4,
        phi: Math.PI / 2,
        targetScene: 'cozinha',
        label: 'Ir para Cozinha',
      },
    ],
  },
  {
    id: 'cozinha',
    label: 'Cozinha',
    image: 'public/assets/milkway.jpg',
    hotspots: [
      {
        theta: -Math.PI / 3,
        phi: Math.PI / 2,
        targetScene: 'quarto',
        label: 'Ir para Quarto',
      },
    ],
  },
  {
    id: 'quarto',
    label: 'Quarto',
    image: 'public/assets/vlw-mw-potw.jpg',
    hotspots: [
      {
        theta: Math.PI,
        phi: Math.PI / 2,
        targetScene: 'sala',
        label: 'Voltar para Sala',
      },
    ],
  },
];

// ─── Setup básico ─────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 0);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // evita lag em telas de alta densidade
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6;
document.body.appendChild(renderer.domElement);

// ─── Esfera panorâmica ────────────────────────────────────────────────────────
const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1);
const material = new THREE.MeshBasicMaterial();
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// ─── Carregador de texturas com loading screen ────────────────────────────────
const textureLoader = new THREE.TextureLoader();
const loadingEl = document.getElementById('loading');

function loadScene(sceneId) {
  const sceneData = scenes.find((s) => s.id === sceneId);
  if (!sceneData) return;

  // Mostra loading
  loadingEl.classList.remove('hidden');

  // Remove hotspots anteriores da cena Three.js
  clearHotspots();

  textureLoader.load(
    sceneData.image,
    (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      material.map = texture;
      material.needsUpdate = true;

      // Cria hotspots da nova cena
      createHotspots(sceneData.hotspots);

      // Atualiza minimap / breadcrumb
      updateUI(sceneId);

      loadingEl.classList.add('hidden');
    },
    undefined,
    (err) => {
      console.error('Erro ao carregar imagem:', err);
      loadingEl.classList.add('hidden');
    }
  );
}

// ─── Hotspots ─────────────────────────────────────────────────────────────────
// Converte coordenadas esféricas para posição 3D dentro da esfera
function sphericalToPosition(theta, phi, radius = 400) {
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  );
}

const hotspotObjects = []; // guarda referências para raycasting e limpeza

function createHotspots(hotspotsData) {
  hotspotsData.forEach((data) => {
    // Sprite com textura de ícone
    const map = textureLoader.load('public/assets/info-icon.png');
    const spriteMat = new THREE.SpriteMaterial({
      map,
      sizeAttenuation: true,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(sphericalToPosition(data.theta, data.phi));
    sprite.scale.set(40, 40, 1);
    sprite.userData = { targetScene: data.targetScene, label: data.label };
    scene.add(sprite);
    hotspotObjects.push(sprite);
  });
}

function clearHotspots() {
  hotspotObjects.forEach((obj) => scene.remove(obj));
  hotspotObjects.length = 0;
}

// ─── UI: loading + breadcrumb ─────────────────────────────────────────────────
function updateUI(sceneId) {
  const sceneData = scenes.find((s) => s.id === sceneId);
  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb && sceneData) breadcrumb.textContent = sceneData.label;

  // Atualiza botões do minimapa
  document.querySelectorAll('.map-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.scene === sceneId);
  });
}

// ─── Raycaster ────────────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function checkHotspotClick(clientX, clientY) {
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hotspotObjects);
  if (intersects.length > 0) {
    const target = intersects[0].object.userData.targetScene;
    if (target) loadScene(target);
  }
}

// ─── Controles: mouse ─────────────────────────────────────────────────────────
let isDragging = false;
let previousMouse = { x: 0, y: 0 };
let mouseDownPos = { x: 0, y: 0 };
const DRAG_THRESHOLD = 5;

window.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMouse = { x: e.clientX, y: e.clientY };
  mouseDownPos = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', (e) => {
  isDragging = false;
  const dx = e.clientX - mouseDownPos.x;
  const dy = e.clientY - mouseDownPos.y;
  if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) {
    checkHotspotClick(e.clientX, e.clientY);
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - previousMouse.x;
  const dy = e.clientY - previousMouse.y;
  let yaw = camera.rotation.y - dx * 0.005;
  let pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x - dy * 0.005));
  camera.rotation.set(pitch, yaw, 0);
  previousMouse = { x: e.clientX, y: e.clientY };
});

// ─── Controles: touch (mobile) ────────────────────────────────────────────────
let previousTouch = null;
let touchDownPos = null;

window.addEventListener('touchstart', (e) => {
  previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  touchDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});

window.addEventListener('touchend', (e) => {
  if (!touchDownPos) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchDownPos.x;
  const dy = t.clientY - touchDownPos.y;
  if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) {
    checkHotspotClick(t.clientX, t.clientY);
  }
  previousTouch = null;
  touchDownPos = null;
});

window.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!previousTouch) return;
  const touch = e.touches[0];
  const dx = touch.clientX - previousTouch.x;
  const dy = touch.clientY - previousTouch.y;
  let yaw = camera.rotation.y - dx * 0.005;
  let pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x - dy * 0.005));
  camera.rotation.set(pitch, yaw, 0);
  previousTouch = { x: touch.clientX, y: touch.clientY };
}, { passive: false });

// ─── Zoom com scroll ──────────────────────────────────────────────────────────
window.addEventListener('wheel', (e) => {
  camera.fov = Math.max(30, Math.min(100, camera.fov + e.deltaY * 0.05));
  camera.updateProjectionMatrix();
});

// ─── Redimensionamento ────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Cursor: muda ao passar sobre hotspot ─────────────────────────────────────
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(hotspotObjects);
  document.body.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
});

// ─── Loop de animação ─────────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);

  // Pulsa os hotspots suavemente para chamar atenção
  const t = Date.now() * 0.002;
  hotspotObjects.forEach((obj, i) => {
    const scale = 40 + Math.sin(t + i) * 5;
    obj.scale.set(scale, scale, 1);
  });

  renderer.render(scene, camera);
}

// ─── Minimap: gera botões automaticamente com base em `scenes` ───────────────
function buildMinimap() {
  const minimap = document.getElementById('minimap');
  if (!minimap) return;
  scenes.forEach((s) => {
    const btn = document.createElement('button');
    btn.className = 'map-btn';
    btn.dataset.scene = s.id;
    btn.textContent = s.label;
    btn.addEventListener('click', () => loadScene(s.id));
    minimap.appendChild(btn);
  });
}

// ─── Inicialização ────────────────────────────────────────────────────────────
buildMinimap();
loadScene(scenes[0].id);
animate();