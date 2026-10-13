import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, CheckCircle, FileText, Download, ArrowRight, Clock, ShieldCheck, User } from 'lucide-react';
import { api } from '../services/api';
import { StudentStats, Certificate, Invoice } from '../types';
import { useAuth } from '../context/AuthContext';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStudentDashboard().then(setStats).catch(() => {}),
      api.getMyCertificates().then(setCertificates).catch(() => {}),
      api.getMyInvoices().then(setInvoices).catch(() => {}),
    ]).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-sand py-20 text-center text-slate-500">
        Se încarcă panoul de student NursLab...
      </div>
    );
  }

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-green text-white flex items-center justify-center font-bold text-xl uppercase shadow-md">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Panou Personal Student</span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">
                Bună ziua, {user?.full_name}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {user?.hospital_affiliation || 'Asistent Medical'} • {user?.nursing_specialty || 'Nursing Clinic'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/courses" className="btn-primary text-xs px-5 py-2.5">
              Explorează cursuri noi
            </Link>
          </div>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0284C7] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-brand-navy">{stats?.total_enrolled || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Cursuri înscrise</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-brand-navy">{stats?.completed_courses || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Cursuri absolvite</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-brand-navy">{certificates.length}</p>
            <p className="text-xs text-slate-500 font-medium">Certificate atestate</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-brand-navy">{stats?.active_subscriptions || 0}</p>
            <p className="text-xs text-slate-500 font-medium">Abonamente active</p>
          </div>
        </div>

        {/* Section 1: In-Progress Courses */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-brand-navy">Continuă învățarea</h2>

          {stats?.in_progress_courses && stats.in_progress_courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.in_progress_courses.map((c) => (
                <div key={c.course_id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Progres parcurs</span>
                      <span className="font-bold text-brand-navy">{c.progress_percent}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-green h-full rounded-full transition-all duration-300"
                        style={{ width: `${c.progress_percent}%` }}
                      />
                    </div>

                    <h3 className="font-serif font-bold text-base text-brand-navy leading-snug">
                      {c.course_title}
                    </h3>
                  </div>

                  <Link
                    to={`/courses/${c.course_slug}`}
                    className="btn-primary w-full text-xs justify-center py-2"
                  >
                    <span>{c.progress_percent > 0 ? 'Continuă lecția' : 'Începe cursul'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-600">Nu ești înscris la niciun curs în acest moment.</p>
              <Link to="/courses" className="btn-primary text-xs inline-flex">
                Descoperă cursurile gratuite sau cu plată
              </Link>
            </div>
          )}
        </div>

        {/* Section 2: Certificates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-brand-navy">Certificatele mele</h2>
            <Link to="/certificate/verify" className="text-xs text-brand-green hover:underline font-semibold">
              Verificator public cod certificat →
            </Link>
          </div>

          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {cert.certificate_code}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-brand-navy">
                      {cert.course_title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Eliberat la: {new Date(cert.issue_date).toLocaleDateString('ro-RO')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <a
                      href={`/api/v1/certificates/${cert.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                    <Link
                      to={`/certificate/verify/${cert.certificate_code}`}
                      className="text-[11px] text-center text-slate-500 hover:text-brand-navy underline"
                    >
                      Verifică
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
              Absolvă un curs și promovează testul grilă pentru a genera certificatul tău de perfecționare.
            </div>
          )}
        </div>

        {/* Section 3: Invoices & Receipts (Romanian Business Compliance) */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-brand-navy">Facturi & Documente Fiscale</h2>

          {invoices.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Serie & Număr</th>
                      <th className="p-3.5">Dată Emitere</th>
                      <th className="p-3.5">Comandă</th>
                      <th className="p-3.5">Total (TVA inclus)</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-brand-navy font-mono">
                          {inv.full_invoice_number}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {new Date(inv.issue_date).toLocaleDateString('ro-RO')}
                        </td>
                        <td className="p-3.5 text-slate-600 font-mono">
                          {inv.order_number}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {inv.total_amount} {inv.currency}
                        </td>
                        <td className="p-3.5">
                          <span className="badge-mint text-[10px] px-2 py-0.5">
                            Achitată
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
              Nu ai efectuat încă achiziții plătite. Toate facturile viitoare vor apărea aici automat.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
