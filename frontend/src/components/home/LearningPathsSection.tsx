import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Users, ArrowRight } from 'lucide-react';
import { CMSSection } from '../../types';
import { formatImageUrl, getImageStyle } from '../../utils/cms';

interface LearningPathsProps {
  cmsData?: CMSSection;
}

export const LearningPathsSection: React.FC<LearningPathsProps> = ({ cmsData }) => {
  const title = cmsData?.title || 'Alege cum începi';
  const subtitle = cmsData?.subtitle || 'Resurse gratuite, cursuri online și workshopuri fizice – pentru fiecare etapă a ta.';

  const defaultCards = [
    {
      badge: 'GRATUIT',
      badgeClass: 'badge-mint',
      image: '/images/free_resources.jpg',
      imagePosition: 'center 15%',
      metadata_json: { image_position: 'center 15%' },
      icon: <BookOpen className="w-8 h-8 sm:w-9 sm:h-9 text-[#116448]" strokeWidth={1.8} />,
      title: 'Resurse gratuite',
      description: 'Lecții introductive, videoclipuri și fișe de studiu.',
      buttonLabel: 'Începe gratuit',
      buttonUrl: '/courses?free=true',
    },
    {
      badge: 'CU PLATĂ',
      badgeClass: 'badge-coral',
      image: '/images/online_courses.jpg',
      imagePosition: 'center 15%',
      metadata_json: { image_position: 'center 15%' },
      icon: <PlayCircle className="w-8 h-8 sm:w-9 sm:h-9 text-[#0284C7]" strokeWidth={1.8} />,
      title: 'Cursuri online',
      description: 'Teorie, demonstrații video și teste de verificare.',
      buttonLabel: 'Vezi cursurile',
      buttonUrl: '/courses',
    },
    {
      badge: 'CU PLATĂ',
      badgeClass: 'badge-coral',
      image: '/images/workshops_nurses.jpg',
      imagePosition: 'center 20%',
      metadata_json: { image_position: 'center 20%' },
      icon: <Users className="w-8 h-8 sm:w-9 sm:h-9 text-[#E11D48]" strokeWidth={1.75} />,
      title: 'Workshopuri fizice',
      description: 'Practică supravegheată, în grupe restrânse.',
      buttonLabel: 'Vezi workshopurile',
      buttonUrl: '/workshops',
    },
  ];

  // Merge CMS blocks if available, respecting active state
  const activeBlocks = (cmsData?.blocks || []).filter((b) => b.is_active !== false);

  const cards = activeBlocks.length > 0
    ? activeBlocks.map((b, i) => ({
        badge: b.badge || (b.badge_variant === 'mint' ? 'GRATUIT' : 'CU PLATĂ'),
        badgeClass: b.badge_variant === 'mint' 
          ? 'badge-mint' 
          : (b.badge_variant === 'sky' 
            ? 'bg-[#F0F7FB] text-[#0284C7] text-xs font-bold px-3 py-1 rounded-full' 
            : 'badge-coral'),
        image: formatImageUrl(b.image_url || defaultCards[i % 3].image),
        imageStyle: getImageStyle(b.metadata_json, defaultCards[i % 3].imagePosition || 'center 15%'),
        hasPlayOverlay: i === 1,
        icon: i === 0 
          ? <BookOpen className="w-8 h-8 sm:w-9 sm:h-9 text-[#116448]" strokeWidth={1.8} /> 
          : (i === 1 
            ? <PlayCircle className="w-8 h-8 sm:w-9 sm:h-9 text-[#0284C7]" strokeWidth={1.8} /> 
            : <Users className="w-8 h-8 sm:w-9 sm:h-9 text-[#E11D48]" strokeWidth={1.8} />),
        title: b.title,
        description: b.content || '',
        buttonLabel: b.link_label || (i === 0 ? 'Începe gratuit' : (i === 1 ? 'Vezi cursurile' : 'Vezi workshopurile')),
        buttonUrl: b.link_url || (i === 0 ? '/courses?free=true' : (i === 1 ? '/courses' : '/workshops')),
      }))
    : defaultCards.map((c) => ({
        ...c,
        imageStyle: getImageStyle(c.metadata_json, c.imagePosition),
        hasPlayOverlay: false,
      }));

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header with Mixed Colors */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            {title.includes('cum începi') ? (
              <>
                {title.replace('cum începi', '').trim()} <span className="text-brand-green">cum începi</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={card.title + index}
              className="group bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card Image Container with Badge */}
              <div className="relative h-56 sm:h-60 overflow-hidden bg-slate-100">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={card.imageStyle}
                />

                {/* Badge top-left */}
                {card.badge && (
                  <div className="absolute top-4 left-4">
                    <span className={card.badgeClass}>
                      {card.badge}
                    </span>
                  </div>
                )}

                {/* Play button overlay if applicable */}
                {card.hasPlayOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-navy shadow-lg transform group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8 fill-brand-navy text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body with Large Colored SVG Icon */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="shrink-0">
                      {card.icon}
                    </div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-brand-navy group-hover:text-brand-green transition-colors">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-2">
                  <Link
                    to={card.buttonUrl}
                    className="btn-primary text-xs sm:text-sm font-semibold w-full py-3 flex items-center justify-center gap-2 rounded-xl shadow-xs"
                  >
                    <span>{card.buttonLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
