# 🏛️ Tour Virtual — Museu da Cidade

Projeto desenvolvido para a disciplina de **Atividades de Extensão** do IFSC.
O objetivo é oferecer um tour interativo em 360° pelas salas do museu da cidade, permitindo que qualquer pessoa navegue pelo espaço de forma virtual, a partir do navegador, sem instalar nada.

---

## Índice

- [Como funciona](#como-funciona)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Como adaptar para outro museu](#como-adaptar-para-outro-museu)
  - [Adicionando cenas](#1-adicionando-cenas)
  - [Posicionando hotspots](#2-posicionando-hotspots)
  - [Atualizando a planta baixa](#3-atualizando-a-planta-baixa)
  - [Trocando as imagens](#4-trocando-as-imagens)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Melhorias sugeridas para próximas turmas](#melhorias-sugeridas-para-próximas-turmas)
- [Tecnologias utilizadas](#tecnologias-utilizadas)

---

## Como funciona

O tour usa a biblioteca **Three.js** para renderizar uma esfera 3D invertida (`SphereGeometry` com escala `-1` no eixo X). A foto panorâmica da sala é aplicada como textura interna dessa esfera; o usuário fica "dentro" dela e pode arrastar o mouse/dedo para olhar em qualquer direção — como se estivesse no local.

Sobre essa esfera, são adicionados **hotspots** (sprites 2D posicionados em coordenadas esféricas) que o usuário pode clicar para:
- **Navegar** para outra sala (hotspot de seta verde).
- **Ver informações** sobre um objeto ou ponto de interesse (hotspot de "i" branco).

A câmera usa a ordem de rotação `YXZ`, o que simula bem o comportamento de uma câmera humana (girar horizontal com yaw, vertical com pitch, sem rolar).

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recomendada — 20.x ou superior)
- [Git](https://git-scm.com/)
- Um editor de código (VS Code recomendado)
- Fotos panorâmicas equiretangulares (360°) dos ambientes — formato JPG ou PNG

> **Dica para tirar as fotos:** smartphones modernos têm modo "foto panorâmica" ou "foto esférica" (no Google Camera, por exemplo). O resultado é uma imagem larga e achatada, no formato 2:1, que é exatamente o que o Three.js espera.

---

## Instalação e execução

1. Clone o repositório:
```bash
   git clone https://github.com/Guglevers/Virtual_Tour.git
   cd Virtual_Tour
```

2. Instale as dependências:
```bash
   npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
   npm run dev
```

Abra o navegador em `http://localhost:5173`.

> Para fazer fork do projeto e criar sua própria versão, use o botão **Fork** no GitHub antes de clonar.
---

## Estrutura do projeto

```
Virtual_Tour/
├── public/
│   └── assets/            # Imagens panorâmicas e ícones
│       ├── sala1museu.png
│       ├── sala2museu.jpg
│       ├── religiao.jpg
│       ├── souvenir.jpg
│       └── info-icon.png
├── index.html             # HTML da página (estrutura e elementos de UI)
├── script.js              # Toda a lógica Three.js, cenas, hotspots e controles
├── Style.css              # Estilos da interface (HUD, bússola, minimap, popup)
├── package.json           # Dependências do projeto
└── README.md
```

Os dois arquivos que você vai mexer na grande maioria das vezes são:

| Arquivo | O que fica lá |
|---|---|
| `script.js` | Array de cenas, hotspots, lógica de navegação |
| `public/assets/` | Suas fotos panorâmicas |

---

## Como adaptar para outro museu

### 1. Adicionando cenas

Abra `script.js`. No topo, há um array chamado `scenes`. Cada elemento é uma sala do tour:

```js
const scenes = [
  {
    id: 'sala-entrada',           // identificador único da cena (use só letras, números e hífens)
    label: 'Entrada do museu',    // nome exibido no minimap e no breadcrumb
    image: 'public/assets/entrada.jpg',  // caminho para a foto panorâmica
    floorPos: { x: 80, y: 70 },  // posição do ponto na planta baixa (veja seção 3)
    hotspots: [
      // hotspots desta cena (veja seção 2)
    ],
  },
  // ... outras cenas
];
```

Para **adicionar uma nova sala**, basta inserir mais um objeto nesse array seguindo o mesmo formato.

Para **remover uma sala**, apague o objeto correspondente e certifique-se de que nenhum hotspot de outra cena aponta para o `id` removido.

---

### 2. Posicionando hotspots

Cada hotspot é um objeto dentro do array `hotspots` de uma cena. Existem dois tipos:

**Hotspot de navegação (seta verde):**
```js
{
  theta: Math.PI,      // ângulo horizontal (0 = frente, Math.PI = atrás)
  phi: Math.PI / 2,    // ângulo vertical (Math.PI/2 = horizonte)
  targetScene: 'sala-acervo',   // id da cena de destino
  label: 'Ir para o Acervo',
}
```

**Hotspot de informação (ícone "i"):**
```js
{
  theta: 0.5,
  phi: Math.PI / 2.2,
  type: 'info',
  label: 'Quadro histórico',
  info: {
    title: 'Fundação da cidade',
    text: 'Este quadro retrata a cerimônia de fundação em 1890.',
    image: 'public/assets/quadro-detalhe.jpg',  // opcional
  },
}
```

**Como descobrir os ângulos certos?**

A forma mais prática é colocar um `console.log(camera.rotation)` no loop de animação e girar a câmera até apontar para o objeto. O valor de `camera.rotation.y` (negado) vira o `theta`, e `Math.PI/2` funciona bem para o `phi` na maioria dos casos no horizonte. Experimente e ajuste.

- `theta` vai de `0` (frente) até `2 * Math.PI` (volta à frente).
- `phi` vai de `0` (cima) até `Math.PI` (baixo). Use `Math.PI / 2` para o horizonte.

---

### 3. Atualizando a planta baixa

O minicanvas no canto inferior esquerdo desenha um mapa esquemático. Cada cena tem uma propriedade `floorPos: { x, y }` que posiciona o ponto no canvas de 160×140 px.

Além disso, o array `floorConnections` define quais salas estão conectadas por um corredor:

```js
const floorConnections = [
  ['sala-entrada', 'sala-acervo'],
  ['sala-acervo', 'sala-religiao'],
  // ...
];
```

Para o mapa ficar fiel à planta real, desenhe no papel a posição relativa das salas, calcule as coordenadas dentro do canvas (0–160 horizontal, 0–140 vertical) e atribua a cada cena.

---

### 4. Trocando as imagens

Coloque as fotos panorâmicas dentro de `public/assets/`. Nomes de arquivo sem espaços ou caracteres especiais são mais seguros. Atualize o campo `image` de cada cena em `script.js`.

Formatos recomendados:
- **JPG** para fotos (menor tamanho de arquivo, sem transparência).
- **PNG** apenas se precisar de transparência (arquivos ficam muito maiores).
- Resolução ideal: **4096×2048** ou **6000×3000** px. Acima disso o carregamento fica lento sem ganho visual perceptível.

---

## Funcionalidades implementadas

| Funcionalidade | Onde no código |
|---|---|
| Renderização 360° em esfera | `SphereGeometry` + `MeshBasicMaterial` em `script.js` |
| Navegação com mouse e toque | Eventos `mousemove` / `touchmove` |
| Zoom com scroll | Evento `wheel`, ajusta `camera.fov` |
| Hotspots de navegação e info | Funções `createHotspots` / `onTap` |
| Crossfade entre cenas | `fade-overlay` + classes CSS em `Style.css` |
| Pop-up de informação | `#info-popup` no HTML + `openPopup()` |
| Minimap com cenas | Função `buildMinimap()` + `<nav id="minimap">` |
| Planta baixa com posição atual | Função `drawFloorplan()` no canvas `#floormap` |
| Bússola giratória | `#compass-needle` rotacionado por `updateCompass()` |
| Botão de tela cheia | `requestFullscreen()` |
| Rotação automática | Flag `autoRotating` no loop `animate()` |
| Compartilhar link da cena | URL params `?scene=&yaw=` via `navigator.clipboard` |
| Botão "Voltar" | Stack `navHistory` + `history.replaceState` |
| Cache de texturas | Objeto `texCache` + pré-carregamento de vizinhos |
| Animação pulsante dos hotspots | `Math.sin(t + i)` no loop de animação |

---

## Melhorias sugeridas para próximas turmas

Deixamos aqui o que identificamos como próximos passos naturais para quem for continuar o projeto:

**Experiência de navegação:**
- Suavizar a rotação da câmera com interpolação (`lerp`) ao invés de atualização direta — elimina o efeito "seco" ao arrastar.
- Adicionar suporte a giroscópio em dispositivos móveis (API `DeviceOrientation`).
- Implementar zoom com pinch gesture (dois dedos no touch).

**Conteúdo e estrutura:**
- Carregar as cenas de um arquivo JSON externo em vez de hardcoded no `script.js`, facilitando atualização do conteúdo sem mexer no código.
- Adicionar áudio ambiente por cena (Web Audio API).
- Suporte a legendas acessíveis (ARIA) nos hotspots para leitores de tela.

**Interface:**
- Tela de início com mapa geral do museu antes de entrar no tour.
- Modo de apresentação guiada, que percorre as cenas automaticamente com narração em texto.
- Versão dark/light mode no CSS.

**Performance:**
- Substituir imagens PNG muito pesadas por JPG progressivo (a `sala1museu.png` tem ~50 MB).
- Avaliar uso de formato WebP para reduzir tamanho dos assets.
- Implementar nível de detalhe adaptativo (trocar resolução conforme a conexão do usuário).

---

## Tecnologias utilizadas

- [Three.js](https://threejs.org/) `v0.160.0` — renderização 3D no navegador via WebGL
- [Vite](https://vitejs.dev/) `v6.x` — servidor de desenvolvimento e bundler
- HTML5 + CSS3 — estrutura e interface do HUD
- JavaScript (ES Modules) — sem frameworks adicionais

---

> Projeto desenvolvido no IFSC — semestre 2026.1.
> Dúvidas sobre o código? Leia os comentários em `script.js` — cada seção está marcada com `// ─── Nome ───`.