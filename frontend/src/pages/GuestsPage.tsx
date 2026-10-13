import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Search, Video, Award, Building, Sparkles, ArrowRight, Calendar, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Speaker, Webinar } from '../types';

export const GuestsPage: React.FC = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getSpeakers(),
      api.getWebinars()
    ])
      .then(([spkData, webData]) => {
        setSpeakers(spkData);
        setWebinars(webData);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredSpeakers = speakers.filter((s) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(query) ||
      (s.title && s.title.toLowerCase().includes(query)) ||
      (s.hospital && s.hospital.toLowerCase().includes(query)) ||
      (s.bio && s.bio.toLowerCase().includes(query))
    );
  });

  // Map webinars to speakers
  const getSpeakerWebinars = (speakerId: string) => {
    return webinars.filter((w) => (w as any).speaker_id === speakerId || (w.speaker && w.speaker.id === speakerId));
  };

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14 space-y-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-10">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#1C4269] uppercase font-sans">
            Comunitate & Experți Medicali
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
            Invitați <span className="text-brand-green">NursLab</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Perspective și experiențe reale din practica clinică: dialoguri deschise cu medici primari, asistenți șefi, cercetători și lideri din spitalele de urgență.
          </p>
        </div>

        {/* Search & Stats Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută după nume, specialitate sau spital..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium w-full sm:w-auto justify-end">
            <span>{filteredSpeakers.length} {filteredSpeakers.length === 1 ? 'invitat găsit' : 'invitați găsiți'}</span>
            <Link
              to="/webinars"
              className="inline-flex items-center gap-1.5 text-brand-green font-semibold hover:underline"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Vezi calendarul webinariilor</span>
            </Link>
          </div>
        </div>

        {/* Speakers Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            Se încarcă profilurile invitaților...
          </div>
        ) : filteredSpeakers.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <User className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-serif font-bold text-brand-navy">Nu a fost găsit niciun invitat</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Încearcă să modifici termenul de căutare pentru a găsi formatorii sau medicii doriți.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSpeakers.map((speaker) => {
              const spkWebinars = getSpeakerWebinars(speaker.id);
              return (
                <div
                  key={speaker.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 sm:p-7 space-y-5">
                    {/* Header: Photo + Name + Institution */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-100 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        {speaker.photo_url ? (
                          <img
                            src={speaker.photo_url}
                            alt={speaker.full_name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-green bg-[#EBF5F0] px-2 py-0.5 rounded-full">
                          Formator Atestat
                        </span>
                        <h3 className="font-serif font-bold text-lg text-brand-navy leading-snug truncate">
                          {speaker.full_name}
                        </h3>
                        <p className="text-xs text-brand-green font-semibold line-clamp-1">
                          {speaker.title}
                        </p>
                        {speaker.hospital && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{speaker.hospital}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {speaker.bio && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4">
                        {speaker.bio}
                      </p>
                    )}

                    {/* Associated Webinars */}
                    {spkWebinars.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <p className="text-[11px] font-bold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-brand-green" />
                          <span>Sesiuni & Webinarii asociate:</span>
                        </p>
                        <div className="space-y-1.5">
                          {spkWebinars.map((w) => (
                            <Link
                              key={w.id}
                              to={`/webinars#webinar-${w.id}`}
                              className="block p-2 rounded-lg bg-slate-50 hover:bg-[#EBF5F0] text-xs text-brand-navy hover:text-brand-green transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium truncate">{w.title}</span>
                                <span className={w.badge === 'LIVE' ? 'badge-coral text-[9px] px-1.5 py-0.5' : 'badge-mint text-[9px] px-1.5 py-0.5'}>
                                  {w.badge}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Action */}
                  <div className="px-6 sm:px-7 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      NursLab Community
                    </span>
                    <Link
                      to="/webinars"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:text-brand-green-dark transition-colors"
                    >
                      <span>Vezi webinariile</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Suggest / Join CTA Banner */}
        <div className="bg-gradient-to-r from-brand-navy to-[#1C4269] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Implică-te în educație
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold">
              Ești medic specialist sau asistent cu experiență?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Alătură-te echipei de formatori NursLab și împărtășește protocoalele clinice care salvează vieți cu mii de asistenți medicali din întreaga țară.
            </p>
          </div>

          <a
            href="mailto:contact@nurslab.ro?subject=Propunere%20Invitat%20NursLab"
            className="btn-primary bg-white hover:bg-slate-100 text-brand-navy font-bold px-6 py-3 whitespace-nowrap shadow-md"
          >
            <span>Propune o temă / devino invitat</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </div>

      </div>
    </div>
  );
};
