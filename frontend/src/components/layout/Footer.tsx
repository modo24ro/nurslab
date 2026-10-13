import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, CheckCircle2, MapPin, Phone, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-brand-navy text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
              <img src="/NursLab_logo.svg" alt="NursLab Logo" className="h-11 sm:h-12 w-auto object-contain" />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Platformă medicală de e-learning și instruire practică pentru asistenți medicali, studenți și profesioniști din domeniul sănătății. Învață. Exersează. Aplică.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-brand-green" />
                <span>Certificat Atestat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-brand-red" />
                <span>Practică Medicală Riguroasă</span>
              </div>
            </div>
          </div>

          {/* Col 1: Educație & Cursuri */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Educație Online</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/courses" className="hover:text-white transition-colors">Toate cursurile</Link></li>
              <li><Link to="/courses?free=true" className="hover:text-white transition-colors">Resurse gratuite</Link></li>
              <li><Link to="/courses?category=urgente-terapie-intensiva" className="hover:text-white transition-colors">Urgențe & ATI</Link></li>
              <li><Link to="/courses?category=practica-clinica" className="hover:text-white transition-colors">Tehnici de recoltare</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Planuri & Abonamente</Link></li>
            </ul>
          </div>

          {/* Col 2: Evenimente & Practică */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Practică & Evenimente</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/workshops" className="hover:text-white transition-colors">Workshopuri locale</Link></li>
              <li><Link to="/webinars" className="hover:text-white transition-colors">Webinarii & Invitați</Link></li>
              <li><Link to="/home-nursing" className="hover:text-white transition-colors">Îngrijiri la domiciliu</Link></li>
              <li><Link to="/holistic" className="hover:text-white transition-colors">Îngrijire holistică</Link></li>
              <li><Link to="/articles" className="hover:text-white transition-colors">Articole & Ghiduri</Link></li>
            </ul>
          </div>

          {/* Col 3: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Comunitate & Noutăți</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Primește protocoale clinice actualizate, notificări pentru workshopuri noi și acces gratuit la webinarii.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-brand-green/20 border border-brand-green/40 rounded-xl text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mulțumim! Te-ai abonat cu succes la noutățile medicale NursLab.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="adresa.ta@spital.ro"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-green"
                />
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green-dark text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Abonează-te gratuit
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} NursLab Medical Education S.R.L. Toate drepturile rezervate. Conformitate RO e-Factura.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/certificate/verify" className="hover:text-slate-300 transition-colors">Verificare Certificat</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Termeni și Condiții</Link>
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Politica de Confidențialitate (GDPR)</Link>
            <Link to="/cookies" className="hover:text-slate-300 transition-colors">Politica Cookie-uri</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
