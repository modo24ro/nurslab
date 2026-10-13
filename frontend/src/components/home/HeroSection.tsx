import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { CMSSection } from '../../types';

interface HeroSectionProps {
  cmsData?: CMSSection;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ cmsData }) => {
  const kicker = cmsData?.kicker || 'RESURSE, CURSURI ȘI WORKSHOPURI PENTRU ASISTENȚI MEDICALI';
  const title = cmsData?.title || 'De la prima lecție la practică.';
  const subtitle = cmsData?.subtitle || 'Un parcurs care îmbină teoria, demonstrațiile video și workshopurile fizice.';
  const stickyNote = cmsData?.metadata_json?.sticky_note || 'Mai multă încredere în practica de zi cu zi. ❤️';

  return (
    <section className="relative overflow-hidden bg-brand-sand pt-8 sm:pt-14 pb-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Kicker */}
            <div className="inline-flex items-center gap-2">
              <span className="text-[12px] sm:text-[13px] font-bold tracking-widest text-[#1C4269] uppercase font-sans">
                {kicker}
              </span>
            </div>

            {/* Main Editorial Serif Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-serif font-bold text-brand-navy leading-[1.12] tracking-tight">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
              {subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/courses?free=true"
                className="btn-primary text-base px-6 py-3 shadow-md hover:shadow-lg"
              >
                <span>Începe gratuit</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                to="/courses"
                className="btn-secondary text-base px-6 py-3"
              >
                Explorează cursurile
              </Link>
            </div>

            {/* Trust Micro-indicators */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-green" />
                <span>Acces gratuit la noțiuni fundamentale</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-green" />
                <span>Demonstrații filmate în clinică</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-brand-green" />
                <span>Workshopuri pe simulatoare reale</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Medical Image with Sticky Note */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Photo Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=85"
                  alt="Asistente medicale în timpul instruirii clinice NursLab"
                  className="w-full h-[380px] sm:h-[440px] object-cover object-top"
                />
                
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Sticky Note / Polaroid matching the screenshot */}
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-xl shadow-xl border border-slate-100 max-w-[210px] transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <p className="font-serif italic text-brand-navy font-semibold text-sm leading-snug">
                  {stickyNote}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                  <span>Comunitatea NursLab</span>
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
