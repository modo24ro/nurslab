import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileEdit, BookOpen, MapPin, HeartHandshake,
  Users, CreditCard, ChevronLeft, LogOut, Video, Settings, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Se verifică permisiunile...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Panou Principal', shortLabel: 'Panou', to: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Editor Conținut CMS', shortLabel: 'CMS', to: '/admin/cms', icon: <FileEdit className="w-4 h-4" /> },
    { label: 'Cursuri & Lecții', shortLabel: 'Cursuri', to: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Webinarii & Invitați', shortLabel: 'Webinarii', to: '/admin/webinars', icon: <Video className="w-4 h-4" /> },
    { label: 'Workshopuri Locale', shortLabel: 'Workshop', to: '/admin/workshops', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Îngrijiri la Domiciliu', shortLabel: 'Domiciliu', to: '/admin/home-nursing', icon: <HeartHandshake className="w-4 h-4" /> },
    { label: 'Utilizatori & Roluri', shortLabel: 'Useri', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Comenzi & Facturi', shortLabel: 'Comenzi', to: '/admin/orders', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Setări Platformă', shortLabel: 'Setări', to: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  // Primary 4 tabs for narrow mobile phones (< 640px); the 5th slot opens the full drawer
  const primaryMobilePaths = ['/admin', '/admin/cms', '/admin/courses', '/admin/orders'];
  const primaryMobileItems = navItems.filter((item) => primaryMobilePaths.includes(item.to));
  const isOverflowRouteActive = !primaryMobilePaths.includes(location.pathname);

  const currentNavItem = navItems.find((item) => item.to === location.pathname);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Compact Mobile & Tablet Top Header (< lg, including Z Fold 6 inner screen) */}
      <header className="lg:hidden sticky top-0 z-30 bg-brand-navy text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-sm">
        <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-green flex items-center justify-center text-white font-serif font-bold text-base shadow-sm shrink-0">
            N
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-sm text-white tracking-tight leading-tight">
                Nurs<span className="text-brand-green">Lab</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-green/20 text-brand-green px-1.5 py-0.5 rounded">
                ADMIN
              </span>
            </div>
            {currentNavItem && (
              <span className="text-[11px] text-slate-400 font-medium block truncate">
                {currentNavItem.label}
              </span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Înapoi pe site-ul public"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Site</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Deconectare"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ieșire</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (>= lg / 1024px) */}
      <aside className="hidden lg:flex lg:w-64 bg-brand-navy text-slate-300 flex-col justify-between shrink-0 border-r border-slate-800 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div>
          {/* Brand & Admin Badge */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-green flex items-center justify-center text-white font-serif font-bold text-base shadow-sm">
                N
              </div>
              <div>
                <span className="font-serif font-bold text-base text-white tracking-tight block leading-tight">
                  Nurs<span className="text-brand-green">Lab</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Panou Administrare
                </span>
              </div>
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-green/20 text-brand-green px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-brand-green text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors p-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Înapoi pe site-ul public</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 p-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Deconectare</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-10 pb-24 lg:pb-10 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Mobile Bottom Sheet Drawer (for narrow phones < sm when "Meniu" is tapped) */}
      {mobileMenuOpen && (
        <div className="lg:hidden sm:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute bottom-[64px] inset-x-0 bg-brand-navy border-t border-slate-700/80 rounded-t-3xl p-4 pb-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Toate Secțiunile Admin
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Închide meniul"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-center transition-all ${
                      active
                        ? 'bg-brand-green text-white shadow-md'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[11px] font-semibold leading-tight">{item.shortLabel}</span>
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
              <Link
                to="/"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 text-slate-200 text-xs font-semibold hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Site Public</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25"
              >
                <LogOut className="w-4 h-4" />
                <span>Deconectare</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar (< lg: phones, Z Fold 6 inner screen, tablets) */}
      <nav
        aria-label="Navigare administrare"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-brand-navy/95 backdrop-blur-md border-t border-slate-800 text-slate-300 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]"
      >
        {/* Narrow mobile (< 640px): 4 primary tabs + "Meniu" drawer trigger */}
        <div className="grid grid-cols-5 sm:hidden h-16 px-1">
          {primaryMobileItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl my-1 transition-colors ${
                  active ? 'text-brand-green' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-brand-green/20 text-brand-green' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold leading-none truncate max-w-full px-1">
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`relative flex flex-col items-center justify-center gap-1 rounded-xl my-1 transition-colors ${
              mobileMenuOpen || isOverflowRouteActive
                ? 'text-brand-green'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span
              className={`p-1.5 rounded-xl transition-colors ${
                mobileMenuOpen || isOverflowRouteActive ? 'bg-brand-green/20 text-brand-green' : ''
              }`}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </span>
            <span className="text-[10px] font-semibold leading-none">Meniu</span>
            {isOverflowRouteActive && !mobileMenuOpen && (
              <span className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-brand-green" />
            )}
          </button>
        </div>

        {/* Wide mobile / Z Fold 6 inner screen / Tablet (640px - 1023px): all 9 items visible in one bottom bar */}
        <div className="hidden sm:grid sm:grid-cols-9 h-16 px-2 gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl my-1.5 px-1 transition-colors ${
                  active
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-semibold leading-none truncate max-w-full">
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
