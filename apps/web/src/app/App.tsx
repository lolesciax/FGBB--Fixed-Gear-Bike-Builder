import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, Moon, Sun, UserRound, X } from 'lucide-react';
import { api, loadSession } from '../services/api';
import { AppContext, errorMessage, type AuthMode } from './context';
import { AuthDialog } from '../components/AuthDialog';
import { useBuilder } from '../features/builder/store';
import { BuilderPage } from '../pages/BuilderPage';
import { CatalogPage } from '../pages/CatalogPage';
import { GaragePage } from '../pages/GaragePage';
import { AccountPage, TokenPage } from '../pages/AccountPage';
import { AboutPage, HomePage, PublicBuildPage, AdminPage } from '../pages/OtherPages';
export function App() {
  const client = useQueryClient(), navigate = useNavigate();
  const session = useQuery({ queryKey: ['session'], queryFn: loadSession, retry: 1, staleTime: 30000 });
  const [authMode, setAuthMode] = useState<AuthMode | null>(null), [toast, setToast] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('tracklab-theme') || 'system');
  useEffect(() => { const media = matchMedia('(prefers-color-scheme: dark)'); const apply = () => document.documentElement.dataset.theme = (session.data?.user?.theme || theme) === 'system' ? media.matches ? 'dark' : 'light' : session.data?.user?.theme || theme; apply(); media.addEventListener('change', apply); return () => media.removeEventListener('change', apply); }, [theme, session.data?.user?.theme]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 6500); return () => clearTimeout(timer); }, [toast]);
  function canLeave(e: React.MouseEvent<HTMLAnchorElement>) { const s = useBuilder.getState(); if (s.dirty && !session.data?.user && !confirm('This guest build is temporary and will be lost when the page is closed or refreshed. Leave the workspace?')) e.preventDefault(); }
  async function toggleTheme() { const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(next); localStorage.setItem('tracklab-theme', next); if (session.data?.user) { try { await api('/account', { method: 'PATCH', body: { name: session.data.user.name, theme: next } }); await refresh(); } catch (error) { setToast(errorMessage(error)); } } }
  async function refresh() { await client.invalidateQueries({ queryKey: ['session'] }); }
  async function logout() { try { await api('/auth/logout', { method: 'POST' }); useBuilder.getState().set({ configuration: null, token: '', dirty: false }); client.removeQueries({ queryKey: ['builds'] }); await refresh(); navigate('/builder'); } catch (error) { setToast(errorMessage(error)); } }
  const shell = <>
    <header className="site-header"><Link to="/" className="wordmark" onClick={canLeave} aria-label="TrackLab home">TRACKLAB</Link><nav aria-label="Main navigation"><NavLink to="/builder" onClick={canLeave}>Builder</NavLink><NavLink to="/catalog" onClick={canLeave}>Parts catalog</NavLink><NavLink to="/garage" onClick={canLeave}>My garage</NavLink></nav><div className="header-actions"><button className="icon-button" onClick={() => void toggleTheme()} aria-label="Toggle color theme">{document.documentElement.dataset.theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>{session.data?.user ? <><Link className="account-link" to="/account"><UserRound size={17}/><span>{session.data.user.name.split(' ')[0]}</span></Link><button className="text-button signout" onClick={() => void logout()}>Sign out</button></> : <button className="text-button account-link" disabled={!session.data} onClick={() => setAuthMode('login')}><UserRound size={17}/><span>Sign in</span></button>}</div></header>
    {session.isPending ? <main className="center-state"><div className="loader"/><h1>Opening your workshop…</h1></main> : session.isError ? <main className="center-state"><h1>Let’s reconnect.</h1><p className="muted">{errorMessage(session.error)}</p><button className="button primary" onClick={() => void session.refetch()}>Retry connection</button><p className="small muted">The frontend needs the TrackLab API running. See the README for local setup.</p></main> : <AppContext.Provider value={{ session: session.data, refresh, auth: mode => setAuthMode(mode || 'login'), notify: setToast }}>
      {session.data.mode === 'ephemeral-development' && <div className="development-notice">Local development · database and usage counters reset when the API restarts.</div>}
      <Routes><Route path="/" element={<HomePage/>}/><Route path="/builder" element={<BuilderPage/>}/><Route path="/builder/:id" element={<BuilderPage/>}/><Route path="/catalog" element={<CatalogPage/>}/><Route path="/garage" element={<GaragePage/>}/><Route path="/account" element={<AccountPage/>}/><Route path="/account/:kind" element={<TokenPage/>}/><Route path="/build/:publicId" element={<PublicBuildPage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/acknowledgments" element={<AboutPage/>}/><Route path="/admin" element={<AdminPage/>}/><Route path="*" element={<main className="center-state"><h1>A wrong turn.</h1><Link to="/builder" className="button primary">Back to the workshop</Link></main>}/></Routes>
      {authMode && <AuthDialog mode={authMode} close={() => setAuthMode(null)}/>}
    </AppContext.Provider>}
    <footer className="site-footer"><span><b>TRACKLAB</b> <span className="muted">An independent project for a more considered cycling culture.</span></span><div><Link to="/about">About</Link><Link to="/acknowledgments">Brand acknowledgments <ArrowUpRight size={12}/></Link></div></footer>
    {toast && <div role="status" className="toast">{toast}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16}/></button></div>}
  </>;
  return shell;
}
