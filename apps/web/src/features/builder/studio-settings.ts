export const cameraPresets = [
  ["studio", "Default Studio"],
  ["side", "Side Profile"],
  ["front", "Front"],
  ["rear", "Rear"],
  ["three-quarter", "Three-Quarter Front"],
  ["rear-quarter", "Three-Quarter Rear"],
  ["top", "Top"],
] as const;
export type CameraView = (typeof cameraPresets)[number][0];
export type StudioEnvironment = "light" | "dark";
export type GraphicsQuality = "auto" | "performance" | "balanced" | "quality";
export type QualityTier = Exclude<GraphicsQuality, "auto">;
export const studioPalettes = {
  light: {
    background: "#e8ebef",
    floor: "#d7dce2",
    key: "#fff9f0",
    fill: "#d6e3ff",
    rim: "#ffffff",
    exposure: 1.05,
  },
  dark: {
    background: "#151a22",
    floor: "#202630",
    key: "#f4f6ff",
    fill: "#afc4ed",
    rim: "#e6edff",
    exposure: 1.12,
  },
} as const;
export const motion = {
  cameraSeconds: 0.65,
  paintDamping: 10,
  turntableRadiansPerSecond: 0.12,
};
export function autoQuality(
  width: number,
  cores = 8,
  memory = 8,
  saveData = false,
): QualityTier {
  return width <= 768 || cores <= 4 || memory <= 4 || saveData
    ? "performance"
    : "balanced";
}
