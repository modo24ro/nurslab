import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { CMSSection } from '../../types';
import { formatImageUrl, getImageStyle } from '../../utils/cms';

interface HeroSectionProps {
  cmsData?: CMSSection;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ cmsData }) => {
  const kicker = cmsData?.kicker || 'RESURSE, CURSURI ȘI WORKSHOPURI PENTRU ASISTENȚI MEDICALI';
  const title = cmsData?.title || 'De la prima lecție la practică.';
  const subtitle = cmsData?.subtitle || 'Un parcurs care îmbină teoria, demonstrațiile video și workshopurile fizice.';
  const stickyNote = cmsData?.metadata_json?.sticky_note || 'Mai multă încredere în practica de zi cu zi. ❤️';
  const heroImage = formatImageUrl(cmsData?.metadata_json?.hero_image || cmsData?.metadata_json?.image_url || '/images/hero_nurses.jpg');
  const imageStyle = getImageStyle(cmsData?.metadata_json, 'center 15%');

  const ctaPrimaryLabel = cmsData?.metadata_json?.cta_primary_label;
  const ctaPrimaryUrl = cmsData?.metadata_json?.cta_primary_url || '/courses?free=true';
  const ctaSecondaryLabel = cmsData?.metadata_json?.cta_secondary_label;
  const ctaSecondaryUrl = cmsData?.metadata_json?.cta_secondary_url || '/courses';

  // Helper to nicely colorize the heading while supporting arbitrary CMS edits
  const renderHeroHeading = (text: string) => {
    if (text.includes('\n')) {
      const parts = text.split('\n');
      return (
        <>
          <span className="text-brand-navy block">{parts[0]}</span>
          <span className="text-brand-green block mt-1">{parts.slice(1).join(' ')}</span>
        </>
      );
    }
    // If text contains the standard Romanian phrase, colorize second part
    if (text.toLowerCase().includes('la practică')) {
      const parts = text.split(/(la practică[\.]?)/i);
      return (
        <>
          <span className="text-brand-navy block">{parts[0]}</span>
          <span className="text-brand-green block mt-1">{parts.slice(1).join('')}</span>
        </>
      );
    }
    return <span className="text-brand-navy block">{text}</span>;
  };

  return (
    <section className="relative overflow-hidden bg-white pt-6 sm:pt-10 pb-8 sm:pb-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Kicker */}
            {kicker && (
              <div className="inline-flex items-center gap-2">
                <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.18em] text-[#1E40AF] uppercase font-sans">
                  {kicker}
                </span>
              </div>
            )}

            {/* Main Editorial Serif Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-serif font-bold leading-[1.12] tracking-tight">
              {renderHeroHeading(title)}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            {/* Optional Hero CTAs */}
            {(ctaPrimaryLabel || ctaSecondaryLabel) && (
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                {ctaPrimaryLabel && (
                  <Link
                    to={ctaPrimaryUrl}
                    className="btn-primary text-sm sm:text-base font-semibold px-7 py-3.5 rounded-full shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <span>{ctaPrimaryLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {ctaSecondaryLabel && (
                  <Link
                    to={ctaSecondaryUrl}
                    className="btn-secondary text-sm sm:text-base font-semibold px-7 py-3.5 rounded-full hover:bg-slate-100"
                  >
                    {ctaSecondaryLabel}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Wide Authentic Medical Image with Sticky Note */}
          <div className="lg:col-span-6 relative w-full">
            <div className="relative w-full">
              
              {/* Main Photo Card - Expanded Width */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 w-full">
                <img
                  src={heroImage}
                  alt={title}
                  className="w-full h-[400px] sm:h-[460px] lg:h-[480px] xl:h-[520px] object-cover transition-transform duration-300"
                  style={imageStyle}
                />
              </div>

              {/* Sticky Note matching the screenshot with handwriting font */}
              {stickyNote && (
                <div className="absolute -top-3 -left-3 sm:-top-5 sm:-left-5 bg-[#F0F7FB] p-4 sm:p-5 rounded-2xl shadow-xl border border-sky-100 max-w-[220px] transform -rotate-3 hover:rotate-0 transition-transform duration-300 z-10">
                  <div className="w-3 h-3 rounded-full bg-slate-300 mx-auto -mt-2 mb-2 shadow-inner"></div>
                  <p className="font-handwriting text-[#0284C7] font-bold text-xl sm:text-2xl leading-tight whitespace-pre-line">
                    {stickyNote}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
