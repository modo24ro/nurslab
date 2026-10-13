import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Email sau parolă incorectă');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="bg-brand-sand min-h-screen py-14 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full border border-slate-200/80 shadow-card space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img src="/NursLab_logo.svg" alt="NursLab Logo" className="h-10 mx-auto" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-brand-navy pt-2">
            Autentificare în Platformă
          </h1>
          <p className="text-xs text-slate-500">
            Continuă parcursul tău de învățare și practică medicală
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Demo Fast Login Pills */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Conturi Demo Pre-configurate
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@nurslab.ro', 'Admin123!')}
              className="p-2 rounded-xl border border-slate-200 hover:border-brand-green/40 hover:bg-slate-50 text-[11px] font-semibold text-brand-navy text-center"
            >
              Autentificare Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('student@nurslab.ro', 'Student123!')}
              className="p-2 rounded-xl border border-slate-200 hover:border-brand-green/40 hover:bg-slate-50 text-[11px] font-semibold text-brand-navy text-center"
            >
              Autentificare Student
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adresă de Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nume@exemplu.ro"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">Parolă</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 justify-center text-sm font-bold shadow-md hover:shadow-lg"
          >
            {loading ? 'Se conectează...' : 'Conectare în cont'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Nu ai încă un cont?{' '}
          <Link to="/register" className="font-bold text-brand-green hover:underline">
            Creează cont gratuit
          </Link>
        </div>

      </div>
    </div>
  );
};
