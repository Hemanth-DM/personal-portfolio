/**
 * HEMANTH D.M. - 3D WebGL Background Scene
 * Powered by Three.js
 * Features: Starfield Nebula, Floating Cyber Geometric Core, Theme Reactive Colors
 */

(function () {
  'use strict';

  let scene, camera, renderer, particles, coreMesh, wireCore, ringMesh;
  let targetMouseX = 0, targetMouseY = 0;
  let mouseX = 0, mouseY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  // Color palette definitions for themes
  const themeColors = {
    cyber: {
      accent1: 0x00f0ff,
      accent2: 0xa855f7,
      coreWire: 0x00f0ff,
      innerNucleus: 0x3b82f6,
      particles: [0x00f0ff, 0xa855f7, 0x38bdf8, 0x818cf8]
    },
    matrix: {
      accent1: 0x10b981,
      accent2: 0x34d399,
      coreWire: 0x10b981,
      innerNucleus: 0x059669,
      particles: [0x10b981, 0x34d399, 0x6ee7b7, 0x047857]
    },
    solar: {
      accent1: 0xf59e0b,
      accent2: 0xef4444,
      coreWire: 0xf59e0b,
      innerNucleus: 0xf97316,
      particles: [0xf59e0b, 0xef4444, 0xfbbf24, 0xd97706]
    }
  };

  let currentTheme = 'cyber';

  function init() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') {
      console.warn('Three.js not loaded or canvas missing');
      return;
    }

    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060814, 0.001);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1000;

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Particle Universe
    createParticleUniverse();

    // 4. Floating 3D Geometric Cyber Core
    createCyberCore();

    // 5. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight1.position.set(200, 300, 400);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.0);
    dirLight2.position.set(-200, -300, 200);
    scene.add(dirLight2);

    // Event Listeners
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onDocumentMouseMove, { passive: true });
    window.addEventListener('touchmove', onDocumentTouchMove, { passive: true });

    // Listen to theme switch events
    window.addEventListener('themeChange', function (e) {
      if (e.detail && themeColors[e.detail.theme]) {
        updateThemeColors(e.detail.theme);
      }
    });

    animate();
  }

  function createParticleUniverse() {
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const activeTheme = themeColors[currentTheme];
    const colorPalette = activeTheme.particles.map(c => new THREE.Color(c));

    for (let i = 0; i < particleCount; i++) {
      // Spread across wide 3D sphere
      const x = (Math.random() - 0.5) * 2200;
      const y = (Math.random() - 0.5) * 2200;
      const z = (Math.random() - 0.5) * 2000;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color selection
      const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circular soft glow texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.7)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 6,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function createCyberCore() {
    // Outer Wireframe Icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(130, 1);
    const wireMat = new THREE.MeshStandardMaterial({
      color: themeColors[currentTheme].coreWire,
      wireframe: true,
      emissive: themeColors[currentTheme].coreWire,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.8
    });
    wireCore = new THREE.Mesh(icoGeometry, wireMat);
    wireCore.position.set(380, 50, 0); // Positioned nicely near the hero image area

    // Inner Glowing Solid Nucleus
    const nucleusGeo = new THREE.OctahedronGeometry(60, 2);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: themeColors[currentTheme].innerNucleus,
      emissive: themeColors[currentTheme].innerNucleus,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });
    coreMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    wireCore.add(coreMesh);

    // Glowing Orbit Ring
    const ringGeo = new THREE.TorusGeometry(180, 1.5, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: themeColors[currentTheme].accent2,
      transparent: true,
      opacity: 0.5
    });
    ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    wireCore.add(ringMesh);

    scene.add(wireCore);
  }

  function updateThemeColors(themeKey) {
    currentTheme = themeKey;
    const theme = themeColors[themeKey] || themeColors.cyber;

    if (wireCore && wireCore.material) {
      wireCore.material.color.setHex(theme.coreWire);
      wireCore.material.emissive.setHex(theme.coreWire);
    }
    if (coreMesh && coreMesh.material) {
      coreMesh.material.color.setHex(theme.innerNucleus);
      coreMesh.material.emissive.setHex(theme.innerNucleus);
    }
    if (ringMesh && ringMesh.material) {
      ringMesh.material.color.setHex(theme.accent2);
    }
    if (particles && particles.geometry) {
      const colors = particles.geometry.attributes.color.array;
      const colorPalette = theme.particles.map(c => new THREE.Color(c));
      for (let i = 0; i < colors.length / 3; i++) {
        const chosen = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = chosen.r;
        colors[i * 3 + 1] = chosen.g;
        colors[i * 3 + 2] = chosen.b;
      }
      particles.geometry.attributes.color.needsUpdate = true;
    }
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Reposition wire core for mobile viewports
    if (window.innerWidth < 1024) {
      wireCore.position.set(0, 200, -200);
      wireCore.scale.set(0.7, 0.7, 0.7);
    } else {
      wireCore.position.set(380, 50, 0);
      wireCore.scale.set(1, 1, 1);
    }
  }

  function onDocumentMouseMove(event) {
    targetMouseX = (event.clientX - windowHalfX) * 0.4;
    targetMouseY = (event.clientY - windowHalfY) * 0.4;
  }

  function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
      targetMouseX = (event.touches[0].pageX - windowHalfX) * 0.4;
      targetMouseY = (event.touches[0].pageY - windowHalfY) * 0.4;
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    // Smooth inertia interpolation
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Camera subtle parallax
    camera.position.x += (mouseX - camera.position.x) * 0.02;
    camera.position.y += (-mouseY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    // Rotate particles
    if (particles) {
      particles.rotation.y += 0.0004;
      particles.rotation.x += 0.0002;
    }

    // Rotate Cyber Core
    if (wireCore) {
      wireCore.rotation.x += 0.005;
      wireCore.rotation.y += 0.008;

      if (coreMesh) {
        coreMesh.rotation.x -= 0.01;
        coreMesh.rotation.z += 0.01;
      }
      if (ringMesh) {
        ringMesh.rotation.z += 0.006;
      }
    }

    renderer.render(scene, camera);
  }

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export helper
  window.AgyThreeScene = {
    updateTheme: updateThemeColors
  };
})();
