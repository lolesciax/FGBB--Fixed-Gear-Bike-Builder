import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Box, Frame, FileCheck } from "lucide-react";
import { loadCatalog } from "../services/api";
import { useApp } from "../app/context";
import { Bike2D } from "../features/builder/Bike2D";
import { PartThumbnail } from "../features/builder/PartThumbnail";
export function HomePage() {
  const { session, auth } = useApp(),
    catalog = useQuery({ queryKey: ["catalog"], queryFn: loadCatalog });
  const frames =
    catalog.data?.items.filter(
      (p) =>
        p.slot === "frameset" && !p.illustrative && p.status === "published",
    ) || [];
  return (
    <main className="home-studio">
      <section className="studio-hero">
        <div className="studio-copy">
          <h1>
            One gear.
            <br />
            Endless possibility.
          </h1>
          <p>Choose a frameset. Make it your own.</p>
          <div className="studio-actions">
            <Link className="button primary" to="/builder">
              Start building
              <ArrowRight size={18} />
            </Link>
            <Link className="button" to="/catalog">
              Explore components
            </Link>
          </div>
          <span className="small muted">No account needed to explore.</span>
        </div>
        <figure className="studio-bike">
          {catalog.data ? (
            <Bike2D
              configuration={catalog.data.configuration}
              catalog={catalog.data.items}
            />
          ) : (
            <div className="loader" />
          )}
          <figcaption>Independent studio illustration</figcaption>
        </figure>
      </section>
      <section className="studio-features">
        <div>
          <Frame />
          <h2>Choose your frame</h2>
          <p>
            Explore source-reviewed framesets and their available size variants.
          </p>
        </div>
        <div>
          <Box />
          <h2>Explore in 2D and 3D</h2>
          <p>
            Change components and see your configuration from another angle.
          </p>
        </div>
        <div>
          <FileCheck />
          <h2>Check the details</h2>
          <p>
            See listed dimensions, missing measurements and compatibility
            checks.
          </p>
        </div>
      </section>
      <section className="studio-frames">
        <header>
          <h2>Featured framesets</h2>
          <p>
            Dimensions inform the preview. Authentic manufacturer models
            unavailable.
          </p>
        </header>
        <div>
          {frames.map((product) => (
            <Link key={product.id} to="/catalog">
              <PartThumbnail
                product={product}
                variant={product.variants[0]}
                color={product.variants[0].color}
              />
              <span>
                {product.brand} {product.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="studio-access">
        <div>
          <h2>Explore first. Keep the good ideas.</h2>
          <p>
            Guests receive {session.policy.guestChanges} accepted replacements
            and {session.policy.guestPreviews} 3D sessions of up to{" "}
            {session.policy.guestPreviewMinutes} minutes per rolling day. Your
            temporary draft stays in memory.
          </p>
          <p>
            Register for up to {session.policy.builds} saved builds,{" "}
            {session.policy.createDaily} creations per day and{" "}
            {session.policy.createMonthly} per rolling month. Edit existing
            builds without using another slot. Export build information or an
            illustrative SVG image, sharing {session.policy.exports} exports per
            rolling day.
          </p>
        </div>
        <button className="button primary" onClick={() => auth("register")}>
          Create your account
          <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}
