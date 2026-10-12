import time
from playwright.sync_api import sync_playwright

html_content = """
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: transparent; overflow: hidden; }
    canvas { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import * as THREE from 'http://localhost:5173/node_modules/three/build/three.module.js';
    import { GLTFLoader } from 'http://localhost:5173/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
    import { RoomEnvironment } from 'http://localhost:5173/node_modules/three/examples/jsm/environments/RoomEnvironment.js';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.45, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(800, 800);
    renderer.setPixelRatio(2);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    document.body.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    scene.environment = pmrem.fromScene(room, 0.04).texture;
    scene.environmentIntensity = 0.70;

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const key = new THREE.DirectionalLight(0xffffff, 5.8);
    key.position.set(-4.2, 3.4, 3.8);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x9598b0, 1.6);
    fill.position.set(3.8, 1.8, 2.5);
    scene.add(fill);

    const loader = new GLTFLoader();
    loader.load('/osmoo_character.glb', (gltf) => {
      const root = gltf.scene;

      const obsidianMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#15141b'),
        roughness: 0.14,
        metalness: 0.68,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 0.95,
        ior: 1.85,
      });

      const pearlMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f4f5f9'),
        roughness: 0.18,
        metalness: 0.03,
      });

      const head = root.getObjectByName('Head');
      const body = root.getObjectByName('Body');
      const lh = root.getObjectByName('LeftHand');
      const rh = root.getObjectByName('RightHand');

      if (head) head.material = obsidianMat;
      if (body) body.material = obsidianMat;
      if (lh) lh.material = pearlMat;
      if (rh) rh.material = pearlMat;

      // Add eyes to head
      const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 2.5, 2.5), toneMapped: false });
      const eyeGeom = new THREE.CapsuleGeometry(0.052, 0.12, 32, 32);

      const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
      leftEye.position.set(-0.115, 0.008, 0.408);
      leftEye.rotation.set(0.04, -0.06, -0.12);
      head.add(leftEye);

      const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
      rightEye.position.set(0.115, 0.008, 0.408);
      rightEye.rotation.set(0.04, 0.06, 0.12);
      head.add(rightEye);

      scene.add(root);
      window.__READY = true;
    });

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>
"""

with open(r"c:\Users\gaurav\Downloads\OSMOO\public\render_bot.html", "w") as f:
    f.write(html_content)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 800, "height": 800}, device_scale_factor=2)
    page.goto("http://localhost:5173/render_bot.html")
    page.wait_for_function("window.__READY === true", timeout=10000)
    time.sleep(1.0)
    page.screenshot(path=r"c:\Users\gaurav\Downloads\OSMOO\public\osmoo_bot_transparent.png", omit_background=True)
    print("Rendered transparent bot to public/osmoo_bot_transparent.png")
    browser.close()
