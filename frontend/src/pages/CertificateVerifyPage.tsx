import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, ShieldCheck, AlertCircle, Award, Calendar, UserCheck } from 'lucide-react';
import { api } from '../services/api';

export const CertificateVerifyPage: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const [code, setCode] = useState(urlCode || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const performVerification = (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setLoading(true);
    api.verifyCertificate(codeToVerify.trim())
      .then(setResult)
      .catch((err) => setResult({ is_valid: false, message: err.message }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (urlCode) {
      performVerification(urlCode);
    }
  }, [urlCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(code);
  };

  return (
    <div className="bg-brand-sand min-h-screen py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-green-mint text-brand-green mx-auto flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy">
            Verificare Certificat NursLab
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
            Sistem securizat de verificare a autenticității diplomelor și certificatelor de perfecționare medicală emise de platforma NursLab.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Introduceți codul unic (ex: NLB-2026-XXXXXXXX)..."
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-sm px-6 py-3 justify-center"
          >
            {loading ? 'Se verifică...' : 'Verifică acum'}
          </button>
        </form>

        {/* Result Card */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            {result.is_valid ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-green shadow-card space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="badge-mint text-[11px] px-2.5 py-0.5">Certificat Autentic Verificat</span>
                    <h3 className="text-xl font-serif font-bold text-brand-navy mt-0.5">
                      {result.message}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Curs Absolvit</span>
                    <p className="font-bold text-brand-navy mt-0.5">{result.course_title}</p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Absolvent</span>
                    <p className="font-bold text-brand-navy mt-0.5">{result.student_name}</p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Data Eliberării</span>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {new Date(result.issue_date).toLocaleDateString('ro-RO')}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Formator Atestat</span>
                    <p className="font-medium text-slate-700 mt-0.5">{result.instructor_name}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 font-mono break-all">
                  Hash de integritate criptografică: {result.verification_hash}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-300 shadow-sm flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                <div className="space-y-1">
                  <h3 className="font-bold text-brand-navy text-base">Certificat Nevalid</h3>
                  <p className="text-sm text-slate-600">{result.message}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
