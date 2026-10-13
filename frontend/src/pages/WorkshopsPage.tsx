import React, { useState, useEffect } from 'react';
import { MapPin, Users, Calendar, Clock, CheckCircle2, Award, Shield, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { WorkshopCity, WorkshopTopic } from '../types';
import { LocalWorkshopsSection } from '../components/home/LocalWorkshopsSection';
import { usePageCMS } from '../utils/usePageCMS';

export const WorkshopsPage: React.FC = () => {
  const [topics, setTopics] = useState<WorkshopTopic[]>([]);

  const pageCms = usePageCMS('page_workshops', {
    kicker: 'Instruire Clinică Practică',
    title: 'Workshopuri Fizice de Nursing',
    subtitle: 'Exersare directă pe simulatoare medicale avansate, manechine anatomice și echipamente spitalicești reale, sub îndrumarea formatorilor atestați.',
  });

  useEffect(() => {
    api.getWorkshopTopics().then(setTopics).catch(() => {});
  }, []);

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14 space-y-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-12">
        
        {/* Page Header */}
        <div className="max-w-3xl space-y-3">
          {pageCms.kicker && (
            <span className="text-xs font-bold tracking-widest text-brand-green uppercase font-sans">
              {pageCms.kicker}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            {pageCms.title}
          </h1>
          {pageCms.subtitle && (
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {pageCms.subtitle}
            </p>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green-mint text-brand-green flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-brand-navy">Grupe Mici (max 10-12 cursanți)</h3>
            <p className="text-sm text-slate-600">
              Fiecare participant are timp dedicat de exersare individuală și primește feedback în timp real de la formator.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0284C7] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-brand-navy">Simulatoare Anatomice</h3>
            <p className="text-sm text-slate-600">
              Brațe de puncție cu reflux sanguin simulat, torace pentru compresiuni BLS și mulaje de plăgi chirurgicale reale.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-brand-navy">Certificare de Competență</h3>
            <p className="text-sm text-slate-600">
              Diploma eliberată atestă efectuarea manevrelor practice conform standardelor clinice europene.
            </p>
          </div>
        </div>

        {/* Form component for city interest */}
        <LocalWorkshopsSection />

      </div>
    </div>
  );
};
