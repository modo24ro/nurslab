import React, { useState, useEffect } from 'react';
import {
  Video, Users, Plus, Edit2, Trash2, Calendar, Clock,
  CheckCircle2, XCircle, Search, ExternalLink, AlertCircle, AlertTriangle, Eye, UserCheck, X
} from 'lucide-react';
import { api } from '../../services/api';
import { Webinar, Speaker } from '../../types';
import { VisualImageCropper } from '../../components/admin/VisualImageCropper';
import { formatImageUrl, getImageStyle } from '../../utils/cms';
import { useModal } from '../../context/ModalContext';

export const AdminWebinarsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'webinars' | 'speakers'>('webinars');
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Webinar Modal State
  const [webinarModalOpen, setWebinarModalOpen] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const [webinarFormData, setWebinarFormData] = useState({
    title: '',
    slug: '',
    description: '',
    webinar_type: 'live',
    badge: 'LIVE',
    scheduled_at: '',
    duration_minutes: 60,
    cover_image: '',
    speaker_id: '',
    is_free: true,
    recording_url: '',
    is_published: true,
    metadata_json: {} as any,
  });

  // Webinar Delete Modal State
  const [webinarToDelete, setWebinarToDelete] = useState<Webinar | null>(null);
  const [deletingWebinar, setDeletingWebinar] = useState(false);

  // Speaker Modal State
  const [speakerModalOpen, setSpeakerModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [speakerFormData, setSpeakerFormData] = useState({
    full_name: '',
    title: '',
    hospital: '',
    bio: '',
    photo_url: '',
    metadata_json: {} as any,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [wList, sList] = await Promise.all([
        api.getAdminWebinars(),
        api.getSpeakers(),
      ]);
      setWebinars(wList);
      setSpeakers(sList);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Eroare la încărcarea datelor.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open Webinar Modal for Create
  const handleOpenCreateWebinar = () => {
    setEditingWebinar(null);
    const inThreeDays = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    const dateStr = inThreeDays.toISOString().slice(0, 16);
    setWebinarFormData({
      title: '',
      slug: '',
      description: '',
      webinar_type: 'live',
      badge: 'LIVE',
      scheduled_at: dateStr,
      duration_minutes: 90,
      cover_image: '/images/guest_radu.jpg',
      speaker_id: speakers.length > 0 ? speakers[0].id : '',
      is_free: true,
      recording_url: '',
      is_published: true,
      metadata_json: {},
    });
    setWebinarModalOpen(true);
  };

  // Open Webinar Modal for Edit
  const handleOpenEditWebinar = (w: Webinar) => {
    setEditingWebinar(w);
    let dateStr = '';
    try {
      dateStr = new Date(w.scheduled_at).toISOString().slice(0, 16);
    } catch (e) {
      dateStr = '';
    }

    setWebinarFormData({
      title: w.title,
      slug: w.slug,
      description: w.description || '',
      webinar_type: w.webinar_type || 'live',
      badge: w.badge || 'LIVE',
      scheduled_at: dateStr,
      duration_minutes: w.duration_minutes || 60,
      cover_image: w.cover_image || '',
      speaker_id: (w as any).speaker_id || (w.speaker ? w.speaker.id : ''),
      is_free: w.is_free,
      recording_url: w.recording_url || '',
      is_published: w.is_published ?? true,
      metadata_json: w.metadata_json || {},
    });
    setWebinarModalOpen(true);
  };

  // Save Webinar
  const handleSaveWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = {
        title: webinarFormData.title,
        slug: webinarFormData.slug || undefined,
        description: webinarFormData.description,
        webinar_type: webinarFormData.webinar_type,
        badge: webinarFormData.badge,
        scheduled_at: new Date(webinarFormData.scheduled_at).toISOString(),
        duration_minutes: Number(webinarFormData.duration_minutes),
        cover_image: webinarFormData.cover_image || undefined,
        speaker_id: webinarFormData.speaker_id || undefined,
        is_free: webinarFormData.is_free,
        recording_url: webinarFormData.recording_url || undefined,
        is_published: webinarFormData.is_published,
        metadata_json: webinarFormData.metadata_json || {},
      };

      if (editingWebinar) {
        await api.updateWebinar(editingWebinar.id, payload);
        setMessage({ type: 'success', text: 'Webinarul a fost actualizat cu succes!' });
      } else {
        await api.createWebinar(payload);
        setMessage({ type: 'success', text: 'Webinarul a fost creat cu succes!' });
      }

      setWebinarModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Eroare la salvarea webinarului.' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Webinar Handlers
  const handleDeleteWebinar = (w: Webinar) => {
    setWebinarToDelete(w);
  };

  const handleConfirmDeleteWebinar = async () => {
    if (!webinarToDelete) return;
    setDeletingWebinar(true);
    try {
      await api.deleteWebinar(webinarToDelete.id);
      setMessage({ type: 'success', text: `Webinarul "${webinarToDelete.title}" a fost șters cu succes.` });
      setWebinarToDelete(null);
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la ștergerea webinarului.' });
    } finally {
      setDeletingWebinar(false);
    }
  };

  // Open Speaker Modal for Create
  const handleOpenCreateSpeaker = () => {
    setEditingSpeaker(null);
    setSpeakerFormData({
      full_name: '',
      title: '',
      hospital: '',
      bio: '',
      photo_url: '/images/speaker_dr_andrei_radu.jpg',
      metadata_json: {},
    });
    setSpeakerModalOpen(true);
  };

  // Open Speaker Modal for Edit
  const handleOpenEditSpeaker = (s: Speaker) => {
    setEditingSpeaker(s);
    setSpeakerFormData({
      full_name: s.full_name,
      title: s.title || '',
      hospital: s.hospital || '',
      bio: s.bio || '',
      photo_url: s.photo_url || '',
      metadata_json: s.metadata_json || {},
    });
    setSpeakerModalOpen(true);
  };

  // Save Speaker
  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...speakerFormData,
        metadata_json: speakerFormData.metadata_json || {},
      };
      if (editingSpeaker) {
        await api.updateSpeaker(editingSpeaker.id, payload);
        setMessage({ type: 'success', text: 'Datele invitatului au fost actualizate!' });
      } else {
        await api.createSpeaker(payload);
        setMessage({ type: 'success', text: 'Invitat adăugat cu succes!' });
      }

      setSpeakerModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Eroare la salvarea invitatului.' });
    } finally {
      setSaving(false);
    }
  };

  const { showConfirm } = useModal();

  // Delete Speaker
  const handleDeleteSpeaker = async (id: string, name: string) => {
    const confirmed = await showConfirm(`Sunteți sigur că doriți să ștergeți invitatul "${name}"?`, {
      title: 'Ștergere Invitat / Lector',
      type: 'warning',
      confirmText: 'Da, șterge',
      cancelText: 'Anulează',
    });
    if (!confirmed) return;
    try {
      await api.deleteSpeaker(id);
      setMessage({ type: 'success', text: 'Invitat șters cu succes.' });
      await loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Eroare la ștergerea invitatului.' });
    }
  };

  // Filter lists
  const filteredWebinars = webinars.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      (w.description && w.description.toLowerCase().includes(q)) ||
      (w.speaker && w.speaker.full_name.toLowerCase().includes(q))
    );
  });

  const filteredSpeakers = speakers.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.hospital && s.hospital.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-brand-navy">
            Gestionare Webinarii & Invitați
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configurează transmisiunile live, înregistrările video și profilurile medicilor / asistenților invitați.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'webinars' ? (
            <button
              onClick={handleOpenCreateWebinar}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adaugă Webinar Nou</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateSpeaker}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adaugă Invitat Nou</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab('webinars'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'webinars'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Webinarii ({webinars.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('speakers'); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'speakers'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Invitați & Formatori ({speakers.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'webinars' ? 'Caută după titlu webinar...' : 'Caută după nume invitat...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:bg-white"
          />
        </div>
      </div>

      {/* CONTENT: WEBINARS TAB */}
      {activeTab === 'webinars' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Se încarcă lista de webinarii...</div>
          ) : filteredWebinars.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">Nu a fost găsit niciun webinar.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Webinar</th>
                    <th className="px-6 py-4">Invitat / Speaker</th>
                    <th className="px-6 py-4">Dată & Durată</th>
                    <th className="px-6 py-4">Tip / Badge</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWebinars.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={formatImageUrl(w.cover_image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80')}
                            alt=""
                            style={getImageStyle(w.metadata_json)}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="max-w-xs">
                            <p className="font-bold text-slate-900 line-clamp-1">{w.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{w.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {w.speaker ? (
                          <div className="flex items-center gap-2">
                            {w.speaker.photo_url && (
                              <img
                                src={formatImageUrl(w.speaker.photo_url)}
                                alt=""
                                style={getImageStyle(w.speaker.metadata_json)}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                            )}
                            <span className="font-semibold text-brand-navy">{w.speaker.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Fără invitat asignat</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-brand-green" />
                            <span>{new Date(w.scheduled_at).toLocaleDateString('ro-RO')}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>{w.duration_minutes} min</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={w.badge === 'LIVE' ? 'badge-coral text-[10px]' : 'badge-mint text-[10px]'}>
                            {w.badge}
                          </span>
                          {w.is_free && (
                            <span className="bg-slate-100 text-slate-700 font-semibold text-[10px] px-2 py-0.5 rounded-full">
                              GRATUIT
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {w.is_published ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Publicat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full text-[10px]">
                            <XCircle className="w-3 h-3" /> Ciornă
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditWebinar(w)}
                            className="p-1.5 text-slate-600 hover:text-brand-green hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editează webinar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteWebinar(w)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Șterge webinar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTENT: SPEAKERS TAB */}
      {activeTab === 'speakers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Se încarcă lista de invitați...</div>
          ) : filteredSpeakers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">Nu a fost găsit niciun invitat.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Invitat</th>
                    <th className="px-6 py-4">Titlu & Calificare</th>
                    <th className="px-6 py-4">Spital / Instituție</th>
                    <th className="px-6 py-4">Biografie</th>
                    <th className="px-6 py-4 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSpeakers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={formatImageUrl(s.photo_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80')}
                            alt=""
                            style={getImageStyle(s.metadata_json)}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <span className="font-bold text-slate-900">{s.full_name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-brand-green font-semibold">{s.title || '-'}</span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {s.hospital || '-'}
                      </td>

                      <td className="px-6 py-4 max-w-sm">
                        <p className="line-clamp-2 text-slate-500 text-[11px]">{s.bio || '-'}</p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditSpeaker(s)}
                            className="p-1.5 text-slate-600 hover:text-brand-green hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editează invitat"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSpeaker(s.id, s.full_name)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Șterge invitat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* WEBINAR EDIT/CREATE MODAL */}
      {webinarModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-brand-navy">
                {editingWebinar ? 'Editează Webinar' : 'Adaugă Webinar Nou'}
              </h2>
              <button
                onClick={() => setWebinarModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWebinar} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Titlu Webinar *</label>
                <input
                  type="text"
                  required
                  value={webinarFormData.title}
                  onChange={(e) => setWebinarFormData({ ...webinarFormData, title: e.target.value })}
                  placeholder="ex: Webinar Live: Gestionarea Situațiilor Critice în Gardă"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Slug (opțional)</label>
                  <input
                    type="text"
                    value={webinarFormData.slug}
                    onChange={(e) => setWebinarFormData({ ...webinarFormData, slug: e.target.value })}
                    placeholder="lasă gol pentru auto-generare"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Invitat / Speaker</label>
                  <select
                    value={webinarFormData.speaker_id}
                    onChange={(e) => setWebinarFormData({ ...webinarFormData, speaker_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                  >
                    <option value="">-- Fără Invitat --</option>
                    {speakers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.title})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Descriere detaliată</label>
                <textarea
                  rows={3}
                  value={webinarFormData.description}
                  onChange={(e) => setWebinarFormData({ ...webinarFormData, description: e.target.value })}
                  placeholder="Descrie tematica și obiectivele de învățare..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Dată & Oră programată *</label>
                  <input
                    type="datetime-local"
                    required
                    value={webinarFormData.scheduled_at}
                    onChange={(e) => setWebinarFormData({ ...webinarFormData, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Durată (minute)</label>
                  <input
                    type="number"
                    min={15}
                    max={360}
                    value={webinarFormData.duration_minutes}
                    onChange={(e) => setWebinarFormData({ ...webinarFormData, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Badge Afișat</label>
                  <select
                    value={webinarFormData.badge}
                    onChange={(e) => setWebinarFormData({ ...webinarFormData, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                  >
                    <option value="LIVE">LIVE</option>
                    <option value="INTERVIU">INTERVIU</option>
                    <option value="DISCUȚIE">DISCUȚIE</option>
                    <option value="SPECIAL">SPECIAL</option>
                  </select>
                </div>
              </div>

              {/* Visual Image Cropper for Webinar Cover */}
              <VisualImageCropper
                label="Copertă Webinar & Poziționare Imagine"
                imageUrl={webinarFormData.cover_image}
                onImageUrlChange={(newUrl) => setWebinarFormData(prev => ({ ...prev, cover_image: newUrl }))}
                metadata={webinarFormData.metadata_json}
                onChange={(updatedMeta) => setWebinarFormData(prev => ({
                  ...prev,
                  metadata_json: { ...prev.metadata_json, ...updatedMeta }
                }))}
                cardType="default"
                cardTitle={webinarFormData.title || 'Webinar'}
                badge={webinarFormData.badge || 'LIVE'}
              />

              <div>
                <label className="block text-slate-700 font-semibold mb-1">URL Înregistrare Video (după transmisiune)</label>
                <input
                  type="url"
                  value={webinarFormData.recording_url}
                  onChange={(e) => setWebinarFormData({ ...webinarFormData, recording_url: e.target.value })}
                  placeholder="https://...mp4 sau YouTube/Vimeo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webinarFormData.is_free}
                    onChange={(e) => setWebinarFormData({ ...webinarFormData, is_free: e.target.checked })}
                    className="rounded text-brand-green focus:ring-brand-green w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">Webinar Gratuit</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webinarFormData.is_published}
                    onChange={(e) => setWebinarFormData({ ...webinarFormData, is_published: e.target.checked })}
                    className="rounded text-brand-green focus:ring-brand-green w-4 h-4"
                  />
                  <span className="font-semibold text-slate-700">Publicat pe site</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {editingWebinar ? (
                  <button
                    type="button"
                    onClick={() => {
                      setWebinarModalOpen(false);
                      setWebinarToDelete(editingWebinar);
                    }}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-200"
                    title="Șterge acest webinar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Șterge Webinar</span>
                  </button>
                ) : <div />}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setWebinarModalOpen(false)}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs px-6 py-2"
                  >
                    {saving ? 'Se salvează...' : editingWebinar ? 'Salvează Modificările' : 'Creează Webinar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPEAKER EDIT/CREATE MODAL */}
      {speakerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-brand-navy">
                {editingSpeaker ? 'Editează Invitat' : 'Adaugă Invitat Nou'}
              </h2>
              <button
                onClick={() => setSpeakerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSpeaker} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nume Complet *</label>
                <input
                  type="text"
                  required
                  value={speakerFormData.full_name}
                  onChange={(e) => setSpeakerFormData({ ...speakerFormData, full_name: e.target.value })}
                  placeholder="ex: Dr. Mihai Ionescu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Titlu / Specialitate *</label>
                  <input
                    type="text"
                    required
                    value={speakerFormData.title}
                    onChange={(e) => setSpeakerFormData({ ...speakerFormData, title: e.target.value })}
                    placeholder="ex: Medic Primar Medicină de Urgență"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Spital / Instituție</label>
                  <input
                    type="text"
                    value={speakerFormData.hospital}
                    onChange={(e) => setSpeakerFormData({ ...speakerFormData, hospital: e.target.value })}
                    placeholder="ex: UPU-SMURD București"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
              </div>

              {/* Visual Image Cropper for Speaker Profile Photograph */}
              <VisualImageCropper
                label="Fotografie Profil Invitat (Încadrare, Focalizare & Decupare)"
                imageUrl={speakerFormData.photo_url}
                onImageUrlChange={(newUrl) => setSpeakerFormData(prev => ({ ...prev, photo_url: newUrl }))}
                metadata={speakerFormData.metadata_json}
                onChange={(updatedMeta) => setSpeakerFormData(prev => ({
                  ...prev,
                  metadata_json: { ...prev.metadata_json, ...updatedMeta }
                }))}
                cardType="guest"
                cardTitle={speakerFormData.full_name || 'Invitat'}
              />

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Biografie & Experiență Clinică</label>
                <textarea
                  rows={4}
                  value={speakerFormData.bio}
                  onChange={(e) => setSpeakerFormData({ ...speakerFormData, bio: e.target.value })}
                  placeholder="Peste 15 ani de experiență clinică în..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/30"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSpeakerModalOpen(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs px-6 py-2"
                >
                  {saving ? 'Se salvează...' : editingSpeaker ? 'Salvează Modificările' : 'Adaugă Invitat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WEBINAR DELETE CONFIRMATION MODAL */}
      {webinarToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 space-y-5">
            {/* Header with Danger Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  Confirmare Ștergere Webinar
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 mt-1">
                  Ștergere Definitivă Webinar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWebinarToDelete(null)}
                disabled={deletingWebinar}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                title="Închide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Alert Box */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
              <p className="text-sm font-semibold leading-relaxed">
                <strong className="text-rose-700">ATENȚIE:</strong> Sunteți sigur că doriți să ștergeți webinarul{' '}
                <span className="font-bold underline decoration-rose-300">"{webinarToDelete.title}"</span>? Această acțiune nu poate fi anulată.
              </p>
            </div>

            {/* Impact Details & Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 font-medium">
                <span className="text-slate-500">Webinar selectat:</span>
                <span className="font-bold text-slate-800 line-clamp-1 max-w-[240px]">{webinarToDelete.title}</span>
              </div>
              <p className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">Impactul acestei acțiuni:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px] leading-relaxed">
                <li>Înregistrarea și datele de programare ale webinarului vor fi eliminate din baza de date.</li>
                <li>Participanții înscriși nu vor mai avea acces la sesiunea live sau la reluarea video a conferinței.</li>
                <li>Evenimentul va fi retras imediat din catalogul public de webinarii și din panoul de administrare.</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWebinarToDelete(null)}
                disabled={deletingWebinar}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteWebinar}
                disabled={deletingWebinar}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {deletingWebinar ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Se șterge definitiv...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Da, șterge webinarul</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
