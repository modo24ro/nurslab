import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User as UserIcon, Menu, X, BookOpen, Shield, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Învățare online', to: '/courses' },
    { label: 'Practică fizică', to: '/workshops' },
    { label: 'Webinarii', to: '/webinars' },
    { label: 'Invitați', to: '/webinars#invitati' },
    { label: 'Îngrijire holistică', to: '/holistic' },
    { label: 'Lumea medicală', to: '/articles' },
    { label: 'Gratuit', to: '/courses?free=true' },
  ];

  const isActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-green/20 rounded-lg py-1">
            <img
              src="/NursLab_logo.svg"
              alt="NursLab - Nursing Practice"
              className="h-9 sm:h-10 xl:h-11 w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`whitespace-nowrap text-[13.5px] xl:text-[14.5px] font-medium transition-colors duration-150 py-1 ${
                  isActive(link.to)
                    ? 'text-brand-green font-semibold border-b-2 border-brand-green'
                    : 'text-slate-700 hover:text-brand-green'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 xl:gap-4 shrink-0">
            
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-600 hover:text-brand-navy hover:bg-slate-100 rounded-full transition-colors"
              title="Caută cursuri sau articole"
              aria-label="Căutare"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 hover:border-brand-green/40 bg-slate-50 hover:bg-white transition-all text-sm font-medium text-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">{user.full_name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Conectat ca</p>
                      <p className="text-sm font-semibold text-brand-navy truncate">{user.full_name}</p>
                      <p className="text-xs text-brand-green font-medium capitalize">{user.role}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-green transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Panou Student & Cursuri
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-brand-navy font-semibold hover:bg-brand-green-mint hover:text-brand-green transition-colors"
                      >
                        <Settings className="w-4 h-4 text-brand-green" />
                        Panou Administrare CMS
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Deconectare
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-slate-700 hover:text-brand-green px-3 py-2 transition-colors"
                >
                  Autentificare
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Creează cont
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Meniu mobil"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="py-3 border-t border-slate-100 animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută cursuri, manevre clinice, articole sau tehnici de recoltare..."
                autoFocus
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:bg-white"
              />
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
              >
                Caută
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive(link.to)
                  ? 'bg-brand-green-mint text-brand-green font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full justify-center text-center"
                >
                  Autentificare
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full justify-center text-center"
                >
                  Creează cont
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full justify-center text-center"
                >
                  Panou Student
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary w-full justify-center text-center"
                  >
                    Panou Administrare CMS
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm text-red-600 font-medium"
                >
                  Deconectare
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
