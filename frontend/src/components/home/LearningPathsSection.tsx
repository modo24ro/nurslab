import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, Users, ArrowRight } from 'lucide-react';
import { CMSSection } from '../../types';

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
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      icon: <BookOpen className="w-5 h-5 text-brand-green" />,
      iconBg: 'bg-[#EBF5F0]',
      title: 'Resurse gratuite',
      description: 'Lecții introductive, videoclipuri și fișe de studiu.',
      buttonLabel: 'Începe gratuit',
      buttonUrl: '/courses?free=true',
    },
    {
      badge: 'CU PLATĂ',
      badgeClass: 'badge-coral',
      image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
      hasPlayOverlay: true,
      icon: <PlayCircle className="w-5 h-5 text-[#0284C7]" />,
      iconBg: 'bg-[#F0F7FB]',
      title: 'Cursuri online',
      description: 'Teorie, demonstrații video și teste de verificare.',
      buttonLabel: 'Vezi cursurile',
      buttonUrl: '/courses',
    },
    {
      badge: 'CU PLATĂ',
      badgeClass: 'badge-coral',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
      icon: <Users className="w-5 h-5 text-brand-red" />,
      iconBg: 'bg-[#FFF0ED]',
      title: 'Workshopuri fizice',
      description: 'Practică supravegheată, în grupe restrânse.',
      buttonLabel: 'Vezi workshopurile',
      buttonUrl: '/workshops',
    },
  ];

  // Merge CMS blocks if available
  const cards = cmsData?.blocks && cmsData.blocks.length > 0
    ? cmsData.blocks.map((b, i) => ({
        badge: b.badge || (b.badge_variant === 'mint' ? 'GRATUIT' : 'CU PLATĂ'),
        badgeClass: b.badge_variant === 'mint' ? 'badge-mint' : 'badge-coral',
        image: b.image_url || defaultCards[i % 3].image,
        hasPlayOverlay: i === 1,
        icon: i === 0 ? <BookOpen className="w-5 h-5 text-brand-green" /> : (i === 1 ? <PlayCircle className="w-5 h-5 text-[#0284C7]" /> : <Users className="w-5 h-5 text-brand-red" />),
        iconBg: i === 0 ? 'bg-[#EBF5F0]' : (i === 1 ? 'bg-[#F0F7FB]' : 'bg-[#FFF0ED]'),
        title: b.title,
        description: b.content || '',
        buttonLabel: b.link_label || 'Află mai multe',
        buttonUrl: b.link_url || '/courses',
      }))
    : defaultCards;

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy">
            {title}
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
                />

                {/* Badge top-left */}
                <div className="absolute top-4 left-4">
                  <span className={card.badgeClass}>
                    {card.badge}
                  </span>
                </div>

                {/* Play button overlay if applicable */}
                {card.hasPlayOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-navy shadow-lg transform group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8 fill-brand-navy text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${card.iconBg} flex items-center justify-center shrink-0`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-brand-navy">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed pl-12">
                    {card.description}
                  </p>
                </div>

                {/* Card Button */}
                <div className="pt-2">
                  <Link
                    to={card.buttonUrl}
                    className="btn-primary w-full text-sm font-semibold py-2.5"
                  >
                    <span>{card.buttonLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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
