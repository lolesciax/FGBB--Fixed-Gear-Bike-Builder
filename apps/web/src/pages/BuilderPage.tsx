import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Bike, Circle, CircleDot, Cog, Frame, Hand, Info, List, Maximize, Minus, Plus, Redo2, RotateCcw, Save, Search, ShieldCheck, SlidersHorizontal, TriangleAlert, Undo2 } from 'lucide-react';
import { compatibility, slots, stateLabel, technicalDisclaimer, variantById, withHistoricalCatalog, type Configuration, type Product, type Slot } from '@tracklab/domain';
import { api, loadCatalog, type SavedBuild } from '../services/api';
import { errorMessage, useApp } from '../app/context';
import { useBuilder } from '../features/builder/store';
import { Bike2D } from '../features/builder/Bike2D';
const Bike3D = lazy(() => import('../features/builder/Bike3D'));
const categories = { frameset: { label: 'Frameset', icon: Frame, description: 'The foundation of your ride. Choose a silhouette and make it your own.' }, wheels: { label: 'Wheels', icon: CircleDot, description: 'Set the rhythm. Explore classic spokes and deeper profiles.' }, tires: { label: 'Tires', icon: Circle, description: 'Your connection to the road. Check frame clearance before selecting.' }, cockpit: { label: 'Cockpit', icon: Bike, description: 'A different perspective. Find the bar shape for your build.' }, drivetrain: { label: 'Drivetrain', icon: Cog, description: 'One gear. All yours. Explore chainring and sprocket combinations.' }, saddle: { label: 'Saddle', icon: SlidersHorizontal, description: 'The finishing touch. Choose your saddle and seatpost assembly.' } };
export function BuilderPage() {
  const { session, refresh, auth, notify } = useApp(), { id } = useParams(), navigate = useNavigate(), client = useQueryClient();
  const catalog = useQuery({ queryKey: ['catalog'], queryFn: loadCatalog });
  const userId = session.user?.id;
  const workspaceKey = session.workspaceKey;
  const b = useBuilder(), [loadError, setLoadError] = useState(''), [actionError, setActionError] = useState(''), [query, setQuery] = useState(''), [brand, setBrand] = useState(''), [resetKey, setResetKey] = useState(0), [info, setInfo] = useState(false), [panning, setPanning] = useState(false), [pan, setPan] = useState({ x: 0, y: 0 });
  const [reconnect, setReconnect] = useState(0), [saving, setSaving] = useState(false);
  const infoRef = useRef<HTMLDialogElement>(null), drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const selectionLocked = !session.user && session.usage.changes >= session.limits.changes;
  const hasEditorLease = Boolean(b.editorToken);
  useEffect(() => {
    if (!catalog.data) return;
    const memory = useBuilder.getState();
    if (!id && !memory.saved && memory.configuration && memory.token && memory.ownerKey === workspaceKey) return;
    let cancelled = false;
    setLoadError(''); useBuilder.getState().set({ pending: true });
    async function open() {
      try {
        let saved: SavedBuild | undefined, editorToken = '';
        if (id) {
          saved = await api<SavedBuild>(`/builds/${id}`);
          const lease = await api<{ editorToken: string }>(`/builds/${id}/lease`, { method: 'POST' }); editorToken = lease.editorToken;
        }
        const current = useBuilder.getState();
        const workspace = await api<{ configuration: Configuration; token: string }>('/workspace', { method: 'POST', body: { configuration: saved?.configuration || (userId && !current.saved ? current.configuration || undefined : undefined) } });
        if (!cancelled) {
          const carryDraft = !!userId && !saved && !current.saved && !!current.configuration;
          current.init(workspace.configuration, workspace.token, workspaceKey, saved, editorToken);
          if (carryDraft) current.set({ name: current.name, dirty: current.dirty, past: current.past, future: current.future });
        }
      } catch (error) { if (!cancelled) setLoadError(errorMessage(error)); }
      finally { if (!cancelled) useBuilder.getState().set({ pending: false }); }
    }
    void open();
    return () => { cancelled = true; };
  }, [id, userId, workspaceKey, catalog.data, reconnect]);
  useEffect(() => { if (!b.saved?._id || !hasEditorLease) return; const buildId = b.saved._id; let leaseToken = useBuilder.getState().editorToken;
    const timer = setInterval(() => { void api<{ editorToken: string }>(`/builds/${buildId}/lease`, { method: 'POST', editorToken: leaseToken }).then(r => { leaseToken = r.editorToken; if (useBuilder.getState().saved?._id === buildId) useBuilder.getState().set({ editorToken: r.editorToken }); }).catch(e => setActionError(errorMessage(e))); }, 4 * 60000);
    return () => { clearInterval(timer); void api(`/builds/${buildId}/lease`, { method: 'DELETE', editorToken: leaseToken }).catch(() => undefined); };
  }, [b.saved?._id, hasEditorLease]);
  useEffect(() => { const beforeUnload = (event: BeforeUnloadEvent) => { if (useBuilder.getState().dirty) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', beforeUnload); return () => window.removeEventListener('beforeunload', beforeUnload); }, []);
  useEffect(() => { if (info) infoRef.current?.showModal(); }, [info]);
  useEffect(() => {
    if (!selectionLocked || !session.usage.changesResetAt) return;
    const timer = setTimeout(() => { void refresh().catch(error => setActionError(errorMessage(error))); }, Math.max(1000, Date.parse(session.usage.changesResetAt) - Date.now() + 100));
    return () => clearTimeout(timer);
  }, [selectionLocked, session.usage.changesResetAt, refresh]);
  const data = withHistoricalCatalog(catalog.data?.items || [], b.saved?.catalogSnapshot), selected = b.configuration ? variantById(data, b.configuration[b.slot]) : null;
  const result = b.configuration ? compatibility(b.configuration, data) : null;
  async function change(slot: Slot, variantId: string, direction?: 'undo' | 'redo') {
    const current = useBuilder.getState();
    if (!current.configuration || current.pending || current.configuration[slot] === variantId) return;
    if (selectionLocked) return;
    current.set({ pending: true }); setActionError('');
    try {
      const next = await api<{ configuration: Configuration; token: string }>('/workspace/change', { method: 'POST', body: { token: current.token, slot, variantId } });
      current.accept(next.configuration, next.token, { slot, before: current.configuration[slot], after: variantId }, direction); await refresh();
    } catch (error) { setActionError(errorMessage(error)); await refresh(); }
    finally { current.set({ pending: false }); }
  }
  async function setMode(mode: '2d' | '3d') {
    if (mode === '2d') { b.set({ mode }); return; }
    if (b.pending) return;
    if (b.previewExpiresAt > Date.now()) { b.set({ mode }); return; }
    const testCanvas = document.createElement('canvas'); const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) { setActionError('WebGL is not available on this device. Your 2D workspace remains available.'); return; }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    b.set({ pending: true }); setActionError('');
    try { const r = await api<{ expiresAt: string }>('/workspace/preview', { method: 'POST', body: { token: b.token } }); b.set({ mode: '3d', previewExpiresAt: new Date(r.expiresAt).getTime() }); await refresh(); }
    catch (error) { setActionError(errorMessage(error)); } finally { b.set({ pending: false }); }
  }
  async function save() {
    if (!session.user) { auth('register'); return; }
    if (!b.configuration || saving) return;
    setSaving(true); setActionError('');
    try {
      const saved = await api<SavedBuild>(b.saved ? `/builds/${b.saved._id}` : '/builds', { method: b.saved ? 'PATCH' : 'POST', editorToken: b.editorToken, body: { name: b.name, configuration: b.configuration, ...(b.saved ? { revision: b.saved.revision, visibility: b.saved.visibility } : {}) } });
      b.set({ saved, dirty: false }); await client.invalidateQueries({ queryKey: ['builds'] }); notify('Build saved to your garage.');
      if (!id) navigate(`/builder/${saved._id}`, { replace: true });
    } catch (error) { setActionError(errorMessage(error)); } finally { setSaving(false); }
  }
  const chosenProducts = data.filter(p => p.status === 'published' && p.slot === b.slot && (!brand || p.brand === brand) && `${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase()));
  const Icon = categories[b.slot].icon;
  const quotaNotice = selectionLocked ? <div className="notice quota-notice" role="status"><strong>Your {session.limits.changes} component changes are used.</strong><p>Your current bicycle stays here. You can keep browsing specifications and moving the view.{session.usage.changesResetAt ? ` Changes reset ${new Date(session.usage.changesResetAt).toLocaleString()}.` : ''}</p><button className="text-button" onClick={() => auth('register')}>Create an account to keep building</button></div> : null;
  return <main className="builder-page">
    <div className="workspace-heading"><div><h1>Your next ride. Built by you.</h1><p>Independent fixed-gear configurator for modern riders.</p></div><div className="workspace-actions"><label className="build-name"><span className="sr-only">Build name</span><input aria-label="Build name" maxLength={80} value={b.name} onChange={e => b.set({ name: e.target.value, dirty: true })}/><span className="unsaved-dot" title={b.dirty ? 'Unsaved changes' : 'No unsaved changes'} data-dirty={b.dirty}/></label><button className="button primary" onClick={() => void save()} disabled={saving || b.pending || !b.configuration || !b.name.trim()}><Save size={17}/>{saving ? 'Saving…' : 'Save build'}</button></div></div>
    {(loadError || catalog.isError) ? <div className="error-box" role="alert">{loadError || errorMessage(catalog.error)} <button className="text-button" onClick={() => { setReconnect(v => v + 1); void catalog.refetch(); }}>Try again</button></div> : null}
    <div className="workbench">
      <aside className="category-rail" aria-label="Component categories">{slots.map(slot => { const I = categories[slot].icon; return <button key={slot} className={b.slot === slot ? 'active' : ''} onClick={() => { b.set({ slot }); setQuery(''); }} aria-pressed={b.slot === slot}><I size={23} strokeWidth={1.6}/><span>{categories[slot].label}</span></button>; })}<button className="help-button" onClick={() => setInfo(true)}><Info size={20}/><span>Builder guide</span></button></aside>
      <section className="viewer" aria-label="Bicycle preview">
        <div className="viewer-top"><div className="segmented" aria-label="Viewer mode"><button onClick={() => void setMode('2d')} className={b.mode === '2d' ? 'selected' : ''} aria-pressed={b.mode === '2d'}>2D</button><button onClick={() => void setMode('3d')} className={b.mode === '3d' ? 'selected' : ''} disabled={b.pending} aria-pressed={b.mode === '3d'}>3D</button></div><span className="viewer-label">ILLUSTRATIVE STUDIO ASSEMBLY</span><button className="icon-button bordered" aria-label="Fit bicycle to view" onClick={() => { b.set({ zoom: 1 }); setPan({ x: 0, y: 0 }); setResetKey(k => k + 1); }}><Maximize size={17}/></button></div>
        <div className={`canvas-area ${panning ? 'panning' : ''}`} onPointerDown={e => { if (!panning || b.mode !== '2d') return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, startX: pan.x, startY: pan.y }; }} onPointerMove={e => { if (drag.current) setPan({ x: Math.max(-200, Math.min(200, drag.current.startX + e.clientX - drag.current.x)), y: Math.max(-120, Math.min(120, drag.current.startY + e.clientY - drag.current.y)) }); }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
          {b.configuration && !loadError ? b.mode === '2d' ? <div className="pan-layer" style={{ transform: `translate(${pan.x}px,${pan.y}px)` }}><Bike2D configuration={b.configuration} catalog={data} zoom={b.zoom} active={b.slot} onSelect={panning ? undefined : slot => b.set({ slot })}/></div> : <Suspense fallback={<div className="viewer-fallback">Loading the studio…</div>}><Bike3D configuration={b.configuration} catalog={data} onSelect={slot => b.set({ slot })} resetKey={resetKey}/></Suspense> : <div className="viewer-fallback"><div className="loader"/>Preparing your bicycle…</div>}
        </div>
        <div className="viewer-controls"><button className="icon-button" aria-label="Undo last selection" title="Undo (uses a component change for guests)" disabled={!b.past.length || b.pending || selectionLocked} onClick={() => { const h = b.past.at(-1)!; void change(h.slot, h.before, 'undo'); }}><Undo2 size={16}/></button><button className="icon-button" aria-label="Redo selection" disabled={!b.future.length || b.pending || selectionLocked} onClick={() => { const h = b.future.at(-1)!; void change(h.slot, h.after, 'redo'); }}><Redo2 size={16}/></button><span className="control-divider"/><button className="reset-button" onClick={() => { b.set({ zoom: 1 }); setPan({ x: 0, y: 0 }); setResetKey(k => k + 1); }}><RotateCcw size={14}/><span>Reset view</span></button>{b.mode === '2d' && <><button className={`icon-button ${panning ? 'active' : ''}`} aria-label="Pan bicycle" aria-pressed={panning} onClick={() => setPanning(v => !v)}><Hand size={15}/></button><span className="control-divider"/><button className="icon-button bordered" aria-label="Zoom out" disabled={b.zoom <= .65} onClick={() => b.set({ zoom: Math.max(.65, b.zoom - .1) })}><Minus size={13}/></button><span className="zoom-value">{Math.round(b.zoom * 100)}%</span><button className="icon-button bordered" aria-label="Zoom in" disabled={b.zoom >= 1.5} onClick={() => b.set({ zoom: Math.min(1.5, b.zoom + .1) })}><Plus size={13}/></button></>}</div>
      </section>
      <aside className="parts-inspector">{quotaNotice}<div className="inspector-heading"><Icon size={20}/><h2>{categories[b.slot].label}</h2></div><p className="muted">{categories[b.slot].description}</p><div className="search-field"><Search size={16}/><input aria-label={`Search ${categories[b.slot].label.toLowerCase()}`} placeholder={`Search ${categories[b.slot].label.toLowerCase()}…`} value={query} onChange={e => setQuery(e.target.value)}/></div><select className="brand-filter" aria-label="Filter by brand" value={brand} onChange={e => setBrand(e.target.value)}><option value="">All brands</option>{[...new Set(data.map(p => p.brand))].map(v => <option key={v}>{v}</option>)}</select>
        <div className="product-options">{catalog.isPending ? <p className="muted">Loading parts…</p> : !chosenProducts.length ? <div className="empty-inline"><Search size={24}/><p>No parts match your search.</p><button className="text-button" onClick={() => { setQuery(''); setBrand(''); }}>Clear filters</button></div> : chosenProducts.map(product => {
          const isSelected = product.variants.some(v => v.id === b.configuration?.[b.slot]);
          return <article className={`product-option ${isSelected ? 'selected' : ''}`} key={product.id}>
            <button className="product-select" disabled={b.pending || selectionLocked || isSelected || !b.configuration} onClick={() => void change(b.slot, product.variants[0].id)} aria-label={`Select ${product.name}`} aria-pressed={isSelected}>
              <div className="part-thumbnail"><PartThumbnail product={product} color={isSelected ? selected?.variant.color : product.variants[0].color}/></div><div><span className="demo-tag">Illustrative demo</span><h3>{product.name}</h3><p>{product.description}</p></div>
            </button>
            {product.variants.length > 1 && <><div className="finish-label"><span>Finish</span><span>{isSelected ? selected?.variant.label : ''}</span></div><div className="swatches">{product.variants.map(v => <button key={v.id} title={v.label} aria-label={`${product.name} ${v.label} finish`} aria-pressed={b.configuration?.frameset === v.id} className={b.configuration?.frameset === v.id ? 'selected' : ''} style={{ '--swatch': v.color } as React.CSSProperties} disabled={b.pending || selectionLocked} onClick={() => void change(b.slot, v.id)}/>)}</div></>}
            <div className="variant-row"><span>Variant</span><select aria-label={`${product.name} variant`} disabled={b.pending || selectionLocked} value={isSelected ? b.configuration?.[b.slot] : product.variants[0].id} onChange={e => void change(b.slot, e.target.value)}>{product.variants.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</select></div>
          </article>;
        })}</div><p className="inspector-footnote">Original schematic assets. Demo parts are not products for sale.</p>
      </aside>
      <section className="build-summary" aria-label="Build specifications"><div className="selected-parts"><h3><List size={19}/>Selected parts</h3><dl>{slots.map(slot => <div key={slot}><dt>{categories[slot].label}</dt><dd>{b.configuration ? variantById(data, b.configuration[slot])?.product.name || 'Unavailable' : '—'}</dd></div>)}</dl></div><div className="ratio-summary"><h3><Cog size={20}/>Gear ratio</h3><strong>{result?.ratio?.toFixed(2) || '—'} <span>: 1</span></strong><span className="mono small">{result?.gearInches ? `${result.gearInches.toFixed(1)} gear inches · illustrative` : 'Effective wheel diameter unknown'}</span><p>Known weight: {result?.knownWeightG ? `${(result.knownWeightG / 1000).toFixed(2)} kg` : 'not available'}{result && !result.weightComplete ? ' · incomplete' : ''}</p></div><div className="compatibility-summary"><h3><ShieldCheck size={20}/>Compatibility</h3><button className={`compatibility-status ${result?.state || 'unverified'}`} onClick={() => setInfo(true)}><TriangleAlert size={18}/>{result ? stateLabel[result.state] : 'Checking…'}</button><p>{result?.unresolved ?? '—'} unresolved checks. Review fitment details before finalizing your build.</p><button className="text-button small" onClick={() => setInfo(true)}>Review checks <ArrowRight size={13}/></button></div></section>
    </div>
    {actionError && <div className="error-box action-error" role="alert">{actionError}</div>}
    <div className="guest-banner"><UserIcon/><div><b>{session.user ? 'Your workshop' : 'Guest workspace'}</b><span> · </span>{session.user ? 'Up to five saved builds. Keep making it your own.' : <>{Math.max(0, session.limits.changes - session.usage.changes)} of {session.limits.changes} component changes left / 24h.<span className="guest-reminder"> Temporary build — refresh or closing may discard it.</span></>}{!session.user && session.usage.changesResetAt && <span className="small"> Resets {new Date(session.usage.changesResetAt).toLocaleString()}.</span>}</div><button className="button primary" onClick={() => session.user ? navigate('/garage') : auth('register')}>{session.user ? 'Open my garage' : 'Create an account'}<ArrowRight size={17}/></button></div>
    {info && <dialog className="dialog info-dialog" ref={infoRef} onCancel={() => setInfo(false)}><h2>Know your build.</h2><p>{technicalDisclaimer}</p><p className="notice">This assembly uses illustrative demo parts. A green dimensional check is not proof of safe real-world assembly.</p><ul className="rule-list">{result?.rules.map(rule => <li key={rule.id}><span className={`rule-dot ${rule.state}`}/><div><strong>{stateLabel[rule.state]}</strong><p>{rule.message}</p>{rule.missing.length > 0 && <span className="small muted">Needed: {rule.missing.join(', ')}</span>}</div></li>)}</ul><h3>Guest workspace</h3><p className="small muted">Twelve accepted component changes and one 3D grant per rolling 24 hours. Undo and redo are component changes. Browsing and rejected incompatible selections use no component allowance. Your guest build stays only in memory.</p><button className="button primary full" onClick={() => setInfo(false)}>Back to the build</button></dialog>}
  </main>;
}
function UserIcon() { return <svg width="21" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="6" r="3.3"/><path d="M5 22v-4a7 7 0 0 1 14 0v4"/></svg>; }
export function PartThumbnail({ product, color }: { product: Product; color?: string }) {
  if (product.slot === 'frameset') return <svg viewBox="0 0 180 120" aria-hidden="true"><g fill="none" stroke={color || '#294f40'} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round"><path d={product.id.includes('pursuit') ? 'M20 100 65 26 84 105Z M65 26 139 39 147 66 84 105 M139 39 166 105' : 'M20 100 65 22 84 105Z M65 22 139 22 147 55 84 105 M139 22 166 105'}/></g></svg>;
  if (product.slot === 'wheels' || product.slot === 'tires') return <svg viewBox="0 0 140 120" aria-hidden="true"><circle cx="70" cy="60" r="47" fill="none" stroke="#313c33" strokeWidth={product.id.includes('deep') ? 14 : 6}/>{product.slot === 'wheels' && Array.from({ length: 16 }, (_, i) => <line key={i} x1="70" y1="60" x2={70 + Math.cos(i * Math.PI / 8) * 44} y2={60 + Math.sin(i * Math.PI / 8) * 44} stroke="#9ca498" strokeWidth="1"/>)}{product.id.includes('tire28') && <circle cx="70" cy="60" r="47" fill="none" stroke="#aa8d62" strokeWidth="3"/>}</svg>;
  const I = product.slot === 'drivetrain' ? Cog : product.slot === 'cockpit' ? Bike : SlidersHorizontal;
  return <I size={70} strokeWidth={1.2}/>;
}
