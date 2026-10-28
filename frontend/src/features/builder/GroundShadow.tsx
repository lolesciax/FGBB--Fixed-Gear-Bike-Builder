import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HorizontalBlurShader, VerticalBlurShader } from "three-stdlib";

// Owned render targets keep finite contact shadows bounded across component and
// quality changes. The depth camera sees bicycle layer 1; the blur camera has its
// own full-screen scene, so floor geometry can never enter either pass.
export function GroundShadow({
  centerX,
  groundY,
  resolution,
  opacity,
  revision,
}: {
  centerX: number;
  groundY: number;
  resolution: number;
  opacity: number;
  revision: string;
}) {
  const { gl, scene, invalidate } = useThree();
  const dirty = useRef(true);
  const resources = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(resolution, resolution);
    const scratch = new THREE.WebGLRenderTarget(resolution, resolution);
    const camera = new THREE.OrthographicCamera(
      -2.5,
      2.5,
      2.5,
      -2.5,
      0.005,
      1.2,
    );
    camera.up.set(0, 0, 1);
    camera.layers.set(1);
    const depth = new THREE.MeshDepthMaterial();
    depth.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec4( vec3( 1.0 - fragCoordZ ), opacity )",
        "vec4( vec3( 0.0 ), 1.0 - fragCoordZ )",
      );
    };
    const horizontal = new THREE.ShaderMaterial(HorizontalBlurShader);
    const vertical = new THREE.ShaderMaterial(VerticalBlurShader);
    horizontal.depthTest =
      horizontal.depthWrite =
      vertical.depthTest =
      vertical.depthWrite =
        false;
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), horizontal);
    const blurScene = new THREE.Scene();
    blurScene.add(quad);
    const blurCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    blurCamera.position.z = 0.5;
    const plane = new THREE.PlaneGeometry(5, 5);
    return {
      target,
      scratch,
      camera,
      depth,
      horizontal,
      vertical,
      quad,
      blurScene,
      blurCamera,
      plane,
    };
  }, [resolution]);
  useEffect(
    () => () => {
      resources.target.dispose();
      resources.scratch.dispose();
      resources.depth.dispose();
      resources.horizontal.dispose();
      resources.vertical.dispose();
      resources.quad.geometry.dispose();
      resources.plane.dispose();
    },
    [resources],
  );
  useLayoutEffect(() => {
    resources.camera.position.set(centerX, groundY - 0.0001, 0);
    resources.camera.lookAt(centerX, groundY + 1, 0);
    resources.camera.updateMatrixWorld();
    dirty.current = true;
    invalidate();
  }, [centerX, groundY, revision, resources, invalidate]);
  useFrame(() => {
    if (!dirty.current) return;
    dirty.current = false;
    const previous = gl.getRenderTarget();
    const background = scene.background;
    const override = scene.overrideMaterial;
    const clear = gl.getClearColor(new THREE.Color());
    const alpha = gl.getClearAlpha();
    const {
      target,
      scratch,
      camera,
      depth,
      quad,
      horizontal,
      vertical,
      blurScene,
      blurCamera,
    } = resources;
    try {
      scene.background = null;
      scene.overrideMaterial = depth;
      gl.setClearColor(0x000000, 0);
      gl.setRenderTarget(target);
      gl.clear();
      gl.render(scene, camera);
      for (const radius of [3, 1.2]) {
        quad.material = horizontal;
        horizontal.uniforms.tDiffuse.value = target.texture;
        horizontal.uniforms.h.value = radius / resolution;
        gl.setRenderTarget(scratch);
        gl.clear();
        gl.render(blurScene, blurCamera);
        quad.material = vertical;
        vertical.uniforms.tDiffuse.value = scratch.texture;
        vertical.uniforms.v.value = radius / resolution;
        gl.setRenderTarget(target);
        gl.clear();
        gl.render(blurScene, blurCamera);
      }
    } finally {
      scene.background = background;
      scene.overrideMaterial = override;
      gl.setClearColor(clear, alpha);
      gl.setRenderTarget(previous);
    }
  });
  return (
    <mesh
      geometry={resources.plane}
      position={[centerX, groundY - 0.0001, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <meshBasicMaterial
        map={resources.target.texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        forceSinglePass
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
