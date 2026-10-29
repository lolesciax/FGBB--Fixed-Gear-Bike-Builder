import * as THREE from "three";
import {
  finishAnchors,
  paintFor,
  stopsFor,
  zoneForMesh,
  type Colorway,
  type Variant,
  type PaintZone,
} from "@tracklab/domain";
export function physicalCopy(source: THREE.Material) {
  if (source instanceof THREE.MeshPhysicalMaterial) return source.clone();
  const result = new THREE.MeshPhysicalMaterial();
  if (source instanceof THREE.MeshStandardMaterial)
    THREE.MeshStandardMaterial.prototype.copy.call(result, source);
  return result;
}
export function prepareFinish(scene: THREE.Object3D, specs: Variant["specs"]) {
  const anchors = finishAnchors(specs),
    items: {
      zone: PaintZone;
      material: THREE.MeshPhysicalMaterial;
      original: { color: THREE.Color; roughness: number; metalness: number };
      uniforms: {
        colors: { value: THREE.Color[] };
        stops: { value: number[] };
        count: { value: number };
        start: { value: THREE.Vector3 };
        end: { value: THREE.Vector3 };
      };
    }[] = [];
  scene.traverse((node) => {
    const zone = zoneForMesh(node.name);
    if (!zone || !(node instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(node.material)
      ? node.material
      : [node.material]) {
      if (
        !(material instanceof THREE.MeshPhysicalMaterial) ||
        items.some((i) => i.material === material)
      )
        continue;
      const uniforms = {
        colors: {
          value: Array.from({ length: 8 }, () => material.color.clone()),
        },
        stops: { value: [0, 1, 1, 1, 1, 1, 1, 1] },
        count: { value: 2 },
        start: { value: new THREE.Vector3(...anchors[zone][0]) },
        end: { value: new THREE.Vector3(...anchors[zone][1]) },
      };
      items.push({
        zone,
        material,
        uniforms,
        original: {
          color: material.color.clone(),
          roughness: material.roughness,
          metalness: material.metalness,
        },
      });
    }
  });
  return items;
}
export type FinishMaterials = ReturnType<typeof prepareFinish>;
export function enableFinish(item: FinishMaterials[number]) {
  const m = item.material;
  if (m.userData.tracklabFinish) return;
  m.userData.tracklabFinish = true;
  m.onBeforeCompile = (shader) => {
    shader.uniforms.finishColors = item.uniforms.colors;
    shader.uniforms.finishStops = item.uniforms.stops;
    shader.uniforms.finishCount = item.uniforms.count;
    shader.uniforms.finishStart = item.uniforms.start;
    shader.uniforms.finishEnd = item.uniforms.end;
    shader.vertexShader =
      "varying vec3 vFinishPosition;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      "#include <project_vertex>\nvFinishPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;",
    );
    shader.fragmentShader =
      "varying vec3 vFinishPosition;\nuniform vec3 finishColors[8];\nuniform float finishStops[8];\nuniform int finishCount;\nuniform vec3 finishStart;\nuniform vec3 finishEnd;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      vec3 paintAxis = finishEnd - finishStart;
      float paintT = clamp(dot(vFinishPosition-finishStart,paintAxis)/max(dot(paintAxis,paintAxis),0.000001),0.0,1.0);
      vec3 paintColor = finishColors[0];
      for(int i=1;i<8;i++) { if(i<finishCount) { float blend=clamp((paintT-finishStops[i-1])/max(finishStops[i]-finishStops[i-1],0.00001),0.0,1.0); paintColor=mix(paintColor,finishColors[i],blend); } }
      diffuseColor.rgb *= paintColor;`,
    );
  };
  m.customProgramCacheKey = () => "tracklab-zoned-paint-v1";
  m.color.set("white");
  m.needsUpdate = true;
}
export function finishTargets(
  item: FinishMaterials[number],
  colorway: Colorway | undefined,
  color: string,
) {
  const legacyFork =
    !colorway && (item.zone === "fork" || item.zone === "crown");
  return {
    paint: legacyFork
      ? {
          ...paintFor(undefined, item.zone, color),
          roughness: item.original.roughness,
          metalness: item.original.metalness,
        }
      : paintFor(colorway, item.zone, color),
    stops: legacyFork
      ? [
          { at: 0, color: "#" + item.original.color.getHexString() },
          { at: 1, color: "#" + item.original.color.getHexString() },
        ]
      : stopsFor(colorway, item.zone, color),
  };
}
