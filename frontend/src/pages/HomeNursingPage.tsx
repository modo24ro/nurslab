import React, { useState, useEffect } from 'react';
import { Home, Heart, ShieldCheck, CheckCircle2, Phone, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { HomeNursingService, CMSSection } from '../types';
import { HomeNursingSection } from '../components/home/HomeNursingSection';
import { usePageCMS } from '../utils/usePageCMS';

export const HomeNursingPage: React.FC = () => {
  const [services, setServices] = useState<HomeNursingService[]>([]);
  const [nursingCms, setNursingCms] = useState<CMSSection | undefined>();

  const pageCms = usePageCMS('page_home_nursing', {
    kicker: 'Asistență Medicală Mobilă',
    title: 'Servicii de Nursing la Domiciliu',
    subtitle: 'Îngrijire profesionistă, empatică și sigură în confortul căminului dumneavoastră, asigurată de asistenți medicali autorizați OAMGMAMR.',
  });

  useEffect(() => {
    api.getHomeNursingServices().then(setServices).catch(() => {});
    api.getPublicCMS()
      .then((data) => {
        if (data?.sections) {
          const found = data.sections.find((s: CMSSection) => s.section_key === 'home_nursing');
          if (found) setNursingCms(found);
        }
      })
      .catch(() => {});
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

        {/* Services Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-green-mint text-brand-green flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-brand-navy">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase">Tarif orientativ</span>
                <span className="text-sm font-bold text-brand-green">{s.price_estimate || 'La cerere'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Form Banner with CMS data */}
        <HomeNursingSection cmsData={nursingCms} />

      </div>
    </div>
  );
};
