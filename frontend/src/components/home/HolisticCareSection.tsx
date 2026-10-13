import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Sparkles, Users, ArrowRight } from 'lucide-react';
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
      icon: <Heart className="w-5 h-5 text-brand-green" />,
      bg: 'bg-white',
      border: 'border-slate-100',
    },
    {
      title: 'Îngrijire psiho-emoțională',
      description: 'Ascultare, empatie și sprijin emoțional.',
      icon: <MessageSquare className="w-5 h-5 text-[#0284C7]" />,
      bg: 'bg-white',
      border: 'border-slate-100',
    },
    {
      title: 'Îngrijire spirituală',
      description: 'Respect pentru valorile și convingerile personale.',
      icon: <Sparkles className="w-5 h-5 text-brand-green" />,
      bg: 'bg-white',
      border: 'border-slate-100',
    },
    {
      title: 'Îngrijire socială',
      description: 'Relații, familie și sprijin în comunitate.',
      icon: <Users className="w-5 h-5 text-[#EA580C]" />,
      bg: 'bg-white',
      border: 'border-slate-100',
    },
  ];

  const cards = cmsData?.blocks && cmsData.blocks.length > 0
    ? cmsData.blocks.map((b, i) => ({
        title: b.title,
        description: b.content || '',
        icon: i === 0 ? <Heart className="w-5 h-5 text-brand-green" /> : (i === 1 ? <MessageSquare className="w-5 h-5 text-[#0284C7]" /> : (i === 2 ? <Sparkles className="w-5 h-5 text-brand-green" /> : <Users className="w-5 h-5 text-[#EA580C]" />)),
        bg: 'bg-white',
        border: 'border-slate-100',
      }))
    : defaultCards;

  return (
    <section className="py-16 sm:py-20 bg-[#F4F7F6]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy">
            {title}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {cards.map((c, idx) => (
            <div
              key={c.title + idx}
              className={`${c.bg} p-6 rounded-2xl border ${c.border} shadow-sm hover:shadow-card transition-all duration-200 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  {c.icon}
                </div>
                <h3 className="font-serif font-bold text-lg text-brand-navy">
                  {c.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {c.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10">
          <Link
            to={ctaUrl}
            className="btn-primary text-sm font-semibold px-7 py-3"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

      </div>
    </section>
  );
};
