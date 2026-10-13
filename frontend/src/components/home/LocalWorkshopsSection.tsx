import React, { useState, useEffect } from 'react';
import { MapPin, BookOpen, Bell, CheckCircle2, Building, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { WorkshopCity, WorkshopTopic, CMSSection } from '../../types';

interface LocalWorkshopsProps {
  cmsData?: CMSSection;
}

export const LocalWorkshopsSection: React.FC<LocalWorkshopsProps> = ({ cmsData }) => {
  const title = cmsData?.title || 'Adu practica în orașul tău';
  const subtitle = cmsData?.subtitle || 'Spune-ne ce te interesează și te anunțăm când se formează o grupă de workshop în orașul tău.';

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
      alert(err.message || 'A apărut o eroare la salvarea înregistrării');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-navy">
            {title}
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-[#F8FAF9] rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Form Left */}
            <div className="lg:col-span-8 space-y-4">
              <form onSubmit={handleOpenForm} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                
                {/* Select City */}
                <div className="sm:col-span-6 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-green">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-green/30 cursor-pointer shadow-sm"
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

                {/* Select Subject */}
                <div className="sm:col-span-6 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-green">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full pl-11 pr-8 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-green/30 cursor-pointer shadow-sm"
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

                {/* Submit Action Button */}
                <div className="sm:col-span-12">
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn-primary px-7 py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Anunță-mă când se formează grupa</span>
                  </button>
                </div>
              </form>

              {/* Disclaimer Microcopy */}
              <p className="text-xs text-slate-500 font-medium pt-1">
                Lista de interes este gratuită. Workshopurile sunt cu plată.
              </p>
            </div>

            {/* Visual Box Right */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-green-mint flex items-center justify-center text-brand-green shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-green">
                  Comunitate Locală
                </p>
                <p className="text-sm font-medium text-brand-navy leading-snug">
                  Contribuie la organizarea următoarelor workshopuri NursLab în orașul tău.
                </p>
              </div>
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
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-green-mint text-brand-green mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-navy">
                  Înregistrare Confirmată!
                </h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Te vom anunța prin email și SMS de îndată ce grupa de workshop pentru <strong>{selectedCity || 'orașul tău'}</strong> atinge numărul minim de participanți.
                </p>
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
