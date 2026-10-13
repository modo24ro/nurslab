import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CMSSection } from '../types';
import { HeroSection } from '../components/home/HeroSection';
import { LearningPathsSection } from '../components/home/LearningPathsSection';
import { LearningJourneySection } from '../components/home/LearningJourneySection';
import { LocalWorkshopsSection } from '../components/home/LocalWorkshopsSection';
import { HomeNursingSection } from '../components/home/HomeNursingSection';
import { HolisticCareSection } from '../components/home/HolisticCareSection';
import { GuestsWebinarsSection } from '../components/home/GuestsWebinarsSection';
import { MedicalWorldSection } from '../components/home/MedicalWorldSection';

export const HomePage: React.FC = () => {
  const [sectionsMap, setSectionsMap] = useState<Record<string, CMSSection>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getPublicCMS()
      .then((data) => {
        if (data && data.sections) {
          const map: Record<string, CMSSection> = {};
          data.sections.forEach((sec: CMSSection) => {
            map[sec.section_key] = sec;
          });
          setSectionsMap(map);
        }
      })
      .catch((err) => {
        console.warn('CMS load notice:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection cmsData={sectionsMap['hero']} />

      {/* 2. Learning Paths Section ("Alege cum începi") */}
      <LearningPathsSection cmsData={sectionsMap['learning_paths']} />

      {/* 3. Learning Journey Section ("Parcursul tău NursLab") */}
      <LearningJourneySection cmsData={sectionsMap['learning_journey']} />

      {/* 4. Local Workshops Section ("Adu practica în orașul tău") */}
      <LocalWorkshopsSection cmsData={sectionsMap['local_workshops']} />

      {/* 5. Home Nursing Section ("Îngrijiri la domiciliu") */}
      <HomeNursingSection cmsData={sectionsMap['home_nursing']} />

      {/* 6. Holistic Care Section ("Abordarea holistică a îngrijirii pacienților") */}
      <HolisticCareSection cmsData={sectionsMap['holistic_care']} />

      {/* 7. Guests & Webinars Section ("Invitați NursLab") */}
      <GuestsWebinarsSection cmsData={sectionsMap['guests_webinars']} />

      {/* 8. Medical World Section ("Lumea medicală") */}
      <MedicalWorldSection cmsData={sectionsMap['medical_world']} />
    </div>
  );
};
