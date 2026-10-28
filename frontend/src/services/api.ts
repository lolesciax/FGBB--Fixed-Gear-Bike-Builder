import type { QuotaPolicy, Product, Configuration } from '@tracklab/domain';
export type Account = { id: string; email: string; name: string; verified: boolean; role: string; theme: 'light' | 'dark' | 'system' };
export type SessionInfo = { developmentUnlimited:boolean; accountUsage:{active:number;published:number;createdToday:number;createdMonth:number;exportsToday:number}|null; policy: QuotaPolicy; user: Account | null; csrf: string; workspaceKey: string; mode: string; limits: { builds: number; publish: number; changes: number; previews: number }; usage: { changes: number; previews: number; changesResetAt: string | null; previewsResetAt: string | null } };
export type SavedBuild = { _id: string; name: string; configuration: Configuration; catalogSnapshot?: Product[]; revision: number; visibility: 'private' | 'public'; publicId?: string; updatedAt: string };
export class RequestError extends Error { constructor(public code: string, message: string, public details?: unknown, public retryAfterSeconds?: number) { super(message); } }
let csrf = '';
export function setCsrf(value: string) { csrf = value; }
export async function api<T>(path: string, options: { method?: string; body?: unknown; raw?:Blob; editorToken?: string; signal?: AbortSignal } = {}): Promise<T> {
  let response: Response;
  try { response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api${path}`, { method: options.method || 'GET', credentials: 'include', signal: options.signal, headers: { ...(options.raw ? { 'Content-Type': options.raw.type || 'model/gltf-binary' } : options.body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(options.method && options.method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}), ...(options.editorToken ? { 'X-Editor-Token': options.editorToken } : {}) }, body: options.raw || (options.body !== undefined ? JSON.stringify(options.body) : undefined) }); }
  catch (error) { if ((error as Error).name === 'AbortError') throw error; throw new RequestError('NETWORK_ERROR', 'The workshop could not connect to the API. Check your connection and retry.'); }
  let result;
  try { result = await response.json(); } catch { throw new RequestError('INVALID_RESPONSE', 'The API returned an unexpected response. Please retry.'); }
  if (!response.ok) throw new RequestError(result.error?.code || 'REQUEST_FAILED', result.error?.message || 'The request failed.', result.error?.details, result.error?.retryAfterSeconds);
  if (result.csrf) setCsrf(result.csrf);
  return result as T;
}
export const loadSession = () => api<SessionInfo>('/session').then(s => { setCsrf(s.csrf); return s; });
export async function loadCatalog() {
  const first=await api<{items:Product[];total:number;configuration:Configuration}>('/catalog?limit=30');
  const items=[...first.items];
  for(let page=2;items.length<first.total&&page<=100;page++){
    const next=await api<{items:Product[]}>('/catalog?limit=30&page='+page);
    if(!next.items.length)break;items.push(...next.items);
  }
  return {...first,items};
}
