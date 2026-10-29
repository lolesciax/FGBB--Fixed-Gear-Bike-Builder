import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  componentGeometry,
  renderFrameSpecs,
  slots,
  selectedColorway,
  variantById,
  type Configuration,
  type Product,
  type Slot,
  type BicycleGeometry,
} from "@tracklab/domain";
import { StudioCamera } from "./StudioCamera";
import { StudioLighting } from "./StudioLighting";
import { PartGroup } from "./MaterialMotion";
import {useFrameFinish} from './useFrameFinish';
import {FinishGraphics} from './FinishGraphics';
import {useComponentFinishes} from './useComponentFinishes';
import { FrameKit } from "./FrameKit";
import type {
  CameraView,
  StudioEnvironment,
  QualityTier,
} from "./studio-settings";
import { createFrame } from "./modeling/frame";
import { createWheel, createTire } from "./modeling/wheel";
import { createCockpit } from "./modeling/cockpit";
import { createSaddle } from "./modeling/saddle";
import { createDrivetrain } from "./modeling/drivetrain";
import { disposeModel } from "./modeling/primitives";

type ModelSpecs = NonNullable<Parameters<typeof componentGeometry>[0]>;
function useOwnedModel(
  key: string,
  build: (g: BicycleGeometry, specs: ModelSpecs) => THREE.Group,
) {
  const model = useMemo(() => {
    const specs = JSON.parse(key) as ModelSpecs;
    return build(componentGeometry(specs), specs);
  }, [key, build]);
  useEffect(() => () => disposeModel(model), [model]);
  return model;
}
const fallbackFrame = (g: BicycleGeometry, s: ModelSpecs) =>
  s.frameset ? createFrame(g, "#535963") : new THREE.Group();
const wheels = (g: BicycleGeometry) => {
  const root = new THREE.Group();
  root.add(createWheel(g, false), createWheel(g, true));
  return root;
};
const tires = (g: BicycleGeometry) => {
  const root = new THREE.Group();
  for (const axle of [g.rear, g.front]) {
    const tire = createTire(g);
    tire.position.set(...axle);
    root.add(tire);
  }
  return root;
};
const cockpit = (g: BicycleGeometry, s: ModelSpecs) =>
  createCockpit(g, s.cockpit || {});

export function ProceduralAssembly({
  configuration,
  catalog,
  resetKey,
  onSelect,
  cameraView = "studio",
  studio = "light",
  quality = "balanced",
  reducedMotion = false,
  turntable = false,
  activeSlot,
  onInteract,
  onMoving,
  onFinishFailure,
}: {
  configuration: Configuration;
  catalog: Product[];
  resetKey: number;
  onSelect: (slot: Slot) => void;
  cameraView?: CameraView;
  studio?: StudioEnvironment;
  quality?: QualityTier;
  reducedMotion?: boolean;
  turntable?: boolean;
  activeSlot?: Slot;
  onInteract: () => void;
  onMoving: (moving: boolean) => void;
  onFinishFailure:(failed:boolean)=>void;
}) {
  const get = (slot: Slot) =>
    variantById(catalog, configuration[slot])?.variant;
  const frameRecord=variantById(catalog,configuration.frameset);
  const frame = get("frameset");
  const geometryKey = JSON.stringify(
    Object.fromEntries(
      slots.map((slot) => [
        slot,
        slot==='frameset'?renderFrameSpecs(get('frameset')?.specs||{}):get(slot as Slot)?.specs,
      ]),
    ),
  );
  const g = useMemo(
    () => componentGeometry(JSON.parse(geometryKey)),
    [geometryKey],
  );
  const key = (...slots: Slot[]) =>
    JSON.stringify(
      Object.fromEntries(slots.map((slot) => [slot, slot==='frameset'?renderFrameSpecs(get(slot)?.specs||{}):get(slot)?.specs])),
    );
  const models = {
    frame: useOwnedModel(
      frame?.asset3D ? "{}" : key("frameset"),
      fallbackFrame,
    ),
    wheels: useOwnedModel(key("frameset", "wheels"), wheels),
    tires: useOwnedModel(JSON.stringify({frameset:renderFrameSpecs(get('frameset')?.specs||{}),wheels:{bsd:get('wheels')?.specs.bsd,rimWidth:get('wheels')?.specs.rimWidth},tires:get('tires')?.specs}), tires),
    cockpit: useOwnedModel(key("frameset", "cockpit"), cockpit),
    saddle: useOwnedModel(key("frameset", "saddle"), createSaddle),
    drivetrain: useOwnedModel(key("frameset", "drivetrain"), createDrivetrain),
  };
  useFrameFinish(models.frame,frameRecord?.product,frame,reducedMotion);
  useComponentFinishes(models.wheels,configuration,catalog,reducedMotion);
  useComponentFinishes(models.drivetrain,configuration,catalog,reducedMotion);
  useComponentFinishes(models.cockpit,configuration,catalog,reducedMotion);
  useComponentFinishes(models.saddle,configuration,catalog,reducedMotion);
  const group = useRef<THREE.Group>(null),
    modelKey = slots.map(slot=>configuration[slot]).join("|");
  useLayoutEffect(() => {
    // Layer 0 is the visible scene. Layer 1 contains only bicycle shadow casters,
    // excluding the near-coplanar studio floor from the contact depth texture.
    group.current?.traverse((node) => node.layers.enable(1));
  }, [
    modelKey,
    models.frame,
    models.wheels,
    models.tires,
    models.cockpit,
    models.saddle,
    models.drivetrain,
    frame?.asset3D?.revision,
  ]);
  const pick = (slot: Slot) => ({
    onClick: (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      onSelect(slot);
    },
  });
  return (
    <>
      <group
        ref={group}
        name="bicycle_assembly"
        userData={{
          geometryRevision: "components-v3",
          cockpit: g.cockpit.type,
        }}
      >
        <PartGroup
          {...pick("frameset")}
          active={activeSlot === "frameset"}
          modelKey={modelKey}
        >
          {frame?.asset3D ? (
            <FrameKit
              product={frameRecord!.product}
              variant={frame}
              bb={g.frame.bb}
              reducedMotion={reducedMotion}
            />
          ) : (
            <primitive object={models.frame} />
          )}
          {frameRecord&&<FinishGraphics assembly={group} specs={frameRecord.variant.specs} colorway={selectedColorway(frameRecord.product,frameRecord.variant)} geometryKey={geometryKey} onFailure={onFinishFailure}/>}
        </PartGroup>
        {(["wheels", "tires", "cockpit", "saddle", "drivetrain"] as const).map(
          (slot) => (
            <PartGroup
              key={slot}
              {...pick(slot)}
              active={activeSlot === slot}
              modelKey={modelKey}
            >
              <primitive object={models[slot]} />
            </PartGroup>
          ),
        )}
      </group>
      <StudioLighting
        studio={studio}
        quality={quality}
        modelKey={modelKey}
        centerX={g.front[0] / 2}
        groundY={g.groundY}
      />
      <StudioCamera
        assembly={group}
        configurationKey={
          geometryKey +
          (frame?.asset3D?.url || "") +
          (frame?.asset3D?.revision || "")
        }
        view={cameraView}
        resetKey={resetKey}
        reducedMotion={reducedMotion}
        turntable={turntable}
        onInteract={onInteract}
        onMoving={onMoving}
      />
    </>
  );
}
