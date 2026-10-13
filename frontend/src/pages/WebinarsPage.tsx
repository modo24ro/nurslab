import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Clock, User, CheckCircle2, ArrowRight, Play, Users, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Webinar } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl, getImageStyle } from '../utils/cms';
import { ReservationSuccessModal } from '../components/common/ReservationSuccessModal';
import { usePageCMS } from '../utils/usePageCMS';

export const WebinarsPage: React.FC = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'interview'>('all');
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const pageCms = usePageCMS('page_webinars', {
    kicker: 'Transmisiuni Live & Înregistrări Clinice',
    title: 'Webinarii NursLab',
    subtitle: 'Perspective practice din gărzile de urgență și terapie intensivă: sesiuni interactive, studii de caz și discuții aplicate cu specialiști de top.',
  });
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    title?: string;
    date?: string;
    time?: string;
    speaker?: string;
  }>({ isOpen: false });
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    api.getWebinars()
      .then((data) => {
        setWebinars(data);
        const reg: Record<string, boolean> = {};
        data.forEach((w) => {
          if (w.is_registered) reg[w.id] = true;
        });
        setRegisteredMap(reg);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRegister = async (webinar: Webinar) => {
    if (!user) {
      setAuthPromptOpen(true);
      return;
    }

    try {
      await api.registerWebinar(webinar.id);
      setRegisteredMap((prev) => ({ ...prev, [webinar.id]: true }));
      setSuccessModalData({
        isOpen: true,
        title: webinar.title,
        date: webinar.scheduled_at 
          ? new Date(webinar.scheduled_at).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
          : 'Data va fi anunțată în curând',
        time: webinar.duration_minutes ? `${webinar.duration_minutes} min` : 'Ora 18:00',
        speaker: webinar.speaker?.full_name,
      });
    } catch (err: any) {
      alert(err.message || 'Eroare la înregistrare');
    }
  };

  const filteredWebinars = webinars.filter((w) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'live') return w.webinar_type === 'live' || w.badge === 'LIVE';
    if (selectedFilter === 'interview') return w.webinar_type === 'interview' || w.badge === 'INTERVIU';
    return true;
  });

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14 space-y-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-8">
          <div className="max-w-3xl space-y-3">
            {pageCms.kicker && (
              <span className="text-xs font-bold tracking-widest text-[#1C4269] uppercase font-sans">
                {pageCms.kicker}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-navy">
              {pageCms.title}
            </h1>
            {pageCms.subtitle && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {pageCms.subtitle}
              </p>
            )}
          </div>

          <Link
            to="/invitati"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-brand-navy hover:text-brand-green hover:border-brand-green/40 shadow-sm transition-all shrink-0"
          >
            <Users className="w-4 h-4 text-brand-green" />
            <span>Vezi toți Invitații NursLab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Toate Webinariile ({webinars.length})
          </button>
          <button
            onClick={() => setSelectedFilter('live')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedFilter === 'live'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Transmisiuni Live
          </button>
          <button
            onClick={() => setSelectedFilter('interview')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedFilter === 'interview'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Interviuri & Înregistrări
          </button>
        </div>

        {/* Webinars Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            Se încarcă calendarul webinariilor...
          </div>
        ) : filteredWebinars.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Video className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-xl font-serif font-bold text-brand-navy">Nu există webinarii în această categorie</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Reveniți curând pentru noi sesiuni clinice live sau explorați cursurile noastre video.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredWebinars.map((w) => (
              <div
                key={w.id}
                id={`webinar-${w.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-64 sm:h-72 bg-slate-100 overflow-hidden">
                  <img
                    src={formatImageUrl(w.cover_image || '/images/guest_radu.jpg')}
                    alt={w.title}
                    style={getImageStyle(w.metadata_json)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className={w.badge === 'LIVE' ? 'badge-coral' : 'badge-mint'}>
                      {w.badge}
                    </span>
                    {w.is_free && (
                      <span className="bg-white/90 backdrop-blur-sm text-brand-navy font-bold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm">
                        Acces Gratuit
                      </span>
                    )}
                  </div>

                  {w.recording_url && (
                    <div className="absolute bottom-4 right-4">
                      <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full">
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Înregistrare disponibilă</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand-green" />
                        <span>{new Date(w.scheduled_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
                      <Link
                        to="/invitati"
                        className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 group/spk hover:bg-slate-50 p-2 rounded-xl transition-colors"
                      >
                        <div className="w-11 h-11 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          {w.speaker.photo_url ? (
                            <img
                              src={formatImageUrl(w.speaker.photo_url)}
                              alt={w.speaker.full_name}
                              style={getImageStyle(w.speaker.metadata_json)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-slate-400 m-3" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-brand-navy group-hover/spk:text-brand-green transition-colors truncate">
                            {w.speaker.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {w.speaker.title} • {w.speaker.hospital}
                          </p>
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Registration / Watch button */}
                  <div className="pt-4 border-t border-slate-100">
                    {registeredMap[w.id] ? (
                      <div className="flex items-center justify-between text-xs font-semibold text-brand-green py-2 px-3 bg-[#EBF5F0] rounded-xl">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Ești înscris la acest webinar</span>
                        </div>
                        {w.recording_url && (
                          <a
                            href={w.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold underline hover:text-brand-green-dark"
                          >
                            Vizionează
                          </a>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(w)}
                        className="btn-primary w-full text-xs font-semibold py-3"
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
        )}

        {/* Dedicated Guests Section Callout */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
              Experți & Formatori Atestați
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">
              Fă cunoștință cu toți Invitații NursLab
            </h3>
            <p className="text-sm text-slate-600 max-w-xl">
              Descoperă medicii și asistenții șefi care susțin webinariile noastre, biografiile lor clinice și spitalele din care provin.
            </p>
          </div>

          <Link
            to="/invitati"
            className="btn-primary whitespace-nowrap text-sm px-6 py-3"
          >
            <span>Explorează toți invitații</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

      </div>

      {/* Reservation Success Modal */}
      <ReservationSuccessModal
        isOpen={successModalData.isOpen}
        onClose={() => setSuccessModalData({ isOpen: false })}
        title={successModalData.title}
        date={successModalData.date}
        time={successModalData.time}
        speaker={successModalData.speaker}
        userEmail={user?.email}
        eventType="webinar"
      />

      {/* Auth Prompt Modal if not logged in */}
      {authPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0284C7] flex items-center justify-center mx-auto">
              <User className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-brand-navy">
                Autentificare Necesară
              </h3>
              <p className="text-sm text-slate-600">
                Pentru a vă rezerva locul gratuit și a primi linkul live, vă rugăm să vă conectați sau să creați un cont.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/login"
                className="btn-primary flex-1 py-2.5 text-sm font-semibold rounded-full"
              >
                Autentificare
              </Link>
              <Link
                to="/register"
                className="btn-secondary flex-1 py-2.5 text-sm font-semibold rounded-full"
              >
                Creează cont
              </Link>
            </div>

            <button
              onClick={() => setAuthPromptOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Închide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
