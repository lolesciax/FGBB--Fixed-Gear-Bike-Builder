import type { ComponentSpecs } from "./components";
export const lacingNames = {
  radial: "Radial",
  "two-cross": "2-cross",
  "three-cross": "3-cross",
} as const;
export type Lacing = keyof typeof lacingNames;
export function wheelBuild(specs: ComponentSpecs = {}, rear = false) {
  const prefix = rear ? "rear" : "front";
  const rawCount = specs[`${prefix}SpokeCount`] ?? specs.spokeCount;
  const rawLacing = specs[`${prefix}Lacing`];
  const validCount =
    typeof rawCount === "number" &&
    Number.isInteger(rawCount) &&
    rawCount >= 16 &&
    rawCount <= 48 &&
    rawCount % 4 === 0;
  const count = validCount ? rawCount : 32;
  const lacing: Lacing =
    typeof rawLacing === "string" && Object.hasOwn(lacingNames, rawLacing)
      ? (rawLacing as Lacing)
      : rear
        ? "three-cross"
        : "two-cross";
  const crossings = lacing === "radial" ? 0 : lacing === "two-cross" ? 2 : 3;
  const errors: string[] = [],
    missing: string[] = [];
  if (rawCount === undefined) missing.push(`${prefix}SpokeCount`);
  else if (!validCount)
    errors.push("Spoke count must be a multiple of four from 16 to 48.");
  if (rawLacing === undefined) missing.push(`${prefix}Lacing`);
  else if (!(
    typeof rawLacing === "string" && Object.hasOwn(lacingNames, rawLacing)
  ))
    errors.push("Unsupported lacing pattern.");
  if (crossings >= count / 4)
    errors.push("Lacing crosses beyond the supported flange spacing.");
  for (const part of ["Hub", "Rim"]) {
    const key = `${prefix}${part}Drilling`,
      value = specs[key];
    if (value === undefined) missing.push(key);
    else if (value !== count)
      errors.push(`${part} drilling must match the ${count} spokes.`);
  }
  return {
    count,
    lacing,
    crossings,
    errors,
    missing,
    label: `${count} spokes · ${lacingNames[lacing]}`,
    illustrative: missing.length > 0,
  };
}
