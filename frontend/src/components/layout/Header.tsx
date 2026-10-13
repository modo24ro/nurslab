import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User as UserIcon, Menu, X, BookOpen, Shield, LogOut, LayoutDashboard, Settings, Video, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    total: number;
    courses: any[];
    webinars: any[];
    articles: any[];
    speakers: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live search query with debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      api.searchGlobal(trimmed)
        .then((res) => {
          setSearchResults(res);
        })
        .catch(() => {
          setSearchResults(null);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/courses?search=${encodeURIComponent(trimmed)}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults(null);
    }
  };

  const defaultNavLinks = [
    { label: 'Acasă', to: '/' },
    { label: 'Învăță online', to: '/courses' },
    { label: 'Practica fizică', to: '/workshops' },
    { label: 'Webinarii', to: '/webinars' },
    { label: 'Invitați', to: '/invitati' },
    { label: 'Îngrijire holistică', to: '/holistic' },
    { label: 'Lumea medicală', to: '/articles' },
    { label: 'Gratuit', to: '/courses?free=true' },
  ];

  const [navLinks, setNavLinks] = useState(defaultNavLinks);

  useEffect(() => {
    api.getPublicCMS()
      .then((data) => {
        if (data?.navigation && data.navigation.length > 0) {
          const mapped = data.navigation
            .filter((item: any) => item.is_visible !== false)
            .map((item: any) => ({
              label: item.label,
              to: item.url,
            }));
          if (mapped.length > 0) {
            setNavLinks(mapped);
          }
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between min-h-[5.5rem] lg:min-h-[6.5rem] py-2 sm:py-2.5 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-green/20 rounded-lg py-1">
            <img
              src="/NursLab_logo.svg"
              alt="NursLab - Nursing Practice"
              className="h-12 sm:h-14 md:h-16 lg:h-[68px] xl:h-[76px] w-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop Navigation Links matching JPEG */}
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

          {/* Right Controls: Search Icon, User Icon, Creează cont */}
          <div className="flex items-center gap-2 sm:gap-3 xl:gap-3.5 shrink-0">
            
            {/* Search Trigger (Icon Q) */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (!searchOpen) {
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }
              }}
              className="p-2 text-slate-700 hover:text-brand-green hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
              title="Caută cursuri sau articole"
              aria-label="Căutare"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account / Auth Icon */}
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
                {/* Auth Button AS ICON (👤) matching WhatsApp Image */}
                <Link
                  to="/login"
                  className="p-2 text-slate-700 hover:text-brand-green hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
                  title="Autentificare"
                  aria-label="Autentificare"
                >
                  <UserIcon className="w-5 h-5 text-slate-700 hover:text-brand-green" />
                </Link>

                {/* Creează cont Button */}
                <Link
                  to="/register"
                  className="btn-primary text-xs sm:text-sm px-4 sm:px-5 py-2 font-medium"
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

        {/* Expandable Search Input & Live Dropdown Results */}
        {searchOpen && (
          <div className="py-3 border-t border-slate-100 animate-in fade-in duration-150 relative">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută după titlu curs (ex: Gestionarea Situațiilor Critice în Gardă), manevre sau tematici..."
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

            {/* Instant Search Results Dropdown */}
            {searchResults && searchResults.total > 0 && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Rezultate găsite ({searchResults.total})</span>
                  <button
                    onClick={() => setSearchResults(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    Închide
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                  {/* Courses */}
                  {searchResults.courses.map((item) => (
                    <Link
                      key={item.id}
                      to={item.url}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults(null);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#EBF5F0] transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-brand-navy group-hover:text-brand-green transition-colors truncate">
                            {item.title}
                          </p>
                          <span className="badge-mint text-[9px] px-1.5 py-0.5">CURS ONLINE</span>
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-green shrink-0" />
                    </Link>
                  ))}

                  {/* Webinars */}
                  {searchResults.webinars.map((item) => (
                    <Link
                      key={item.id}
                      to="/webinars"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults(null);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-brand-navy group-hover:text-brand-green transition-colors truncate">
                            {item.title}
                          </p>
                          <span className="badge-coral text-[9px] px-1.5 py-0.5">{item.badge || 'WEBINAR'}</span>
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-green shrink-0" />
                    </Link>
                  ))}

                  {/* Speakers */}
                  {searchResults.speakers.map((item) => (
                    <Link
                      key={item.id}
                      to="/invitati"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults(null);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-brand-navy group-hover:text-brand-green transition-colors truncate">
                            {item.title}
                          </p>
                          <span className="badge-sky text-[9px] px-1.5 py-0.5">INVITAT</span>
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-green shrink-0" />
                    </Link>
                  ))}

                  {/* Articles */}
                  {searchResults.articles.map((item) => (
                    <Link
                      key={item.id}
                      to={item.url}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults(null);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-brand-navy group-hover:text-brand-green transition-colors truncate">
                            {item.title}
                          </p>
                          <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">ARTICOL</span>
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-green shrink-0" />
                    </Link>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-brand-green hover:underline"
                  >
                    Vezi toate rezultatele pe pagina de cursuri →
                  </button>
                </div>
              </div>
            )}
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
                  className="btn-secondary w-full justify-center text-center flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-brand-green" />
                  <span>Autentificare</span>
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
