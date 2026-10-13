import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, CreditCard, Award, MapPin, HeartHandshake,
  TrendingUp, CheckCircle, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats()
      .then(setStats)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Tablou de Bord Executiv</span>
        <h1 className="text-3xl font-serif font-bold text-brand-navy">Prezentare Generală Platformă</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitorizare în timp real a indicatorilor educaționali, financiari și a solicitărilor medicale.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Utilizatori</span>
            <Users className="w-5 h-5 text-brand-green" />
          </div>
          <p className="text-3xl font-bold text-brand-navy">{stats?.total_users || 0}</p>
          <p className="text-xs text-slate-500">Asistenți și formatori înregistrați</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Venituri Totale</span>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-brand-navy">{stats?.total_revenue_ron?.toFixed(2) || '0.00'} RON</p>
          <p className="text-xs text-emerald-600 font-medium">Facturate conform RO e-Factura</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cursuri Publicate</span>
            <BookOpen className="w-5 h-5 text-[#0284C7]" />
          </div>
          <p className="text-3xl font-bold text-brand-navy">{stats?.total_courses || 0}</p>
          <p className="text-xs text-slate-500">{stats?.total_enrollments || 0} înscrieri totale</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Certificate Emise</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-brand-navy">{stats?.certificates_issued || 0}</p>
          <p className="text-xs text-slate-500">Certificate atestate verificate</p>
        </div>

      </div>

      {/* Actionable Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Workshop leads box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-green-mint text-brand-green flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-brand-navy">Workshopuri Locale</h3>
            </div>
            <span className="badge-mint text-xs">
              {stats?.pending_workshop_leads || 0} înscrieri noi
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Utilizatorii au selectat orașul și tema de interes pentru viitoarele workshopuri fizice.
          </p>
          <Link
            to="/admin/workshops"
            className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <span>Gestionează înscrierile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Home nursing leads box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-brand-red flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-brand-navy">Îngrijiri la Domiciliu</h3>
            </div>
            <span className="badge-coral text-xs">
              {stats?.pending_home_nursing_leads || 0} solicitări
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Solicitări primite de la pacienți și aparținători pentru tratamente și vizite medicale.
          </p>
          <Link
            to="/admin/home-nursing"
            className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <span>Gestionează solicitările</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};
