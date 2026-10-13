import React from 'react';
import { Heart, MessageSquare, Sparkles, Users, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HolisticCareSection } from '../components/home/HolisticCareSection';

export const HolisticCarePage: React.FC = () => {
  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-green uppercase font-sans">
            Filosofia de Îngrijire NursLab
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            Abordarea Holistică în Nursing
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Tratăm omul în totalitatea sa, nu doar diagnosticul. Îngrijirea holistică integrează dimensiunile fizice, psiho-emoționale, spirituale și sociale pentru o vindecare autentică.
          </p>
        </div>

        {/* 4 Deep Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-green-mint text-brand-green flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-brand-navy">1. Dimensiunea Fizică</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Asigurarea confortului corporal, managementul durerii prin evaluare pe scale validate (VAS/NRS), igiena riguroasă, nutriția adecvată și mobilizarea precoce a pacientului.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green" /> Administrarea la timp a analgezicelor prescrise</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green" /> Prevenirea leziunilor de decubit prin repoziționare</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0284C7] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-brand-navy">2. Dimensiunea Psiho-Emoțională</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ascultarea activă a fricilor pacientului, reducerea anxietății legate de procedurile invazive și oferirea de explicații clare, într-un limbaj accesibil, fără jargon intimidant.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green" /> Validarea emoțiilor și oferirea unui climat de siguranță</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green" /> Tehnici de respirație ghidată înaintea manevrelor dureroase</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-brand-navy">3. Dimensiunea Spirituală</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Respectarea convingerilor religioase, a valorilor etice și a ritualurilor pacientului, fără judecată sau prejudecăți, facilitând accesul la asistență religioasă sau momente de reflecție.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green" /> Respectul pentru demnitatea persoanei în orice stadiu al bolii</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green" /> Sprijin spiritual în îngrijirea paliativă</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-brand-navy">4. Dimensiunea Socială & Relațională</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Implicarea familiei și a aparținătorilor în planul de îngrijire, instruirea lor pentru perioada de convalescență și conectarea cu resursele de asistență socială din comunitate.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green" /> Educarea aparținătorilor privind schimbarea pansamentelor</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-green" /> Evitarea izolării sociale a pacientului cronic</li>
            </ul>
          </div>

        </div>

        {/* Holistic Care Overview Component */}
        <HolisticCareSection />

      </div>
    </div>
  );
};
