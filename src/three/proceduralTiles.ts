import * as THREE from "three";

export type TilePatternStyle = "stacked-1200" | "grid-600" | "brick-900";
export type TileVeinStyle =
  | "marble"
  | "sapphire"
  | "travertine"
  | "concrete"
  | "ceramic"
  | "basalt";

export function detectSoftwareWebGL(): boolean {
  if (typeof document === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface ProceduralTileMaps {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  dispose: () => void;
}

// Memory cache so identical texture sets are reused smoothly
const textureCache = new Map<string, ProceduralTileMaps>();

export function createProceduralTileMaps(options: {
  style: TileVeinStyle;
  pattern: TilePatternStyle;
  repeatX?: number;
  repeatY?: number;
  maxAnisotropy?: number;
  size?: number;
}): ProceduralTileMaps {
  const {
    style,
    pattern,
    repeatX = 2,
    repeatY = 2,
    maxAnisotropy = 16,
    size = 2048, // 2K ultra-crisp resolution by default for retina & 4K displays
  } = options;

  const cacheKey = `${style}-${pattern}-${repeatX}-${repeatY}-${size}-${maxAnisotropy}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext("2d", { alpha: false })!;

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext("2d", { alpha: false })!;

  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext("2d", { alpha: false })!;

  const rand = seededRandom(
    style.split("").reduce((acc, c) => acc + c.charCodeAt(0), 19) * 101,
  );

  // Palette specifications per architectural stone & glass tile finish
  const palette: Record<
    TileVeinStyle,
    {
      base: string;
      mid: string;
      deep: string;
      veinMain: string;
      veinSubtle: string;
      veinGold: string;
      grout: string;
      baseRoughness: number;
      groutRoughness: number;
    }
  > = {
    marble: {
      base: "#fcfbf8", // Luminous Italian alabaster white
      mid: "#f2ece2",
      deep: "#e6decfa0",
      veinMain: "rgba(58, 54, 49, 0.72)", // Crisp high-definition charcoal-grey vein core
      veinSubtle: "rgba(118, 112, 104, 0.38)",
      veinGold: "rgba(196, 162, 112, 0.52)", // Rich Calacatta Gold warm ribbons
      grout: "#ded9cf", // Pure clean architectural grout joint
      baseRoughness: 24, // Polished mirror-like porcelain sheen
      groutRoughness: 245,
    },
    sapphire: {
      base: "#0c1d38", // Deep Mediterranean oceanic cobalt
      mid: "#143059",
      deep: "#081326",
      veinMain: "rgba(56, 189, 248, 0.65)", // Brilliant electric turquoise crystalline vein
      veinSubtle: "rgba(14, 165, 233, 0.45)",
      veinGold: "rgba(186, 230, 253, 0.55)", // Iridescent diamond pool sparkle
      grout: "#eef4fa", // Crisp contrast bright designer white grout line
      baseRoughness: 16, // High-gloss glass & polished pool tile glaze
      groutRoughness: 240,
    },
    travertine: {
      base: "#dcd0bf",
      mid: "#cfbfab",
      deep: "#bead96",
      veinMain: "rgba(132, 114, 91, 0.46)",
      veinSubtle: "rgba(164, 146, 122, 0.34)",
      veinGold: "rgba(195, 172, 140, 0.35)",
      grout: "#b8a994",
      baseRoughness: 140,
      groutRoughness: 245,
    },
    concrete: {
      base: "#8d9197",
      mid: "#7d8187",
      deep: "#6d7177",
      veinMain: "rgba(52, 55, 60, 0.32)",
      veinSubtle: "rgba(42, 45, 50, 0.22)",
      veinGold: "rgba(120, 125, 130, 0.2)",
      grout: "#585b61",
      baseRoughness: 130,
      groutRoughness: 240,
    },
    ceramic: {
      base: "#f9f9fb", // Pure Carrara Italian marble white
      mid: "#f0f0f4",
      deep: "#e2e2e8",
      veinMain: "rgba(95, 102, 112, 0.48)", // Fine smoky grey Carrara veins
      veinSubtle: "rgba(140, 145, 155, 0.28)",
      veinGold: "rgba(180, 185, 195, 0.22)",
      grout: "#e0e0e6",
      baseRoughness: 26,
      groutRoughness: 240,
    },
    basalt: {
      base: "#202328",
      mid: "#181b1e",
      deep: "#111316",
      veinMain: "rgba(72, 78, 86, 0.44)",
      veinSubtle: "rgba(88, 96, 106, 0.3)",
      veinGold: "rgba(110, 105, 95, 0.2)",
      grout: "#0c0e10",
      baseRoughness: 75,
      groutRoughness: 245,
    },
  };

  const p = palette[style];

  // 1. Base wash
  ctx.fillStyle = p.base;
  ctx.fillRect(0, 0, size, size);

  // Bump base (smooth stone field with micro-elevation)
  bCtx.fillStyle = "rgb(230, 230, 230)";
  bCtx.fillRect(0, 0, size, size);

  // Roughness base
  rCtx.fillStyle = `rgb(${p.baseRoughness}, ${p.baseRoughness}, ${p.baseRoughness})`;
  rCtx.fillRect(0, 0, size, size);

  // 2. High-resolution Geological Surface Detailing
  if (style === "marble") {
    // Pure, clean Italian alabaster base with gentle diagonal warm drift (NO circular blotches/spots)
    const diagGrad = ctx.createLinearGradient(0, 0, size, size);
    diagGrad.addColorStop(0, "#fcfbf8");
    diagGrad.addColorStop(0.3, "#f8f5ee");
    diagGrad.addColorStop(0.7, "#faf8f3");
    diagGrad.addColorStop(1, "#f5efe5");
    ctx.fillStyle = diagGrad;
    ctx.fillRect(0, 0, size, size);

    // Subtle natural directional stone mist (soft linear bands, zero circular spots)
    for (let m = 0; m < 12; m++) {
      const my = rand() * size;
      const mh = size * (0.08 + rand() * 0.16);
      const mGrad = ctx.createLinearGradient(0, my, size, my + mh);
      mGrad.addColorStop(0, "rgba(240, 235, 225, 0)");
      mGrad.addColorStop(0.5, "rgba(235, 228, 218, 0.35)");
      mGrad.addColorStop(1, "rgba(240, 235, 225, 0)");
      ctx.fillStyle = mGrad;
      ctx.fillRect(0, my, size, mh);
    }
  } else {
    const cloudCount = Math.round(size * 0.04);
    for (let i = 0; i < cloudCount; i++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const radius = size * (0.09 + rand() * 0.35);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, rand() > 0.4 ? p.mid : p.deep);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.globalAlpha = 1.0;
  }

  // 3. Material-Specific High-Resolution Architectural Surface Detailing
  if (style === "marble") {
    // Ultra-detailed organic Italian Calacatta Gold veining (Double-pass with smoky feathering)
    const numVeins = 12;
    for (let v = 0; v < numVeins; v++) {
      const isMajor = v < 3;
      let startX = rand() * size;
      let startY = rand() * (size * 0.15);
      let curX = startX;
      let curY = startY;

      const baseWidth = isMajor ? 3.0 + rand() * 2.8 : 0.9 + rand() * 1.5;

      // PASS 1: Soft translucent feathered penumbra halo around the vein
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(curX, curY);

      const segments = 36;
      const xDrift = (rand() - 0.5) * 1.9;
      const stepY = (size * 1.15) / segments;

      const pathPoints: { x: number; y: number }[] = [{ x: curX, y: curY }];
      for (let s = 0; s < segments; s++) {
        curY += stepY;
        curX += xDrift * (size / segments) + (rand() - 0.5) * (size * 0.038);
        pathPoints.push({ x: curX, y: curY });
        ctx.lineTo(curX, curY);
      }

      ctx.strokeStyle = "rgba(125, 118, 108, 0.12)";
      ctx.lineWidth = baseWidth * 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // PASS 2: Crisp, dark mineral core with golden ribbon highlights
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let s = 1; s < pathPoints.length; s++) {
        ctx.lineTo(pathPoints[s].x, pathPoints[s].y);
      }
      ctx.strokeStyle = isMajor
        ? p.veinMain
        : v % 2 === 0
          ? p.veinSubtle
          : p.veinGold;
      ctx.lineWidth = baseWidth;
      ctx.stroke();
      ctx.restore();

      // Delicate golden spider branches
      if (isMajor) {
        for (let b = 4; b < segments; b += 6) {
          if (rand() > 0.35) {
            ctx.save();
            ctx.beginPath();
            let bx = pathPoints[b].x;
            let by = pathPoints[b].y;
            ctx.moveTo(bx, by);
            const branchLen = 6 + rand() * 6;
            const angle = (rand() - 0.5) * 1.5;
            for (let step = 0; step < branchLen; step++) {
              bx += Math.cos(angle) * (size * 0.016) + (rand() - 0.5) * 8;
              by += Math.sin(angle) * (size * 0.012) + stepY * 0.3;
              ctx.lineTo(bx, by);
            }
            ctx.strokeStyle = rand() > 0.5 ? p.veinGold : p.veinSubtle;
            ctx.lineWidth = Math.max(0.8, baseWidth * 0.32);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // Bump indentation along major vein channel
      if (isMajor) {
        bCtx.save();
        bCtx.beginPath();
        bCtx.moveTo(pathPoints[0].x, pathPoints[0].y);
        for (let s = 1; s < pathPoints.length; s++) {
          bCtx.lineTo(pathPoints[s].x, pathPoints[s].y);
        }
        bCtx.strokeStyle = "rgb(212, 212, 212)";
        bCtx.lineWidth = baseWidth * 1.6;
        bCtx.stroke();
        bCtx.restore();
      }
    }

    // Microscopic quartz crystalline specks
    const fleckCount = Math.round(size * 1.4);
    for (let f = 0; f < fleckCount; f++) {
      const fx = rand() * size;
      const fy = rand() * size;
      const fRadius = 0.6 + rand() * 1.6;
      ctx.fillStyle = rand() > 0.4 ? "rgba(255, 255, 255, 0.6)" : "rgba(145, 135, 120, 0.25)";
      ctx.fillRect(fx, fy, fRadius, fRadius);
    }
  } else if (style === "sapphire") {
    // Ultra-luxurious Ocean Azure & Glazed Pool Tile Detailing
    const waveCount = 14;
    for (let w = 0; w < waveCount; w++) {
      let wx = rand() * size;
      let wy = 0;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(wx, wy);

      const segments = 28;
      const xDrift = (rand() - 0.5) * 2.2;
      const stepY = (size * 1.1) / segments;

      for (let s = 0; s < segments; s++) {
        wy += stepY;
        wx += xDrift * (size / segments) + (rand() - 0.5) * (size * 0.05);
        ctx.lineTo(wx, wy);
      }

      // Brilliant cyan & turquoise water-crystal ribbons
      ctx.strokeStyle = w % 2 === 0 ? p.veinMain : p.veinSubtle;
      ctx.lineWidth = 2.0 + rand() * 5.0;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    }

    // Sparkling crystalline silica flecks (water refraction glints)
    const sparkleCount = Math.round(size * 2.2);
    for (let sp = 0; sp < sparkleCount; sp++) {
      const sx = rand() * size;
      const sy = rand() * size;
      const sRadius = 0.8 + rand() * 2.2;
      ctx.fillStyle = rand() > 0.5 ? "rgba(255, 255, 255, 0.75)" : "rgba(186, 230, 253, 0.6)";
      ctx.fillRect(sx, sy, sRadius, sRadius);
    }
  } else if (style === "travertine") {
    // Photorealistic Travertine Strata & Pore Pockets
    const bandCount = Math.round(size * 0.09);
    for (let b = 0; b < bandCount; b++) {
      const y = rand() * size;
      const h = 2 + rand() * 16;
      ctx.fillStyle = rand() > 0.4 ? p.veinSubtle : p.veinMain;
      ctx.fillRect(0, y, size, h);
    }

    // Natural elongated porous cavities (the hallmark of honed travertine)
    const pitCount = Math.round(size * 0.6);
    for (let pit = 0; pit < pitCount; pit++) {
      const px = rand() * size;
      const py = rand() * size;
      const pw = 6 + rand() * 32;
      const ph = 1.8 + rand() * 5.0;

      ctx.fillStyle = "rgba(90, 75, 58, 0.38)";
      ctx.fillRect(px, py, pw, ph);

      bCtx.fillStyle = "rgb(155, 145, 135)";
      bCtx.fillRect(px, py, pw, ph);

      rCtx.fillStyle = "rgb(220, 220, 220)";
      rCtx.fillRect(px, py, pw, ph);
    }
  } else if (style === "basalt" || style === "concrete") {
    // High-resolution architectural aggregate flecks & mineral speckles
    const speckleCount = Math.round(size * 2.2);
    for (let sp = 0; sp < speckleCount; sp++) {
      const sx = rand() * size;
      const sy = rand() * size;
      const sSize = 0.8 + rand() * 2.5;

      const isLight = rand() > 0.6;
      ctx.fillStyle = isLight
        ? style === "basalt"
          ? "rgba(180, 190, 205, 0.24)"
          : "rgba(255, 255, 255, 0.3)"
        : style === "basalt"
          ? "rgba(0, 0, 0, 0.45)"
          : "rgba(40, 42, 46, 0.3)";
      ctx.fillRect(sx, sy, sSize, sSize);

      bCtx.fillStyle = isLight ? "rgb(240, 240, 240)" : "rgb(190, 190, 190)";
      bCtx.fillRect(sx, sy, sSize, sSize);
    }
  } else {
    // Ultra-clean honed satin ceramic stipple
    const stippleCount = Math.round(size * 1.2);
    for (let st = 0; st < stippleCount; st++) {
      const sx = rand() * size;
      const sy = rand() * size;
      ctx.fillStyle = rand() > 0.5 ? "rgba(255, 255, 255, 0.22)" : "rgba(140, 132, 120, 0.12)";
      ctx.fillRect(sx, sy, 1.4, 1.4);
    }
  }

  // 4. Precision Architectural Grout Lines with Cushion Bevel (High Specular Pops)
  const groutWidth = Math.max(5, Math.round(size * 0.0055));
  const bevelWidth = Math.round(groutWidth * 1.8);

  const drawCrispGroutLine = (x1: number, y1: number, x2: number, y2: number) => {
    // Step A: Cushion edge bevel on the bump map (creates realistic 3D tile edge highlights)
    bCtx.save();
    bCtx.strokeStyle = "rgb(180, 180, 180)";
    bCtx.lineWidth = groutWidth + bevelWidth * 2;
    bCtx.beginPath();
    bCtx.moveTo(x1, y1);
    bCtx.lineTo(x2, y2);
    bCtx.stroke();
    bCtx.restore();

    // Step B: Deep recessed grout joint (dark valley on bump map)
    bCtx.save();
    bCtx.strokeStyle = "rgb(35, 35, 35)";
    bCtx.lineWidth = groutWidth;
    bCtx.beginPath();
    bCtx.moveTo(x1, y1);
    bCtx.lineTo(x2, y2);
    bCtx.stroke();
    bCtx.restore();

    // Step C: Roughness contrast: Grout is completely matte and porous
    rCtx.save();
    rCtx.strokeStyle = `rgb(${p.groutRoughness}, ${p.groutRoughness}, ${p.groutRoughness})`;
    rCtx.lineWidth = groutWidth + 2;
    rCtx.beginPath();
    rCtx.moveTo(x1, y1);
    rCtx.lineTo(x2, y2);
    rCtx.stroke();
    rCtx.restore();

    // Step D: Color of the grout line
    ctx.save();
    ctx.strokeStyle = p.grout;
    ctx.lineWidth = groutWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Inner subtle shadow along joint edge for depth
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = Math.max(1, Math.round(groutWidth * 0.28));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  if (pattern === "stacked-1200") {
    // 2 columns x 4 rows per repeat unit (large-format 1200x600 ratio)
    const rows = 4;
    const cols = 2;
    for (let r = 0; r <= rows; r++) {
      const y = (r / rows) * size;
      drawCrispGroutLine(0, y, size, y);
    }
    for (let c = 0; c <= cols; c++) {
      const x = (c / cols) * size;
      drawCrispGroutLine(x, 0, x, size);
    }
  } else if (pattern === "grid-600") {
    // Precision 600x600 square tile grid
    const divisions = 4;
    for (let i = 0; i <= divisions; i++) {
      const pos = (i / divisions) * size;
      drawCrispGroutLine(0, pos, size, pos);
      drawCrispGroutLine(pos, 0, pos, size);
    }
  } else {
    // Architectural 900x450 staggered brick bond
    const rows = 4;
    const cols = 2;
    for (let r = 0; r < rows; r++) {
      const yTop = (r / rows) * size;
      const yBot = ((r + 1) / rows) * size;
      drawCrispGroutLine(0, yTop, size, yTop);
      const offset = r % 2 === 1 ? size / (cols * 2) : 0;
      for (let c = 0; c <= cols; c++) {
        const x = ((c / cols) * size + offset) % size;
        drawCrispGroutLine(x, yTop, x, yBot);
      }
    }
    drawCrispGroutLine(0, size, size, size);
  }

  // 5. Configure Three.js Texture Objects with Maximum Anisotropic Crispness
  const configureTex = (
    canvas: HTMLCanvasElement,
    isColor: boolean,
  ): THREE.CanvasTexture => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = Math.max(4, Math.min(16, maxAnisotropy));
    if (isColor) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    tex.needsUpdate = true;
    return tex;
  };

  const map = configureTex(colorCanvas, true);
  const bumpMap = configureTex(bumpCanvas, false);
  const roughnessMap = configureTex(roughCanvas, false);

  const tileMaps: ProceduralTileMaps = {
    map,
    bumpMap,
    roughnessMap,
    dispose: () => {
      map.dispose();
      bumpMap.dispose();
      roughnessMap.dispose();
      textureCache.delete(cacheKey);
    },
  };

  textureCache.set(cacheKey, tileMaps);
  return tileMaps;
}
