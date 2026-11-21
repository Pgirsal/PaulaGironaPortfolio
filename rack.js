/* rack.js — 3D Postcard Display Rack with Three.js
   ================================================================
   Builds a realistic silver metal rotating postcard rack using
   Three.js geometry primitives. Auto-rotates, draggable, clickable.
   ================================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     PROJECTS DATA
     ─────────────────────────────────────────────────────────────*/
  const PROJECTS = [
    {
      id: 1,
      title: 'I love NY — Addison Rae',
      desc: 'Promotional motion graphics video inspired by Addison Rae\'s playful visual identity, combining nostalgic internet aesthetics and bold typography.',
      tag: 'Music · Fashion · 2026',
      categories: ['Music', 'Fashion'],
      image: 'works/1.gif',
      link: 'works/Addison/addison.html',
    },
    {
      id: 2,
      title: 'Weird',
      desc: 'Surreal visual world-building and experimental digital art direction.',
      tag: 'Visual identity · 3D · 2026',
      categories: ['Visual identity', '3D'],
      image: 'works/13.png',
      link: 'works/weird/weird.html',
    },
    {
      id: 3,
      title: 'Marvão',
      desc: 'Brand identity, bespoke botanical illustrations, and packaging design for an artisanal tea brand.',
      tag: 'Visual identity · 2026',
      categories: ['Visual identity'],
      image: 'works/3.png',
      link: 'works/te/marvao.html',
    },
    {
      id: 4,
      title: 'Kill the static',
      desc: 'Comprehensive brand identity, campaign imagery, and graphic system.',
      tag: 'Visual identity · Editorial · 2026',
      categories: ['Visual identity', 'Editorial'],
      image: 'works/12.png',
      link: 'works/KTS/kts.html',
    },
    {
      id: 5,
      title: '4:23',
      desc: 'Graphic compositions and tactile sleeve studies for the 4:23 vinyl edition.',
      tag: 'Visual identity · Music · 2026',
      categories: ['Visual identity', 'Music'],
      image: 'works/5.png',
      link: 'works/Vinil/vinil.html',
    },
    {
      id: 6,
      title: 'PAM',
      desc: 'Visual identity and graphic design system developed around bold form and expressive typography.',
      tag: 'Visual identity · 2026',
      categories: ['Visual identity'],
      image: 'works/6.png',
      link: 'works/PAM/pam.html',
    },
    {
      id: 7,
      title: 'Mugler advertising posters',
      desc: 'Visual direction and fashion editorial inspired by Mugler\'s sculptural silhouettes and theatrical energy.',
      tag: '3D · Fashion · 2026',
      categories: ['3D', 'Fashion'],
      image: 'works/7.Webp',
      link: 'works/mugler/mugler.html',
    },
    {
      id: 8,
      title: 'Dior campaign',
      desc: 'Editorial campaign and motion study reimagining luxury fashion storytelling through a contemporary lens.',
      tag: 'Visual identity · 3D · Fashion · 2026',
      categories: ['Visual identity', '3D', 'Fashion'],
      image: 'works/8.png',
      link: 'works/dior/dior.html',
    },
    {
      id: 9,
      title: 'LUV Magazine',
      desc: 'An editorial publication revisiting the unapologetic visual language of early-2000s pop culture and teen glossies.',
      tag: 'Editorial · Fashion · 2026',
      categories: ['Editorial', 'Fashion'],
      image: 'works/9.png',
      link: 'works/LUV/LUV.html',
    },
    {
      id: 10,
      title: 'Rosas last Night',
      desc: 'A visual exploration through layered archival imagery, texture, and mixed-media graphic composition.',
      tag: 'Editorial · 2026',
      categories: ['Editorial'],
      image: 'works/10.png',
      link: 'works/Collage/collage.html',
    },
    {
      id: 11,
      title: 'Bass',
      desc: 'Visual study on rhythm, form, and typographic contrast inspired by modernist title sequences.',
      tag: 'Visual identity · 2026',
      categories: ['Visual identity'],
      image: 'works/11.webp',
      link: 'works/Bass/bass.html',
    },
    {
      id: 12,
      title: 'Weird',
      desc: 'Surreal visual world-building and experimental digital art direction in motion.',
      tag: '3D · Visual identity · 2026',
      categories: ['3D', 'Visual identity'],
      video: 'works/weird/ai4.mp4',
      link: 'works/weird/weird.html',
    },
  ];

  /* Standalone project for rack slot 12 (excluded from Work archive grid) */
  const comingSoonProject = {
    id: 13,
    title: 'Coming soon...',
    desc: 'Art direction for an upcoming music artist',
    tag: 'Music · Art Direction',
    image: 'works/4.png',
  };

  /* 12 cards for the 3D rotating rack
     Image 12.png (KTS) is at slot 4, image 4.png (Silhouette) is at slot 12
     Image 11.webp (Bass) is at slot 6, image 6.png (PAM) is at slot 11 */
  const RACK_PROJECTS = [
    PROJECTS[0],  // 1.gif (Addison)
    PROJECTS[1],  // 13.png (Weird)
    PROJECTS[2],  // 3.png (Marvão)
    PROJECTS[3],  // 12.png (KTS) — switched with 4.png on rack
    PROJECTS[4],  // 5.png (4:23)
    PROJECTS[10], // 11.webp (Bass) — switched with 6.png on rack
    PROJECTS[6],  // 7.Webp (Mugler)
    PROJECTS[7],  // 8.png (Dior)
    PROJECTS[8],  // 9.png (LUV Magazine)
    PROJECTS[9],  // 10.png (Collage)
    PROJECTS[5],  // 6.png (PAM) — switched with 11.webp on rack
    comingSoonProject, // 4.png (Silhouette) — Coming soon...
  ];

  /* ─────────────────────────────────────────────────────────────
     SCENE SETUP
     ─────────────────────────────────────────────────────────────*/
  const canvas = document.getElementById('rack-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding; // match display gamma — prevents burnt/washed look
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xffffff, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.4, 7.0);
  camera.lookAt(0, -0.1, 0);

  /* ─────────────────────────────────────────────────────────────
     LIGHTS  (soft, studio-like)
     ─────────────────────────────────────────────────────────────*/
  // Ambient — fills the scene
  const ambient = new THREE.AmbientLight(0xffffff, 1.1);
  scene.add(ambient);

  // Key light — top-left, like window light
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(-3, 5, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 0.1;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  // Fill light — softer, from the right
  const fillLight = new THREE.DirectionalLight(0xf0f0ff, 0.7);
  fillLight.position.set(4, 2, 2);
  scene.add(fillLight);

  // Rim light — subtle from behind
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
  rimLight.position.set(0, -2, -4);
  scene.add(rimLight);

  /* ─────────────────────────────────────────────────────────────
     MATERIALS — Silver metal palette
     ─────────────────────────────────────────────────────────────*/
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8,
    metalness: 0.75,
    roughness: 0.28,
  });

  const metalDarkMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.82,
    roughness: 0.35,
  });

  const wireMatGen = () => new THREE.MeshStandardMaterial({
    color: 0xd4d4d4,
    metalness: 0.70,
    roughness: 0.25,
  });

  /* ─────────────────────────────────────────────────────────────
     RACK GROUP — everything rotates together
     ─────────────────────────────────────────────────────────────*/
  const rackGroup = new THREE.Group();
  rackGroup.scale.set(0.88, 0.88, 0.88);
  scene.add(rackGroup);

  /* ─── CENTRAL POLE ───────────────────────────────────────────*/
  const poleGeo = new THREE.CylinderGeometry(0.028, 0.028, 3.4, 16);
  const pole = new THREE.Mesh(poleGeo, metalMat);
  pole.position.y = 0.2;
  pole.castShadow = true;
  rackGroup.add(pole);

  // Top finial loop (authentic vintage postcard rack topper)
  const finialRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 10, 32), metalMat);
  finialRing.position.y = 1.97;
  finialRing.castShadow = true;
  rackGroup.add(finialRing);

  /* ─── BASE / STAND ───────────────────────────────────────────*/
  // Central hub
  const hubGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.10, 24);
  const hub = new THREE.Mesh(hubGeo, metalDarkMat);
  hub.position.y = -1.48;
  hub.castShadow = true;
  rackGroup.add(hub);

  // Four feet extending from hub
  const numLegs = 4;
  for (let i = 0; i < numLegs; i++) {
    const angle = (i / numLegs) * Math.PI * 2;
    const legLen = 0.88;
    const legGeo = new THREE.CylinderGeometry(0.018, 0.014, legLen, 8);
    const leg = new THREE.Mesh(legGeo, metalMat);
    // Orient horizontally + slight downward tilt
    leg.rotation.z = Math.PI / 2;
    leg.rotation.y = angle;
    const cx = Math.cos(angle) * (legLen / 2);
    const cz = Math.sin(angle) * (legLen / 2);
    leg.position.set(cx, -1.48, cz);
    leg.castShadow = true;
    rackGroup.add(leg);

    // Small rubber foot at the end of each leg
    const footGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.04, 12);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.2, roughness: 0.8 });
    const foot = new THREE.Mesh(footGeo, footMat);
    const fx = Math.cos(angle) * legLen;
    const fz = Math.sin(angle) * legLen;
    foot.position.set(fx, -1.48, fz);
    rackGroup.add(foot);
  }

  /* ─── TIERS (POSTCARD LEVELS) ────────────────────────────────
     4 levels, each with cards at 3 angular positions (every 120°),
     alternating front/back. Total = 12 postcards.
  */
  const NUM_TIERS = 4;
  const CARDS_PER_TIER = 3;
  const TIER_SPACING = 0.68;
  const TIER_Y_START = 1.12; // top tier Y
  const CARD_RADIUS = 0.52;   // distance from pole center
  const CARD_W = 0.58;
  const CARD_H = 0.76;

  // Wire basket / holder geometry per slot
  function makeWireHolder(w, h) {
    const g = new THREE.Group();
    const mat = wireMatGen();
    const tubeR = 0.008;
    const segs = 6;

    // Bottom rail
    const bRail = new THREE.Mesh(new THREE.CylinderGeometry(tubeR, tubeR, w + 0.04, segs), mat);
    bRail.rotation.z = Math.PI / 2;
    bRail.position.set(0, -h * 0.5 + 0.01, 0);
    g.add(bRail);

    // Top rail
    const tRail = new THREE.Mesh(new THREE.CylinderGeometry(tubeR, tubeR, w + 0.04, segs), mat);
    tRail.rotation.z = Math.PI / 2;
    tRail.position.set(0, h * 0.5 + 0.06, 0);
    g.add(tRail);

    // Two side verticals
    [-w / 2, w / 2].forEach(x => {
      const sRail = new THREE.Mesh(new THREE.CylinderGeometry(tubeR, tubeR, h + 0.07, segs), mat);
      sRail.position.set(x + (x < 0 ? -0.02 : 0.02), h * 0.02, 0);
      g.add(sRail);
    });

    // (Removed: disconnected semicircular bracket meshes above the top rail.
    // No geometry is created for them, so there is nothing to dispose.)

    return g;
  }

  /* Mounting arm that connects each basket to the pole */
  function makeArm(radius) {
    const mat = wireMatGen();
    const armGeo = new THREE.CylinderGeometry(0.010, 0.010, radius - 0.036, 8);
    const arm = new THREE.Mesh(armGeo, mat);
    arm.rotation.z = Math.PI / 2;
    arm.castShadow = true;
    return arm;
  }

  /* ─── PRELOADER MANAGER ─────────────────────────────────────*/
  const loaderEl = document.getElementById('page-loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderCounter = document.getElementById('loader-counter');

  let minTimeElapsed = false;
  let allDone = false;
  let windowLoaded = document.readyState === 'complete';

  if (!windowLoaded) {
    window.addEventListener('load', () => {
      windowLoaded = true;
      tryDismiss();
    });
  }

  function updateLoaderDisplay(progressPct) {
    if (loaderFill) loaderFill.style.width = progressPct + '%';
    if (loaderCounter) loaderCounter.textContent = String(Math.round(progressPct)).padStart(2, '0') + '%';
  }

  function dismissLoader() {
    if (!loaderEl) return;
    updateLoaderDisplay(100);
    setTimeout(() => {
      loaderEl.classList.add('loaded');
      setTimeout(() => {
        if (loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
      }, 900);
    }, 220);
  }

  function tryDismiss() {
    if (allDone && minTimeElapsed && (windowLoaded || document.readyState === 'complete')) {
      dismissLoader();
    }
  }

  // Minimum graceful duration: 800ms for a deliberate, elegant intro
  setTimeout(() => {
    minTimeElapsed = true;
    tryDismiss();
  }, 800);

  // Safety fallback: if anything hangs, dismiss after 3.8s
  setTimeout(() => {
    if (loaderEl && !loaderEl.classList.contains('loaded')) {
      dismissLoader();
    }
  }, 3800);

  const loadingManager = new THREE.LoadingManager(
    () => {
      allDone = true;
      tryDismiss();
    },
    (url, itemsLoaded, itemsTotal) => {
      const pct = Math.min(98, Math.round((itemsLoaded / itemsTotal) * 100));
      updateLoaderDisplay(pct);
    },
    (url) => {
      console.warn('Failed to load texture:', url);
    }
  );

  /* ─── POSTCARD MESH ─────────────────────────────────────────*/
  const textureLoader = new THREE.TextureLoader(loadingManager);

  function makeCardMat() {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\nif (!gl_FrontFacing) gl_FragColor.rgb = vec3(1.0);'
      );
    };
    return mat;
  }

  const cardSlots = []; // { mesh, projectIndex }

  let projectIndex = 0;

  for (let tier = 0; tier < NUM_TIERS; tier++) {
    const tierY = TIER_Y_START - tier * TIER_SPACING;

    // Ring bracket at this level
    const ringGeo = new THREE.TorusGeometry(0.038, 0.010, 8, 24);
    const ring = new THREE.Mesh(ringGeo, metalDarkMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = tierY + 0.04;
    ring.castShadow = true;
    rackGroup.add(ring);

    for (let c = 0; c < CARDS_PER_TIER; c++) {
      const angle = (c / CARDS_PER_TIER) * Math.PI * 2 + tier * (Math.PI / CARDS_PER_TIER);

      const slotGroup = new THREE.Group();
      slotGroup.position.y = tierY;

      // Mounting arm (extends from pole ring to the back of the image frame)
      const arm = makeArm(CARD_RADIUS);
      const armMid = CARD_RADIUS * 0.5 + 0.01;
      arm.position.set(Math.cos(angle) * armMid, 0.04, Math.sin(angle) * armMid);
      arm.rotation.y = -angle;
      slotGroup.add(arm);

      // Wire holder
      const holder = makeWireHolder(CARD_W, CARD_H);
      holder.rotation.y = -angle + Math.PI / 2;
      holder.position.set(
        Math.cos(angle) * CARD_RADIUS,
        0,
        Math.sin(angle) * CARD_RADIUS
      );
      slotGroup.add(holder);

      // Postcard (plane mesh with texture)
      const proj = RACK_PROJECTS[projectIndex % RACK_PROJECTS.length];
      const cardGeo = new THREE.PlaneGeometry(CARD_W - 0.04, CARD_H - 0.04);
      const cardMat = makeCardMat();

      const card = new THREE.Mesh(cardGeo, cardMat);
      card.position.set(
        Math.cos(angle) * CARD_RADIUS,
        0.015,
        Math.sin(angle) * CARD_RADIUS
      );
      card.rotation.y = -angle + Math.PI / 2;
      card.castShadow = true;
      card.receiveShadow = true;
      card.userData = { project: proj, isCard: true };

      // Load texture
      ; (function (mesh, imagePath, cardW, cardH) {
        textureLoader.load(
          imagePath,
          (tex) => {
            tex.encoding = THREE.sRGBEncoding;
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;

            // Cover fit: scale UV so image fills card without stretching,
            // cropping the overflow (like CSS object-fit: cover).
            const imgAspect = tex.image.width / tex.image.height;
            const cardAspect = cardW / cardH;

            if (imgAspect > cardAspect) {
              // Image is wider than the card slot — fit height, crop width
              const scale = cardAspect / imgAspect;
              tex.repeat.set(scale, 1);
              tex.offset.set((1 - scale) / 2, 0);
            } else {
              // Image is taller than the card slot — fit width, crop height
              const scale = imgAspect / cardAspect;
              tex.repeat.set(1, scale);
              tex.offset.set(0, (1 - scale) / 2);
            }

            mesh.material.map = tex;
            mesh.material.color.set(0xffffff);
            mesh.material.needsUpdate = true;
          },
          undefined,
          () => {
            // Fallback: subtle paper colour
            mesh.material.color.set(0xf0ede8);
          }
        );
      })(card, proj.image, CARD_W - 0.04, CARD_H - 0.04);

      slotGroup.add(card);
      cardSlots.push({ mesh: card, project: proj });

      rackGroup.add(slotGroup);
      projectIndex++;
    }
  }

  /* ─── FLOOR SHADOW ───────────────────────────────────────────*/
  // Subtle circular shadow/vignette under rack base
  const shadowGeo = new THREE.CircleGeometry(0.7, 48);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.04,
    depthWrite: false,
  });
  const floorShadow = new THREE.Mesh(shadowGeo, shadowMat);
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.y = -1.32;
  scene.add(floorShadow);

  /* ─────────────────────────────────────────────────────────────
     RESIZE HANDLER
     ─────────────────────────────────────────────────────────────*/
  function onResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', onResize);
  onResize();

  /* ─────────────────────────────────────────────────────────────
     INTERACTION — drag to rotate
     ─────────────────────────────────────────────────────────────*/
  let isDragging = false;
  let dragStartX = 0;
  let dragStartRotY = 0;
  let autoRotateSpeed = 0.0028;
  let manualRotVelocity = 0;
  let lastDragX = 0;
  let dragDeltaX = 0;

  const dragHint = document.getElementById('drag-hint');
  let hintHidden = false;

  function hideHint() {
    if (!hintHidden) {
      hintHidden = true;
      dragHint.classList.add('hidden');
    }
  }

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartRotY = rackGroup.rotation.y;
    lastDragX = e.clientX;
    dragDeltaX = 0;
    canvas.style.cursor = 'grabbing';
    hideHint();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    dragDeltaX = e.clientX - lastDragX;
    lastDragX = e.clientX;
    const delta = e.clientX - dragStartX;
    rackGroup.rotation.y = dragStartRotY + delta * 0.008;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    manualRotVelocity = dragDeltaX * 0.004;
    canvas.style.cursor = 'grab';
  });

  // Touch support — on phone: tap a card to open it, rotate with arrow buttons
  const phoneMQ = window.matchMedia('(max-width: 430px)');
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchMoved = false;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    touchMoved = false;
    hideHint();
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (Math.abs(t.clientX - touchStartX) > 10 || Math.abs(t.clientY - touchStartY) > 10) {
      touchMoved = true;
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    // Swipe left/right → step the rack one card
    const dx = t.clientX - touchStartX;
    if (touchMoved && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(t.clientY - touchStartY)) {
      stepRack(dx > 0 ? -1 : 1);
      return;
    }
    // Tap → open the card under the finger
    if (!touchMoved && Date.now() - touchStartTime < 500) {
      handleCanvasClick({ clientX: t.clientX, clientY: t.clientY });
    }
    e.preventDefault();
  }, { passive: false });

  // Arrow buttons: rotate one card at a time with smooth easing
  const ROT_STEP = Math.PI / CARDS_PER_TIER; // tiers are offset, so this brings a new card to the front
  let rotTarget = null;
  let autoPauseUntil = 0;

  function stepRack(dir) {
    const base = rotTarget !== null ? rotTarget : rackGroup.rotation.y;
    rotTarget = base + dir * ROT_STEP;
    manualRotVelocity = 0;
    autoPauseUntil = Date.now() + 5000; // hold still so the card is easy to tap
    hideHint();
  }

  const rackPrev = document.getElementById('rack-prev');
  const rackNext = document.getElementById('rack-next');
  if (rackPrev) rackPrev.addEventListener('click', () => stepRack(-1));
  if (rackNext) rackNext.addEventListener('click', () => stepRack(1));

  if (phoneMQ.matches && dragHint) {
    const span = dragHint.querySelector('span');
    if (span) span.textContent = 'tap a card to open';
  }

  // Mouse wheel / trackpad scroll spins the rack
  window.addEventListener('wheel', (e) => {
    if (overlay && overlay.classList.contains('visible')) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    manualRotVelocity += delta * 0.00035;
    hideHint();
  }, { passive: true });

  /* ─────────────────────────────────────────────────────────────
     INTERACTION — hover highlight
     ─────────────────────────────────────────────────────────────*/
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredCard = null;
  let clickStartTime = 0;

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const meshes = cardSlots.map(s => s.mesh);
    const hits = raycaster.intersectObjects(meshes);

    // Reset previous hover
    if (hoveredCard && (!hits.length || hits[0].object !== hoveredCard)) {
      hoveredCard.scale.set(1, 1, 1);
      hoveredCard = null;
      canvas.style.cursor = 'grab';
    }

    if (hits.length > 0) {
      const hit = hits[0].object;
      if (hit !== hoveredCard) {
        hoveredCard = hit;
        hoveredCard.scale.set(1.04, 1.04, 1.04);
        canvas.style.cursor = 'pointer';
      }
    }
  });

  canvas.addEventListener('mousedown', () => { clickStartTime = Date.now(); });

  canvas.addEventListener('mouseup', (e) => {
    // Only fire click if it wasn't a drag (< 180ms and < 8px move)
    const elapsed = Date.now() - clickStartTime;
    const totalMove = Math.abs(e.clientX - dragStartX);
    if (elapsed < 250 && totalMove < 8) {
      handleCanvasClick(e);
    }
  });

  function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const meshes = cardSlots.map(s => s.mesh);
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length > 0) {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      overlayInner.style.setProperty('--from-x', dx * 0.75 + 'px');
      overlayInner.style.setProperty('--from-y', dy * 0.75 + 'px');
      overlayInner.style.setProperty('--spin-y', (dx >= 0 ? 195 : -195) + 'deg');
      openOverlay(hits[0].object.userData.project);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     OVERLAY
     ─────────────────────────────────────────────────────────────*/
  const overlay = document.getElementById('project-overlay');
  const overlayInner = overlay.querySelector('.overlay-inner');
  const backdrop = document.getElementById('overlay-backdrop');
  const closeBtn = document.getElementById('overlay-close');
  const overlayImg = document.getElementById('overlay-image');
  const overlayVideo = document.getElementById('overlay-video');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayDesc = document.getElementById('overlay-desc');
  const overlayTag = document.getElementById('overlay-tag');
  const overlayIndex = document.getElementById('overlay-index');
  const cursorBadge = document.getElementById('cursor-badge');

  function getActiveOverlayMedia() {
    return overlayVideo && !overlayVideo.hidden ? overlayVideo : overlayImg;
  }

  let currentOverlayProj = null;

  function openOverlay(proj) {
    currentOverlayProj = proj;
    if (proj.video && overlayVideo) {
      overlayImg.hidden = true;
      overlayVideo.hidden = false;
      overlayVideo.src = proj.video;
      overlayVideo.play().catch(() => { });
    } else {
      if (overlayVideo) {
        overlayVideo.pause();
        overlayVideo.hidden = true;
      }
      overlayImg.hidden = false;
      overlayImg.src = proj.image;
      overlayImg.alt = proj.title;
    }
    overlay.onclick = (e) => {
      const mediaEl = getActiveOverlayMedia();
      if (e.target === closeBtn) return;
      const onMedia = e.target === mediaEl || cursorBadge.classList.contains('visible');
      if (onMedia) {
        if (proj.link) {
          cursorBadge.classList.remove('visible');
          document.body.classList.add('page-exit');
          setTimeout(() => { window.location.href = proj.link; }, 520);
        }
        return;
      }
      // Clicked anywhere that isn't the image/video → close
      closeOverlay();
    };
    overlayTitle.textContent = proj.title;
    overlayDesc.textContent = proj.desc;
    overlayTag.textContent = proj.tag;
    overlayIndex.textContent = String(proj.id).padStart(2, '0');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('visible');
    backdrop.classList.add('visible');
    autoRotateSpeed = 0; // pause rotation while overlay is open
  }

  function closeOverlay() {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('visible');
    backdrop.classList.remove('visible');
    cursorBadge.classList.remove('visible');
    overlay.style.cursor = '';
    if (overlayVideo) overlayVideo.pause();
    autoRotateSpeed = 0.0028;
  }

  overlay.addEventListener('mousemove', (e) => {
    cursorBadge.style.left = e.clientX + 'px';
    cursorBadge.style.top = e.clientY + 'px';
    const r = getActiveOverlayMedia().getBoundingClientRect(), pad = 36;
    const canNavigate = !!(currentOverlayProj && currentOverlayProj.link);
    const hit = canNavigate && e.clientX >= r.left - pad && e.clientX <= r.right + pad &&
      e.clientY >= r.top - pad && e.clientY <= r.bottom + pad;
    cursorBadge.classList.toggle('visible', hit);
    overlay.style.cursor = hit ? 'none' : '';
  });

  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay();
  });

  window.addEventListener('pageshow', () => document.body.classList.remove('page-exit'));

  /* ─────────────────────────────────────────────────────────────
     WORK ARCHIVE GRID & CATEGORY FILTERING
     ─────────────────────────────────────────────────────────────*/
  const workArchive = document.getElementById('work-archive');
  const workGrid = document.getElementById('work-grid');
  const filterBtns = Array.from(document.querySelectorAll('.work-filter'));
  const navNew = document.getElementById('nav-new');
  const navWork = document.getElementById('nav-work');

  if (workGrid && workArchive) {
    PROJECTS.forEach((proj) => {
      const card = document.createElement('article');
      card.className = 'work-card';
      card.dataset.categories = (proj.categories || []).join(',');
      const mediaMarkup = proj.video
        ? `<video class="work-card-img" src="${proj.video}" autoplay loop muted playsinline></video>`
        : `<img class="work-card-img" src="${proj.image}" alt="${proj.title}" loading="lazy" />`;
      card.innerHTML = `<h3 class="work-card-title">${proj.title}</h3><div class="work-card-media">${mediaMarkup}</div>`;
      card.addEventListener('click', () => {
        const r = card.getBoundingClientRect();
        const dx = (r.left + r.width / 2) - window.innerWidth / 2;
        const dy = (r.top + r.height / 2) - window.innerHeight / 2;
        overlayInner.style.setProperty('--from-x', dx * 0.75 + 'px');
        overlayInner.style.setProperty('--from-y', dy * 0.75 + 'px');
        overlayInner.style.setProperty('--spin-y', (dx >= 0 ? 195 : -195) + 'deg');
        openOverlay(proj);
      });
      workGrid.appendChild(card);
    });

    const cards = Array.from(workGrid.querySelectorAll('.work-card'));

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.toggle('active', b === btn));
        cards.forEach((c) => {
          const list = c.dataset.categories.split(',');
          c.hidden = cat !== 'All' && !list.includes(cat);
        });
      });
    });

    function toggleWorkView(show) {
      workArchive.classList.toggle('visible', show);
      workArchive.setAttribute('aria-hidden', String(!show));
      navNew.classList.toggle('nav-link--active', !show);
      navWork.classList.toggle('nav-link--active', show);
    }

    navWork.addEventListener('click', (e) => { e.preventDefault(); toggleWorkView(true); });
    navNew.addEventListener('click', (e) => { e.preventDefault(); toggleWorkView(false); });
    if (window.location.hash === '#work') toggleWorkView(true);
  }

  /* ── Cute Star & Flower Cursor Trail ───────────────────── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const glyphs = ['✦', '✿', '✧', '❀', '⋆'];
    let lastSparkX = 0, lastSparkY = 0;
    window.addEventListener('mousemove', (e) => {
      if (cursorBadge.classList.contains('visible')) return;
      const dx = e.clientX - lastSparkX, dy = e.clientY - lastSparkY;
      if (dx * dx + dy * dy < 1100) return;
      lastSparkX = e.clientX;
      lastSparkY = e.clientY;
      const el = document.createElement('span');
      el.className = 'cursor-spark';
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.left = (e.clientX + (Math.random() * 18 - 9)) + 'px';
      el.style.top = (e.clientY + (Math.random() * 18 - 9)) + 'px';
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
     ANIMATION LOOP
     ─────────────────────────────────────────────────────────────*/
  function animate() {
    requestAnimationFrame(animate);

    if (rotTarget !== null) {
      const diff = rotTarget - rackGroup.rotation.y;
      rackGroup.rotation.y += diff * 0.12;
      if (Math.abs(diff) < 0.001) {
        rackGroup.rotation.y = rotTarget;
        rotTarget = null;
      }
    } else if (Date.now() < autoPauseUntil) {
      // paused after a phone arrow/swipe step
    } else if (!isDragging) {
      if (Math.abs(manualRotVelocity) > 0.0001) {
        rackGroup.rotation.y += manualRotVelocity;
        manualRotVelocity *= 0.94;
      } else {
        rackGroup.rotation.y += autoRotateSpeed;
      }
    }

    renderer.render(scene, camera);
  }

  animate();
})();
