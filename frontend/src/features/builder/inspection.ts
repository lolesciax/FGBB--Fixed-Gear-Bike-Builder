import type * as THREE from "three";
import type { Slot } from "@tracklab/domain";
export const inspectionTargets = [
  ["frameset", "Frameset"],
  ["fork", "Fork"],
  ["wheels", "Wheelset"],
  ["drivetrain", "Crankset"],
  ["cockpit", "Cockpit"],
  ["saddle", "Saddle / seatpost"],
] as const;
export const developmentTargets = [
  ["dev-head", "Head tube / junctions"],
  ["dev-headset", "Headset / stem"],
  ["dev-crown", "Fork crown"],
  ["dev-front-dropout", "Front dropout"],
  ["dev-rear-dropout", "Rear track end"],
  ["dev-front-hardware", "Front axle hardware"],
  ["dev-rear-hardware", "Rear axle hardware"],
  ["dev-stays", "Stay junctions"],
  ["dev-bb", "Bottom bracket"],
  ["dev-front-dropout-left", "Left fork dropout"],
  ["dev-rear-dropout-left", "Left rear track end"],
  ["dev-front-hub", "Front hub / axle"],
  ["dev-rear-hub", "Rear hub / axle"],
] as const;
export type InspectionTarget =
  | (typeof inspectionTargets)[number][0]
  | (typeof developmentTargets)[number][0];
export type CameraCommand = {
  id: number;
  action:
    "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down";
};
export function inspectionSlot(target: InspectionTarget): Slot {
  if (target.startsWith("dev-"))
    return target.includes("hardware") || target.includes("hub")
      ? "wheels"
      : target === "dev-headset"
        ? "cockpit"
        : "frameset";
  return target === "fork" ? "frameset" : (target as Slot);
}
export function inspectionObject(
  root: THREE.Object3D,
  target?: InspectionTarget,
) {
  const meshNames: Record<string, string> = {
    "dev-head": "paint_head",
    "dev-headset": "stem_steerer_clamp",
    "dev-crown": "fork_crown",
    "dev-front-dropout": "fork_dropout_1",
    "dev-rear-dropout": "rear_dropout_1",
    "dev-front-hardware": "axle_nut_1",
    "dev-rear-hardware": "axle_nut_1",
    "dev-stays": "paint_seatstay_1",
    "dev-bb": "paint_bottom_bracket",
    "dev-front-dropout-left": "fork_dropout_-1",
    "dev-rear-dropout-left": "rear_dropout_-1",
    "dev-front-hub": "hub_body",
    "dev-rear-hub": "hub_body",
  };
  if (target && meshNames[target]) {
    const scope = ["dev-front-hardware", "dev-front-hub"].includes(target)
      ? root.getObjectByName("front_wheel")
      : ["dev-rear-hardware", "dev-rear-hub"].includes(target)
        ? root.getObjectByName("rear_wheel")
        : root;
    return (
      scope?.getObjectByName(meshNames[target]) ||
      scope?.getObjectByName("through_head_1") ||
      scope?.getObjectByName("quick-release_head_1") ||
      root
    );
  }
  return target
    ? root.getObjectByName(
        target === "fork" ? "fork_assembly" : `assembly_${target}`,
      ) || root
    : root;
}
