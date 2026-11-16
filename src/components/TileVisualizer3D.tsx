import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  Box,
  Home,
  RotateCcw,
  Maximize2,
  Minimize2,
  MousePointer,
  CheckCircle2,
  Bath,
  Utensils,
  Armchair,
  Trees,
} from "lucide-react";
import {
  materialFinishes,
  type MaterialFinishOption,
} from "../config/business";
import {
  createProceduralTileMaps,
  detectSoftwareWebGL,
  type ProceduralTileMaps,
} from "../three/proceduralTiles";

type ActiveSpace = "bathroom" | "kitchen" | "living" | "outdoor";

export function TileVisualizer3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedFinish, setSelectedFinish] = useState<MaterialFinishOption>(
    materialFinishes[0],
  );
  const [activeSpace, setActiveSpace] = useState<ActiveSpace>("bathroom");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const sceneControllerRef = useRef<{
    applyMaterial: (finish: MaterialFinishOption) => void;
    resetCamera: () => void;
    toggleAutoRotate: (enabled: boolean) => void;
    setSpace: (space: ActiveSpace) => void;
  } | null>(null);

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: "high-performance",
        alpha: false,
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 640;
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0c0d0f");

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Architectural wide perspective camera
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 40);
    const defaultCamPos = new THREE.Vector3(0.05, 1.72, 4.45);
    const defaultLookAt = new THREE.Vector3(0.0, 1.25, -1.8);
    camera.position.copy(defaultCamPos);

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(defaultLookAt);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 6.2;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minAzimuthAngle = -Math.PI / 3.5;
    controls.maxAzimuthAngle = Math.PI / 3.5;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.8;
    controls.update();

    const maxAniso = isSoftwareGl
      ? 2
      : Math.min(16, renderer.capabilities.getMaxAnisotropy());

    // 1. Tile Surface Textures & Materials
    let currentMaps: ProceduralTileMaps = createProceduralTileMaps({
      style: selectedFinish.veinStyle,
      pattern: "stacked-1200",
      repeatX: 3.2,
      repeatY: 2.4,
      maxAnisotropy: maxAniso,
      size: 2048,
    });

    const tileMaterial = new THREE.MeshPhysicalMaterial({
      map: currentMaps.map,
      bumpMap: currentMaps.bumpMap,
      bumpScale: 0.022,
      roughnessMap: currentMaps.roughnessMap,
      roughness: selectedFinish.roughness,
      metalness: 0.02,
      clearcoat: selectedFinish.clearcoat,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.35,
    });

    // 2. Room Shell Architecture (Back Wall, Left Wall, Right Wall, Floor, Ceiling)
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // Floor Slab (Large-Format Polished Tiled Floor)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 6.2),
      tileMaterial,
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -0.4);
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Back Wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 3.4, 0.14),
      tileMaterial,
    );
    backWall.position.set(0, 1.7, -2.4);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Left Wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 3.4, 6.2),
      tileMaterial,
    );
    leftWall.position.set(-3.55, 1.7, -0.4);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 3.4, 6.2),
      tileMaterial,
    );
    rightWall.position.set(3.55, 1.7, -0.4);
    rightWall.receiveShadow = true;
    roomGroup.add(rightWall);

    // Ceiling with Downlight Apertures
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: "#f8f7f5",
      roughness: 0.85,
    });
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 6.2),
      ceilingMat,
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.38, -0.4);
    roomGroup.add(ceiling);

    // 3. Shared Materials
    const matteBlackMetal = new THREE.MeshStandardMaterial({
      color: "#161719",
      roughness: 0.35,
      metalness: 0.85,
    });

    const ceramicWhiteMat = new THREE.MeshPhysicalMaterial({
      color: "#fcfbfa",
      roughness: 0.1,
      metalness: 0.0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    });

    const amberGlassMat = new THREE.MeshPhysicalMaterial({
      color: "#b06c28",
      roughness: 0.12,
      transmission: 0.75,
      transparent: true,
      opacity: 0.9,
      ior: 1.5,
    });

    const plantLeafMat = new THREE.MeshStandardMaterial({
      color: "#286832",
      roughness: 0.38,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const plantLeafDarkMat = new THREE.MeshStandardMaterial({
      color: "#1c4e24",
      roughness: 0.42,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    // Oak Timber Vanity Texture
    const oakVanityMat = new THREE.MeshStandardMaterial({
      color: "#8d6440",
      roughness: 0.58,
      metalness: 0.02,
    });

    // 4. Suite Zone A: Left Wall Potted Plant & Wall-Hung Toilet
    const leftZoneGroup = new THREE.Group();
    roomGroup.add(leftZoneGroup);

    // Concrete Floor Planter Pot
    const planterMat = new THREE.MeshStandardMaterial({
      color: "#b2b4b8",
      roughness: 0.75,
    });
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.18, 0.48, 24),
      planterMat,
    );
    pot.position.set(-2.4, 0.24, -1.2);
    pot.castShadow = true;
    pot.receiveShadow = true;
    leftZoneGroup.add(pot);

    // Soil
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: "#221c17", roughness: 0.95 }),
    );
    soil.position.set(-2.4, 0.47, -1.2);
    leftZoneGroup.add(soil);

    // Tropical Foliage Leaves (Radiating Fan)
    const plantGroup = new THREE.Group();
    plantGroup.position.set(-2.4, 0.47, -1.2);
    const leafCount = 14;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2 + (i % 2) * 0.2;
      const height = 0.55 + (i % 4) * 0.12;
      const leafGeo = new THREE.PlaneGeometry(0.14, height, 1, 4);
      const leafMesh = new THREE.Mesh(
        leafGeo,
        i % 2 === 0 ? plantLeafMat : plantLeafDarkMat,
      );
      leafMesh.position.set(Math.cos(angle) * 0.08, height * 0.45, Math.sin(angle) * 0.08);
      leafMesh.rotation.y = angle;
      leafMesh.rotation.x = 0.35 + (i % 3) * 0.15;
      leafMesh.rotation.z = (Math.random() - 0.5) * 0.3;
      leafMesh.castShadow = true;
      plantGroup.add(leafMesh);
    }
    leftZoneGroup.add(plantGroup);

    // Modern Wall-Hung Toilet (White Ceramic Floating Suite)
    const toiletGroup = new THREE.Group();
    toiletGroup.position.set(-1.65, 0.42, -2.05);

    const toiletBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.14, 0.32, 24),
      ceramicWhiteMat,
    );
    toiletBowl.castShadow = true;
    toiletBowl.receiveShadow = true;
    toiletGroup.add(toiletBowl);

    const toiletSeat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.205, 0.205, 0.04, 24),
      ceramicWhiteMat,
    );
    toiletSeat.position.y = 0.17;
    toiletSeat.castShadow = true;
    toiletGroup.add(toiletSeat);

    leftZoneGroup.add(toiletGroup);

    // Black Dual Flush Plate on Wall
    const flushPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.16, 0.018),
      matteBlackMetal,
    );
    flushPlate.position.set(-1.65, 0.98, -2.32);
    leftZoneGroup.add(flushPlate);

    const flushButton1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.09, 0.01),
      new THREE.MeshStandardMaterial({ color: "#282a2e", metalness: 0.9 }),
    );
    flushButton1.position.set(-1.69, 0.98, -2.31);
    leftZoneGroup.add(flushButton1);

    const flushButton2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.09, 0.01),
      new THREE.MeshStandardMaterial({ color: "#282a2e", metalness: 0.9 }),
    );
    flushButton2.position.set(-1.62, 0.98, -2.31);
    leftZoneGroup.add(flushButton2);

    // 5. Suite Zone B: Center Walk-in Shower with Recessed Niche & Black Trim
    const showerGroup = new THREE.Group();
    roomGroup.add(showerGroup);

    // Frameless Black-Framed Shower Glass Screen
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#f6faff",
      roughness: 0.02,
      metalness: 0.0,
      transmission: isSoftwareGl ? 0 : 0.94,
      transparent: true,
      opacity: isSoftwareGl ? 0.3 : 1.0,
      ior: 1.5,
      thickness: 0.03,
      clearcoat: 1,
      depthWrite: false,
    });

    const glassPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 2.38, 1.45),
      glassMat,
    );
    glassPanel.position.set(-0.35, 1.19, -1.55);
    glassPanel.renderOrder = 3;
    showerGroup.add(glassPanel);

    // Matte Black Perimeter Frame for Glass
    const glassTopFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, 0.034, 1.46),
      matteBlackMetal,
    );
    glassTopFrame.position.set(-0.35, 2.38, -1.55);
    showerGroup.add(glassTopFrame);

    const glassFrontFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, 2.38, 0.034),
      matteBlackMetal,
    );
    glassFrontFrame.position.set(-0.35, 1.19, -0.83);
    showerGroup.add(glassFrontFrame);

    // Black Shower Door Handle
    const glassHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.42, 12),
      matteBlackMetal,
    );
    glassHandle.position.set(-0.33, 1.15, -0.92);
    showerGroup.add(glassHandle);

    // Overhead Rain Shower Head & Dropper Arm
    const showerArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.45, 16),
      matteBlackMetal,
    );
    showerArm.position.set(0.45, 2.85, -2.1);
    showerGroup.add(showerArm);

    const showerHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.022, 0.28),
      matteBlackMetal,
    );
    showerHead.position.set(0.45, 2.62, -2.1);
    showerHead.castShadow = true;
    showerGroup.add(showerHead);

    // Wall Mixer Tap in Shower
    const showerMixerPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.16, 0.02),
      matteBlackMetal,
    );
    showerMixerPlate.position.set(0.25, 1.15, -2.32);
    showerGroup.add(showerMixerPlate);

    const showerMixerLever = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.08, 12),
      matteBlackMetal,
    );
    showerMixerLever.rotation.x = Math.PI / 2;
    showerMixerLever.position.set(0.25, 1.18, -2.29);
    showerGroup.add(showerMixerLever);

    // Recessed Illuminated Shower Wall Niche
    const nicheGroup = new THREE.Group();
    nicheGroup.position.set(0.45, 1.55, -2.32);

    // Niche Frame & Inner Back Box
    const nicheFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.46, 0.08),
      matteBlackMetal,
    );
    nicheGroup.add(nicheFrame);

    const nicheBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.98, 0.39, 0.03),
      tileMaterial,
    );
    nicheBack.position.set(0, 0, 0.025);
    nicheGroup.add(nicheBack);

    // Warm LED Strip at top of niche
    const nicheLed = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.018, 0.02),
      new THREE.MeshBasicMaterial({ color: "#ffe1b3" }),
    );
    nicheLed.position.set(0, 0.18, 0.025);
    nicheGroup.add(nicheLed);

    // Niche Light
    const nichePointLight = new THREE.PointLight("#ffca85", 3.8, 2.2, 1.8);
    nichePointLight.position.set(0.45, 1.68, -2.22);
    scene.add(nichePointLight);

    // Amber Bottles inside Niche
    const b1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.14, 16),
      amberGlassMat,
    );
    b1.position.set(-0.25, -0.1, 0.03);
    nicheGroup.add(b1);

    const b2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.12, 16),
      amberGlassMat,
    );
    b2.position.set(-0.16, -0.11, 0.03);
    nicheGroup.add(b2);

    // Trailing Hanging Plant inside Niche
    const nichePlantPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.035, 0.08, 16),
      planterMat,
    );
    nichePlantPot.position.set(0.32, -0.12, 0.03);
    nicheGroup.add(nichePlantPot);

    // Trailing Vine Leaves cascading down
    for (let v = 0; v < 8; v++) {
      const vineLeaf = new THREE.Mesh(
        new THREE.PlaneGeometry(0.055, 0.12),
        plantLeafMat,
      );
      vineLeaf.position.set(0.32 + (v % 3 - 1) * 0.035, -0.14 - v * 0.028, 0.045);
      vineLeaf.rotation.z = (Math.random() - 0.5) * 0.5;
      nicheGroup.add(vineLeaf);
    }

    showerGroup.add(nicheGroup);

    // 6. Suite Zone C: Right Floating Oak Vanity & Round Backlit Mirror
    const vanityGroup = new THREE.Group();
    vanityGroup.position.set(1.72, 0.72, -1.95);

    // Floating Oak Vanity Cabinet
    const vanityCabinet = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.44, 0.52),
      oakVanityMat,
    );
    vanityCabinet.castShadow = true;
    vanityCabinet.receiveShadow = true;
    vanityGroup.add(vanityCabinet);

    // Central Drawer Seam Line
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.42, 0.01),
      matteBlackMetal,
    );
    seam.position.set(0, 0, 0.262);
    vanityGroup.add(seam);

    // Rectangular White Ceramic Vessel Basin
    const vesselSink = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.13, 0.38),
      ceramicWhiteMat,
    );
    vesselSink.position.set(0.0, 0.28, 0.02);
    vesselSink.castShadow = true;
    vanityGroup.add(vesselSink);

    // Matte Black Tall Basin Mixer Tap
    const basinTap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.28, 16),
      matteBlackMetal,
    );
    basinTap.position.set(0.0, 0.44, -0.18);
    basinTap.castShadow = true;
    vanityGroup.add(basinTap);

    const tapSpout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.14, 12),
      matteBlackMetal,
    );
    tapSpout.rotation.x = Math.PI / 2.3;
    tapSpout.position.set(0.0, 0.54, -0.12);
    vanityGroup.add(tapSpout);

    // Countertop Decor: Small potted plant on vanity
    const vanityPot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.04, 0.09, 16),
      ceramicWhiteMat,
    );
    vanityPot.position.set(-0.52, 0.26, 0.02);
    vanityGroup.add(vanityPot);

    for (let p = 0; p < 7; p++) {
      const vLeaf = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, 0.16),
        plantLeafMat,
      );
      const pAngle = (p / 7) * Math.PI * 2;
      vLeaf.position.set(-0.52 + Math.cos(pAngle) * 0.02, 0.35, 0.02 + Math.sin(pAngle) * 0.02);
      vLeaf.rotation.y = pAngle;
      vLeaf.rotation.x = 0.4;
      vanityGroup.add(vLeaf);
    }

    // Countertop Amber Pump Bottles
    const vBottle1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.12, 16),
      amberGlassMat,
    );
    vBottle1.position.set(0.48, 0.28, 0.04);
    vanityGroup.add(vBottle1);

    const vBottle2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.10, 16),
      amberGlassMat,
    );
    vBottle2.position.set(0.56, 0.27, 0.02);
    vanityGroup.add(vBottle2);

    roomGroup.add(vanityGroup);

    // Round Backlit Circular LED Mirror
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(1.72, 1.76, -2.32);

    // Glowing Halo Backplate
    const haloPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 0.015, 48),
      new THREE.MeshBasicMaterial({ color: "#ffe7c2" }),
    );
    haloPlate.rotation.x = Math.PI / 2;
    mirrorGroup.add(haloPlate);

    // Mirror Frame Ring (Matte Black Trim)
    const mirrorRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.66, 0.014, 16, 48),
      matteBlackMetal,
    );
    mirrorRing.position.z = 0.018;
    mirrorGroup.add(mirrorRing);

    // Reflective Mirror Glass
    const mirrorGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.01, 48),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.02,
        metalness: 0.98,
        envMapIntensity: 1.4,
      }),
    );
    mirrorGlass.rotation.x = Math.PI / 2;
    mirrorGlass.position.z = 0.015;
    mirrorGroup.add(mirrorGlass);

    // Mirror Halo Glow Point Light (Radiating circular light cone against the marble wall!)
    const mirrorHaloLight = new THREE.PointLight("#ffda9e", 4.2, 3.2, 1.6);
    mirrorHaloLight.position.set(1.72, 1.76, -2.26);
    scene.add(mirrorHaloLight);

    roomGroup.add(mirrorGroup);

    // Matte Black Towel Rail on Right Wall with Folded Dark Towel
    const towelRailGroup = new THREE.Group();
    towelRailGroup.position.set(3.46, 1.72, -1.2);

    const railBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.55, 16),
      matteBlackMetal,
    );
    railBar.rotation.x = Math.PI / 2;
    towelRailGroup.add(railBar);

    // Stand-offs
    const standoff1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.08, 12),
      matteBlackMetal,
    );
    standoff1.rotation.z = Math.PI / 2;
    standoff1.position.set(-0.04, 0, -0.22);
    towelRailGroup.add(standoff1);

    const standoff2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.08, 12),
      matteBlackMetal,
    );
    standoff2.rotation.z = Math.PI / 2;
    standoff2.position.set(-0.04, 0, 0.22);
    towelRailGroup.add(standoff2);

    // Folded Fabric Dark Towel
    const towelMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.72, 0.36),
      new THREE.MeshStandardMaterial({ color: "#45484e", roughness: 0.95 }),
    );
    towelMesh.position.set(-0.02, -0.32, 0);
    towelRailGroup.add(towelMesh);

    roomGroup.add(towelRailGroup);

    // 7. Architectural Downlights / Spotlights Rig (Cones of Warm Light on Walls)
    const downlightsGroup = new THREE.Group();
    scene.add(downlightsGroup);

    const downlightPositions = [
      -2.0,  // Above plant & toilet
      -0.65, // Above shower entry
      0.45,  // Above shower niche
      1.72,  // Above vanity & mirror
    ];

    downlightPositions.forEach((xPos) => {
      // Downlight Bezel in Ceiling
      const bezel = new THREE.Mesh(
        new THREE.RingGeometry(0.035, 0.065, 24),
        new THREE.MeshBasicMaterial({ color: "#ffffff", side: THREE.DoubleSide }),
      );
      bezel.rotation.x = Math.PI / 2;
      bezel.position.set(xPos, 3.37, -1.8);
      downlightsGroup.add(bezel);

      // Warm Downlight Spotlight pointing down against the wall
      const spot = new THREE.SpotLight("#fff4e3", 4.8);
      spot.position.set(xPos, 3.32, -1.75);
      spot.target.position.set(xPos, 0.8, -2.38);
      spot.angle = 0.65;
      spot.penumbra = 0.68;
      spot.decay = 1.6;
      spot.distance = 5.2;
      spot.castShadow = !isSoftwareGl;
      if (!isSoftwareGl) {
        spot.shadow.mapSize.width = 512;
        spot.shadow.mapSize.height = 512;
        spot.shadow.bias = -0.0005;
      }
      scene.add(spot);
      scene.add(spot.target);
    });

    // Ambient & Studio Key Fill
    const hemiLight = new THREE.HemisphereLight("#ffffff", "#282420", 0.75);
    scene.add(hemiLight);

    const mainKeyLight = new THREE.DirectionalLight("#fff9f0", 1.8);
    mainKeyLight.position.set(1.5, 3.6, 2.8);
    mainKeyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      mainKeyLight.shadow.mapSize.width = 1024;
      mainKeyLight.shadow.mapSize.height = 1024;
      mainKeyLight.shadow.bias = -0.0005;
    }
    scene.add(mainKeyLight);

    // Warm Grazing Light
    const warmGraze = new THREE.PointLight("#ffe0b8", 3.2, 5.5, 1.8);
    warmGraze.position.set(0, 2.6, -1.2);
    scene.add(warmGraze);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 8. Render & Animation Loop
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;
    let lastTime = performance.now();

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

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (!disposed && (renderDirty || controls.autoRotate)) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    controls.addEventListener("change", requestRender);

    // Controller exposed to React state
    sceneControllerRef.current = {
      applyMaterial: (finish) => {
        const nextMaps = createProceduralTileMaps({
          style: finish.veinStyle,
          pattern: "stacked-1200",
          repeatX: 3.2,
          repeatY: 2.4,
          maxAnisotropy: maxAniso,
          size: 2048,
        });
        const oldMaps = currentMaps;
        currentMaps = nextMaps;
        tileMaterial.map = nextMaps.map;
        tileMaterial.bumpMap = nextMaps.bumpMap;
        tileMaterial.roughnessMap = nextMaps.roughnessMap;
        tileMaterial.roughness = finish.roughness;
        tileMaterial.clearcoat = finish.clearcoat;
        tileMaterial.needsUpdate = true;
        oldMaps.dispose();
        requestRender();
      },
      resetCamera: () => {
        camera.position.copy(defaultCamPos);
        controls.target.copy(defaultLookAt);
        controls.update();
        requestRender();
      },
      toggleAutoRotate: (enabled) => {
        controls.autoRotate = enabled;
        if (enabled) requestRender();
      },
      setSpace: (space) => {
        // Adjust camera target slightly for chosen architectural vignette
        if (space === "bathroom") {
          camera.position.set(0.05, 1.72, 4.45);
          controls.target.set(0.0, 1.25, -1.8);
        } else if (space === "kitchen") {
          camera.position.set(0.85, 1.55, 3.8);
          controls.target.set(0.45, 1.1, -1.9);
        } else if (space === "living") {
          camera.position.set(-0.95, 1.65, 4.2);
          controls.target.set(-0.5, 1.15, -1.8);
        } else {
          camera.position.set(0.0, 2.1, 4.5);
          controls.target.set(0.0, 0.4, -1.2);
        }
        controls.update();
        requestRender();
      },
    };

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

    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      currentMaps.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  // Update material when user selects a finish
  useEffect(() => {
    sceneControllerRef.current?.applyMaterial(selectedFinish);
  }, [selectedFinish]);

  // Update space when user toggles room pill
  useEffect(() => {
    sceneControllerRef.current?.setSpace(activeSpace);
  }, [activeSpace]);

  // Toggle auto rotate
  const handleToggleAutoRotate = () => {
    setAutoRotate((prev) => {
      const next = !prev;
      sceneControllerRef.current?.toggleAutoRotate(next);
      return next;
    });
  };

  const handleResetCamera = () => {
    sceneControllerRef.current?.resetCamera();
  };

  return (
    <section
      id="finish-studio"
      className="bg-[#050505] text-white py-14 lg:py-20 border-t border-white/10"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header matching reference layout */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            {/* Monogram A1 Logo & Tagline */}
            <div className="flex items-center gap-3 mb-3">
              <div className="px-2 py-0.5 border border-white text-xs font-mono font-bold tracking-widest text-white">
                A1
              </div>
              <span className="font-mono text-[11px] tracking-[0.25em] text-[#B8B8B8] uppercase">
                QUALITY · PRECISION · STYLE
              </span>
            </div>

            {/* Neon Green Accent Line */}
            <div className="w-16 h-[2px] bg-[#65FF00] mb-3" />

            <p className="font-mono text-xs tracking-[0.22em] text-[#B8B8B8] uppercase mb-2">
              TILING SOLUTIONS FOR MODERN LIVING
            </p>

            {/* Big Bold Headline with Neon Green Accent */}
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase leading-none">
              THE ART OF THE <span className="text-[#65FF00]">FINISH</span>
            </h2>
          </div>

          {/* Top-Right 3D Cube Icon & Architectural Description */}
          <div className="flex items-start gap-4 max-w-md lg:text-left bg-white/[0.03] border border-white/10 p-4 rounded-sm">
            <Box className="w-8 h-8 text-[#65FF00] shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-xs sm:text-[13px] text-[#D4D4D4] leading-relaxed">
              Large-format tile aesthetics in a refined space. Drag to orbit and inspect the details.
            </p>
          </div>
        </div>

        {/* 3D Viewport Container matching reference layout */}
        <div
          ref={containerRef}
          className={`relative w-full bg-[#0a0b0d] border border-white/15 overflow-hidden transition-all duration-300 ${
            isFullscreen
              ? "fixed inset-0 z-50 h-screen w-screen border-none"
              : "h-[560px] sm:h-[640px] lg:h-[720px] rounded-sm"
          }`}
        >
          {/* 3D WebGL Canvas Mount */}
          {!webglError ? (
            <div
              ref={mountRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              aria-label="Interactive 3D architectural bathroom tiling studio"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#111214]">
              <div
                className="w-24 h-24 border border-white/20 mb-4"
                style={{ backgroundColor: selectedFinish.accentHex }}
              />
              <p className="font-display text-lg text-white mb-1">
                {selectedFinish.name}
              </p>
              <p className="text-sm text-[#B8B8B8] max-w-md">
                {selectedFinish.notes}
              </p>
            </div>
          )}

          {/* Top-Left Viewport Pill: Drag to orbit · Scroll to zoom */}
          <div className="pointer-events-none absolute top-4 left-4 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121316]/90 border border-white/15 text-xs text-[#E5E5E5] shadow-lg backdrop-blur-sm">
            <MousePointer className="w-3.5 h-3.5 text-[#65FF00]" />
            <span className="font-medium text-[11px] tracking-wide">
              Drag to orbit · Scroll to zoom
            </span>
          </div>

          {/* Left Floating Action Dock (Home, Auto-Rotate, Fullscreen) */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleResetCamera}
              title="Reset View"
              aria-label="Reset View"
              className="w-10 h-10 rounded-full bg-[#121316]/90 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToggleAutoRotate}
              title={autoRotate ? "Pause Turntable" : "Turntable 360°"}
              aria-label="Toggle Turntable Rotation"
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-md active:scale-95 ${
                autoRotate
                  ? "bg-[#65FF00] text-black border-[#65FF00]"
                  : "bg-[#121316]/90 hover:bg-white hover:text-black border-white/20 text-white"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              aria-label="Toggle Fullscreen"
              className="w-10 h-10 rounded-full bg-[#121316]/90 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center text-white transition-all shadow-md active:scale-95"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Bottom Center Space Switcher Pill matching reference */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center p-1 rounded-full bg-[#14161a]/95 border border-white/20 shadow-2xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveSpace("bathroom")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeSpace === "bathroom"
                  ? "bg-[#1f2329] text-white border border-[#65FF00]/60 shadow-sm"
                  : "text-[#B0B4BC] hover:text-white"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activeSpace === "bathroom" ? "bg-[#65FF00] shadow-[0_0_8px_#65FF00]" : "bg-white/30"
                }`}
              />
              <Bath className="w-3.5 h-3.5" />
              Bathroom
            </button>

            <span className="text-white/20 px-1" aria-hidden="true">|</span>

            <button
              type="button"
              onClick={() => setActiveSpace("kitchen")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                activeSpace === "kitchen"
                  ? "bg-[#1f2329] text-white border border-[#65FF00]/60"
                  : "text-[#B0B4BC] hover:text-white"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Kitchen
            </button>

            <span className="text-white/20 px-1" aria-hidden="true">|</span>

            <button
              type="button"
              onClick={() => setActiveSpace("living")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                activeSpace === "living"
                  ? "bg-[#1f2329] text-white border border-[#65FF00]/60"
                  : "text-[#B0B4BC] hover:text-white"
              }`}
            >
              <Armchair className="w-3.5 h-3.5" />
              Living Area
            </button>

            <span className="text-white/20 px-1" aria-hidden="true">|</span>

            <button
              type="button"
              onClick={() => setActiveSpace("outdoor")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                activeSpace === "outdoor"
                  ? "bg-[#1f2329] text-white border border-[#65FF00]/60"
                  : "text-[#B0B4BC] hover:text-white"
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              Outdoor
            </button>
          </div>

          {/* Right Floating Material Selection Cards (Exact reference design) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5 max-w-[190px] w-full">
            {materialFinishes.map((finish) => {
              const active = finish.id === selectedFinish.id;
              return (
                <button
                  key={finish.id}
                  type="button"
                  onClick={() => setSelectedFinish(finish)}
                  className={`group w-full flex items-center justify-between p-2 rounded-lg border transition-all text-left shadow-lg backdrop-blur-md ${
                    active
                      ? "bg-[#1a1d22]/95 border-[#65FF00] shadow-[0_0_15px_rgba(101,255,0,0.18)]"
                      : "bg-[#14161a]/85 border-white/15 hover:border-white/40 hover:bg-[#1a1d22]/95"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Realistic Texture Swatch Preview Thumbnail */}
                    <div
                      className="w-8 h-8 rounded-md shrink-0 border border-white/20 shadow-inner flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: finish.accentHex,
                        backgroundImage:
                          finish.veinStyle === "marble"
                            ? "radial-gradient(circle, #f8f6f0 20%, #d8d2c6 100%)"
                            : finish.veinStyle === "concrete"
                              ? "radial-gradient(circle, #a4abb3 20%, #686c73 100%)"
                              : finish.veinStyle === "travertine"
                                ? "radial-gradient(circle, #dccfbe 20%, #9e917d 100%)"
                                : finish.veinStyle === "ceramic"
                                  ? "radial-gradient(circle, #ffffff 20%, #d0d2d8 100%)"
                                  : "radial-gradient(circle, #383b42 20%, #151619 100%)",
                      }}
                    >
                      <span className="sr-only">{finish.name} swatch</span>
                    </div>

                    <span
                      className={`text-xs font-semibold tracking-wide truncate ${
                        active ? "text-white" : "text-[#D0D4DC] group-hover:text-white"
                      }`}
                    >
                      {finish.name}
                    </span>
                  </div>

                  {/* Green Checkmark Badge when active */}
                  {active && (
                    <CheckCircle2
                      className="w-4 h-4 text-[#65FF00] shrink-0 ml-1.5"
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Architectural Details Footnote Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#8A8F99] px-2 font-mono">
          <p>
            ACTIVE MATERIAL: <span className="text-white font-semibold">{selectedFinish.name.toUpperCase()}</span> &nbsp;|&nbsp; {selectedFinish.tone.toUpperCase()}
          </p>
          <p>
            PREMIUM LARGE-FORMAT PORCELAIN &bull; RECESSED DOWNLIGHT CONES &bull; BACKLIT LED SUITE
          </p>
        </div>
      </div>
    </section>
  );
}
