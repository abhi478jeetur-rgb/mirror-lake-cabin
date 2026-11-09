import { box, cylinder, cone, sphere } from './geometry.js';

const R = Math.PI / 180;

/** The log cabin, porch, dock, rowboat, campfire, woodpile and lanterns for the Mirror Lake world. */
export function buildCabin({ add, material, terrainHeight: ground, random, createFlagPart, parts }) {
  const log = cylinder(14, 0.08, 2);
  const beam = box(0.04, 2);
  const slab = box(0.02, 1);
  const ball = sphere(14, 10);
  const pebble = sphere(10, 7);
  const flameMesh = cone(0, 1, 12);

  const logWood = [material('wood', [0.31, 0.17, 0.07], 0.82), material('wood', [0.36, 0.2, 0.085], 0.85), material('wood', [0.27, 0.15, 0.06], 0.8)];
  const darkWood = material('wood', [0.12, 0.065, 0.03], 0.75);
  const plankWood = [material('wood', [0.38, 0.24, 0.12], 0.78), material('wood', [0.33, 0.2, 0.1], 0.8), material('wood', [0.42, 0.28, 0.15], 0.82)];
  const weathered = material('wood', [0.26, 0.22, 0.18], 0.9);
  const roofMat = [material('rock', [0.09, 0.1, 0.11], 0.7), material('rock', [0.12, 0.12, 0.13], 0.72), material('rock', [0.075, 0.08, 0.09], 0.68)];
  const stone = [material('rock', [0.3, 0.29, 0.27], 0.92), material('rock', [0.22, 0.22, 0.21], 0.9), material('rock', [0.38, 0.36, 0.32], 0.95)];
  const iron = material('metal', [0.06, 0.06, 0.065], 0.4, 0.85);
  const brass = material('metal', [0.55, 0.38, 0.12], 0.3, 0.9);
  const glass = { tag: 'glass', color: [1, 0.62, 0.26], emissiveColor: [1, 0.55, 0.2], emission: 2.6, roughness: 0.2, metallic: 0 };
  const lampGlow = { tag: 'glass', color: [1, 0.7, 0.32], emissiveColor: [1, 0.62, 0.25], emission: 7, roughness: 0.2, metallic: 0 };
  const fireOuter = { tag: 'fire', color: [1, 0.32, 0.05], emissiveColor: [1, 0.3, 0.04], emission: 9, roughness: 1, metallic: 0 };
  const fireInner = { tag: 'fire', color: [1, 0.8, 0.3], emissiveColor: [1, 0.78, 0.32], emission: 14, roughness: 1, metallic: 0 };
  const ember = { tag: 'fire', color: [0.9, 0.18, 0.03], emissiveColor: [1, 0.2, 0.02], emission: 4, roughness: 1, metallic: 0 };
  const boatPaint = material('wood', [0.45, 0.06, 0.04], 0.55);
  const boatInside = material('wood', [0.36, 0.23, 0.12], 0.8);
  const cloth = material('cloth', [0.55, 0.47, 0.32], 0.95);
  const rope = material('cloth', [0.5, 0.42, 0.28], 0.95);

  const cx = -19, cz = -5;
  const W = 5.6, D = 7.4;
  const g = ground(cx, cz);
  const base = g + 0.45;
  const courses = 11, pitch = 0.27, logR = 0.155;
  const wallTop = base + courses * pitch;
  const P = (x, y, z) => [cx + x, y, cz + z];

  // Stone foundation
  for (let i = 0; i < 26; i++) {
    const t = i / 26;
    const perimeter = 2 * (W + D);
    let d = t * perimeter, x, z;
    if (d < W) { x = -W / 2 + d; z = -D / 2; } else if ((d -= W) < D) { x = W / 2; z = -D / 2 + d; } else if ((d -= D) < W) { x = W / 2 - d; z = D / 2; } else { d -= W; x = -W / 2; z = D / 2 - d; }
    const s = 0.42 + random() * 0.2;
    add(`Foundation stone ${i}`, pebble, P(x, g + 0.22, z), [s, 0.3, s * 0.9], stone[i % 3], [0, random() * 6, 0]);
  }
  add('Foundation slab', beam, P(0, g + 0.2, 0), [W, 0.42, D], stone[1]);

  // Interlocking log walls: front/back walls run along z, side walls along x.
  for (let c = 0; c < courses; c++) {
    const y = base + logR + c * pitch;
    for (const side of [-1, 1]) {
      add(`Side wall log ${c} ${side}`, log, P(0, y + (c % 2 ? 0 : pitch / 2), side * D / 2), [logR, W + 0.7, logR], logWood[(c + (side > 0 ? 1 : 0)) % 3], [0, 0, 90 * R]);
      add(`End wall log ${c} ${side}`, log, P(side * W / 2, y + (c % 2 ? pitch / 2 : 0), 0), [logR, D + 0.7, logR], logWood[(c + 2) % 3], [90 * R, 0, 0]);
    }
  }
  // Gable logs and roof
  const roofAngle = 34 * R;
  const roofHalf = D / 2 + 0.65;
  const rise = Math.tan(roofAngle) * (D / 2);
  for (let k = 0; k * pitch < rise - 0.1; k++) {
    const h = (k + 0.5) * pitch;
    const half = (D / 2) * (1 - h / rise) - 0.05;
    if (half < 0.25) break;
    for (const side of [-1, 1]) add(`Gable log ${k} ${side}`, log, P(side * W / 2, wallTop + h, 0), [logR * 0.95, half * 2, logR * 0.95], logWood[k % 3], [90 * R, 0, 0]);
  }
  const roofLen = roofHalf / Math.cos(roofAngle);
  const roofW = W + 1.4;
  for (const side of [-1, 1]) {
    const angle = side * roofAngle;
    const dirY = -Math.sin(roofAngle), dirZ = side * Math.cos(roofAngle);
    const ridgeY = wallTop + rise + 0.22;
    add(`Roof deck ${side}`, slab, P(0.2, ridgeY + dirY * roofLen / 2, dirZ * roofLen / 2), [roofW, 0.14, roofLen], darkWood, [angle, 0, 0]);
    const rows = 11;
    for (let r = 0; r < rows; r++) {
      const along = (r + 0.5) * roofLen / rows;
      const y = ridgeY + dirY * along + 0.1 + Math.cos(roofAngle) * 0.03 * (r % 2);
      add(`Shingle row ${r} ${side}`, slab, P(0.2 + (r % 2 ? 0.08 : -0.08), y, dirZ * along), [roofW + 0.05, 0.07, roofLen / rows * 1.15], roofMat[(r + (side > 0 ? 1 : 0)) % 3], [angle + side * 3 * R, 0, 0]);
    }
    add(`Fascia ${side}`, beam, P(0.2, ridgeY + dirY * roofLen - 0.05, dirZ * roofLen), [roofW, 0.2, 0.08], darkWood, [angle, 0, 0]);
  }
  add('Ridge beam', log, P(0.2, wallTop + rise + 0.32, 0), [0.17, roofW + 0.1, 0.17], darkWood, [0, 0, 90 * R]);

  // Chimney
  const chimneyTop = wallTop + rise + 1.2;
  for (let i = 0; i * 0.32 < chimneyTop - g; i++) {
    add(`Chimney course ${i}`, beam, P(-W / 2 - 0.45 + (i % 2 ? 0.03 : -0.03), g + 0.16 + i * 0.32, 1.9), [0.95, 0.33, 1.05], stone[i % 3]);
  }
  add('Chimney cap', beam, P(-W / 2 - 0.45, chimneyTop + 0.12, 1.9), [1.15, 0.12, 1.25], stone[1]);
  add('Chimney flue', beam, P(-W / 2 - 0.45, chimneyTop + 0.25, 1.9), [0.5, 0.2, 0.5], { ...ember, emission: 1.5 });

  // Front (lake-facing) wall: door and two windows
  const fx = W / 2 + logR + 0.03;
  add('Door', beam, P(fx, base + 1.05, 0), [0.1, 2.1, 1.05], darkWood);
  for (let b = 0; b < 4; b++) add(`Door board ${b}`, beam, P(fx + 0.06, base + 1.05, -0.39 + b * 0.26), [0.03, 2.0, 0.22], plankWood[b % 3]);
  add('Door brace', beam, P(fx + 0.09, base + 1.05, 0), [0.03, 0.14, 1.25], darkWood, [55 * R, 0, 0]);
  add('Door handle', ball, P(fx + 0.14, base + 1.0, 0.36), [0.06, 0.06, 0.06], brass);
  add('Door frame top', beam, P(fx + 0.02, base + 2.18, 0), [0.16, 0.16, 1.3], darkWood);
  for (const s of [-1, 1]) add(`Door frame ${s}`, beam, P(fx + 0.02, base + 1.05, s * 0.62), [0.16, 2.2, 0.14], darkWood);

  function windowAt(x, z, facing, name, width = 1.0, height = 1.05) {
    // facing: 'x' (wall normal +x/-x) or 'z'
    const sx = facing === 'x' ? 0.08 : width, sz = facing === 'x' ? width : 0.08;
    const off = (v) => (facing === 'x' ? [x + v * Math.sign(x), 0, z] : [x, 0, z + v * Math.sign(z)]);
    const y = base + 1.65;
    const [gx, , gz] = off(0.02);
    add(`${name} glass`, beam, P(gx, y, gz), [sx, height, sz], glass);
    const [fxx, , fzz] = off(0.07);
    add(`${name} sill`, beam, P(fxx, y - height / 2 - 0.07, fzz), facing === 'x' ? [0.26, 0.1, width + 0.35] : [width + 0.35, 0.1, 0.26], darkWood);
    add(`${name} lintel`, beam, P(fxx, y + height / 2 + 0.07, fzz), facing === 'x' ? [0.18, 0.12, width + 0.25] : [width + 0.25, 0.12, 0.18], darkWood);
    for (const s of [-1, 1]) {
      const p = facing === 'x' ? [fxx, y, fzz + s * (width / 2 + 0.05)] : [fxx + s * (width / 2 + 0.05), y, fzz];
      add(`${name} jamb ${s}`, beam, P(...p), facing === 'x' ? [0.16, height + 0.1, 0.1] : [0.1, height + 0.1, 0.16], darkWood);
      const sp = facing === 'x' ? [fxx + 0.02 * Math.sign(x), y, fzz + s * (width / 2 + 0.38)] : [fxx + s * (width / 2 + 0.38), y, fzz + 0.02 * Math.sign(z)];
      add(`${name} shutter ${s}`, beam, P(...sp), facing === 'x' ? [0.06, height + 0.05, 0.55] : [0.55, height + 0.05, 0.06], material('wood', [0.08, 0.2, 0.15], 0.7));
    }
    const [mx, , mz] = off(0.06);
    add(`${name} mullion v`, beam, P(mx, y, mz), facing === 'x' ? [0.05, height, 0.06] : [0.06, height, 0.05], darkWood);
    add(`${name} mullion h`, beam, P(mx, y, mz), facing === 'x' ? [0.05, 0.06, width] : [width, 0.06, 0.05], darkWood);
    const [bx, , bz] = off(0.2);
    add(`${name} flower box`, beam, P(bx, y - height / 2 - 0.26, bz), facing === 'x' ? [0.3, 0.26, width + 0.1] : [width + 0.1, 0.26, 0.3], plankWood[0]);
    for (let f = 0; f < 6; f++) {
      const t = (f + 0.5) / 6 - 0.5;
      const fp = facing === 'x' ? [bx, y - height / 2 - 0.08, bz + t * width] : [bx + t * width, y - height / 2 - 0.08, bz];
      add(`${name} flower ${f}`, ball, P(...fp), [0.1, 0.09, 0.1], f % 2 ? material('foliage', [0.75, 0.12, 0.1]) : material('foliage', [0.12, 0.3, 0.05]));
    }
  }
  windowAt(fx, -2.1, 'x', 'Front window left');
  windowAt(fx, 2.1, 'x', 'Front window right');
  windowAt(-0.6, D / 2 + logR + 0.03, 'z', 'Side window', 1.3);
  windowAt(1.2, -(D / 2 + logR + 0.03), 'z', 'Back window', 0.9);
  windowAt(-W / 2 - logR - 0.03, -1.6, 'x', 'Rear window', 0.8);
  // Small gable window
  add('Gable window', beam, P(fx - 0.02, wallTop + 0.75, 0), [0.08, 0.7, 0.7], glass);
  add('Gable window frame', beam, P(fx, wallTop + 0.75, 0), [0.1, 0.86, 0.86], darkWood);
  add('Gable window glass front', beam, P(fx + 0.03, wallTop + 0.75, 0), [0.06, 0.62, 0.62], glass);

  // Porch
  const porchDepth = 2.6;
  const px0 = W / 2 + 0.2;
  for (let p = 0; p < 15; p++) {
    const z = -D / 2 - 0.3 + (p + 0.5) * (D + 0.6) / 15;
    add(`Porch plank ${p}`, beam, P(px0 + porchDepth / 2, base - 0.05, z), [porchDepth, 0.09, (D + 0.6) / 15 * 0.92], plankWood[p % 3]);
  }
  add('Porch joist', beam, P(px0 + porchDepth / 2, base - 0.22, 0), [porchDepth, 0.22, D + 0.5], darkWood);
  for (let s = 0; s < 3; s++) add(`Porch step ${s}`, beam, P(px0 + porchDepth + 0.25 + s * 0.35, base - 0.2 - s * 0.17, 0), [0.4, 0.12, 1.6], plankWood[(s + 1) % 3]);
  const postX = px0 + porchDepth - 0.15;
  const porchRoofLow = wallTop - 0.55;
  for (const z of [-D / 2 - 0.1, -1.2, 1.2, D / 2 + 0.1]) {
    add(`Porch post ${z}`, log, P(postX, (base + porchRoofLow) / 2, z), [0.13, porchRoofLow - base, 0.13], logWood[1]);
    add(`Porch post base ${z}`, beam, P(postX, base + 0.06, z), [0.32, 0.12, 0.32], darkWood);
  }
  for (const s of [-1, 1]) {
    add(`Porch rail ${s}`, beam, P(postX, base + 0.85, s * (D / 2 + 1.2) / 2 + s * 0.15), [0.1, 0.1, (D / 2 - 1.2) + 0.1], logWood[0]);
    for (let b = 0; b < 6; b++) add(`Baluster ${s} ${b}`, beam, P(postX, base + 0.43, s * (1.35 + b * (D / 2 - 1.3) / 6)), [0.06, 0.8, 0.06], logWood[2]);
  }
  const porchSlope = Math.atan2(wallTop - porchRoofLow, porchDepth + 0.4);
  const porchLen = (porchDepth + 0.6) / Math.cos(porchSlope);
  add('Porch roof', slab, P(px0 + (porchDepth + 0.4) / 2, (wallTop + porchRoofLow) / 2 + 0.12, 0), [porchLen, 0.12, D + 1.2], roofMat[1], [0, 0, -porchSlope]);
  for (let r = 0; r < 6; r++) {
    const t = (r + 0.5) / 6;
    add(`Porch shingles ${r}`, slab, P(px0 - 0.1 + t * (porchDepth + 0.6), wallTop - t * (wallTop - porchRoofLow) + 0.2, 0), [porchLen / 6 * 1.2, 0.06, D + 1.25], roofMat[r % 3], [0, 0, -porchSlope - 3 * R]);
  }
  add('Porch beam', beam, P(postX, porchRoofLow, 0), [0.22, 0.22, D + 0.6], darkWood);

  // Porch furniture: bench, rocking chair, lantern, barrel
  add('Bench seat', beam, P(W / 2 + 0.75, base + 0.45, -2.7), [0.5, 0.08, 1.5], plankWood[2]);
  add('Bench back', beam, P(W / 2 + 0.52, base + 0.8, -2.7), [0.07, 0.5, 1.5], plankWood[1], [0, 0, -10 * R]);
  for (const s of [-1, 1]) add(`Bench leg ${s}`, beam, P(W / 2 + 0.75, base + 0.22, -2.7 + s * 0.65), [0.45, 0.44, 0.07], darkWood);
  add('Blanket', beam, P(W / 2 + 0.78, base + 0.52, -2.4), [0.45, 0.05, 0.55], cloth, [0, 0.2, 0]);
  add('Chair seat', beam, P(W / 2 + 1.0, base + 0.48, 2.6), [0.55, 0.07, 0.55], plankWood[0], [0, -0.4, 0]);
  add('Chair back', beam, P(W / 2 + 0.78, base + 0.9, 2.5), [0.07, 0.75, 0.55], plankWood[0], [0, -0.4, -12 * R]);
  for (const s of [-1, 1]) add(`Rocker ${s}`, cylinder(20, 0, 1), P(W / 2 + 1.0, base + 0.08, 2.6 + s * 0.25), [0.38, 0.05, 0.05], darkWood, [90 * R, -0.4, 0]);
  add('Lantern hook', beam, P(postX - 0.05, porchRoofLow - 0.12, -1.2), [0.3, 0.04, 0.04], iron);
  add('Porch lantern glow', beam, P(postX - 0.18, porchRoofLow - 0.45, -1.2), [0.16, 0.24, 0.16], lampGlow);
  add('Porch lantern cage', beam, P(postX - 0.18, porchRoofLow - 0.3, -1.2), [0.22, 0.05, 0.22], iron);
  add('Porch lantern base', beam, P(postX - 0.18, porchRoofLow - 0.59, -1.2), [0.2, 0.04, 0.2], iron);
  add('Rain barrel', cylinder(18, 0.04, 2), P(W / 2 + 0.4, base + 0.45, -D / 2 - 0.65), [0.38, 0.9, 0.38], plankWood[1]);
  for (const h of [0.15, 0.75]) add(`Barrel hoop ${h}`, cylinder(18, 0, 1), P(W / 2 + 0.4, base + h, -D / 2 - 0.65), [0.4, 0.05, 0.4], iron);

  // Woodpile against the north side wall, plus chopping stump and axe
  const wz = D / 2 + 0.75;
  for (let row = 0; row < 5; row++) {
    for (let i = 0; i < 9 - (row > 3 ? 2 : 0); i++) {
      const x = -W / 2 + 0.6 + i * 0.37 + (row % 2 ? 0.18 : 0);
      add(`Firewood ${row} ${i}`, log, P(x, g + 0.2 + row * 0.33, wz), [0.17 + random() * 0.03, 0.75, 0.17], logWood[(row + i) % 3], [90 * R, 0, 0]);
    }
  }
  add('Woodpile roof', slab, P(-W / 2 + 2.1, g + 2.0, wz + 0.1), [3.8, 0.08, 1.2], weathered, [-10 * R, 0, 0]);
  const stumpX = W / 2 + 0.6, stumpZ = D / 2 + 2.2;
  add('Chopping stump', log, P(stumpX, g + 0.32, stumpZ), [0.42, 0.64, 0.42], logWood[2]);
  add('Stump top', cylinder(20, 0, 1), P(stumpX, g + 0.65, stumpZ), [0.38, 0.02, 0.38], plankWood[2]);
  add('Axe handle', log, P(stumpX + 0.12, g + 1.0, stumpZ + 0.05), [0.03, 0.75, 0.03], plankWood[0], [0, 0, -28 * R]);
  add('Axe head', beam, P(stumpX - 0.05, g + 0.7, stumpZ + 0.05), [0.22, 0.14, 0.04], iron, [0, 0, -28 * R]);
  for (let i = 0; i < 6; i++) add(`Split log ${i}`, log, P(stumpX + 0.6 + random() * 0.8, g + 0.1, stumpZ - 0.6 + random() * 1.2), [0.1, 0.5, 0.06], logWood[i % 3], [90 * R, random() * 3, 0]);

  // Stepping-stone path to the dock and the fire
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const x = cx + W / 2 + 3.9 + t * 4.1, z = cz + 0.3 - t * 0.8 + Math.sin(t * 5) * 0.3;
    add(`Path stone ${i}`, pebble, [x, ground(x, z) + 0.02, z], [0.38, 0.06, 0.32], stone[(i + 1) % 3], [0, random() * 6, 0]);
  }
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const x = cx + W / 2 + 4.5 + t * 0.6, z = cz + 1.5 + t * 4.4;
    add(`Fire path stone ${i}`, pebble, [x, ground(x, z) + 0.02, z], [0.32, 0.06, 0.3], stone[i % 3], [0, random() * 6, 0]);
  }

  // Campfire
  const fireX = -14, fireZ = 3;
  const fg = ground(fireX, fireZ);
  for (let i = 0; i < 11; i++) {
    const a = i / 11 * Math.PI * 2;
    add(`Fire ring stone ${i}`, pebble, [fireX + Math.cos(a) * 0.95, fg + 0.1, fireZ + Math.sin(a) * 0.95], [0.26, 0.2, 0.22], stone[i % 3], [0, a, 0]);
  }
  add('Ash bed', cylinder(20, 0, 1), [fireX, fg + 0.03, fireZ], [0.8, 0.04, 0.8], material('rock', [0.05, 0.045, 0.04], 1));
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    add(`Fire log ${i}`, log, [fireX + Math.cos(a) * 0.25, fg + 0.28, fireZ + Math.sin(a) * 0.25], [0.08, 0.95, 0.08], logWood[2], [Math.sin(a) * 55 * R, 0, -Math.cos(a) * 55 * R]);
  }
  add('Embers', pebble, [fireX, fg + 0.08, fireZ], [0.5, 0.08, 0.5], ember);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + 0.3;
    add(`Flame ${i}`, flameMesh, [fireX + Math.cos(a) * 0.16, fg + 0.45, fireZ + Math.sin(a) * 0.16], [0.17, 0.6 + random() * 0.35, 0.17], fireOuter, [Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15]);
  }
  add('Flame core', flameMesh, [fireX, fg + 0.5, fireZ], [0.14, 0.8, 0.14], fireInner);
  // Log benches around the fire
  for (const [a, len] of [[0.6, 1.9], [2.3, 1.7], [4.0, 1.8]]) {
    const x = fireX + Math.cos(a) * 2.2, z = fireZ + Math.sin(a) * 2.2;
    add(`Fire bench ${a}`, log, [x, ground(x, z) + 0.24, z], [0.24, len, 0.24], logWood[1], [90 * R, -a, 0]);
  }
  add('Kettle', ball, [fireX + 1.2, fg + 0.33, fireZ - 0.7], [0.18, 0.15, 0.18], iron);
  add('Kettle spout', cylinder(8, 0, 1), [fireX + 1.38, fg + 0.37, fireZ - 0.7], [0.03, 0.18, 0.03], iron, [0, 0, -60 * R]);

  // Dock
  const dockZ = -5.6, dockY = 0.62, x0 = -11.5, x1 = -3.4;
  const dockLen = x1 - x0;
  const planks = 34;
  for (let p = 0; p < planks; p++) {
    const x = x0 + (p + 0.5) * dockLen / planks;
    add(`Dock plank ${p}`, beam, [x, dockY + (random() - 0.5) * 0.015, dockZ], [dockLen / planks * 0.9, 0.08, 1.9], plankWood[p % 3], [0, (random() - 0.5) * 0.02, (random() - 0.5) * 0.02]);
  }
  for (const s of [-1, 1]) add(`Dock stringer ${s}`, beam, [(x0 + x1) / 2, dockY - 0.14, dockZ + s * 0.75], [dockLen, 0.18, 0.12], darkWood);
  for (let k = 0; k <= 4; k++) {
    const x = x0 + 0.3 + k * (dockLen - 0.5) / 4;
    for (const s of [-1, 1]) {
      add(`Dock piling ${k} ${s}`, log, [x, dockY - 0.6, dockZ + s * 0.98], [0.12, 1.9, 0.12], weathered);
      add(`Dock piling cap ${k} ${s}`, cylinder(12, 0.02, 1), [x, dockY + 0.37, dockZ + s * 0.98], [0.14, 0.04, 0.14], darkWood);
    }
  }
  add('Mooring cleat', beam, [x1 - 0.8, dockY + 0.08, dockZ + 0.85], [0.3, 0.06, 0.08], iron);
  add('Rope coil', cylinder(18, 0.3, 2), [x1 - 1.3, dockY + 0.07, dockZ - 0.5], [0.25, 0.08, 0.25], rope);
  add('Dock lantern post', log, [x1 - 0.2, dockY + 0.75, dockZ - 0.98], [0.07, 1.5, 0.07], darkWood);
  add('Dock lantern glow', beam, [x1 - 0.2, dockY + 1.62, dockZ - 0.98], [0.17, 0.25, 0.17], lampGlow);
  add('Dock lantern cap', cone(0, 1, 4), [x1 - 0.2, dockY + 1.82, dockZ - 0.98], [0.17, 0.14, 0.17], iron, [0, 45 * R, 0]);
  add('Fishing rod', log, [x1 - 0.6, dockY + 0.9, dockZ + 0.7], [0.015, 2.4, 0.015], darkWood, [35 * R, 0, -40 * R]);
  add('Tackle box', beam, [x1 - 1.9, dockY + 0.14, dockZ + 0.45], [0.42, 0.22, 0.26], material('metal', [0.1, 0.22, 0.12], 0.5, 0.4));
  add('Bucket', cylinder(14, 0.02, 1), [x1 - 2.4, dockY + 0.17, dockZ - 0.55], [0.15, 0.28, 0.15], material('metal', [0.35, 0.36, 0.37], 0.4, 0.8));

  // Flag on the end of the dock
  const poleX = x1 - 0.05, poleZ = dockZ + 0.95;
  add('Flagpole', cylinder(10), [poleX, dockY + 1.7, poleZ], [0.05, 3.4, 0.05], darkWood);
  add('Flagpole finial', ball, [poleX, dockY + 3.45, poleZ], [0.08, 0.08, 0.08], brass);
  const flag = createFlagPart([poleX - 0.03, dockY + 3.25, poleZ]);
  parts.push(flag);

  // Rowboat tied beside the dock
  const bx = -6.2, bz = dockZ - 2.0, by = 0.24;
  add('Rowboat hull', ball, [bx, by, bz], [1.75, 0.42, 0.62], boatPaint, [0, 8 * R, 0]);
  add('Rowboat gunwale', ball, [bx, by + 0.17, bz], [1.72, 0.08, 0.6], boatInside, [0, 8 * R, 0]);
  add('Rowboat interior', ball, [bx, by + 0.19, bz], [1.55, 0.06, 0.5], material('wood', [0.2, 0.12, 0.06], 0.9), [0, 8 * R, 0]);
  for (const o of [-0.6, 0.15, 0.85]) add(`Rowboat thwart ${o}`, beam, [bx + o * Math.cos(8 * R), by + 0.24, bz - o * Math.sin(8 * R)], [0.22, 0.05, 1.05], plankWood[0], [0, 8 * R, 0]);
  for (const s of [-1, 1]) {
    add(`Oar ${s}`, log, [bx + 0.1, by + 0.33, bz + s * 0.35], [0.025, 2.4, 0.025], plankWood[2], [0, 8 * R + s * 0.12, 90 * R]);
    add(`Oar blade ${s}`, beam, [bx + 1.25, by + 0.33, bz + s * 0.5], [0.45, 0.03, 0.14], plankWood[2], [0, 8 * R + s * 0.12, 0]);
  }
  add('Mooring line', log, [(bx + 1.5 + x1 - 0.8) / 2, (by + 0.3 + dockY + 0.1) / 2, (bz + dockZ + 0.85) / 2 - 0.4], [0.015, 2.6, 0.015], rope, [0, -0.5, 80 * R]);

  // Lily pads and a reed bed by the dock
  for (let i = 0; i < 26; i++) {
    const x = -9 + random() * 7, z = -10 + random() * 3.5;
    const s = 0.18 + random() * 0.2;
    add(`Lily pad ${i}`, cylinder(14, 0, 1), [x, 0.235, z], [s, 0.01, s], material('foliage', [0.07, 0.22, 0.05], 0.5));
    if (i % 4 === 0) add(`Lily flower ${i}`, ball, [x, 0.27, z], [0.07, 0.05, 0.07], material('foliage', [0.85, 0.75, 0.8], 0.6));
  }

  // Mailbox and a little sign by the path
  const mx = cx + W / 2 + 5.5, mz = cz + 5.6;
  add('Mailbox post', beam, [mx, ground(mx, mz) + 0.55, mz], [0.1, 1.1, 0.1], weathered);
  add('Mailbox', cylinder(16, 0.05, 2), [mx, ground(mx, mz) + 1.15, mz], [0.17, 0.5, 0.17], material('metal', [0.1, 0.18, 0.3], 0.45, 0.6), [90 * R, 0, 0]);
  add('Mailbox flag', beam, [mx + 0.18, ground(mx, mz) + 1.25, mz + 0.1], [0.03, 0.22, 0.06], material('metal', [0.7, 0.05, 0.04], 0.4, 0.5));

  return { flag };
}
