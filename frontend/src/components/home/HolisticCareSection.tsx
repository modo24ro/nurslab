import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Leaf, Users, ArrowRight } from 'lucide-react';
import { CMSSection } from '../../types';

interface HolisticCareProps {
  cmsData?: CMSSection;
}

export const HolisticCareSection: React.FC<HolisticCareProps> = ({ cmsData }) => {
  const title = cmsData?.title || 'Abordarea holistică a îngrijirii pacienților';
  const subtitle = cmsData?.subtitle || 'Grijă pentru persoană, în toate dimensiunile sale.';
  const ctaLabel = cmsData?.metadata_json?.cta_label || 'Descoperă abordarea holistică';
  const ctaUrl = cmsData?.metadata_json?.cta_url || '/holistic';

  const defaultCards = [
    {
      title: 'Îngrijire fizică',
      description: 'Confort și nevoi fizice.',
      icon: <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#116448]" strokeWidth={1.75} />,
      iconBg: 'bg-[#EBF5F0] border-emerald-100',
    },
    {
      title: 'Îngrijire psiho-emoțională',
      description: 'Ascultare, empatie și sprijin emoțional.',
      icon: <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#0891B2]" strokeWidth={1.75} />,
      iconBg: 'bg-[#E0F7FA] border-cyan-100',
    },
    {
      title: 'Îngrijire spirituală',
      description: 'Respect pentru valorile și convingerile personale.',
      icon: <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-[#116448]" strokeWidth={1.75} />,
      iconBg: 'bg-[#EBF5F0] border-emerald-100',
    },
    {
      title: 'Îngrijire socială',
      description: 'Relații, familie și sprijin în comunitate.',
      icon: <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#D97706]" strokeWidth={1.75} />,
      iconBg: 'bg-[#FEF3C7] border-amber-100',
    },
  ];

  const activeBlocks = (cmsData?.blocks || []).filter((b) => b.is_active !== false);

  const cards = activeBlocks.length > 0
    ? activeBlocks.map((b, i) => ({
        title: b.title,
        description: b.content || '',
        icon: i === 0 
          ? <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-[#116448]" strokeWidth={1.75} /> 
          : (i === 1 
            ? <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#0891B2]" strokeWidth={1.75} /> 
            : (i === 2 
              ? <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-[#116448]" strokeWidth={1.75} /> 
              : <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#D97706]" strokeWidth={1.75} />)),
        iconBg: i === 0 ? 'bg-[#EBF5F0] border-emerald-100' : (i === 1 ? 'bg-[#E0F7FA] border-cyan-100' : (i === 2 ? 'bg-[#EBF5F0] border-emerald-100' : 'bg-[#FEF3C7] border-amber-100')),
      }))
    : defaultCards;

  return (
    <section className="relative py-8 sm:py-12 bg-[#F2F8F5]/80 overflow-hidden">
      
      {/* Decorative leaf SVGs on side margins */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none text-emerald-800">
        <svg width="220" height="420" viewBox="0 0 200 400" fill="currentColor">
          <path d="M0,200 Q80,120 180,150 Q100,240 0,200 Z" />
          <path d="M0,240 Q100,200 190,300 Q90,340 0,240 Z" />
          <path d="M0,160 Q60,80 150,90 Q80,170 0,160 Z" />
        </svg>
      </div>
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none text-emerald-800 transform scale-x-[-1]">
        <svg width="220" height="420" viewBox="0 0 200 400" fill="currentColor">
          <path d="M0,200 Q80,120 180,150 Q100,240 0,200 Z" />
          <path d="M0,240 Q100,200 190,300 Q90,340 0,240 Z" />
          <path d="M0,160 Q60,80 150,90 Q80,170 0,160 Z" />
        </svg>
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header with Mixed Colors matching JPEG */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            {title.includes('a îngrijirii pacienților') ? (
              <>
                {title.replace('a îngrijirii pacienților', '').trim()} <span className="text-brand-green">a îngrijirii pacienților</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* 2x2 Grid with horizontal card layout matching JPEG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {cards.map((c, idx) => (
            <div
              key={c.title + idx}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-card transition-all duration-200 flex items-center gap-5"
            >
              {/* Large Colored SVG Icon in rounded pastel circle */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${c.iconBg} border flex items-center justify-center shrink-0 shadow-xs`}>
                {c.icon}
              </div>

              {/* Text info */}
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-brand-navy">
                  {c.title}
                </h3>
                <p className="text-sm text-slate-600 leading-snug">
                  {c.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Center Pill Button matching JPEG */}
        <div className="text-center mt-8 sm:mt-10">
          <Link
            to={ctaUrl}
            className="btn-primary text-sm sm:text-base font-semibold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

      </div>
    </section>
  );
};
