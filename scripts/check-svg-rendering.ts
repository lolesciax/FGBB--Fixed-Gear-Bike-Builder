import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Bike2D } from "@tracklab/domain/svg";
import { seedCatalog, defaultConfiguration } from "../apps/api/src/catalog";
for (const configuration of [
  defaultConfiguration,
  {
    ...defaultConfiguration,
    frameset: "skream-magnum-m",
    saddle: "studio-race-316",
  },
]) {
  const svg = renderToStaticMarkup(
    createElement(Bike2D, { configuration, catalog: seedCatalog }),
  );
  if (
    !svg.startsWith("<svg") ||
    !svg.includes(`data-frame-variant="${configuration.frameset}"`)
  )
    throw new Error("Shared SVG did not render the selected configuration.");
}
console.info("Verified shared SVG rendering under the API tsx runtime.");
