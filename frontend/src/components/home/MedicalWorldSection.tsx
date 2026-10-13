import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CMSSection } from '../../types';
import { formatImageUrl, getImageStyle } from '../../utils/cms';

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
      image: '/images/medical_world_emergency.jpg',
      imagePosition: 'center 15%',
      metadata_json: { image_position: 'center 15%' },
    },
    {
      title: 'Educație și carieră',
      url: '/articles?category=educatie-si-cariera',
      image: '/images/medical_world_care.jpg',
      imagePosition: 'center 15%',
      metadata_json: { image_position: 'center 15%' },
    },
    {
      title: 'Tehnologie în îngrijire',
      url: '/articles?category=tehnologie-in-ingrijire',
      image: '/images/medical_world_ethics.jpg',
      imagePosition: 'center 15%',
      metadata_json: { image_position: 'center 15%' },
    },
  ];

  const activeBlocks = (cmsData?.blocks || []).filter((b) => b.is_active !== false);

  const cards = activeBlocks.length > 0
    ? activeBlocks.map((b, i) => ({
        title: b.title,
        url: b.link_url || defaultCards[i % 3].url,
        image: formatImageUrl(b.image_url || defaultCards[i % 3].image),
        imageStyle: getImageStyle(b.metadata_json, defaultCards[i % 3].imagePosition || 'center 15%'),
      }))
    : defaultCards.map((c) => ({
        ...c,
        imageStyle: getImageStyle(c.metadata_json, c.imagePosition),
      }));

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Header with Mixed Colors matching JPEG */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            {title.includes('medicală') ? (
              <>
                {title.replace('medicală', '').trim()} <span className="text-brand-green">medicală</span>
              </>
            ) : (
              title
            )}
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
              <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-100">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={c.imageStyle}
                />
              </div>

              {/* Title & Horizontal Circle Arrow */}
              <div className="p-5 sm:p-6 flex items-center justify-between gap-3 bg-white">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-brand-navy group-hover:text-brand-green transition-colors leading-snug">
                  {c.title}
                </h3>
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-green group-hover:border-brand-green transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Center Green Button matching JPEG */}
        {ctaLabel && (
          <div className="text-center mt-8 sm:mt-10">
            <Link
              to={ctaUrl}
              className="btn-primary text-sm sm:text-base font-semibold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};
