import React from 'react';
import { CheckCircle2, Calendar, Clock, User, Sparkles, ExternalLink, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ReservationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  date?: string;
  time?: string;
  speaker?: string;
  location?: string;
  userEmail?: string;
  eventType?: 'webinar' | 'workshop' | 'general';
}

export const ReservationSuccessModal: React.FC<ReservationSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  date,
  time,
  speaker,
  location,
  userEmail,
  eventType = 'webinar',
}) => {
  if (!isOpen) return null;

  // Build a Google Calendar URL if title and date exist
  const getGoogleCalendarUrl = () => {
    const eventName = encodeURIComponent(title || 'Webinar NursLab');
    const details = encodeURIComponent(
      `Eveniment educațional NursLab: ${title || ''}\nFormator: ${speaker || ''}\nAcces din contul dumneavoastră: https://nurslab.ro`
    );
    const loc = encodeURIComponent(location || 'Online - NursLab Live Platform');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventName}&details=${details}&location=${loc}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Închide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon with glowing background */}
        <div className="relative inline-flex items-center justify-center mb-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EBF5F0] border-2 border-emerald-100 flex items-center justify-center text-[#116448] shadow-inner">
            <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.2]" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Modal Headline */}
        <h3 id="modal-headline" className="text-2xl sm:text-[26px] font-serif font-bold text-brand-navy leading-snug">
          Felicitări! Locul dumneavoastră a fost rezervat cu succes.
        </h3>

        {/* Subtitle / Microcopy */}
        <p className="text-sm text-slate-600 mt-2.5 max-w-md mx-auto leading-relaxed">
          Înregistrarea a fost confirmată în sistem.
          {userEmail ? (
            <> Toate instrucțiunile de participare au fost trimise la <strong className="text-slate-800">{userEmail}</strong>.</>
          ) : (
            ' Veți primi instrucțiunile de participare și linkul de conectare prin e-mail.'
          )}
        </p>

        {/* Event Detail Summary Card if details are available */}
        {title && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#F8FAF9] border border-slate-200/80 text-left space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="badge-mint text-[10px] font-bold">
                {eventType === 'workshop' ? 'WORKSHOP CLINIC' : 'WEBINAR LIVE'}
              </span>
              <span className="text-xs font-semibold text-emerald-700">Acces Confirmat</span>
            </div>

            <h4 className="text-base sm:text-lg font-serif font-bold text-brand-navy leading-snug">
              {title}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
              {date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#116448]" />
                  <span>{date}</span>
                </div>
              )}
              {time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>{time}</span>
                </div>
              )}
              {speaker && (
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Invitat: <strong className="text-slate-700">{speaker}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Add to Google Calendar button */}
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto btn-secondary text-xs sm:text-sm py-2.5 px-4 font-semibold rounded-full flex items-center justify-center gap-1.5 border border-slate-300"
          >
            <Calendar className="w-4 h-4 text-[#116448]" />
            <span>Adaugă în Google Calendar</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </a>

          {/* Primary close button */}
          <button
            onClick={onClose}
            className="w-full sm:w-auto btn-primary text-xs sm:text-sm py-2.5 px-7 font-semibold rounded-full shadow-md hover:shadow-lg"
          >
            Am înțeles
          </button>
        </div>

        {/* Link to dashboard */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <Link
            to="/dashboard"
            onClick={onClose}
            className="text-xs font-semibold text-brand-green hover:underline inline-flex items-center gap-1"
          >
            Vezi evenimentul în Panoul tău de Student →
          </Link>
        </div>
      </div>
    </div>
  );
};
