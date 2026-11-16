import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Sun, Moon } from "lucide-react";
import { business } from "../config/business";
import {
  createProceduralTileMaps,
  detectSoftwareWebGL,
} from "../three/proceduralTiles";

type LightingMood = "daylight" | "architectural";

export function HeroBathroom3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const moodRef = useRef<LightingMood>("architectural");
  const [mood, setMood] = useState<LightingMood>("architectural");
  const [sceneReady, setSceneReady] = useState(false);
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    moodRef.current = mood;
    requestRenderRef.current?.();
  }, [mood]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setUseStaticFallback(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: "high-performance",
      });
    } catch {
      setUseStaticFallback(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07080a");
    // Removed thick FogExp2 to eliminate hazy blur and keep all tile textures crystal clear

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 40);
    const baseCamPos = new THREE.Vector3(2.4, 1.72, 4.35);
    const baseLookTarget = new THREE.Vector3(-0.35, 1.28, -1.2);
    camera.position.copy(baseCamPos);
    camera.lookAt(baseLookTarget);

    const maxAniso = isSoftwareGl
      ? 2
      : Math.min(16, renderer.capabilities.getMaxAnisotropy());

    // Procedural architectural tile surfaces
    const basaltFloorMaps = createProceduralTileMaps({
      style: "basalt",
      pattern: "stacked-1200",
      repeatX: 2.5,
      repeatY: 3.2,
      maxAnisotropy: maxAniso,
      size: 2048,
    });

    const basaltWallMaps = createProceduralTileMaps({
      style: "basalt",
      pattern: "stacked-1200",
      repeatX: 3,
      repeatY: 2.2,
      maxAnisotropy: maxAniso,
      size: 2048,
    });

    const marbleFeatureMaps = createProceduralTileMaps({
      style: "marble",
      pattern: "stacked-1200",
      repeatX: 1.5,
      repeatY: 2.0,
      maxAnisotropy: maxAniso,
      size: 2048,
    });

    const basaltFloorMat = new THREE.MeshStandardMaterial({
      map: basaltFloorMaps.map,
      bumpMap: basaltFloorMaps.bumpMap,
      bumpScale: 0.012,
      roughnessMap: basaltFloorMaps.roughnessMap,
      roughness: 0.72,
      metalness: 0.06,
      envMapIntensity: 0.9,
    });

    const basaltWallMat = new THREE.MeshStandardMaterial({
      map: basaltWallMaps.map,
      bumpMap: basaltWallMaps.bumpMap,
      bumpScale: 0.014,
      roughnessMap: basaltWallMaps.roughnessMap,
      roughness: 0.78,
      metalness: 0.04,
      envMapIntensity: 0.75,
    });

    const marbleMat = new THREE.MeshPhysicalMaterial({
      map: marbleFeatureMaps.map,
      bumpMap: marbleFeatureMaps.bumpMap,
      bumpScale: 0.008,
      roughnessMap: marbleFeatureMaps.roughnessMap,
      roughness: 0.35,
      metalness: 0.02,
      clearcoat: 0.55,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.15,
    });

    const matteBlackMetal = new THREE.MeshStandardMaterial({
      color: "#151618",
      roughness: 0.32,
      metalness: 0.88,
      envMapIntensity: 1.1,
    });

    const oakMat = new THREE.MeshStandardMaterial({
      color: "#8e6948",
      roughness: 0.62,
      metalness: 0.02,
    });

    const ceramicWhiteMat = new THREE.MeshPhysicalMaterial({
      color: "#f7f6f3",
      roughness: 0.14,
      metalness: 0.0,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#dce8eb",
      metalness: 0,
      roughness: 0.06,
      transmission: isSoftwareGl ? 0 : 0.88,
      transparent: true,
      opacity: isSoftwareGl ? 0.28 : 1,
      ior: 1.52,
      thickness: 0.08,
      clearcoat: 1,
      depthWrite: false,
    });

    const warmLedMat = new THREE.MeshBasicMaterial({
      color: "#ffdcb0",
    });

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // 1. Tiled Floor (6.8m x 6.4m)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 6.4),
      basaltFloorMat,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Ceiling
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: "#1a1b1e",
      roughness: 0.9,
      metalness: 0.0,
    });
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 6.4),
      ceilingMat,
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.15;
    roomGroup.add(ceiling);

    // 2. Back Architectural Wall + Bookmatched Marble Shower Feature Wall
    const backCharcoalWall = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 3.15, 0.12),
      basaltWallMat,
    );
    backCharcoalWall.position.set(1.5, 1.575, -2.56);
    backCharcoalWall.receiveShadow = true;
    roomGroup.add(backCharcoalWall);

    const marbleShowerWall = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 3.15, 0.12),
      marbleMat,
    );
    marbleShowerWall.position.set(-1.9, 1.575, -2.56);
    marbleShowerWall.receiveShadow = true;
    roomGroup.add(marbleShowerWall);

    // Left Wall (basalt tiled)
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 3.15, 6.4),
      basaltWallMat,
    );
    leftWall.position.set(-3.4, 1.575, 0.6);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Right Wall (vanity backdrop)
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 3.15, 6.4),
      basaltWallMat,
    );
    rightWall.position.set(3.4, 1.575, 0.6);
    rightWall.receiveShadow = true;
    roomGroup.add(rightWall);

    // Recessed Warm Architectural Ceiling Cove Strip along back wall
    const coveStrip = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.025, 0.045),
      warmLedMat,
    );
    coveStrip.position.set(0, 3.12, -2.42);
    roomGroup.add(coveStrip);

    // Skylight Aperture Frame
    const skylightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.04, 1.2),
      warmLedMat,
    );
    skylightFrame.position.set(-1.2, 3.13, -1.1);
    roomGroup.add(skylightFrame);

    // 3. Walk-in Shower Multi-Part Group (Glass screen + channels + rain shower)
    const showerGroup = new THREE.Group();
    roomGroup.add(showerGroup);

    // Floor linear channel drain
    const drainMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.012, 0.08),
      matteBlackMetal,
    );
    drainMesh.position.set(-2.2, 0.008, -2.28);
    showerGroup.add(drainMesh);

    // Frameless glass screen (1.55m wide x 2.35m tall)
    const glassPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 2.35, 1.75),
      glassMat,
    );
    glassPanel.position.set(-0.45, 1.18, -1.62);
    glassPanel.renderOrder = 4;
    showerGroup.add(glassPanel);

    // Matte black perimeter aluminum channel (vertical + floor)
    const wallChannel = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 2.36, 0.036),
      matteBlackMetal,
    );
    wallChannel.position.set(-0.45, 1.18, -2.48);
    showerGroup.add(wallChannel);

    const floorChannel = new THREE.Mesh(
      new THREE.BoxGeometry(0.038, 0.026, 1.76),
      matteBlackMetal,
    );
    floorChannel.position.set(-0.45, 0.013, -1.62);
    showerGroup.add(floorChannel);

    // Overhead rain shower assembly (ceiling drop + head)
    const showerDrop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.42, 16),
      matteBlackMetal,
    );
    showerDrop.position.set(-1.85, 2.94, -1.85);
    showerGroup.add(showerDrop);

    const showerHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.02, 28),
      matteBlackMetal,
    );
    showerHead.position.set(-1.85, 2.72, -1.85);
    showerHead.castShadow = true;
    showerGroup.add(showerHead);

    // Mixer plate on marble wall
    const mixerPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.19, 0.025),
      matteBlackMetal,
    );
    mixerPlate.position.set(-1.85, 1.18, -2.49);
    showerGroup.add(mixerPlate);

    const mixerHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.07, 16),
      matteBlackMetal,
    );
    mixerHandle.rotation.x = Math.PI / 2;
    mixerHandle.position.set(-1.85, 1.22, -2.45);
    showerGroup.add(mixerHandle);

    // Recessed tiled shower niche with warm inner light
    const nicheFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.44, 0.08),
      matteBlackMetal,
    );
    nicheFrame.position.set(-2.45, 1.28, -2.48);
    showerGroup.add(nicheFrame);

    const nicheBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.38, 0.04),
      marbleMat,
    );
    nicheBack.position.set(-2.45, 1.28, -2.455);
    showerGroup.add(nicheBack);

    const nicheLed = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.015, 0.02),
      warmLedMat,
    );
    nicheLed.position.set(-2.45, 1.46, -2.44);
    showerGroup.add(nicheLed);

    // 4. Floating Oak & Stone Vanity Group (back-right zone)
    const vanityGroup = new THREE.Group();
    vanityGroup.position.set(1.55, 0, -2.14);
    roomGroup.add(vanityGroup);

    const vanityCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.52, 0.56),
      oakMat,
    );
    vanityCabinet.position.set(0, 0.58, 0);
    vanityCabinet.castShadow = true;
    vanityCabinet.receiveShadow = true;
    vanityGroup.add(vanityCabinet);

    // Architectural vertical timber flutes on vanity front
    for (let i = -9; i <= 9; i++) {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(0.026, 0.51, 0.025),
        oakMat,
      );
      slat.position.set(i * 0.105, 0.58, 0.285);
      vanityGroup.add(slat);
    }

    // Honed stone vanity countertop
    const vanityTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.14, 0.045, 0.59),
      marbleMat,
    );
    vanityTop.position.set(0, 0.86, 0);
    vanityTop.castShadow = true;
    vanityTop.receiveShadow = true;
    vanityGroup.add(vanityTop);

    // Twin Ceramic Vessel Basins using LatheGeometry
    const basinProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.15, 0.0),
      new THREE.Vector2(0.21, 0.03),
      new THREE.Vector2(0.23, 0.13),
      new THREE.Vector2(0.215, 0.14),
      new THREE.Vector2(0.195, 0.045),
      new THREE.Vector2(0.0, 0.025),
    ];
    const basinGeo = new THREE.LatheGeometry(basinProfile, 32);
    [-0.55, 0.55].forEach((offsetX) => {
      const basin = new THREE.Mesh(basinGeo, ceramicWhiteMat);
      basin.position.set(offsetX, 0.885, 0.03);
      basin.castShadow = true;
      vanityGroup.add(basin);

      // Wall-mounted matte black spout
      const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12),
        matteBlackMetal,
      );
      spout.rotation.x = Math.PI / 2;
      spout.position.set(offsetX, 1.12, -0.24);
      vanityGroup.add(spout);
    });

    // Backlit architectural mirror above vanity
    const mirrorGlow = new THREE.Mesh(
      new THREE.BoxGeometry(2.04, 1.12, 0.02),
      warmLedMat,
    );
    mirrorGlow.position.set(0, 1.82, -0.34);
    vanityGroup.add(mirrorGlow);

    const mirrorGlassMat = new THREE.MeshStandardMaterial({
      color: "#1b1d20",
      metalness: 0.96,
      roughness: 0.06,
      envMapIntensity: 1.5,
    });
    const mirrorGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.98, 1.06, 0.03),
      mirrorGlassMat,
    );
    mirrorGlass.position.set(0, 1.82, -0.32);
    vanityGroup.add(mirrorGlass);

    // 5. Three-Point + Architectural Warm Grazing Lighting
    const hemiLight = new THREE.HemisphereLight("#c9d9f0", "#221e1a", 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight("#fff7eb", 1.8);
    keyLight.position.set(-1.1, 3.05, 0.4);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.2;
      keyLight.shadow.camera.far = 10;
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const vanityWarmLight = new THREE.PointLight("#ffcb8e", 4.5, 6.5, 1.6);
    vanityWarmLight.position.set(1.55, 2.35, -1.65);
    scene.add(vanityWarmLight);

    const showerWarmLight = new THREE.PointLight("#ffd6a3", 3.6, 5.5, 1.6);
    showerWarmLight.position.set(-1.75, 2.6, -1.85);
    scene.add(showerWarmLight);

    // Subtle Rim Light for blue architectural reflection accent
    const rimLight = new THREE.DirectionalLight("#a8c7ff", 0.45);
    rimLight.position.set(3.2, 2.4, 3.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer parallax & scroll-based gentle camera transition
    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let scrollProgress = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointerTarget.x = nx;
      pointerTarget.y = ny;
      requestRender();
    };

    const handleScroll = () => {
      scrollProgress = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * 0.9)),
      );
      requestRender();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;
    let lastTime = performance.now();
    let hasShownScene = false;

    const _desiredCam = new THREE.Vector3();
    const _desiredLook = new THREE.Vector3();

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const applyMoodLighting = (dt: number) => {
      const isDay = moodRef.current === "daylight";
      keyLight.intensity = THREE.MathUtils.damp(
        keyLight.intensity,
        isDay ? 2.8 : 1.45,
        5,
        dt,
      );
      hemiLight.intensity = THREE.MathUtils.damp(
        hemiLight.intensity,
        isDay ? 1.05 : 0.45,
        5,
        dt,
      );
      vanityWarmLight.intensity = THREE.MathUtils.damp(
        vanityWarmLight.intensity,
        isDay ? 2.2 : 5.2,
        5,
        dt,
      );
      showerWarmLight.intensity = THREE.MathUtils.damp(
        showerWarmLight.intensity,
        isDay ? 1.8 : 4.2,
        5,
        dt,
      );
    };

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;
        renderDirty = false;

        pointerCurrent.x = THREE.MathUtils.damp(
          pointerCurrent.x,
          pointerTarget.x,
          4.5,
          dt,
        );
        pointerCurrent.y = THREE.MathUtils.damp(
          pointerCurrent.y,
          pointerTarget.y,
          4.5,
          dt,
        );

        applyMoodLighting(dt);

        _desiredCam.set(
          baseCamPos.x + pointerCurrent.x * 0.28 - scrollProgress * 0.42,
          baseCamPos.y - pointerCurrent.y * 0.14 - scrollProgress * 0.12,
          baseCamPos.z - scrollProgress * 0.65,
        );
        _desiredLook.set(
          baseLookTarget.x + pointerCurrent.x * 0.1,
          baseLookTarget.y - pointerCurrent.y * 0.08,
          baseLookTarget.z,
        );

        camera.position.lerp(_desiredCam, 1 - Math.exp(-6 * dt));
        camera.lookAt(_desiredLook);

        renderer.render(scene, camera);

        if (!hasShownScene) {
          hasShownScene = true;
          setSceneReady(true);
        }

        const stillSettling =
          Math.abs(pointerCurrent.x - pointerTarget.x) > 0.003 ||
          Math.abs(pointerCurrent.y - pointerTarget.y) > 0.003 ||
          camera.position.distanceTo(_desiredCam) > 0.005;

        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || stillSettling)) {
            requestRender();
          }
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    requestRenderRef.current = requestRender;
    requestRender();

    const handleResize = () => {
      if (!container || disposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setUseStaticFallback(true);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);

      basaltFloorMaps.dispose();
      basaltWallMaps.dispose();
      marbleFeatureMaps.dispose();
      envTarget.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505]">
      {/* Instant poster & mobile/reduced-motion fallback */}
      <img
        src={business.heroPosterUrl}
        alt="Luxury architectural tiled bathroom interior with large-format stone tiles and walk-in shower"
        referrerPolicy="no-referrer"
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
          sceneReady && !useStaticFallback ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* Interactive 3D Architectural Bathroom Viewport */}
      {!useStaticFallback && (
        <div
          ref={mountRef}
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
            sceneReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Contrast scrim: keeps white text perfectly readable without dulling the tiles */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#050505]/85 via-[#050505]/50 to-[#050505]/25 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/55 pointer-events-none"
      />

      {/* Subtle desktop 3D lighting mood switcher in bottom-right */}
      {!useStaticFallback && sceneReady && (
        <div className="hidden md:flex items-center gap-1 p-1 bg-[#0b0c0e]/90 border border-white/15 absolute bottom-8 right-8 z-20">
          <button
            type="button"
            onClick={() => setMood("architectural")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              mood === "architectural"
                ? "bg-white text-[#050505]"
                : "text-[#B8B8B8] hover:text-white"
            }`}
          >
            <Moon className="w-3.5 h-3.5" strokeWidth={1.75} />
            Evening Lighting
          </button>
          <button
            type="button"
            onClick={() => setMood("daylight")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              mood === "daylight"
                ? "bg-white text-[#050505]"
                : "text-[#B8B8B8] hover:text-white"
            }`}
          >
            <Sun className="w-3.5 h-3.5" strokeWidth={1.75} />
            Daylight
          </button>
        </div>
      )}
    </div>
  );
}
