import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CMSSection } from '../../types';

interface MedicalWorldProps {
  cmsData?: CMSSection;
}

export const MedicalWorldSection: React.FC<MedicalWorldProps> = ({ cmsData }) => {
  const title = cmsData?.title || 'Lumea medicală';
  const subtitle = cmsData?.subtitle || 'Articole, interviuri și noutăți pentru comunitatea medicală.';
  const ctaLabel = cmsData?.metadata_json?.cta_label || 'Explorează articolele';
  const ctaUrl = cmsData?.metadata_json?.cta_url || '/articles';

  const defaultCards = [
    {
      title: 'Oameni din lumea medicală',
      url: '/articles?category=oameni-din-lumea-medicala',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Educație și carieră',
      url: '/articles?category=educatie-si-cariera',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Tehnologie în îngrijire',
      url: '/articles?category=tehnologie-in-ingrijire',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const cards = cmsData?.blocks && cmsData.blocks.length > 0
    ? cmsData.blocks.map((b, i) => ({
        title: b.title,
        url: b.link_url || defaultCards[i % 3].url,
        image: b.image_url || defaultCards[i % 3].image,
      }))
    : defaultCards;

  return (
    <section className="py-16 sm:py-20 bg-brand-sand border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy">
            {title}
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c, i) => (
            <Link
              key={c.title + i}
              to={c.url}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              {/* Photo */}
              <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Title & Arrow link at bottom */}
              <div className="p-5 flex items-center justify-between gap-3 bg-white">
                <h3 className="font-serif font-bold text-lg text-brand-navy group-hover:text-brand-green transition-colors">
                  {c.title}
                </h3>
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-brand-green group-hover:border-brand-green transition-all shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Button */}
        <div className="text-center mt-12">
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
