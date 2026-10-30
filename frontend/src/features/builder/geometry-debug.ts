import { create } from "zustand";
import type { AssemblyReport } from "./modeling/validation";
export const useGeometryDebug = create<{
  anchors: boolean;
  bounds: boolean;
  intersections: boolean;
  report?: AssemblyReport;
  toggle: (key: "anchors" | "bounds" | "intersections") => void;
  setReport: (report: AssemblyReport | undefined) => void;
}>((set) => ({
  anchors: false,
  bounds: false,
  intersections: false,
  toggle: (key) => set((state) => ({ [key]: !state[key] })),
  setReport: (report) => set({ report }),
}));
