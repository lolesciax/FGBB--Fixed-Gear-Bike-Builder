import * as THREE from "three";
import type { Slot } from "@tracklab/domain";
type Attribute = THREE.BufferAttribute | THREE.InterleavedBufferAttribute;
type Pose = {
  position: Attribute;
  normal: Attribute;
  index: THREE.BufferAttribute | null;
  matrix: THREE.Matrix4;
  instances?: Float32Array;
  groups: string;
};
export type AssemblyPose = {
  family: string;
  meshes: Map<string, Pose>;
  bounds: THREE.Box3;
};
export function assemblyMeshes(root: THREE.Object3D) {
  const entries = new Map<string, THREE.Mesh>(),
    counts = new Map<string, number>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    let parent: THREE.Object3D | null = node,
      slot: Slot | undefined;
    while (parent && parent !== root) {
      slot = parent.userData.slot;
      if (slot) break;
      parent = parent.parent;
    }
    if (!slot) return;
    const base = `${slot}/${node.name}`,
      n = counts.get(base) || 0;
    counts.set(base, n + 1);
    entries.set(`${base}/${n}`, node);
  });
  return entries;
}
export function captureAssembly(
  root: THREE.Object3D,
  family: string,
): AssemblyPose {
  root.updateWorldMatrix(true, true);
  const meshes = new Map<string, Pose>();
  for (const [key, node] of assemblyMeshes(root))
    meshes.set(key, {
      position: node.geometry.getAttribute("position"),
      normal: node.geometry.getAttribute("normal"),
      index: node.geometry.index,
      matrix: node.matrixWorld.clone(),
      groups: JSON.stringify(node.geometry.groups),
      ...(node instanceof THREE.InstancedMesh
        ? { instances: new Float32Array(node.instanceMatrix.array) }
        : {}),
    });
  return { family, meshes, bounds: new THREE.Box3().setFromObject(root) };
}
function equalAttribute(a: Attribute | undefined, b: Attribute | undefined) {
  if (!a || !b || a.count !== b.count || a.itemSize !== b.itemSize)
    return false;
  for (let i = 0; i < a.count; i++)
    for (let k = 0; k < a.itemSize; k++)
      if (a.getComponent(i, k) !== b.getComponent(i, k)) return false;
  return true;
}
type Transform = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
};
const transform = (matrix: THREE.Matrix4): Transform => {
  const position = new THREE.Vector3(),
    quaternion = new THREE.Quaternion(),
    scale = new THREE.Vector3();
  matrix.decompose(position, quaternion, scale);
  return { position, quaternion, scale };
};
const tweenTransform = (
  from: Transform,
  to: Transform,
  t: number,
  matrix: THREE.Matrix4,
  p: THREE.Vector3,
  q: THREE.Quaternion,
  s: THREE.Vector3,
) =>
  matrix.compose(
    p.lerpVectors(from.position, to.position, t),
    q.slerpQuaternions(from.quaternion, to.quaternion, t),
    s.lerpVectors(from.scale, to.scale, t),
  );
/** Correspondence is authorized by a reviewed procedural family, then checked in full. */
export function prepareMorph(
  root: THREE.Object3D,
  source: AssemblyPose,
  family: string,
) {
  if (source.family !== family) return null;
  root.updateWorldMatrix(true, true);
  const targets = assemblyMeshes(root);
  if (targets.size !== source.meshes.size) return null;
  for (const [key, node] of targets) {
    const old = source.meshes.get(key),
      g = node.geometry,
      p = g.getAttribute("position"),
      n = g.getAttribute("normal");
    if (
      !old ||
      !p ||
      !n ||
      p.count !== old.position.count ||
      n.count !== old.normal.count ||
      JSON.stringify(g.groups) !== old.groups ||
      !!g.index !== !!old.index ||
      (g.index && old.index && !equalAttribute(g.index, old.index))
    )
      return null;
    if (node instanceof THREE.InstancedMesh) {
      if (
        !old.instances ||
        old.instances.length !== node.count * 16 ||
        !equalAttribute(p, old.position) ||
        !equalAttribute(n, old.normal)
      )
        return null;
    } else if (old.instances) return null;
  }
  const bounds = new THREE.Box3().setFromObject(root).union(source.bounds);
  const geometries: {
      node: THREE.Mesh;
      original: THREE.BufferGeometry;
      temporary: THREE.BufferGeometry;
    }[] = [],
    transforms: { node: THREE.Mesh; from: Transform; to: Transform }[] = [],
    instances: {
      node: THREE.InstancedMesh;
      from: Transform[];
      to: Transform[];
      original: Float32Array;
    }[] = [];
  const point = new THREE.Vector3(),
    normal = new THREE.Vector3(),
    matrix = new THREE.Matrix4(),
    p = new THREE.Vector3(),
    q = new THREE.Quaternion(),
    s = new THREE.Vector3();
  let bytes = 0;
  for (const [key, node] of targets) {
    const old = source.meshes.get(key)!,
      g = node.geometry,
      position = g.getAttribute("position"),
      normals = g.getAttribute("normal");
    if (node instanceof THREE.InstancedMesh) {
      const inverse = node.matrixWorld.clone().invert(),
        from: Transform[] = [],
        to: Transform[] = [];
      for (let i = 0; i < node.count; i++) {
        from.push(
          transform(
            new THREE.Matrix4().multiplyMatrices(
              inverse,
              new THREE.Matrix4().multiplyMatrices(
                old.matrix,
                new THREE.Matrix4().fromArray(old.instances!, i * 16),
              ),
            ),
          ),
        );
        node.getMatrixAt(i, matrix);
        to.push(transform(matrix));
      }
      instances.push({
        node,
        from,
        to,
        original: new Float32Array(node.instanceMatrix.array),
      });
      continue;
    }
    if (
      equalAttribute(position, old.position) &&
      equalAttribute(normals, old.normal)
    ) {
      const parentInverse = node.parent!.matrixWorld.clone().invert();
      transforms.push({
        node,
        from: transform(parentInverse.multiply(old.matrix)),
        to: {
          position: node.position.clone(),
          quaternion: node.quaternion.clone(),
          scale: node.scale.clone(),
        },
      });
      continue;
    }
    const inverse = node.matrixWorld.clone().invert(),
      positions = new Float32Array(position.count * 3),
      normalValues = new Float32Array(normals.count * 3),
      oldNormals = new THREE.Matrix3().getNormalMatrix(old.matrix),
      newNormals = new THREE.Matrix3()
        .getNormalMatrix(node.matrixWorld)
        .invert();
    for (let i = 0; i < position.count; i++) {
      point
        .fromBufferAttribute(old.position, i)
        .applyMatrix4(old.matrix)
        .applyMatrix4(inverse)
        .toArray(positions, i * 3);
      normal
        .fromBufferAttribute(old.normal, i)
        .applyMatrix3(oldNormals)
        .applyMatrix3(newNormals)
        .normalize()
        .toArray(normalValues, i * 3);
    }
    const temporary = g.clone();
    temporary.morphAttributes.position = [
      new THREE.BufferAttribute(positions, 3),
    ];
    temporary.morphAttributes.normal = [
      new THREE.BufferAttribute(normalValues, 3),
    ];
    temporary.computeBoundingBox();
    temporary.computeBoundingSphere();
    bytes += positions.byteLength + normalValues.byteLength;
    geometries.push({ node, original: g, temporary });
  }
  // Only differing surfaces get private GPU morph buffers; cached GLBs stay immutable.
  root.userData.transitionBounds = bounds;
  for (const { node, temporary } of geometries) {
    node.geometry = temporary;
    node.updateMorphTargets();
  }
  const apply = (amount: number) => {
    for (const { node } of geometries)
      node.morphTargetInfluences![0] = 1 - amount;
    for (const item of transforms) {
      tweenTransform(item.from, item.to, amount, matrix, p, q, s);
      matrix.decompose(
        item.node.position,
        item.node.quaternion,
        item.node.scale,
      );
      item.node.updateMatrix();
    }
    for (const item of instances) {
      for (let i = 0; i < item.node.count; i++) {
        tweenTransform(item.from[i], item.to[i], amount, matrix, p, q, s);
        item.node.setMatrixAt(i, matrix);
      }
      item.node.instanceMatrix.needsUpdate = true;
      item.node.computeBoundingBox();
      item.node.computeBoundingSphere();
    }
    root.updateWorldMatrix(true, true);
  };
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    delete root.userData.transitionBounds;
    for (const { node, original, temporary } of geometries) {
      node.geometry = original;
      node.updateMorphTargets();
      temporary.dispose();
    }
    for (const { node, to } of transforms) {
      node.position.copy(to.position);
      node.quaternion.copy(to.quaternion);
      node.scale.copy(to.scale);
      node.updateMatrix();
    }
    for (const item of instances) {
      item.node.instanceMatrix.array.set(item.original);
      item.node.instanceMatrix.needsUpdate = true;
      item.node.computeBoundingBox();
      item.node.computeBoundingSphere();
    }
    root.updateWorldMatrix(true, true);
  };
  apply(0);
  return { apply, dispose, bytes, geometryCount: geometries.length };
}
