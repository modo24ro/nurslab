import React from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileEdit, BookOpen, MapPin, HeartHandshake,
  Users, CreditCard, ChevronLeft, ShieldCheck, LogOut, Video
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Se verifică permisiunile...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Panou Principal', to: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Editor Conținut CMS', to: '/admin/cms', icon: <FileEdit className="w-4 h-4" /> },
    { label: 'Cursuri & Lecții', to: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Webinarii & Invitați', to: '/admin/webinars', icon: <Video className="w-4 h-4" /> },
    { label: 'Workshopuri Locale', to: '/admin/workshops', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Îngrijiri la Domiciliu', to: '/admin/home-nursing', icon: <HeartHandshake className="w-4 h-4" /> },
    { label: 'Utilizatori & Roluri', to: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Comenzi & Facturi', to: '/admin/orders', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-navy text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 min-h-screen">
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
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
