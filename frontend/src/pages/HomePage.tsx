import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Box, Frame, FileCheck } from "lucide-react";
import { loadCatalog } from "../services/api";
import { useApp } from "../app/context";
import { Bike2D } from "../features/builder/Bike2D";
import { PartThumbnail } from "../features/builder/PartThumbnail";

export function HomePage() {
  const { session, auth } = useApp();
  const catalog = useQuery({ queryKey: ["catalog"], queryFn: loadCatalog });
  const [studio, setStudio] = useState<"light" | "dark">("dark");
  const frames =
    catalog.data?.items.filter(
      (p) =>
        p.slot === "frameset" && !p.illustrative && p.status === "published",
    ) || [];
  const brands = [...new Set(frames.map((p) => p.brand))];
  return (
    <main className="cinematic-home">
      <section className="cinematic-hero">
        <div className="cinematic-copy">
          <h1>
            Build Beyond <br />
            the Ordinary.
          </h1>
          <p>
            Explore fixed-gear framesets. Shape your setup. See every angle in
            one considered studio.
          </p>
          <div className="studio-actions">
            <Link className="button primary" to="/builder">
              Start building
              <ArrowRight size={18} />
            </Link>
            <Link className="button" to="/catalog?slot=frameset">
              Explore framesets
            </Link>
          </div>
          <span className="small muted">No account needed to explore.</span>
        </div>
        <figure className="hero-render">
          <img
            className="hero-dark"
            src="/studio/studio-dark.png"
            width="1438"
            height="798"
            fetchPriority="high"
            alt="Original TrackLab fixed-gear illustration in a graphite studio"
          />
          <img
            className="hero-light"
            src="/studio/studio-light.png"
            width="1438"
            height="798"
            fetchPriority="high"
            alt="Original TrackLab fixed-gear illustration in a light studio"
          />
          <figcaption>Original TrackLab illustration</figcaption>
        </figure>
      </section>
      <section
        className="manufacturer-strip"
        aria-label="Frameset manufacturers in the catalog"
      >
        <p>Framesets from the catalog</p>
        <div>
          {brands.map((brand) => (
            <Link
              key={brand}
              to={`/catalog?slot=frameset&brand=${encodeURIComponent(brand)}`}
            >
              {brand}
            </Link>
          ))}
        </div>
      </section>
      <section className="studio-experience">
        <div className="studio-experience-copy">
          <h2>
            One configuration.
            <br />
            Every angle.
          </h2>
          <p>
            Start with a frameset. Find the right details. Move between a clear
            2D plan and a considered 3D studio.
          </p>
          <ol>
            <li>
              <Frame size={21} />
              <div>
                <h3>Choose your frame</h3>
                <p>Source-reviewed dimensions and available size variants.</p>
              </div>
            </li>
            <li>
              <Box size={21} />
              <div>
                <h3>Explore in 2D and 3D</h3>
                <p>
                  The same setup, with eight camera views and two studio
                  environments.
                </p>
              </div>
            </li>
            <li>
              <FileCheck size={21} />
              <div>
                <h3>Check the details</h3>
                <p>
                  See compatibility checks and measurements that still need
                  verification.
                </p>
              </div>
            </li>
          </ol>
          <Link className="text-button" to="/builder">
            Open the studio
            <ArrowRight size={17} />
          </Link>
        </div>
        <figure className="environment-preview" data-environment={studio}>
          <div
            className="segmented"
            role="group"
            aria-label="Landing studio environment"
          >
            <button
              aria-pressed={studio === "light"}
              className={studio === "light" ? "selected" : ""}
              onClick={() => setStudio("light")}
            >
              Studio Light
            </button>
            <button
              aria-pressed={studio === "dark"}
              className={studio === "dark" ? "selected" : ""}
              onClick={() => setStudio("dark")}
            >
              Studio Dark
            </button>
          </div>
          <img
            src={`/studio/studio-${studio}.png`}
            loading="lazy"
            width="1438"
            height="800"
            alt={`Original TrackLab illustration in Studio ${studio === "dark" ? "Dark" : "Light"}`}
          />
          <figcaption>
            Illustrative preview. Explore the interactive scene in the builder.
          </figcaption>
        </figure>
      </section>
      <section className="cinematic-frames">
        <header>
          <div>
            <h2>Find your starting point.</h2>
            <p>Source-reviewed framesets. Independent illustrative previews.</p>
          </div>
          <Link className="text-button" to="/catalog?slot=frameset">
            Explore framesets
            <ArrowRight size={17} />
          </Link>
        </header>
        {catalog.isError ? (
          <p className="notice">
            The catalog is temporarily unavailable. You can still open the
            studio and retry.
          </p>
        ) : (
          <div className="frame-shelf">
            {frames.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                to={`/catalog?slot=frameset&brand=${encodeURIComponent(product.brand)}`}
              >
                <div>
                  <PartThumbnail
                    product={product}
                    variant={product.variants[0]}
                    color={product.variants[0].color}
                  />
                </div>
                <span className="small muted">{product.brand}</span>
                <h3>{product.name}</h3>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        )}
        <p className="small muted brand-disclosure">
          Manufacturer names identify referenced products. TrackLab is
          independent; previews are not licensed manufacturer surface models or
          an endorsement.
        </p>
      </section>
      <section className="cinematic-garage">
        <div>
          <h2>Keep the good ideas.</h2>
          <p>
            Save your setups, return to the details and make room for your next
            ride.
          </p>
          <Link className="button primary" to="/garage">
            Open my garage
            <ArrowRight size={17} />
          </Link>
        </div>
        <div
          className="garage-plan"
          aria-label="Independent example build illustration"
        >
          {catalog.data && (
            <Bike2D
              configuration={catalog.data.configuration}
              catalog={catalog.data.items}
              compact
            />
          )}
          <span className="small muted">
            Your own collection starts with a saved build.
          </span>
        </div>
      </section>
      <section className="cinematic-access">
        <details>
          <summary>Guest and account access</summary>
          <div>
            <p>
              {session.developmentUnlimited ? (
                "Development access: customize and explore 3D without usage quotas. Guest drafts stay in memory."
              ) : (
                <>
                  Guests receive {session.policy.guestChanges} accepted
                  replacements and {session.policy.guestPreviews} 3D sessions of
                  up to {session.policy.guestPreviewMinutes} minutes per rolling
                  day. Your temporary draft stays in memory.
                </>
              )}
            </p>
            <p>
              {session.developmentUnlimited ? (
                "Sign in to save, duplicate and export builds without development storage or daily usage quotas."
              ) : (
                <>
                  Register for up to {session.policy.builds} saved builds,{" "}
                  {session.policy.createDaily} creations per day and{" "}
                  {session.policy.createMonthly} per rolling month. Edit
                  existing builds without using another slot. Image/information
                  exports share {session.policy.exports} exports per rolling
                  day.
                </>
              )}
            </p>
            <button className="text-button" onClick={() => auth("register")}>
              Create your account
              <ArrowRight size={16} />
            </button>
          </div>
        </details>
      </section>
    </main>
  );
}
