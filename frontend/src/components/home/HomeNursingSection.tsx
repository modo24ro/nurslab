import React, { useState } from 'react';
import { Home, Heart, ArrowRight, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { CMSSection } from '../../types';

import { formatImageUrl, getImageStyle } from '../../utils/cms';
import { useModal } from '../../context/ModalContext';

interface HomeNursingProps {
  cmsData?: CMSSection;
}

export const HomeNursingSection: React.FC<HomeNursingProps> = ({ cmsData }) => {
  const { showAlert } = useModal();
  const title = cmsData?.title || 'Îngrijiri la domiciliu';
  const subtitle = cmsData?.subtitle || 'Sprijin și îngrijire, în confortul casei tale.';
  const microcopy = cmsData?.metadata_json?.microcopy || 'Trimite o solicitare pentru detalii și disponibilitate.';
  const ctaLabel = cmsData?.metadata_json?.cta_label || 'Solicită îngrijire';
  const imageUrl = formatImageUrl(cmsData?.metadata_json?.image_url || '/images/home_nursing.jpg');
  const imageStyle = getImageStyle(cmsData?.metadata_json, 'center 15%');

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
      showAlert(err.message || 'A apărut o eroare la trimiterea solicitării', { type: 'error', title: 'Solicitare Îngrijiri' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Banner Grid Container */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#F0F7FB] to-[#F8FAF9] border border-slate-200/80 p-8 sm:p-12 lg:p-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                 {/* Left Copy & CTA */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy leading-tight flex items-center gap-3.5">
                  <span>{title}</span>
                  <span className="inline-flex items-center justify-center relative w-10 h-10 text-brand-green">
                    <svg className="w-9 h-9 text-[#116448]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                    <Heart className="w-4 h-4 text-red-500 fill-red-500 absolute top-[11px] left-[12px]" strokeWidth={2} />
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-slate-600 font-normal">
                  {subtitle}
                </p>
              </div>

              {/* Action Button & Microcopy */}
              <div className="space-y-3 pt-2">
                <div>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="btn-primary text-base px-8 py-3.5 shadow-md hover:shadow-lg rounded-full"
                  >
                    <span>{ctaLabel}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {microcopy}
                </p>
              </div>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-[320px] sm:h-[360px] object-cover"
                  style={imageStyle}
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
