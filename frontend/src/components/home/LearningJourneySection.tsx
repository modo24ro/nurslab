import React from 'react';
import { BookOpen, PlayCircle, CheckSquare, Users } from 'lucide-react';
import { CMSSection } from '../../types';

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
      icon: <BookOpen className="w-5 h-5 text-brand-green" />,
      iconBg: 'bg-[#EBF5F0]',
      image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&auto=format&fit=crop&q=80',
    },
    {
      num: '2',
      title: '2. Vezi demonstrația',
      description: 'Demonstrații video realizate de profesioniști, cu explicații pas cu pas.',
      icon: <PlayCircle className="w-5 h-5 text-[#0284C7]" />,
      iconBg: 'bg-[#F0F7FB]',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80',
      hasPlay: true,
    },
    {
      num: '3',
      title: '3. Verifici ce ai învățat',
      description: 'Întrebări și situații practice care te ajută să îți consolidezi cunoștințele.',
      icon: <CheckSquare className="w-5 h-5 text-[#EA580C]" />,
      iconBg: 'bg-[#FFF7ED]',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80',
    },
    {
      num: '4',
      title: '4. Exersezi la workshop',
      description: 'Aplici în siguranță, alături de formatori, pe simulatoare și echipamente reale.',
      icon: <Users className="w-5 h-5 text-brand-red" />,
      iconBg: 'bg-[#FFF0ED]',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const steps = cmsData?.blocks && cmsData.blocks.length > 0
    ? cmsData.blocks.map((b, i) => ({
        num: `${i + 1}`,
        title: b.title,
        description: b.content || '',
        icon: i === 0 ? <BookOpen className="w-5 h-5 text-brand-green" /> : (i === 1 ? <PlayCircle className="w-5 h-5 text-[#0284C7]" /> : (i === 2 ? <CheckSquare className="w-5 h-5 text-[#EA580C]" /> : <Users className="w-5 h-5 text-brand-red" />)),
        iconBg: i === 0 ? 'bg-[#EBF5F0]' : (i === 1 ? 'bg-[#F0F7FB]' : (i === 2 ? 'bg-[#FFF7ED]' : 'bg-[#FFF0ED]')),
        image: b.image_url || defaultSteps[i % 4].image,
        hasPlay: i === 1,
      }))
    : defaultSteps;

  return (
    <section className="py-16 sm:py-20 bg-brand-sand border-y border-slate-100">
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

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title + index}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-card transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Step Icon & Title */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${step.iconBg} flex items-center justify-center shrink-0`}>
                    {step.icon}
                  </div>
                  <h3 className="font-serif font-bold text-base text-brand-navy">
                    {step.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[48px]">
                  {step.description}
                </p>
              </div>

              {/* Photo beneath each step */}
              <div className="relative mt-5 rounded-xl overflow-hidden h-36 bg-slate-100 border border-slate-100">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
                {step.hasPlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-brand-navy shadow">
                      <PlayCircle className="w-6 h-6 fill-brand-navy text-white" />
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
