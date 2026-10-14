import React, { useState, useEffect } from 'react';
import { MapPin, BookOpen, Bell, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { WorkshopCity, WorkshopTopic, CMSSection } from '../../types';
import { useModal } from '../../context/ModalContext';

interface LocalWorkshopsProps {
  cmsData?: CMSSection;
}

export const LocalWorkshopsSection: React.FC<LocalWorkshopsProps> = ({ cmsData }) => {
  const { showAlert } = useModal();
  const title = cmsData?.title || 'Adu practica în orașul tău';
  const subtitle = cmsData?.subtitle || 'Spune-ne ce te interesează și te anunțăm când se formează o grupă de workshop în orașul tău.';
  const ctaLabel = cmsData?.metadata_json?.cta_label || 'Anunță-mă când se formează grupa';
  const disclaimer = cmsData?.metadata_json?.disclaimer || 'Lista de interes este gratuită. Workshopurile sunt cu plată.';

  const [cities, setCities] = useState<WorkshopCity[]>([]);
  const [topics, setTopics] = useState<WorkshopTopic[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  
  // Registration modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getWorkshopCities().then(setCities).catch(() => {});
    api.getWorkshopTopics().then(setTopics).catch(() => {});
  }, []);

  const handleOpenForm = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitWorkshopInterest({
        full_name: fullName,
        email,
        phone,
        city_name: selectedCity || 'București',
        topic_title: selectedTopic || 'Recoltare venoasă și cateterism periferic avansat',
      });
      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSuccess(false);
        setFullName('');
        setEmail('');
        setPhone('');
      }, 2500);
    } catch (err: any) {
      showAlert(err.message || 'A apărut o eroare la salvarea înregistrării', { type: 'error', title: 'Înscriere Workshop' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Header with Mixed Colors matching JPEG */}
        <div className="max-w-3xl mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            {title.includes('în orașul tău') ? (
              <>
                {title.replace('în orașul tău', '').trim()} <span className="text-brand-green">în orașul tău</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-[#F8FAF9] rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Form Left */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <form onSubmit={handleOpenForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select City with blue pin icon */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0284C7]">
                      <MapPin className="w-5 h-5 stroke-[2]" />
                    </div>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full pl-11 pr-8 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-green/30 cursor-pointer shadow-sm"
                    >
                      <option value="">Alege orașul</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                      {cities.length === 0 && (
                        <>
                          <option value="București">București</option>
                          <option value="Cluj-Napoca">Cluj-Napoca</option>
                          <option value="Iași">Iași</option>
                          <option value="Timișoara">Timișoara</option>
                          <option value="Brașov">Brașov</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Select Subject with green book icon */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#116448]">
                      <BookOpen className="w-5 h-5 stroke-[2]" />
                    </div>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full pl-11 pr-8 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-green/30 cursor-pointer shadow-sm"
                    >
                      <option value="">Alege tema</option>
                      {topics.map((t) => (
                        <option key={t.id} value={t.title}>{t.title}</option>
                      ))}
                      {topics.length === 0 && (
                        <>
                          <option value="Recoltare venoasă și cateterism periferic">Recoltare venoasă și cateterism periferic</option>
                          <option value="Suport Vital de Bază (BLS) & Resuscitare">Suport Vital de Bază (BLS) & Resuscitare</option>
                          <option value="Managementul plăgilor complexe">Managementul plăgilor complexe</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Disclaimer Microcopy */}
                <p className="text-xs text-slate-500 font-medium">
                  {disclaimer}
                </p>
              </form>
            </div>

            {/* Visual Box & Button Right matching JPEG */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-5 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Skyline vector illustration */}
                <svg className="w-16 h-12 text-slate-300 shrink-0" viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 38h60M8 38V18h12v20M20 38V8h14v30M34 38V22h12v16M46 38V14h10v24" />
                  <rect x="12" y="22" width="4" height="4" />
                  <rect x="24" y="12" width="6" height="4" />
                  <rect x="24" y="20" width="6" height="4" />
                  <rect x="38" y="26" width="4" height="4" />
                </svg>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBF5F0] border border-emerald-200 flex items-center justify-center text-[#116448] shrink-0">
                    <MapPin className="w-5 h-5 stroke-[2]" />
                  </div>
                  <p className="text-xs sm:text-[13px] font-medium text-brand-navy leading-snug">
                    Contribuie la organizarea următoarelor workshopuri NursLab în orașul tău.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenForm}
                className="w-full btn-primary py-3.5 px-5 text-sm font-semibold rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Bell className="w-4 h-4" />
                <span>{ctaLabel}</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Modal for Interest Registration */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ×
            </button>

            {success ? (
              <div className="text-center py-6 sm:py-8 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EBF5F0] border-2 border-emerald-100 text-[#116448] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 sm:w-11 sm:h-11 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl sm:text-[26px] font-serif font-bold text-brand-navy leading-tight">
                  Felicitări! Locul dumneavoastră a fost rezervat cu succes.
                </h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Vă vom anunța prin email și SMS de îndată ce grupa de workshop pentru <strong>{selectedCity || 'orașul dumneavoastră'}</strong> atinge numărul minim de participanți.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { setModalOpen(false); setSuccess(false); }}
                    className="btn-primary text-sm px-7 py-2.5 rounded-full"
                  >
                    Am înțeles
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInterest} className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Înscriere Listă de Interes</span>
                  <h3 className="text-2xl font-serif font-bold text-brand-navy mt-1">
                    Practică medicală în {selectedCity || 'orașul tău'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Tema: {selectedTopic || 'Tehnici clinice fundamentale'}
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nume și Prenume *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Elena Ionescu"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adresă de Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="adresa.ta@exemplu.ro"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Număr de Telefon (pentru alertă SMS) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07xxxxxxxx"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    {isSubmitting ? 'Se trimite...' : 'Confirmă înregistrarea'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </section>
  );
};
