import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, CreditCard, Award, MapPin, HeartHandshake,
  TrendingUp, CheckCircle, ArrowRight, Shield, Video, Clock,
  AlertCircle, DollarSign, Activity, FileText, CheckCircle2,
  Calendar, RefreshCw, Sparkles, ChevronRight, UserCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = () => {
    setIsLoading(true);
    api.getAdminStats()
      .then(setStats)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Tablou de Bord Executiv</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Prezentare Generală Platformă</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitorizare în timp real a indicatorilor educaționali, financiari, resurselor clinice și solicitărilor medicale.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-green' : ''}`} />
          <span>Actualizează Statistici</span>
        </button>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Venituri & Comenzi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Venituri Totale Facturate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-brand-navy">
              {stats?.total_revenue_ron ? stats.total_revenue_ron.toFixed(2) : '0.00'}{' '}
              <span className="text-sm font-semibold text-slate-500">RON</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              RO e-Factura & Stripe Live
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>
              Achitate: <strong>{stats?.paid_orders_count || 0}</strong>
            </span>
            <span>
              AOV: <strong>{stats?.average_order_value_ron ? stats.average_order_value_ron.toFixed(0) : 0} RON</strong>
            </span>
          </div>
        </div>

        {/* KPI 2: Utilizatori pe roluri */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Comunitate & Utilizatori</span>
            <div className="w-8 h-8 rounded-xl bg-brand-green-mint text-brand-green flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-brand-navy">{stats?.total_users || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Conturi înregistrate</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>
              Studenți: <strong>{stats?.students_count || 0}</strong>
            </span>
            <span>
              Formatori: <strong>{stats?.instructors_count || 0}</strong>
            </span>
            <span>
              Admini: <strong>{stats?.admins_count || 0}</strong>
            </span>
          </div>
        </div>

        {/* KPI 3: Cursuri & Lecții */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog Cursuri Online</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-brand-navy">{stats?.total_courses || 0}</p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">
              {stats?.total_enrollments || 0} înscrieri totale
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>
              Plătite: <strong>{stats?.paid_courses_count || 0}</strong>
            </span>
            <span>
              Gratuite: <strong>{stats?.free_courses_count || 0}</strong>
            </span>
            <span>
              Lecții: <strong>{stats?.total_lessons_count || 0}</strong>
            </span>
          </div>
        </div>

        {/* KPI 4: Certificate Emise */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Certificate & Atestate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-brand-navy">{stats?.certificates_issued || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Diplome cu cod unic verificate</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Abonamente Active: <strong>{stats?.active_subscribers || 0}</strong></span>
            <span>Webinarii: <strong>{stats?.total_webinars || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Secondary Operations Grid: Workshopuri & Îngrijiri la Domiciliu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Workshopuri Fizice în Orașe */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-green-mint text-brand-green flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-brand-navy">Workshopuri Practice în Orașe</h3>
                <p className="text-xs text-slate-500">Leads și asistenți medicali înregistrați pe orașe</p>
              </div>
            </div>
            <span className="badge-mint text-xs font-bold px-3 py-1">
              {stats?.pending_workshop_leads || 0} noi
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Înscrieri</span>
              <strong className="text-sm text-slate-900">{stats?.total_workshop_registrations || 0}</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Contactați Tel.</span>
              <strong className="text-sm text-blue-600">{stats?.contacted_workshop_leads || 0}</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Înscriși în Grupă</span>
              <strong className="text-sm text-emerald-600">{stats?.enrolled_workshop_leads || 0}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">Organizare ateliere București, Cluj, Timișoara, Iași</span>
            <Link
              to="/admin/workshops"
              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 font-bold shadow-xs"
            >
              <span>Gestionează Înscrierile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Solicitări Îngrijiri la Domiciliu */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-brand-red flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-brand-navy">Solicitări Îngrijiri la Domiciliu</h3>
                <p className="text-xs text-slate-500">Tratamente, pansamente plăgi și vizite la pat</p>
              </div>
            </div>
            {Number(stats?.urgent_home_nursing || 0) > 0 ? (
              <span className="badge-coral text-xs font-bold px-3 py-1 inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {stats?.urgent_home_nursing} Urgențe
              </span>
            ) : (
              <span className="badge-mint text-xs font-bold px-3 py-1">
                {stats?.pending_home_nursing_leads || 0} în așteptare
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Solicitări</span>
              <strong className="text-sm text-slate-900">{stats?.total_home_nursing_requests || 0}</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Programate</span>
              <strong className="text-sm text-blue-600">{stats?.scheduled_home_nursing || 0}</strong>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Finalizate</span>
              <strong className="text-sm text-emerald-600">{stats?.completed_home_nursing || 0}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">Triaj și alocare asistenți medicali pe teren</span>
            <Link
              to="/admin/home-nursing"
              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 font-bold shadow-xs"
            >
              <span>Gestionează Solicitările</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Modules Navigation Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-green">
              Navigare Rapidă Module Administrative
            </span>
            <h3 className="font-serif font-bold text-xl text-white mt-0.5">
              Module cu Administrare Completă & Căutare Live
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Fiecare modul suportă adăugare manuală, editare completă, ștergere sigură și filtrare instantanee în timp real.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/orders"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5 text-brand-green" />
              <span>Comenzi & Plăți</span>
            </Link>
            <Link
              to="/admin/users"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Utilizatori & Roluri</span>
            </Link>
            <Link
              to="/admin/home-nursing"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Îngrijiri Domiciliu</span>
            </Link>
            <Link
              to="/admin/workshops"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Workshopuri</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Feeds Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Orders Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-serif font-bold text-brand-navy">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Ultimele Comenzi Înregistrate</span>
            </div>
            <Link to="/admin/orders" className="text-xs text-brand-green hover:underline font-bold flex items-center gap-1">
              <span>Toate comenzile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recent_orders && stats.recent_orders.length > 0 ? (
              stats.recent_orders.map((o) => (
                <div
                  key={o.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{o.customer_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{o.order_number} • {o.billing_email}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-900">{Number(o.total_amount).toFixed(2)} {o.currency}</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {o.status === 'paid' ? 'Achitată' : o.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Nu există încă comenzi recente.</p>
            )}
          </div>
        </div>

        {/* Recent Users Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-serif font-bold text-brand-navy">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Utilizatori Înregistrați Recent</span>
            </div>
            <Link to="/admin/users" className="text-xs text-brand-green hover:underline font-bold flex items-center gap-1">
              <span>Toți utilizatorii</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recent_users && stats.recent_users.length > 0 ? (
              stats.recent_users.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{u.full_name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-800 uppercase">
                      {u.role === 'student' ? 'Cursant' : u.role === 'instructor' ? 'Formator' : u.role}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Nu există utilizatori recenți.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
