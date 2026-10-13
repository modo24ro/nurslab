import React from 'react';
import { BookOpen, PlayCircle, CheckSquare, Users } from 'lucide-react';
import { CMSSection } from '../../types';
import { formatImageUrl, getImageStyle } from '../../utils/cms';

interface LearningJourneyProps {
  cmsData?: CMSSection;
}

export const LearningJourneySection: React.FC<LearningJourneyProps> = ({ cmsData }) => {
  const title = cmsData?.title || 'Parcursul tău NursLab';
  const subtitle = cmsData?.subtitle || 'Pași clari, de la primele noțiuni până la exersarea în mâinile tale.';

  const defaultSteps = [
    {
      num: '1',
      title: '1. Înțelegi teoria',
      description: 'Cursuri online, pe teme esențiale, structurate clar și ușor de parcurs.',
      icon: <BookOpen className="w-9 h-9 sm:w-10 sm:h-10 text-[#116448]" strokeWidth={1.75} />,
      image: '/images/journey_theory.jpg',
      imagePosition: 'center 15%',
      metadata_json: { image_position: 'center 15%' },
    },
    {
      num: '2',
      title: '2. Vezi demonstrația',
      description: 'Demonstrații video realizate de profesioniști, cu explicații pas cu pas.',
      icon: <PlayCircle className="w-9 h-9 sm:w-10 sm:h-10 text-[#0284C7]" strokeWidth={1.75} />,
      image: '/images/journey_demo.jpg',
      hasPlay: true,
      imagePosition: 'center 25%',
      metadata_json: { image_position: 'center 25%' },
    },
    {
      num: '3',
      title: '3. Verifici ce ai învățat',
      description: 'Întrebări și situații practice care te ajută să îți consolidezi cunoștințele.',
      icon: <CheckSquare className="w-9 h-9 sm:w-10 sm:h-10 text-[#EA580C]" strokeWidth={1.75} />,
      image: '/images/journey_feedback.jpg',
      imagePosition: 'center 15%',
      metadata_json: { image_position: 'center 15%' },
    },
    {
      num: '4',
      title: '4. Exersezi la workshop',
      description: 'Aplici în siguranță, alături de formatori, pe simulatoare și echipamente reale.',
      icon: <Users className="w-9 h-9 sm:w-10 sm:h-10 text-[#E11D48]" strokeWidth={1.75} />,
      image: '/images/journey_practice.jpg',
      imagePosition: 'center 15%',
      metadata_json: { image_position: 'center 15%' },
    },
  ];

  const activeBlocks = (cmsData?.blocks || []).filter((b) => b.is_active !== false);

  const steps = activeBlocks.length > 0
    ? activeBlocks.map((b, i) => ({
        num: `${i + 1}`,
        title: b.title,
        description: b.content || '',
        icon: i === 0 
          ? <BookOpen className="w-9 h-9 sm:w-10 sm:h-10 text-[#116448]" strokeWidth={1.75} /> 
          : (i === 1 
            ? <PlayCircle className="w-9 h-9 sm:w-10 sm:h-10 text-[#0284C7]" strokeWidth={1.75} /> 
            : (i === 2 
              ? <CheckSquare className="w-9 h-9 sm:w-10 sm:h-10 text-[#EA580C]" strokeWidth={1.75} /> 
              : <Users className="w-9 h-9 sm:w-10 sm:h-10 text-[#E11D48]" strokeWidth={1.75} />)),
        image: formatImageUrl(b.image_url || defaultSteps[i % 4].image),
        imageStyle: getImageStyle(b.metadata_json, defaultSteps[i % 4].imagePosition || 'center 15%'),
        hasPlay: i === 1,
      }))
    : defaultSteps.map((s) => ({
        ...s,
        imageStyle: getImageStyle(s.metadata_json, s.imagePosition),
      }));

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Section Header with Mixed Colors matching JPEG */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            {title.includes('NursLab') ? (
              <>
                {title.replace('NursLab', '').trim()} <span className="text-brand-green">NursLab</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* 4 Steps Columns matching JPEG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title + index}
              className="flex flex-col justify-between group"
            >
              <div className="space-y-3.5 mb-6">
                {/* Large Colored SVG Icon */}
                <div className="mb-3">
                  {step.icon}
                </div>

                <h3 className="font-serif font-bold text-lg text-brand-navy">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Photo beneath each step */}
              <div className="relative rounded-2xl overflow-hidden h-44 sm:h-48 bg-slate-100 shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={step.imageStyle}
                />
                {step.hasPlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-navy shadow-md">
                      <PlayCircle className="w-7 h-7 fill-brand-navy text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
