import React, { useState, useEffect, useMemo } from 'react';
import {
  HeartHandshake, Search, Plus, Edit2, Trash2, CheckCircle2, Clock,
  AlertTriangle, Filter, MapPin, Phone, Mail, X, RefreshCw, Check,
  Calendar, AlertCircle, FileText, User, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { HomeNursingRequest } from '../../types';

export const AdminHomeNursingPage: React.FC = () => {
  const [requests, setRequests] = useState<HomeNursingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'scheduled' | 'completed'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'urgent' | 'normal'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<HomeNursingRequest | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<HomeNursingRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('București');
  const [formServiceType, setFormServiceType] = useState('Pansamente & Îngrijire Plăgi Cronice');
  const [formCondition, setFormCondition] = useState('');
  const [formUrgency, setFormUrgency] = useState<'normal' | 'urgent'>('normal');
  const [formPreferredDate, setFormPreferredDate] = useState('');
  const [formStatus, setFormStatus] = useState<string>('pending');
  const [formAdminNotes, setFormAdminNotes] = useState('');

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminHomeNursingRequests();
      setRequests(data);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Eroare la încărcarea solicitărilor de îngrijire.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Distinct cities list for filter dropdown
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.city) set.add(r.city.trim());
    });
    return Array.from(set).sort();
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      result = result.filter((r) => r.urgency_level === urgencyFilter);
    }

    // City filter
    if (cityFilter !== 'all') {
      result = result.filter((r) => r.city?.toLowerCase() === cityFilter.toLowerCase());
    }

    // Live search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        const name = (r.full_name || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        const phone = (r.phone || '').toLowerCase();
        const city = (r.city || '').toLowerCase();
        const addr = (r.address || '').toLowerCase();
        const service = (r.service_type || '').toLowerCase();
        const cond = (r.patient_condition || '').toLowerCase();
        const notes = (r.admin_notes || '').toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          addr.includes(q) ||
          service.includes(q) ||
          cond.includes(q) ||
          notes.includes(q)
        );
      });
    }

    return result;
  }, [requests, statusFilter, urgencyFilter, cityFilter, searchQuery]);

  // KPI Calculations
  const pendingCount = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests]);
  const scheduledCount = useMemo(() => requests.filter((r) => r.status === 'scheduled').length, [requests]);
  const completedCount = useMemo(() => requests.filter((r) => r.status === 'completed').length, [requests]);
  const urgentCount = useMemo(() => requests.filter((r) => r.urgency_level === 'urgent').length, [requests]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormCity('București');
    setFormServiceType('Pansamente & Îngrijire Plăgi');
    setFormCondition('');
    setFormUrgency('normal');
    setFormPreferredDate('');
    setFormStatus('pending');
    setFormAdminNotes('');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (req: HomeNursingRequest) => {
    setEditingRequest(req);
    setFormFullName(req.full_name);
    setFormEmail(req.email);
    setFormPhone(req.phone);
    setFormAddress(req.address);
    setFormCity(req.city);
    setFormServiceType(req.service_type);
    setFormCondition(req.patient_condition || '');
    setFormUrgency((req.urgency_level as any) || 'normal');
    setFormPreferredDate(req.preferred_date || '');
    setFormStatus(req.status || 'pending');
    setFormAdminNotes(req.admin_notes || '');
  };

  // Submit Create
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        full_name: formFullName,
        email: formEmail,
        phone: formPhone,
        address: formAddress,
        city: formCity,
        service_type: formServiceType,
        patient_condition: formCondition || null,
        urgency_level: formUrgency,
        preferred_date: formPreferredDate || null,
        status: formStatus,
        admin_notes: formAdminNotes || null
      };

      const created = await api.createAdminHomeNursingRequest(payload);
      setRequests((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setFeedback({ type: 'success', message: `Solicitarea pentru ${created.full_name} a fost înregistrată!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la crearea solicitării.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        full_name: formFullName,
        email: formEmail,
        phone: formPhone,
        address: formAddress,
        city: formCity,
        service_type: formServiceType,
        patient_condition: formCondition || null,
        urgency_level: formUrgency,
        preferred_date: formPreferredDate || null,
        status: formStatus,
        admin_notes: formAdminNotes || null
      };

      const updated = await api.updateAdminHomeNursingRequest(editingRequest.id, payload);
      setRequests((prev) => prev.map((r) => (r.id === editingRequest.id ? updated : r)));
      setEditingRequest(null);
      setFeedback({ type: 'success', message: `Solicitarea pentru ${updated.full_name} a fost actualizată!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la actualizarea solicitării.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Change from Table
  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateHomeNursingStatus(id, newStatus);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      setFeedback({ type: 'success', message: 'Statusul intervenției a fost actualizat!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la actualizarea statusului.' });
    }
  };

  // Delete Request
  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await api.deleteAdminHomeNursingRequest(requestToDelete.id);
      setRequests((prev) => prev.filter((r) => r.id !== requestToDelete.id));
      setFeedback({ type: 'success', message: `Solicitarea pentru ${requestToDelete.full_name} a fost ștearsă.` });
      setRequestToDelete(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la ștergerea solicitării.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Servicii Clinice Mobile</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Solicitări Îngrijiri la Domiciliu</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestiune cereri pacienți, planificare asistenți medicali, tratamente injectabile și pansamente.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Adaugă Solicitare Manuală</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Cereri</span>
            <HeartHandshake className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{requests.length}</p>
          <p className="text-[11px] text-slate-500">Înregistrate în platformă</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">În Așteptare</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{pendingCount}</p>
          <p className="text-[11px] text-amber-600 font-medium">Necesită triaj medical</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Programate</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{scheduledCount}</p>
          <p className="text-[11px] text-blue-600 font-medium">Asistent confirmat pe teren</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Finalizate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{completedCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Tratament efectuat</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Urgențe Medicale</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-brand-red">{urgentCount}</p>
          <p className="text-[11px] text-rose-600 font-medium">Prioritate maximă</p>
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
              placeholder="Căutare live după nume solicitant, telefon, oraș, adresă, tip serviciu sau diagnostic..."
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
              <option value="pending">În Așteptare</option>
              <option value="contacted">Contactat</option>
              <option value="scheduled">Asistent Programat</option>
              <option value="completed">Finalizat</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="all">Toate Urgențele</option>
              <option value="urgent">Doar Urgențe</option>
              <option value="normal">Normale</option>
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

            <button
              onClick={loadRequests}
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
            Afișare <strong className="text-slate-800">{filteredRequests.length}</strong> din <strong>{requests.length}</strong> solicitări medicale
          </span>
          {(searchQuery || statusFilter !== 'all' || urgencyFilter !== 'all' || cityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setUrgencyFilter('all');
                setCityFilter('all');
              }}
              className="text-brand-green hover:underline font-semibold"
            >
              Resetează toate filtrele
            </button>
          )}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Nume Solicitant & Pacient</th>
                <th className="p-4">Serviciu Solicitat & Urgență</th>
                <th className="p-4">Locație & Adresă</th>
                <th className="p-4">Date de Contact</th>
                <th className="p-4">Data Cererii</th>
                <th className="p-4">Status Intervenție</th>
                <th className="p-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-green" />
                    Se încarcă solicitările...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    Nu s-au găsit solicitări conform criteriilor de căutare.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-brand-navy">
                      <div className="text-sm font-bold">{r.full_name}</div>
                      {r.patient_condition && (
                        <div className="text-[11px] text-slate-500 font-normal italic mt-0.5 max-w-xs line-clamp-2">
                          „{r.patient_condition}”
                        </div>
                      )}
                      {r.admin_notes && (
                        <div className="text-[10px] text-blue-600 font-mono mt-1">
                          Note: {r.admin_notes}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs">
                      <div className="font-semibold text-slate-900">{r.service_type}</div>
                      {r.urgency_level === 'urgent' ? (
                        <span className="badge-coral text-[9px] font-bold px-2 py-0.5 mt-1 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Urgent
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Standard</span>
                      )}
                      {r.preferred_date && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Pref: {r.preferred_date}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-green" />
                        <span>{r.city}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 max-w-[200px] truncate" title={r.address}>
                        {r.address}
                      </div>
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
                          r.status === 'completed'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : r.status === 'scheduled'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : r.status === 'contacted'
                            ? 'bg-purple-50 border-purple-300 text-purple-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}
                      >
                        <option value="pending">În așteptare</option>
                        <option value="contacted">Contactat</option>
                        <option value="scheduled">Asistent Programat</option>
                        <option value="completed">Finalizat</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editează solicitare"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRequestToDelete(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Șterge solicitare"
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
                <h3 className="font-serif font-bold text-lg text-brand-navy">Adaugă Solicitare Îngrijire la Domiciliu</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nume Solicitant / Pacient *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="ex. Maria Ionescu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefon de Contact *</label>
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
                    placeholder="contact@pacient.ro"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oraș / Localitate *</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="București / Cluj-Napoca"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adresă Detaliată *</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  placeholder="Strada, Număr, Bloc, Scară, Apartament, Interfon"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tip Serviciu Medical *</label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-brand-green outline-none"
                  >
                    <option value="Pansamente & Îngrijire Plăgi Cronice">Pansamente & Îngrijire Plăgi Cronice</option>
                    <option value="Administrare Tratamente Injectabile & Perfuzabile">Administrare Tratamente Injectabile</option>
                    <option value="Montare / Schimbare Sondă Vezicală & Nazogastrică">Sonde Vezicale & Nazogastrice</option>
                    <option value="Recoltare Analize de Sânge la Domiciliu">Recoltare Analize la Domiciliu</option>
                    <option value="Monitorizare Funcții Vitale & Glicemie">Monitorizare Funcții Vitale</option>
                    <option value="Îngrijire Pacient Imobilizat la Pat">Îngrijire Pacient Imobilizat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Grad Urgență</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="normal">Normal (În decurs de 24-48h)</option>
                    <option value="urgent">Urgent (În decurs de 2-4 ore)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dată / Interval Preferat</label>
                  <input
                    type="text"
                    value={formPreferredDate}
                    onChange={(e) => setFormPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="ex. Mâine dimineață 09:00 - 11:00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Solicitare</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="pending">În așteptare (Triaj)</option>
                    <option value="contacted">Contactat telefonic</option>
                    <option value="scheduled">Asistent Programat</option>
                    <option value="completed">Finalizat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stare Pacient / Diagnostic</label>
                <textarea
                  rows={2}
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  placeholder="Detalii despre mobilitate, alergii medicamentoase sau recomandare medic..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Note Administrative Interne</label>
                <input
                  type="text"
                  value={formAdminNotes}
                  onChange={(e) => setFormAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  placeholder="ex. Asistent alocat: Cristina V. / Factură emisă"
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
                  <span>Înregistrează Solicitarea</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">Modificare Solicitare</span>
                <h3 className="font-serif font-bold text-lg text-brand-navy">{editingRequest.full_name}</h3>
              </div>
              <button onClick={() => setEditingRequest(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nume Solicitant *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefon de Contact *</label>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oraș / Localitate *</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adresă Detaliată *</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tip Serviciu Medical *</label>
                  <input
                    type="text"
                    required
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Grad Urgență</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Interval / Dată Preferată</label>
                  <input
                    type="text"
                    value={formPreferredDate}
                    onChange={(e) => setFormPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Solicitare</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="pending">În așteptare (Triaj)</option>
                    <option value="contacted">Contactat telefonic</option>
                    <option value="scheduled">Asistent Programat</option>
                    <option value="completed">Finalizat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stare Pacient / Diagnostic</label>
                <textarea
                  rows={2}
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Note Administrative Interne</label>
                <input
                  type="text"
                  value={formAdminNotes}
                  onChange={(e) => setFormAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
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
                  <span>Actualizează Solicitarea</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {requestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-lg">Ștergere Cerere Îngrijire</h3>
                  <button onClick={() => setRequestToDelete(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">Acțiune permanentă</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 mb-5 text-sm text-slate-700 leading-relaxed">
              Sunteți sigur că doriți să ștergeți solicitarea de îngrijire primită de la{' '}
              <strong className="text-slate-900 font-bold">{requestToDelete.full_name}</strong> ({requestToDelete.city},{' '}
              {requestToDelete.service_type})?
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRequestToDelete(null)}
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
