import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin, Search, Plus, Edit2, Trash2, CheckCircle2, Clock,
  AlertTriangle, Filter, Phone, Mail, X, RefreshCw, Check,
  Users, BookOpen, FileText, CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { WorkshopInterestRegistration } from '../../types';

export const AdminWorkshopsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<WorkshopInterestRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'enrolled'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<WorkshopInterestRegistration | null>(null);
  const [registrationToDelete, setRegistrationToDelete] = useState<WorkshopInterestRegistration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCityName, setFormCityName] = useState('București');
  const [formTopicTitle, setFormTopicTitle] = useState('Resuscitare Cardio-Respiratorie Avansată (ACLS)');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<string>('new');

  const loadRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminWorkshopRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Eroare la încărcarea înscrierilor la workshop.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // Distinct cities and topics
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => {
      if (r.city_name) set.add(r.city_name.trim());
    });
    return Array.from(set).sort();
  }, [registrations]);

  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => {
      if (r.topic_title) set.add(r.topic_title.trim());
    });
    return Array.from(set).sort();
  }, [registrations]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    let result = [...registrations];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // City filter
    if (cityFilter !== 'all') {
      result = result.filter((r) => r.city_name?.toLowerCase() === cityFilter.toLowerCase());
    }

    // Topic filter
    if (topicFilter !== 'all') {
      result = result.filter((r) => r.topic_title?.toLowerCase() === topicFilter.toLowerCase());
    }

    // Live search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const name = (r.full_name || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        const phone = (r.phone || '').toLowerCase();
        const city = (r.city_name || '').toLowerCase();
        const topic = (r.topic_title || '').toLowerCase();
        const notes = (r.notes || '').toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          topic.includes(q) ||
          notes.includes(q)
        );
      });
    }

    return result;
  }, [registrations, statusFilter, cityFilter, topicFilter, searchQuery]);

  // KPI Calculations
  const newCount = useMemo(() => registrations.filter((r) => r.status === 'new').length, [registrations]);
  const contactedCount = useMemo(() => registrations.filter((r) => r.status === 'contacted').length, [registrations]);
  const enrolledCount = useMemo(() => registrations.filter((r) => r.status === 'enrolled').length, [registrations]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormCityName(availableCities[0] || 'București');
    setFormTopicTitle(availableTopics[0] || 'Resuscitare Cardio-Respiratorie Avansată');
    setFormNotes('');
    setFormStatus('new');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (reg: WorkshopInterestRegistration) => {
    setEditingRegistration(reg);
    setFormFullName(reg.full_name);
    setFormEmail(reg.email);
    setFormPhone(reg.phone);
    setFormCityName(reg.city_name);
    setFormTopicTitle(reg.topic_title);
    setFormNotes(reg.notes || '');
    setFormStatus(reg.status);
  };

  // Submit Create
  const handleCreateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        full_name: formFullName,
        email: formEmail,
        phone: formPhone,
        city_name: formCityName,
        topic_title: formTopicTitle,
        notes: formNotes || null,
        status: formStatus
      };

      const created = await api.createAdminWorkshopRegistration(payload);
      setRegistrations((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setFeedback({ type: 'success', message: `Participantul ${created.full_name} a fost înscris la workshop!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la crearea înscrierii.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleUpdateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegistration) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        full_name: formFullName,
        email: formEmail,
        phone: formPhone,
        city_name: formCityName,
        topic_title: formTopicTitle,
        notes: formNotes || null,
        status: formStatus
      };

      const updated = await api.updateAdminWorkshopRegistration(editingRegistration.id, payload);
      setRegistrations((prev) => prev.map((r) => (r.id === editingRegistration.id ? updated : r)));
      setEditingRegistration(null);
      setFeedback({ type: 'success', message: `Înscrierea pentru ${updated.full_name} a fost actualizată!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la actualizarea înscrierii.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Change from Table
  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateWorkshopRegistrationStatus(id, newStatus);
      setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      setFeedback({ type: 'success', message: 'Statusul participantului a fost actualizat!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la actualizarea statusului.' });
    }
  };

  // Delete Registration
  const handleConfirmDelete = async () => {
    if (!registrationToDelete) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await api.deleteAdminWorkshopRegistration(registrationToDelete.id);
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationToDelete.id));
      setFeedback({ type: 'success', message: `Înscrierea participantului ${registrationToDelete.full_name} a fost ștearsă.` });
      setRegistrationToDelete(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la ștergerea înscrierii.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Leads & Formare Practică</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Înscrieri Workshopuri în Orașe</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evidență completă a asistenților medicali interesați de ateliere clinice practice pe orașe și tematici.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Adaugă Înscriere Manuală</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Participanți</span>
            <Users className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{registrations.length}</p>
          <p className="text-[11px] text-slate-500">Înregistrați în baza de interes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Noi (În Așteptare)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{newCount}</p>
          <p className="text-[11px] text-amber-600 font-medium">Necesită contactare telefonică</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Contactați Telefonic</span>
            <Phone className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{contactedCount}</p>
          <p className="text-[11px] text-blue-600 font-medium">Detalii atelier transmise</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Înscriși în Grupă</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{enrolledCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Loc confirmat la workshop</p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Advanced Live Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Căutare live după nume participant, telefon, email, oraș, tematică workshop sau note..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="all">Toate Statusurile</option>
              <option value="new">Nou (În așteptare)</option>
              <option value="contacted">Contactat telefonic</option>
              <option value="enrolled">Înscris în grupă</option>
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="all">Toate Orașele</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Topic Filter */}
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">Toate Tematicile</option>
              {availableTopics.map((t) => (
                <option key={t} value={t} title={t}>
                  {t}
                </option>
              ))}
            </select>

            <button
              onClick={loadRegistrations}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reîmprospătează lista"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Filter Indicator Counts */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Afișare <strong className="text-slate-800">{filteredRegistrations.length}</strong> din <strong>{registrations.length}</strong> participanți
          </span>
          {(searchQuery || statusFilter !== 'all' || cityFilter !== 'all' || topicFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCityFilter('all');
                setTopicFilter('all');
              }}
              className="text-brand-green hover:underline font-semibold"
            >
              Resetează toate filtrele
            </button>
          )}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Participant & Date</th>
                <th className="p-4">Oraș Workshop</th>
                <th className="p-4">Tematică Solicitată</th>
                <th className="p-4">Date de Contact</th>
                <th className="p-4">Data Înscrierii</th>
                <th className="p-4">Status & Progres</th>
                <th className="p-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-green" />
                    Se încarcă înscrierile...
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    Nu s-au găsit înscrieri conform criteriilor de căutare.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-brand-navy">
                      <div className="text-sm font-bold">{r.full_name}</div>
                      {r.notes && (
                        <div className="text-[11px] text-slate-500 font-normal italic mt-0.5 line-clamp-2 max-w-xs">
                          Note: „{r.notes}”
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0" />
                        <span>{r.city_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs">
                      <div className="font-semibold text-slate-900 leading-snug">{r.topic_title}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{r.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{r.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString('ro-RO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleQuickStatusChange(r.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer transition-colors ${
                          r.status === 'enrolled'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : r.status === 'contacted'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}
                      >
                        <option value="new">Nou (În așteptare)</option>
                        <option value="contacted">Contactat telefonic</option>
                        <option value="enrolled">Înscris în grupă</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editează date participant"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRegistrationToDelete(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Șterge înscriere"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 text-brand-navy">
                <Plus className="w-5 h-5 text-brand-green" />
                <h3 className="font-serif font-bold text-lg text-brand-navy">Adaugă Înscriere Workshop</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRegistration} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nume Participant *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="ex. As. Mihai Radu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Număr Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="07xxxxxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="mihai@spital.ro"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oraș Workshop *</label>
                  <input
                    type="text"
                    required
                    value={formCityName}
                    onChange={(e) => setFormCityName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="București, Cluj-Napoca, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tematică Solicitată *</label>
                <input
                  type="text"
                  required
                  value={formTopicTitle}
                  onChange={(e) => setFormTopicTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  placeholder="ex. Resuscitare Cardio-Respiratorie Avansată (ACLS)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Înscriere</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                >
                  <option value="new">Nou (În așteptare)</option>
                  <option value="contacted">Contactat telefonic</option>
                  <option value="enrolled">Înscris în grupă</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Note / Mențiuni Speciale</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  placeholder="Disponibilitate orară sau preferințe de dată..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Salvează Înscrierea</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">Modificare Date Participant</span>
                <h3 className="font-serif font-bold text-lg text-brand-navy">{editingRegistration.full_name}</h3>
              </div>
              <button onClick={() => setEditingRegistration(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRegistration} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nume Participant *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Număr Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oraș Workshop *</label>
                  <input
                    type="text"
                    required
                    value={formCityName}
                    onChange={(e) => setFormCityName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tematică Solicitată *</label>
                <input
                  type="text"
                  required
                  value={formTopicTitle}
                  onChange={(e) => setFormTopicTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Înscriere</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                >
                  <option value="new">Nou (În așteptare)</option>
                  <option value="contacted">Contactat telefonic</option>
                  <option value="enrolled">Înscris în grupă</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Note / Mențiuni Speciale</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRegistration(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-6 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Actualizează Înscrierea</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {registrationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-lg">Ștergere Înscriere Workshop</h3>
                  <button onClick={() => setRegistrationToDelete(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">Acțiune permanentă</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 mb-5 text-sm text-slate-700 leading-relaxed">
              Sunteți sigur că doriți să ștergeți înscrierea participantului{' '}
              <strong className="text-slate-900 font-bold">{registrationToDelete.full_name}</strong> pentru workshopul din{' '}
              <strong className="text-slate-900">{registrationToDelete.city_name}</strong>?
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRegistrationToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Anulează
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm flex items-center gap-1.5 transition-colors"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirmă Ștergerea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
