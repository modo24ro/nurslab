import React, { useState, useEffect } from 'react';
import { FileEdit, Save, CheckCircle2, Eye, EyeOff, Layout, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { CMSSection, CMSContentBlock } from '../../types';

export const AdminCMSPage: React.FC = () => {
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectSection = (key: string) => {
    setSelectedSectionKey(key);
    const found = sections.find((s) => s.section_key === key);
    if (found) {
      setActiveSection(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleSaveSection = async () => {
    if (!activeSection) return;

    try {
      await api.updateSection(activeSection.section_key, {
        title: activeSection.title,
        subtitle: activeSection.subtitle,
        kicker: activeSection.kicker,
        is_visible: activeSection.is_visible,
      });

      // Save blocks
      for (const block of activeSection.blocks) {
        await api.updateBlock(block.id, {
          title: block.title,
          content: block.content,
          image_url: block.image_url,
          link_label: block.link_label,
          link_url: block.link_url,
          badge: block.badge,
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Eroare la salvarea modificărilor');
    }
  };

  const handleBlockChange = (blockId: string, field: keyof CMSContentBlock, value: any) => {
    if (!activeSection) return;
    setActiveSection({
      ...activeSection,
      blocks: activeSection.blocks.map((b) => (b.id === blockId ? { ...b, [field]: value } : b)),
    });
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500">Se încarcă secțiunile CMS...</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Page Builder & CMS</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Editor Conținut Pagină Publică</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Modifică titlurile, textele, imaginile și butoanele secțiunilor fără a atinge codul sursă.
          </p>
        </div>

        <button
          onClick={handleSaveSection}
          className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2 shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>Salvează modificările secțiunii</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Secțiunea și blocurile au fost salvate cu succes în baza de date! Modificările sunt vizibile pe site.</span>
        </div>
      )}

      {/* Main Grid: Section selector tabs on left, Editor form on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Tabs (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Secțiuni Homepage
          </h3>
          <div className="space-y-1">
            {sections.map((sec) => (
              <button
                key={sec.section_key}
                onClick={() => handleSelectSection(sec.section_key)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  selectedSectionKey === sec.section_key
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{sec.title}</span>
                <span className="text-[10px] font-mono opacity-70">[{sec.section_key}]</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Editor Area (8 cols) */}
        {activeSection && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section Level Controls */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-brand-navy">
                  Setări Secțiune: {activeSection.section_key}
                </h3>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeSection.is_visible}
                    onChange={(e) => setActiveSection({ ...activeSection, is_visible: e.target.checked })}
                    className="rounded text-brand-green focus:ring-brand-green"
                  />
                  <span>Secțiune vizibilă</span>
                </label>
              </div>

              <div className="space-y-3 text-xs">
                {activeSection.kicker !== undefined && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Overline Kicker (Text mic deasupra titlului)</label>
                    <input
                      type="text"
                      value={activeSection.kicker || ''}
                      onChange={(e) => setActiveSection({ ...activeSection, kicker: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Titlu Principal (H1/H2)</label>
                  <input
                    type="text"
                    value={activeSection.title}
                    onChange={(e) => setActiveSection({ ...activeSection, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subtitlu / Descriere</label>
                  <textarea
                    rows={2}
                    value={activeSection.subtitle || ''}
                    onChange={(e) => setActiveSection({ ...activeSection, subtitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
              </div>
            </div>

            {/* Content Blocks List */}
            {activeSection.blocks && activeSection.blocks.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-lg text-brand-navy">
                  Carduri & Blocuri de Conținut ({activeSection.blocks.length})
                </h3>

                <div className="space-y-4">
                  {activeSection.blocks.map((b, idx) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
                          Card #{idx + 1}: {b.block_key}
                        </span>
                        {b.badge && (
                          <span className="badge-mint text-[10px] px-2 py-0.5">{b.badge}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Titlu Card</label>
                          <input
                            type="text"
                            value={b.title}
                            onChange={(e) => handleBlockChange(b.id, 'title', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Text Badge</label>
                          <input
                            type="text"
                            value={b.badge || ''}
                            onChange={(e) => handleBlockChange(b.id, 'badge', e.target.value)}
                            placeholder="Ex: GRATUIT sau CU PLATĂ"
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">Descriere Card</label>
                          <textarea
                            rows={2}
                            value={b.content || ''}
                            onChange={(e) => handleBlockChange(b.id, 'content', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">URL Imagine</label>
                          <input
                            type="text"
                            value={b.image_url || ''}
                            onChange={(e) => handleBlockChange(b.id, 'image_url', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Text Buton / Link</label>
                          <input
                            type="text"
                            value={b.link_label || ''}
                            onChange={(e) => handleBlockChange(b.id, 'link_label', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Destinație URL</label>
                          <input
                            type="text"
                            value={b.link_url || ''}
                            onChange={(e) => handleBlockChange(b.id, 'link_url', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
