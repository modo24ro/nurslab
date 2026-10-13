import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CMSSection } from '../../types';

interface GuestsWebinarsProps {
  cmsData?: CMSSection;
}

export const GuestsWebinarsSection: React.FC<GuestsWebinarsProps> = ({ cmsData }) => {
  const title = cmsData?.title || 'Invitați NursLab';
  const subtitle = cmsData?.subtitle || 'Perspective și experiențe din practica medicală.';
  const ctaLabel = cmsData?.metadata_json?.cta_label || 'Descoperă invitații';
  const ctaUrl = cmsData?.metadata_json?.cta_url || '/webinars';

  const defaultCards = [
    {
      badge: 'INTERVIU',
      badgeClass: 'badge-mint',
      title: 'Interviuri cu specialiști',
      url: '/webinars?type=interview',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
    },
    {
      badge: 'LIVE',
      badgeClass: 'badge-coral',
      title: 'Webinarii cu invitați',
      url: '/webinars?type=live',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80',
    },
    {
      badge: 'DISCUȚIE',
      badgeClass: 'badge-sky',
      title: 'Discuții cu pacienți și aparținători',
      url: '/webinars?type=discussion',
      image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const cards = cmsData?.blocks && cmsData.blocks.length > 0
    ? cmsData.blocks.map((b, i) => ({
        badge: b.badge || (i === 0 ? 'INTERVIU' : (i === 1 ? 'LIVE' : 'DISCUȚIE')),
        badgeClass: b.badge_variant === 'mint' ? 'badge-mint' : (b.badge_variant === 'coral' ? 'badge-coral' : 'badge-sky'),
        title: b.title,
        url: b.link_url || defaultCards[i % 3].url,
        image: b.image_url || defaultCards[i % 3].image,
      }))
    : defaultCards;

  return (
    <section className="py-16 sm:py-20 bg-white">
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
              {/* Photo & Badge */}
              <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-100">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={c.badgeClass}>
                    {c.badge}
                  </span>
                </div>
              </div>

              {/* Title & Arrow */}
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
