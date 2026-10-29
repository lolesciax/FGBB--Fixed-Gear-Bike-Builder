import { useMemo, useState,lazy,Suspense } from "react";
import {useQuery} from '@tanstack/react-query';
import { productSchema, visualizationInfo,selectedColorway,slots,configurationSchema } from "@tracklab/domain";
import { PartThumbnail } from "../features/builder/PartThumbnail";
import {loadCatalog} from '../services/api';
const Bike3D=lazy(()=>import('../features/builder/Bike3D'));
export function CatalogReview({ text }: { text: string }) {
  const [variantId, setVariant] = useState("");
  const [view,setView]=useState<'2d'|'3d'>('2d'),[studio,setStudio]=useState<'light'|'dark'>('light');
  const catalog=useQuery({queryKey:['catalog'],queryFn:loadCatalog});
  const parsed = useMemo(() => {
    try {
      return productSchema.safeParse(JSON.parse(text));
    } catch {
      return null;
    }
  }, [text]);
  if (!parsed?.success)
    return (
      <p className="small muted">
        Choose a valid record to review geometry and asset provenance.
      </p>
    );
  const product = parsed.data,
    variant =
      product.variants.find((v) => v.id === variantId) || product.variants[0],
    info = visualizationInfo(product, variant);
  const colorway=selectedColorway(product,variant);
  const items=[...(catalog.data?.items||[]).filter(p=>p.id!==product.id),product];
  const configuration=configurationSchema.parse(Object.fromEntries(slots.map(slot=>[slot,slot==='frameset'?variant.id:items.find(p=>p.slot===slot&&p.status==='published')?.variants[0].id||''])));
  return (
    <section className="catalog-review">
      <h3>Visualization review</h3>
      <div className="dialog-actions"><button type="button" className="button" onClick={()=>setView('2d')}>Review 2D finish</button><button type="button" className="button" disabled={!info.mode3D||!Object.values(configuration).every(Boolean)} onClick={()=>setView('3d')}>Review 3D finish</button></div>
      <div className="review-image">
        <PartThumbnail
          product={product}
          variant={variant}
          color={variant.color}
        />
      </div>
      {view==='3d'&&<><label>Review studio<select value={studio} onChange={e=>setStudio(e.target.value as 'light'|'dark')}><option value="light">Light</option><option value="dark">Dark</option></select></label><div className="catalog-3d-review"><Suspense fallback={<p>Loading finish review…</p>}><Bike3D configuration={configuration} catalog={items} onSelect={()=>{}} resetKey={0} studio={studio} graphicsQuality="balanced"/></Suspense></div></>}
      <label>
        Review variant
        <select value={variant.id} onChange={(e) => setVariant(e.target.value)}>
          {product.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </label>
      <p>
        {info.specifications}. {info.fidelity}.
      </p>
      <p>{info.limitations}</p>
      {colorway&&<p>{colorway.name} / revision {colorway.revision} / {colorway.status}. Paint: {colorway.fidelity}. {colorway.missingGraphics.join(' ')} {colorway.limitations}</p>}
      <dl>
        <dt>Original source</dt>
        <dd>
          {product.source ? (
            <a href={product.source} target="_blank" rel="noreferrer">
              Official product source
            </a>
          ) : (
            "Independent demo"
          )}
        </dd>
        <dt>3D asset</dt>
        <dd>
          {variant.asset3D?.url ||
            "Procedural fallback / no registered frame kit"}
        </dd>
        <dt>Asset license</dt>
        <dd>
          {variant.asset3D?.license ||
            product.visual?.license ||
            "Not registered"}
        </dd>
        <dt>Origin / units</dt>
        <dd>
          {variant.asset3D
            ? `${variant.asset3D.origin} / ${variant.asset3D.units}`
            : "See procedural registry"}
        </dd>
      </dl>
    </section>
  );
}
