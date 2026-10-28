// Independently authored schematic geometry. No manufacturer scans or protected assets.
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mkdir, writeFile } from 'node:fs/promises';
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(value => { this.result = value; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(value => { this.result = `data:application/octet-stream;base64,${Buffer.from(value).toString('base64')}`; this.onloadend?.(); }); }
};
const out = new URL('../frontend/public/models/', import.meta.url);
await mkdir(out, { recursive: true });
const metal = new THREE.MeshStandardMaterial({ color: '#303831', metalness: .65, roughness: .4 });
const paint = new THREE.MeshStandardMaterial({ color: '#294f40', metalness: .45, roughness: .34 });
const rubber = new THREE.MeshStandardMaterial({ color: '#1e2420', roughness: .92 });
const point = (x, y, z = 0) => new THREE.Vector3((x - 450) / 500, (380 - y) / 500, z);
function tube(group, p1, p2, radius, material = metal, name = '') {
  const delta = p2.clone().sub(p1), mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, delta.length(), 12), material);
  mesh.name = name; mesh.position.copy(p1.clone().add(p2).multiplyScalar(.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); group.add(mesh);
}
function ring(group, x, radius, thickness, material) { const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 8, 64), material); mesh.position.copy(point(x, 380)); group.add(mesh); }
async function save(name, group) { const buffer = await new GLTFExporter().parseAsync(group, { binary: true }); await writeFile(new URL(`${name}.glb`, out), Buffer.from(buffer)); }
for (const pursuit of [false, true]) {
  const g = new THREE.Group(), s = point(337, pursuit ? 177 : 163), h = point(617, pursuit ? 190 : 163), b = point(395, 398), l = point(637, 228), r = point(205, 380), f = point(700, 380);
  for (const [p, q, radius] of [[s, h, .015], [s, b, .018], [b, l, .023], [h, l, .024]]) tube(g, p, q, radius, paint, 'paint');
  for (const z of [-.045, .045]) { const rz = r.clone().setZ(z), fz = f.clone().setZ(z); tube(g, s, rz, .009, paint, 'paint'); tube(g, b, rz, .01, paint, 'paint'); tube(g, l, fz, .013, paint, 'paint'); }
  await save(pursuit ? 'frame-pursuit' : 'frame-track', g);
}
for (const deep of [false, true]) {
  const g = new THREE.Group();
  for (const x of [205, 700]) {
    ring(g, x, deep ? .24 : .254, deep ? .024 : .009, metal);
    for (let i = 0; i < 28; i++) { const theta = i * Math.PI / 14; tube(g, point(x, 380, i % 2 ? -.025 : .025), point(x + Math.cos(theta) * (deep ? 108 : 125), 380 + Math.sin(theta) * (deep ? 108 : 125)), .0009); }
    tube(g, point(x, 380, -.06), point(x, 380, .06), .009);
  }
  await save(deep ? 'wheels-deep' : 'wheels-classic', g);
}
for (const tan of [false, true]) { const g = new THREE.Group(); for (const x of [205, 700]) ring(g, x, .27, tan ? .014 : .012, tan ? new THREE.MeshStandardMaterial({ color: '#9b805b', roughness: .9 }) : rubber); await save(tan ? 'tires-tan' : 'tires-black', g); }
for (const riser of [false, true]) {
  const g = new THREE.Group(); tube(g, point(617, 155), point(607, 126), .013); tube(g, point(607, 126), point(665, 121), .013);
  tube(g, point(665, 121, -.16), point(665, 121, .16), .012);
  for (const z of [-.16, .16]) if (riser) tube(g, point(665, 121, z), point(680, 103, z), .013); else { tube(g, point(665, 121, z), point(712, 144, z), .013); tube(g, point(712, 144, z), point(707, 186, z), .013); tube(g, point(707, 186, z), point(681, 195, z), .013); }
  await save(riser ? 'cockpit-riser' : 'cockpit-drop', g);
}
for (const comfort of [false, true]) { const g = new THREE.Group(); tube(g, point(337, 177), point(315, 100), .013); const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), rubber); mesh.scale.set(.11, .016, comfort ? .065 : .045); mesh.position.copy(point(325, 83)); g.add(mesh); await save(comfort ? 'saddle-comfort' : 'saddle-race', g); }
const crank = new THREE.Group(); ring(crank, 395, .088, .007, metal); crank.children[0].position.copy(point(395, 398, .06)); tube(crank, point(395, 398, .06), point(471, 412, .06), .011); tube(crank, point(205, 365, .06), point(395, 354, .06), .003); tube(crank, point(205, 395, .06), point(395, 442, .06), .003); await save('drivetrain', crank);
console.info('Generated 11 independently authored, modular schematic GLB assets.');
