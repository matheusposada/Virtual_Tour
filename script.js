import * as THREE from 'three';

// ─── Configuração das cenas ───────────────────────────────────────────────────
// Cada hotspot pode ser do tipo 'nav' (navega para outra cena)
// ou do tipo 'info' (abre um pop-up com imagem e texto sobre a obra).
//
// Campos de um hotspot de informação:
//   type: 'info'
//   theta / phi: posição esférica (igual aos hotspots de navegação)
//   label: título da obra (aparece no topo do pop-up)
//   info: {
//     image: caminho para a imagem da obra (ex: 'public/assets/obra1.jpg')
//     text:  texto explicativo
//   }
const scenes = [
  {
    id: 'sala',
    label: 'Sala',
    image: 'public/assets/test.jpg',
    hotspots: [
      {
        type: 'nav',
        theta: Math.PI / 4,
        phi: Math.PI / 2,
        targetScene: 'cozinha',
        label: 'Ir para Cozinha',
      },
      // ── Exemplo de hotspot de informação ──────────────────────────────────
      {
        type: 'info',
        theta: -Math.PI / 4,
        phi: Math.PI / 2,
        label: 'A Persistência da Memória',
        info: {
          image: 'public/assets/obra-sala.jpg',   // troque pelo caminho real
          text: 'Salvador Dalí, 1931. Óleo sobre tela, 24 × 33 cm. '
              + 'Uma das obras mais icônicas do Surrealismo, representando '
              + 'relógios derretidos numa paisagem onírica da Catalunha. '
              + 'Acervo: Museum of Modern Art (MoMA), Nova York.',
        },
      },
    ],
  },
  {
    id: 'cozinha',
    label: 'Cozinha',
    image: 'public/assets/inter.jpg',
    hotspots: [
      {
        type: 'nav',
        theta: -Math.PI / 3,
        phi: Math.PI / 2,
        targetScene: 'quarto',
        label: 'Ir para Quarto',
      },
      {
        type: 'info',
        theta: Math.PI / 6,
        phi: Math.PI / 2.2,
        label: 'A Noite Estrelada',
        info: {
          image: 'public/assets/obra-cozinha.jpg',
          text: 'Vincent van Gogh, 1889. Óleo sobre tela, 73,7 × 92,1 cm. '
              + 'Pintada durante sua estadia no asilo de Saint-Paul-de-Mausole, '
              + 'a obra retrata um céu noturno turbulento sobre uma aldeia. '
              + 'Acervo: Museum of Modern Art (MoMA), Nova York.',
        },
      },
    ],
  },
  {
    id: 'quarto',
    label: 'Quarto',
    image: 'public/assets/inter1.jpg',
    hotspots: [
      {
        type: 'nav',
        theta: Math.PI,
        phi: Math.PI / 2,
        targetScene: 'sala',
        label: 'Voltar para Sala',
      },
      {
        type: 'info',
        theta: Math.PI / 2,
        phi: Math.PI / 2,
        label: 'Moça com Brinco de Pérola',
        info: {
          image: 'public/assets/obra-quarto.jpg',
          text: 'Johannes Vermeer, c. 1665. Óleo sobre tela, 44,5 × 39 cm. '
              + 'Frequentemente chamada de "Mona Lisa do Norte", a pintura é '
              + 'famosa pelo olhar enigmático da jovem e pelo uso magistral '
              + 'da luz. Acervo: Mauritshuis, Haia.',
        },
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

// ─── Carregador de texturas ───────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
const loadingEl = document.getElementById('loading');

function loadScene(sceneId) {
  const sceneData = scenes.find((s) => s.id === sceneId);
  if (!sceneData) return;

  closeInfoPopup();           // fecha pop-up aberto ao trocar de cena
  loadingEl.classList.remove('hidden');
  clearHotspots();

  textureLoader.load(
    sceneData.image,
    (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      material.map = texture;
      material.needsUpdate = true;
      createHotspots(sceneData.hotspots);
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
function sphericalToPosition(theta, phi, radius = 400) {
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  );
}

const hotspotObjects = [];

// ─── Textura de seta (hotspot de navegação) ───────────────────────────────────
function createArrowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  ctx.fillStyle = '#222';
  ctx.beginPath();
  const cx = size / 2;
  ctx.moveTo(cx, 20);
  ctx.lineTo(cx + 22, 58);
  ctx.lineTo(cx + 10, 58);
  ctx.lineTo(cx + 10, 100);
  ctx.lineTo(cx - 10, 100);
  ctx.lineTo(cx - 10, 58);
  ctx.lineTo(cx - 22, 58);
  ctx.closePath();
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// ─── Textura de ícone de informação ──────────────────────────────────────────
// Tenta carregar 'public/assets/info-icon.png'.
// Se não encontrar, desenha um "ⓘ" em Canvas como fallback.
let infoTexture = null;

function createInfoFallbackTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Fundo azul vibrante
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(30, 120, 255, 0.92)';
  ctx.fill();

  // Borda branca fina
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Letra "i"
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 72px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('i', size / 2, size / 2 + 4);

  return new THREE.CanvasTexture(canvas);
}

function loadInfoTexture(callback) {
  // Tenta carregar o arquivo externo; usa fallback se falhar
  textureLoader.load(
    'public/assets/info-icon.png',
    (tex) => { infoTexture = tex; callback(); },
    undefined,
    ()  => { infoTexture = createInfoFallbackTexture(); callback(); }
  );
}

const arrowTexture = createArrowTexture();

// ─── Criação dos sprites ──────────────────────────────────────────────────────
function createHotspots(hotspotsData) {
  hotspotsData.forEach((data) => {
    const isInfo = data.type === 'info';
    const map = isInfo ? infoTexture : arrowTexture;

    const spriteMat = new THREE.SpriteMaterial({
      map,
      sizeAttenuation: true,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(sphericalToPosition(data.theta, data.phi));
    sprite.scale.set(40, 40, 1);
    sprite.userData = {
      type: isInfo ? 'info' : 'nav',
      targetScene: data.targetScene || null,
      label: data.label,
      info: data.info || null,
    };
    scene.add(sprite);
    hotspotObjects.push(sprite);
  });
}

function clearHotspots() {
  hotspotObjects.forEach((obj) => scene.remove(obj));
  hotspotObjects.length = 0;
}

// ─── Pop-up de informação ─────────────────────────────────────────────────────
const popup = document.getElementById('info-popup');
const popupTitle   = document.getElementById('popup-title');
const popupImage   = document.getElementById('popup-image');
const popupText    = document.getElementById('popup-text');
const popupClose   = document.getElementById('popup-close');
const popupOverlay = document.getElementById('popup-overlay');

function openInfoPopup(data) {
  popupTitle.textContent = data.label;
  popupText.textContent  = data.info.text;

  if (data.info.image) {
    popupImage.src = data.info.image;
    popupImage.style.display = 'block';
  } else {
    popupImage.style.display = 'none';
  }

  popup.classList.add('visible');
  popupOverlay.classList.add('visible');
}

function closeInfoPopup() {
  popup.classList.remove('visible');
  popupOverlay.classList.remove('visible');
}

popupClose.addEventListener('click', closeInfoPopup);
popupOverlay.addEventListener('click', closeInfoPopup);

// Fecha com Escape
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeInfoPopup();
});

// ─── UI: loading + breadcrumb ─────────────────────────────────────────────────
function updateUI(sceneId) {
  const sceneData = scenes.find((s) => s.id === sceneId);
  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb && sceneData) breadcrumb.textContent = sceneData.label;

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
    const userData = intersects[0].object.userData;
    if (userData.type === 'nav' && userData.targetScene) {
      loadScene(userData.targetScene);
    } else if (userData.type === 'info' && userData.info) {
      openInfoPopup(userData);
    }
  }
}

// ─── Controles: mouse ─────────────────────────────────────────────────────────
let isDragging = false;
let previousMouse = { x: 0, y: 0 };
let mouseDownPos  = { x: 0, y: 0 };
const DRAG_THRESHOLD = 5;

window.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMouse = { x: e.clientX, y: e.clientY };
  mouseDownPos  = { x: e.clientX, y: e.clientY };
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
  const yaw   = camera.rotation.y - dx * 0.005;
  const pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x - dy * 0.005));
  camera.rotation.set(pitch, yaw, 0);
  previousMouse = { x: e.clientX, y: e.clientY };
});

// ─── Controles: touch ─────────────────────────────────────────────────────────
let previousTouch = null;
let touchDownPos  = null;

window.addEventListener('touchstart', (e) => {
  previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  touchDownPos  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});

window.addEventListener('touchend', (e) => {
  if (!touchDownPos) return;
  const t  = e.changedTouches[0];
  const dx = t.clientX - touchDownPos.x;
  const dy = t.clientY - touchDownPos.y;
  if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) {
    checkHotspotClick(t.clientX, t.clientY);
  }
  previousTouch = null;
  touchDownPos  = null;
});

window.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!previousTouch) return;
  const touch = e.touches[0];
  const dx    = touch.clientX - previousTouch.x;
  const dy    = touch.clientY - previousTouch.y;
  const yaw   = camera.rotation.y - dx * 0.005;
  const pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x - dy * 0.005));
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

// ─── Cursor ───────────────────────────────────────────────────────────────────
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
  const t = Date.now() * 0.002;
  hotspotObjects.forEach((obj, i) => {
    const scale = 40 + Math.sin(t + i) * 5;
    obj.scale.set(scale, scale, 1);
  });
  renderer.render(scene, camera);
}

// ─── Minimap ──────────────────────────────────────────────────────────────────
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
// Carrega a textura do ícone antes de iniciar, para garantir que esteja
// disponível quando os hotspots forem criados.
buildMinimap();
loadInfoTexture(() => {
  loadScene(scenes[0].id);
  animate();
});
