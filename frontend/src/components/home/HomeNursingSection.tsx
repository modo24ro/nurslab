import React, { useState } from 'react';
import { Home, Heart, ArrowRight, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { CMSSection } from '../../types';

interface HomeNursingProps {
  cmsData?: CMSSection;
}

export const HomeNursingSection: React.FC<HomeNursingProps> = ({ cmsData }) => {
  const title = cmsData?.title || 'Îngrijiri la domiciliu';
  const subtitle = cmsData?.subtitle || 'Sprijin și îngrijire, în confortul casei tale.';
  const microcopy = cmsData?.metadata_json?.microcopy || 'Trimite o solicitare pentru detalii și disponibilitate.';
  const imageUrl = cmsData?.metadata_json?.image_url || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80';

  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('București');
  const [serviceType, setServiceType] = useState('Administrare tratamente injectabile & perfuzii');
  const [patientCondition, setPatientCondition] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitHomeNursingRequest({
        full_name: fullName,
        phone,
        email,
        address,
        city,
        service_type: serviceType,
        patient_condition: patientCondition,
        urgency_level: urgencyLevel,
      });
      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSuccess(false);
        setFullName('');
        setPhone('');
        setEmail('');
        setAddress('');
        setPatientCondition('');
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'A apărut o eroare la trimiterea solicitării');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Grid Container */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#F0F7FB] to-[#F8FAF9] border border-slate-200/80 p-8 sm:p-12 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Copy & CTA */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-green-mint flex items-center justify-center text-brand-green">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-brand-green uppercase tracking-wider">
                  Servicii Clinice de Nursing
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy leading-tight">
                  {title}
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 font-normal">
                  {subtitle}
                </p>
              </div>

              {/* Action Button & Microcopy */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setModalOpen(true)}
                  className="btn-primary text-base px-7 py-3.5 shadow-md hover:shadow-lg"
                >
                  <span>Solicită îngrijire</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <p className="text-xs text-slate-500 font-medium">
                  {microcopy}
                </p>
              </div>

              {/* Trust badges */}
              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-green" />
                  <span>Asistenți medicali autorizați OAMGMAMR</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-brand-green" />
                  <span>Respect și empatie la domiciliu</span>
                </div>
              </div>

            </div>

            {/* Right Photo */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
                <img
                  src={imageUrl}
                  alt="Asistentă medicală oferind sprijin la domiciliu"
                  className="w-full h-[320px] sm:h-[360px] object-cover"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
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
                  Solicitare Înregistrată!
                </h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Un coordonator medical NursLab vă va contacta în cel mai scurt timp la numărul <strong>{phone}</strong> pentru stabilirea detaliilor vizitei la domiciliu.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Formular Solicitare</span>
                  <h3 className="text-2xl font-serif font-bold text-brand-navy mt-1">
                    Îngrijiri Medicale la Domiciliu
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Completați datele pentru a stabili o vizită a asistentului medical.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nume Solicitant / Pacient *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Ion Popescu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon de contact *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="07xxxxxxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@exemplu.ro"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Oraș *</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="București"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Adresă completă *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Str., Nr., Bloc, Ap."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tip de Serviciu Solicitat *</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    >
                      <option value="Administrare tratamente injectabile & perfuzii">Administrare tratamente injectabile & perfuzii</option>
                      <option value="Toaletă și pansament escare / plăgi">Toaletă și pansament escare / plăgi</option>
                      <option value="Recoltare analize de sânge la domiciliu">Recoltare analize de sânge la domiciliu</option>
                      <option value="Schimbare / montare sondă urinară">Schimbare / montare sondă urinară</option>
                      <option value="Monitorizare parametri vitali & EKG">Monitorizare parametri vitali & EKG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic sau stare pacient</label>
                    <textarea
                      rows={2}
                      value={patientCondition}
                      onChange={(e) => setPatientCondition(e.target.value)}
                      placeholder="Menționați pe scurt prescripția medicului sau starea pacientului..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Renunță
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    {isSubmitting ? 'Se trimite...' : 'Trimite solicitarea'}
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
