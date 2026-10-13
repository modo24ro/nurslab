import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Sliders,
  Image as ImageIcon,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Plus,
  Globe,
  Layout,
} from 'lucide-react';
import { api } from '../../services/api';
import { CMSSection, CMSContentBlock } from '../../types';
import { VisualImageCropper } from '../../components/admin/VisualImageCropper';
import { formatImageUrl } from '../../utils/cms';

const getPagePublicRoute = (key: string): string => {
  switch (key) {
    case 'page_courses': return '/courses';
    case 'page_workshops': return '/workshops';
    case 'page_webinars': return '/webinars';
    case 'page_guests': return '/invitati';
    case 'page_home_nursing': return '/home-nursing';
    case 'page_holistic': return '/holistic';
    case 'page_articles': return '/articles';
    case 'page_certificate': return '/certificate/verify';
    default: return '/';
  }
};

export const AdminCMSPage: React.FC = () => {
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('hero');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'home' | 'pages'>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Active section form state
  const [activeSection, setActiveSection] = useState<CMSSection | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getAllSections()
      .then((data) => {
        setSections(data);
        if (data.length > 0) {
          const current = data.find((s) => s.section_key === selectedSectionKey) || data[0];
          setActiveSection(JSON.parse(JSON.stringify(current)));
          setSelectedSectionKey(current.section_key);
          if (current.section_key.startsWith('page_')) {
            setActiveCategoryTab('pages');
          } else {
            setActiveCategoryTab('home');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load sections:', err);
        setStatusMessage('Eroare la încărcarea secțiunilor din baza de date.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectSection = (key: string) => {
    setSelectedSectionKey(key);
    if (key.startsWith('page_')) {
      setActiveCategoryTab('pages');
    } else {
      setActiveCategoryTab('home');
    }
    const found = sections.find((s) => s.section_key === key);
    if (found) {
      setActiveSection(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleSaveSection = async () => {
    if (!activeSection) return;

    setIsSaving(true);
    setStatusMessage(null);

    try {
      // 1. Update section
      const updatedSec = await api.updateSection(activeSection.section_key, {
        title: activeSection.title,
        subtitle: activeSection.subtitle,
        kicker: activeSection.kicker,
        is_visible: activeSection.is_visible,
        metadata_json: activeSection.metadata_json,
      });

      // 2. Update each content block
      if (activeSection.blocks && activeSection.blocks.length > 0) {
        for (const block of activeSection.blocks) {
          await api.updateBlock(block.id, {
            title: block.title,
            content: block.content,
            image_url: formatImageUrl(block.image_url),
            link_label: block.link_label,
            link_url: block.link_url,
            badge: block.badge,
            badge_variant: block.badge_variant,
            is_active: block.is_active,
            metadata_json: block.metadata_json,
          });
        }
      }

      // 3. Keep in-memory sections state strictly synced
      setSections((prev) =>
        prev.map((s) =>
          s.section_key === activeSection.section_key
            ? JSON.parse(JSON.stringify(activeSection))
            : s
        )
      );

      setSavedSuccess(true);
      setStatusMessage('Modificările au fost salvate cu succes și sunt reflectate imediat pe site!');
      setTimeout(() => {
        setSavedSuccess(false);
        setStatusMessage(null);
      }, 3500);
    } catch (err: any) {
      console.error('Error saving CMS section:', err);
      alert(err.message || 'Eroare la salvarea modificărilor în baza de date');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSingleBlock = async (block: CMSContentBlock) => {
    try {
      await api.updateBlock(block.id, {
        title: block.title,
        content: block.content,
        image_url: formatImageUrl(block.image_url),
        link_label: block.link_label,
        link_url: block.link_url,
        badge: block.badge,
        badge_variant: block.badge_variant,
        is_active: block.is_active,
        metadata_json: block.metadata_json,
      });

      // Update in-memory sections state
      if (activeSection) {
        setSections((prev) =>
          prev.map((s) =>
            s.section_key === activeSection.section_key
              ? JSON.parse(JSON.stringify(activeSection))
              : s
          )
        );
      }

      setSavedSuccess(true);
      setStatusMessage(`Cardul "${block.title}" a fost salvat cu succes!`);
      setTimeout(() => {
        setSavedSuccess(false);
        setStatusMessage(null);
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Eroare la salvarea cardului');
    }
  };

  const handleBlockChange = (blockId: string, field: keyof CMSContentBlock, value: any) => {
    if (!activeSection) return;
    setActiveSection({
      ...activeSection,
      blocks: activeSection.blocks.map((b) => (b.id === blockId ? { ...b, [field]: value } : b)),
    });
  };

  const handleBlockMetadataChange = (blockId: string, updatedMetadata: any) => {
    if (!activeSection) return;
    setActiveSection({
      ...activeSection,
      blocks: activeSection.blocks.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          metadata_json: {
            ...(b.metadata_json || {}),
            ...updatedMetadata,
          },
        };
      }),
    });
  };

  const handleSectionMetadataChange = (metaKey: string, value: any) => {
    if (!activeSection) return;
    setActiveSection({
      ...activeSection,
      metadata_json: {
        ...(activeSection.metadata_json || {}),
        [metaKey]: value,
      },
    });
  };

  const handleSectionMetadataObjectChange = (updatedMetadata: any) => {
    if (!activeSection) return;
    setActiveSection({
      ...activeSection,
      metadata_json: {
        ...(activeSection.metadata_json || {}),
        ...updatedMetadata,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-500">Se încarcă secțiunile CMS din baza de date...</p>
      </div>
    );
  }

  // Determine card type for the active section
  const getSectionCardType = (key: string): 'journey' | 'path' | 'nursing' | 'hero' | 'guest' | 'article' | 'default' => {
    switch (key) {
      case 'learning_journey':
        return 'journey';
      case 'learning_paths':
        return 'path';
      case 'home_nursing':
        return 'nursing';
      case 'hero':
        return 'hero';
      case 'guests_webinars':
        return 'guest';
      case 'medical_world':
        return 'article';
      default:
        return 'default';
    }
  };

  const homeSections = sections.filter((s) => !s.section_key.startsWith('page_'));
  const pageSections = sections.filter((s) => s.section_key.startsWith('page_'));
  const displayedSections = activeCategoryTab === 'home' ? homeSections : pageSections;

  const handleSwitchTab = (tab: 'home' | 'pages') => {
    setActiveCategoryTab(tab);
    const targetList = tab === 'home' ? homeSections : pageSections;
    if (targetList.length > 0 && !targetList.some((s) => s.section_key === selectedSectionKey)) {
      handleSelectSection(targetList[0].section_key);
    }
  };

  const activeCardType = activeSection ? getSectionCardType(activeSection.section_key) : 'default';

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Panou CMS NursLab</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy mt-1">
            Editor Conținut & Încadrare Vizuală
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Editează titlurile, descrierile, textele butoanelor și reglează interactiv decupajul și zoom-ul fotografiilor pentru fiecare pagină și card de pe site.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={activeSection ? getPagePublicRoute(activeSection.section_key) : '/'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-brand-navy px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{activeSection?.section_key.startsWith('page_') ? 'Vezi pagina publică' : 'Vezi site-ul public'}</span>
          </a>
          <button
            onClick={handleSaveSection}
            disabled={isSaving}
            className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Se salvează...' : 'Salvează modificările'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-semibold animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusMessage || 'Secțiunea a fost salvată în baza de date! Modificările sunt active pe site.'}</span>
        </div>
      )}

      {/* Main Grid: Section Selector (Left 4 cols) | Active Form (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Section Selector Tabs */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 space-y-3">
          
          {/* Category Tabs: Homepage vs Dedicated Website Pages */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => handleSwitchTab('home')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeCategoryTab === 'home'
                  ? 'bg-white text-brand-navy shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Homepage ({homeSections.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('pages')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeCategoryTab === 'pages'
                  ? 'bg-white text-brand-navy shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Pagini Site ({pageSections.length})</span>
            </button>
          </div>

          <div className="px-2 py-0.5 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {activeCategoryTab === 'home' ? 'Secțiuni Homepage' : 'Pagini Publice'}
            </h3>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {displayedSections.length} elemente
            </span>
          </div>

          <div className="space-y-1.5">
            {displayedSections.map((sec) => {
              const isSelected = selectedSectionKey === sec.section_key;
              return (
                <button
                  key={sec.section_key}
                  onClick={() => handleSelectSection(sec.section_key)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-navy text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="truncate">{sec.title}</div>
                    <div className={`text-[10px] font-mono ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {sec.section_key}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {sec.is_visible ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        Activ
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-400">
                        Ascuns
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Section Editor Form */}
        {activeSection && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section Main Information */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-brand-green font-bold uppercase tracking-wider">
                    Secțiune: {activeSection.section_key}
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-brand-navy">
                    Configurare Secțiune
                  </h3>
                </div>

                {/* Section Visibility Switch */}
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={activeSection.is_visible}
                    onChange={(e) => setActiveSection({ ...activeSection, is_visible: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-green focus:ring-brand-green cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    {activeSection.is_visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Secțiune Vizibilă pe Site</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Secțiune Ascunsă (Draft)</span>
                      </>
                    )}
                  </span>
                </label>
              </div>

              {/* Text Fields */}
              <div className="space-y-4 text-xs">
                
                {/* Kicker (if present) */}
                {activeSection.kicker !== undefined && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kicker Text (Etichetă mică deasupra titlului)
                    </label>
                    <input
                      type="text"
                      value={activeSection.kicker || ''}
                      onChange={(e) => setActiveSection({ ...activeSection, kicker: e.target.value })}
                      placeholder="Ex: RESURSE, CURSURI ȘI WORKSHOPURI"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Titlu Principal Secțiune
                  </label>
                  <input
                    type="text"
                    value={activeSection.title}
                    onChange={(e) => setActiveSection({ ...activeSection, title: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                {/* Subtitle / Description */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subtitlu / Descriere Paragraf
                  </label>
                  <textarea
                    rows={2}
                    value={activeSection.subtitle || ''}
                    onChange={(e) => setActiveSection({ ...activeSection, subtitle: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 leading-relaxed"
                  />
                </div>

                {/* Section Specific Metadata Fields */}
                {/* Hero Metadata */}
                {activeSection.section_key === 'hero' && (
                  <div className="pt-3 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Text Bilet Galben/Albastru (Sticky Note)</label>
                        <textarea
                          rows={2}
                          value={activeSection.metadata_json?.sticky_note || ''}
                          onChange={(e) => handleSectionMetadataChange('sticky_note', e.target.value)}
                          placeholder="Mai multă încredere în practica de zi cu zi. ❤️"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Text Buton Principal (CTA)</label>
                        <input
                          type="text"
                          value={activeSection.metadata_json?.cta_primary_label || 'Începe gratuit'}
                          onChange={(e) => handleSectionMetadataChange('cta_primary_label', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    {/* Hero Visual Image Cropper */}
                    <VisualImageCropper
                      label="Fotografie Principală Hero (Două Asistente)"
                      imageUrl={activeSection.metadata_json?.hero_image || activeSection.metadata_json?.image_url || '/images/hero_nurses.jpg'}
                      onImageUrlChange={(newUrl) => handleSectionMetadataChange('hero_image', newUrl)}
                      metadata={activeSection.metadata_json}
                      onChange={handleSectionMetadataObjectChange}
                      onSave={handleSaveSection}
                      cardType="hero"
                      cardTitle="Hero Image"
                    />
                  </div>
                )}

                {/* Home Nursing Metadata */}
                {activeSection.section_key === 'home_nursing' && (
                  <div className="pt-3 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Text Buton Solicitare</label>
                        <input
                          type="text"
                          value={activeSection.metadata_json?.cta_label || 'Solicită îngrijire'}
                          onChange={(e) => handleSectionMetadataChange('cta_label', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Microcopy (Sub buton)</label>
                        <input
                          type="text"
                          value={activeSection.metadata_json?.microcopy || 'Trimite o solicitare pentru detalii și disponibilitate.'}
                          onChange={(e) => handleSectionMetadataChange('microcopy', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>

                    <VisualImageCropper
                      label="Fotografie Secțiune Nursing la Domiciliu"
                      imageUrl={activeSection.metadata_json?.image_url || '/images/home_nursing.jpg'}
                      onImageUrlChange={(newUrl) => handleSectionMetadataChange('image_url', newUrl)}
                      metadata={activeSection.metadata_json}
                      onChange={handleSectionMetadataObjectChange}
                      onSave={handleSaveSection}
                      cardType="nursing"
                      cardTitle="Home Nursing"
                    />
                  </div>
                )}

                {/* Local Workshops Metadata */}
                {activeSection.section_key === 'local_workshops' && (
                  <div className="pt-3 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Text Buton Formular</label>
                        <input
                          type="text"
                          value={activeSection.metadata_json?.cta_label || 'Verifică disponibilitatea'}
                          onChange={(e) => handleSectionMetadataChange('cta_label', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Notă / Disclaimer</label>
                        <input
                          type="text"
                          value={activeSection.metadata_json?.disclaimer || 'Lista de interes este gratuită. Workshopurile sunt cu plată.'}
                          onChange={(e) => handleSectionMetadataChange('disclaimer', e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Holistic Care or Medical World Metadata */}
                {(activeSection.section_key === 'holistic_care' || activeSection.section_key === 'medical_world' || activeSection.section_key === 'guests_webinars') && (
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Text Buton CTA Secțiune</label>
                      <input
                        type="text"
                        value={activeSection.metadata_json?.cta_label || ''}
                        onChange={(e) => handleSectionMetadataChange('cta_label', e.target.value)}
                        placeholder="Ex: Descoperă abordarea holistică"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Link URL Buton</label>
                      <input
                        type="text"
                        value={activeSection.metadata_json?.cta_url || ''}
                        onChange={(e) => handleSectionMetadataChange('cta_url', e.target.value)}
                        placeholder="Ex: /holistic sau /articles"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Dedicated Website Page Settings (SEO, Banner Cropper, Custom Parameters) */}
                {activeSection.section_key.startsWith('page_') && (
                  <div className="pt-4 border-t border-slate-100 space-y-5">
                    
                    {/* SEO & Meta Tags Card */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-brand-green" />
                        <h4 className="font-serif font-bold text-sm text-brand-navy">
                          Optimizare SEO & Social Media
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Titlu SEO Browser (Title Tag)
                          </label>
                          <input
                            type="text"
                            value={activeSection.metadata_json?.seo_title || ''}
                            onChange={(e) => handleSectionMetadataChange('seo_title', e.target.value)}
                            placeholder="Ex: Cursuri Asistenți Medicali | NursLab"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Meta Descriere (Search Engines & Social Preview)
                          </label>
                          <textarea
                            rows={2}
                            value={activeSection.metadata_json?.meta_description || ''}
                            onChange={(e) => handleSectionMetadataChange('meta_description', e.target.value)}
                            placeholder="Descriere sintetică a paginii pentru Google și rețelele sociale..."
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Banner Image & Visual Cropper */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#0284C7]" />
                          <h4 className="font-serif font-bold text-sm text-brand-navy">
                            Imagine Banner / Antet Pagină
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Editor vizual cu poziționare și decupaj 9 puncte
                        </span>
                      </div>

                      <VisualImageCropper
                        label={`Fotografie Reprezentativă: ${activeSection.title}`}
                        imageUrl={activeSection.metadata_json?.banner_image || activeSection.metadata_json?.image_url || '/images/hero_nurses.jpg'}
                        onImageUrlChange={(newUrl) => handleSectionMetadataChange('banner_image', newUrl)}
                        metadata={activeSection.metadata_json}
                        onChange={handleSectionMetadataObjectChange}
                        onSave={handleSaveSection}
                        cardType="hero"
                        cardTitle={activeSection.title}
                      />
                    </div>

                    {/* Page Specific Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeSection.section_key === 'page_courses' && (
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Badge Antet</label>
                          <input
                            type="text"
                            value={activeSection.metadata_json?.badge || ''}
                            onChange={(e) => handleSectionMetadataChange('badge', e.target.value)}
                            placeholder="Ex: CURSURI PRACTICE"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      )}

                      {activeSection.section_key === 'page_workshops' && (
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Email Contact Workshopuri</label>
                          <input
                            type="email"
                            value={activeSection.metadata_json?.contact_email || ''}
                            onChange={(e) => handleSectionMetadataChange('contact_email', e.target.value)}
                            placeholder="workshop@nurslab.ro"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                          />
                        </div>
                      )}

                      {activeSection.section_key === 'page_home_nursing' && (
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Telefon Urgențe / Solicitări</label>
                          <input
                            type="text"
                            value={activeSection.metadata_json?.phone || ''}
                            onChange={(e) => handleSectionMetadataChange('phone', e.target.value)}
                            placeholder="+40 700 000 000"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Text Buton Principal (Opțional)</label>
                        <input
                          type="text"
                          value={activeSection.metadata_json?.cta_label || ''}
                          onChange={(e) => handleSectionMetadataChange('cta_label', e.target.value)}
                          placeholder="Ex: Explorează acum"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Link Buton Principal (Opțional)</label>
                        <input
                          type="text"
                          value={activeSection.metadata_json?.cta_url || ''}
                          onChange={(e) => handleSectionMetadataChange('cta_url', e.target.value)}
                          placeholder="Ex: /courses sau #inscriere"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* Content Blocks List (Cards) */}
            {activeSection.blocks && activeSection.blocks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-serif font-bold text-xl text-brand-navy">
                    Carduri & Pași în Secțiune ({activeSection.blocks.length})
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Fiecare card include editor vizual dedicat
                  </span>
                </div>

                <div className="space-y-6">
                  {activeSection.blocks.map((b, idx) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                            {b.block_key}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={b.is_active}
                              onChange={(e) => handleBlockChange(b.id, 'is_active', e.target.checked)}
                              className="rounded text-brand-green focus:ring-brand-green"
                            />
                            <span>Card Activ</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleSaveSingleBlock(b)}
                            className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-navy hover:text-white text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Salvează cardul</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Content Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Titlu Card</label>
                          <input
                            type="text"
                            value={b.title}
                            onChange={(e) => handleBlockChange(b.id, 'title', e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Badge Text (Etichetă)</label>
                          <input
                            type="text"
                            value={b.badge || ''}
                            onChange={(e) => handleBlockChange(b.id, 'badge', e.target.value)}
                            placeholder="Ex: GRATUIT sau CU PLATĂ"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">Descriere Card / Pas</label>
                          <textarea
                            rows={2}
                            value={b.content || ''}
                            onChange={(e) => handleBlockChange(b.id, 'content', e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed"
                          />
                        </div>

                        {/* Interactive Visual Cropper for each block image */}
                        <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                          <VisualImageCropper
                            label={`Încadrare și Focalizare Imagine: ${b.title}`}
                            imageUrl={b.image_url || ''}
                            onImageUrlChange={(newUrl) => handleBlockChange(b.id, 'image_url', newUrl)}
                            metadata={b.metadata_json}
                            onChange={(updatedMeta) => handleBlockMetadataChange(b.id, updatedMeta)}
                            onSave={() => handleSaveSingleBlock(b)}
                            cardType={activeCardType}
                            cardTitle={b.title}
                            badge={b.badge || undefined}
                            badgeClass={b.badge_variant === 'mint' ? 'badge-mint' : (b.badge_variant === 'sky' ? 'bg-[#F0F7FB] text-[#0284C7] text-xs font-bold px-3 py-1 rounded-full' : 'badge-coral')}
                            hasPlayOverlay={idx === 1 && activeSection.section_key === 'learning_journey'}
                          />
                        </div>

                        {/* Optional Button Label and Link URL */}
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Text Buton / Link (Opțional)</label>
                          <input
                            type="text"
                            value={b.link_label || ''}
                            onChange={(e) => handleBlockChange(b.id, 'link_label', e.target.value)}
                            placeholder="Ex: Vezi cursurile"
                            className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Destinație URL (Opțional)</label>
                          <input
                            type="text"
                            value={b.link_url || ''}
                            onChange={(e) => handleBlockChange(b.id, 'link_url', e.target.value)}
                            placeholder="Ex: /courses sau /workshops"
                            className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleSaveSection}
                disabled={isSaving}
                className="btn-primary text-sm px-8 py-3 flex items-center gap-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Se salvează secțiunea...' : 'Salvează toate modificările secțiunii'}</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
