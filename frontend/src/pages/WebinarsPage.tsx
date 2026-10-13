import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Webinar, Speaker } from '../types';
import { useAuth } from '../context/AuthContext';

export const WebinarsPage: React.FC = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    api.getWebinars().then((data) => {
      setWebinars(data);
      const reg: Record<string, boolean> = {};
      data.forEach((w) => {
        if (w.is_registered) reg[w.id] = true;
      });
      setRegisteredMap(reg);
    }).catch(() => {});

    api.getSpeakers().then(setSpeakers).catch(() => {});
  }, []);

  const handleRegister = async (webinarId: string) => {
    if (!user) {
      alert('Vă rugăm să vă autentificați pentru a vă rezerva locul gratuit la webinar.');
      return;
    }

    try {
      await api.registerWebinar(webinarId);
      setRegisteredMap((prev) => ({ ...prev, [webinarId]: true }));
      alert('Felicitări! Locul dumneavoastră a fost rezervat cu succes.');
    } catch (err: any) {
      alert(err.message || 'Eroare la înregistrare');
    }
  };

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-green uppercase font-sans">
            Comunitate & Experți Medicali
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            Webinarii & Invitați NursLab
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Perspective și experiențe reale din practica clinică: dialoguri cu medici primari, asistenți șefi și lideri în nursing.
          </p>
        </div>

        {/* Webinars List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {webinars.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div className="relative h-60 bg-slate-100 overflow-hidden">
                <img
                  src={w.cover_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=80'}
                  alt={w.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={w.badge === 'LIVE' ? 'badge-coral' : 'badge-mint'}>
                    {w.badge}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-green" />
                      <span>{new Date(w.scheduled_at).toLocaleDateString('ro-RO')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-green" />
                      <span>{w.duration_minutes} min</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-brand-navy leading-snug">
                    {w.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {w.description}
                  </p>

                  {/* Speaker info */}
                  {w.speaker && (
                    <div className="pt-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        {w.speaker.photo_url ? (
                          <img src={w.speaker.photo_url} alt={w.speaker.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400 m-2.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-navy">{w.speaker.full_name}</p>
                        <p className="text-[11px] text-slate-500">{w.speaker.title} • {w.speaker.hospital}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Registration button */}
                <div className="pt-4 border-t border-slate-100">
                  {registeredMap[w.id] ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-green py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ești înscris la acest webinar</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(w.id)}
                      className="btn-primary w-full text-xs font-semibold py-2.5"
                    >
                      <span>Rezervă loc gratuit la webinar</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Speakers Section */}
        <div id="invitati" className="space-y-6 pt-6">
          <h2 className="text-2xl font-serif font-bold text-brand-navy">Invitați & Formatori Atestați</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                  {s.photo_url ? (
                    <img src={s.photo_url} alt={s.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400 m-4" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-brand-navy">{s.full_name}</h3>
                  <p className="text-xs text-brand-green font-semibold">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.hospital}</p>
                  {s.bio && <p className="text-xs text-slate-600 pt-1 line-clamp-2">{s.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
