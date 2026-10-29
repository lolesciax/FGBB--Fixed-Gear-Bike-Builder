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
export type InspectionTarget = (typeof inspectionTargets)[number][0];
export type CameraCommand = {
  id: number;
  action:
    "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down";
};
export function inspectionSlot(target: InspectionTarget): Slot {
  return target === "fork" ? "frameset" : target;
}
export function inspectionObject(
  root: THREE.Object3D,
  target?: InspectionTarget,
) {
  return target
    ? root.getObjectByName(
        target === "fork" ? "fork_assembly" : `assembly_${target}`,
      ) || root
    : root;
}
