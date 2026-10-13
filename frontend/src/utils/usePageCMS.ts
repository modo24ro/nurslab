import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CMSSection } from '../types';

export function usePageCMS(sectionKey: string, fallback?: Partial<CMSSection>) {
  const [cms, setCms] = useState<CMSSection | null>(null);

  useEffect(() => {
    api.getPublicCMS()
      .then((data) => {
        if (data?.sections) {
          const found = data.sections.find((s: CMSSection) => s.section_key === sectionKey);
          if (found) {
            setCms(found);
            if (found.metadata_json?.seo_title) {
              document.title = found.metadata_json.seo_title;
            }
            if (found.metadata_json?.meta_description) {
              let meta = document.querySelector('meta[name="description"]');
              if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'description');
                document.head.appendChild(meta);
              }
              meta.setAttribute('content', found.metadata_json.meta_description);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Notice: could not load page CMS for', sectionKey, err);
      });
  }, [sectionKey]);

  return {
    cms,
    kicker: cms?.kicker ?? fallback?.kicker,
    title: cms?.title ?? fallback?.title,
    subtitle: cms?.subtitle ?? fallback?.subtitle,
    isVisible: cms ? cms.is_visible : true,
    metadata: cms?.metadata_json || {},
  };
}
