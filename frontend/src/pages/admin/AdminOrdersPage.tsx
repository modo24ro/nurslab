import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard, Search, Plus, Edit2, Trash2, CheckCircle2, Clock,
  AlertTriangle, Filter, ArrowUpDown, Building2, User as UserIcon,
  X, RefreshCw, Check, Download, FileText, ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminOrder } from '../../types';
import { Toast } from '../../components/common/Toast';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'failed' | 'refunded'>('all');
  const [billingTypeFilter, setBillingTypeFilter] = useState<'all' | 'individual' | 'company'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formBillingEmail, setFormBillingEmail] = useState('');
  const [formBillingPhone, setFormBillingPhone] = useState('');
  const [formBillingType, setFormBillingType] = useState<'individual' | 'company'>('individual');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formCompanyCui, setFormCompanyCui] = useState('');
  const [formCompanyRegCom, setFormCompanyRegCom] = useState('');
  const [formBillingAddress, setFormBillingAddress] = useState('');
  const [formBillingCity, setFormBillingCity] = useState('');
  const [formTotalAmount, setFormTotalAmount] = useState<number>(149);
  const [formCurrency, setFormCurrency] = useState('RON');
  const [formStatus, setFormStatus] = useState<'pending' | 'paid' | 'failed' | 'refunded'>('paid');
  const [formPaymentMethod, setFormPaymentMethod] = useState('card');
  const [formItemTitle, setFormItemTitle] = useState('Gestionarea Situațiilor Critice în Gardă');

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminOrders();
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Eroare la încărcarea comenzilor.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Billing type filter
    if (billingTypeFilter !== 'all') {
      result = result.filter((o) => o.billing_type === billingTypeFilter);
    }

    // Live Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => {
        const orderNum = (o.order_number || '').toLowerCase();
        const custName = (o.customer_name || '').toLowerCase();
        const email = (o.billing_email || '').toLowerCase();
        const phone = (o.billing_phone || '').toLowerCase();
        const company = (o.company_name || '').toLowerCase();
        const cui = (o.company_cui || '').toLowerCase();
        const itemsMatch = o.items?.some((it) => it.title.toLowerCase().includes(q));

        return (
          orderNum.includes(q) ||
          custName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          company.includes(q) ||
          cui.includes(q) ||
          itemsMatch
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'amount_desc') {
        return Number(b.total_amount) - Number(a.total_amount);
      }
      if (sortBy === 'amount_asc') {
        return Number(a.total_amount) - Number(b.total_amount);
      }
      return 0;
    });

    return result;
  }, [orders, statusFilter, billingTypeFilter, searchQuery, sortBy]);

  // Financial KPI calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'paid')
      .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  }, [orders]);

  const paidCount = useMemo(() => orders.filter((o) => o.status === 'paid').length, [orders]);
  const pendingCount = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders]);
  const avgOrderValue = paidCount > 0 ? totalRevenue / paidCount : 0;

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormCustomerName('');
    setFormBillingEmail('');
    setFormBillingPhone('');
    setFormBillingType('individual');
    setFormCompanyName('');
    setFormCompanyCui('');
    setFormCompanyRegCom('');
    setFormBillingAddress('');
    setFormBillingCity('București');
    setFormTotalAmount(149);
    setFormCurrency('RON');
    setFormStatus('paid');
    setFormPaymentMethod('card');
    setFormItemTitle('Gestionarea Situațiilor Critice în Gardă');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (order: AdminOrder) => {
    setEditingOrder(order);
    setFormCustomerName(order.customer_name);
    setFormBillingEmail(order.billing_email);
    setFormBillingPhone(order.billing_phone || '');
    setFormBillingType(order.billing_type || 'individual');
    setFormCompanyName(order.company_name || '');
    setFormCompanyCui(order.company_cui || '');
    setFormCompanyRegCom(order.company_reg_com || '');
    setFormBillingAddress(order.billing_address || '');
    setFormBillingCity(order.billing_city || '');
    setFormTotalAmount(Number(order.total_amount));
    setFormCurrency(order.currency || 'RON');
    setFormStatus(order.status);
    setFormPaymentMethod(order.payment_method || 'card');
  };

  // Submit Create
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        customer_name: formCustomerName,
        billing_email: formBillingEmail,
        billing_phone: formBillingPhone,
        billing_type: formBillingType,
        company_name: formBillingType === 'company' ? formCompanyName : null,
        company_cui: formBillingType === 'company' ? formCompanyCui : null,
        company_reg_com: formBillingType === 'company' ? formCompanyRegCom : null,
        billing_address: formBillingAddress,
        billing_city: formBillingCity,
        billing_country: 'Romania',
        total_amount: Number(formTotalAmount),
        currency: formCurrency,
        status: formStatus,
        payment_method: formPaymentMethod,
        item_title: formItemTitle,
        item_type: 'course'
      };

      const created = await api.createAdminOrder(payload);
      setOrders((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setFeedback({ type: 'success', message: `Comanda ${created.order_number} a fost adăugată cu succes!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la crearea comenzii.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        customer_name: formCustomerName,
        billing_email: formBillingEmail,
        billing_phone: formBillingPhone,
        billing_type: formBillingType,
        company_name: formBillingType === 'company' ? formCompanyName : null,
        company_cui: formBillingType === 'company' ? formCompanyCui : null,
        company_reg_com: formBillingType === 'company' ? formCompanyRegCom : null,
        billing_address: formBillingAddress,
        billing_city: formBillingCity,
        billing_country: 'Romania',
        total_amount: Number(formTotalAmount),
        currency: formCurrency,
        status: formStatus,
        payment_method: formPaymentMethod
      };

      const updated = await api.updateAdminOrder(editingOrder.id, payload);
      setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? updated : o)));
      setEditingOrder(null);
      setFeedback({ type: 'success', message: `Comanda ${updated.order_number} a fost actualizată!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la actualizarea comenzii.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Order
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await api.deleteAdminOrder(orderToDelete.id);
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setFeedback({ type: 'success', message: `Comanda ${orderToDelete.order_number} a fost ștearsă definitiv.` });
      setOrderToDelete(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la ștergerea comenzii.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Modul Financiar & Facturare</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Comenzi & Tranzacții Facturate</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evidență completă a achizițiilor online, facturilor fiscale și plăților securizate Stripe.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Înregistrează Comandă Manuală</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Încasat (RON)</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{totalRevenue.toFixed(2)} RON</p>
          <p className="text-[11px] text-emerald-600 font-medium">Facturat conform RO e-Factura</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Comenzi Achitate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{paidCount}</p>
          <p className="text-[11px] text-slate-500">Tranzacții finalizate cu succes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">În Așteptare Plată</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{pendingCount}</p>
          <p className="text-[11px] text-amber-600 font-medium">Carduri nefinalizate sau OP</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Valoare Medie / Comandă</span>
            <ArrowUpDown className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{avgOrderValue.toFixed(2)} RON</p>
          <p className="text-[11px] text-slate-500">AOV per tranzacție achitată</p>
        </div>
      </div>

      {/* Toast Notification (Dreapta Jos) */}
      {feedback && (
        <Toast
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Advanced Live Search & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Căutare live după nr. comandă, nume cumpărător, email, CUI companie sau titlu produs..."
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
            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="all">Toate Statusurile</option>
              <option value="paid">Doar Achitate</option>
              <option value="pending">În Așteptare</option>
              <option value="refunded">Rambursate</option>
              <option value="failed">Eșuate</option>
            </select>

            {/* Filter by Billing Type */}
            <select
              value={billingTypeFilter}
              onChange={(e) => setBillingTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="all">Toate Entitățile</option>
              <option value="individual">Persoană Fizică</option>
              <option value="company">Persoană Juridică (PJ)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="newest">Cele mai recente</option>
              <option value="oldest">Cele mai vechi</option>
              <option value="amount_desc">Total descrescător</option>
              <option value="amount_asc">Total crescător</option>
            </select>

            <button
              onClick={loadOrders}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reîmprospătează datele"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Filter Indicator Counts */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Afișare <strong className="text-slate-800">{filteredOrders.length}</strong> din <strong>{orders.length}</strong> comenzi înregistrate
          </span>
          {(searchQuery || statusFilter !== 'all' || billingTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setBillingTypeFilter('all');
              }}
              className="text-brand-green hover:underline font-semibold"
            >
              Resetează toate filtrele
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Nr. Comandă</th>
                <th className="p-4">Client / Date Fiscale</th>
                <th className="p-4">Produse / Servicii</th>
                <th className="p-4">Total (TVA)</th>
                <th className="p-4">Data Emiterii</th>
                <th className="p-4">Status & Plată</th>
                <th className="p-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-green" />
                    Se încarcă comenzile...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    Nu s-au găsit comenzi conform filtrelor selectate.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-navy">
                      <div>{o.order_number}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-normal">
                        {o.payment_method}
                      </span>
                    </td>
                    <td className="p-4 text-slate-800">
                      <div className="font-bold flex items-center gap-1.5">
                        {o.billing_type === 'company' ? (
                          <span title="Persoană Juridică">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          </span>
                        ) : (
                          <span title="Persoană Fizică">
                            <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </span>
                        )}
                        <span>{o.customer_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{o.billing_email}</div>
                      {o.company_name && (
                        <div className="text-[11px] text-blue-700 font-medium">
                          {o.company_name} {o.company_cui ? `(CUI: ${o.company_cui})` : ''}
                        </div>
                      )}
                      {o.billing_city && (
                        <div className="text-[10px] text-slate-400">{o.billing_city}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs">
                      {o.items && o.items.length > 0 ? (
                        o.items.map((it) => (
                          <div key={it.id} className="truncate font-medium text-slate-700" title={it.title}>
                            • {it.title}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">Servicii NursLab</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      <span className="text-sm">{Number(o.total_amount).toFixed(2)}</span>{' '}
                      <span className="text-[11px] text-slate-500">{o.currency}</span>
                    </td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('ro-RO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      {o.status === 'paid' && (
                        <span className="badge-mint text-[11px] font-bold px-2.5 py-1">
                          Achitată
                        </span>
                      )}
                      {o.status === 'pending' && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          În Așteptare
                        </span>
                      )}
                      {o.status === 'refunded' && (
                        <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                          Rambursată
                        </span>
                      )}
                      {o.status === 'failed' && (
                        <span className="badge-coral text-[11px] font-bold px-2.5 py-1">
                          Eșuată
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(o)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editează date comandă"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setOrderToDelete(o)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Șterge comanda"
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

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 text-brand-navy">
                <Plus className="w-5 h-5 text-brand-green" />
                <h3 className="font-serif font-bold text-lg text-brand-navy">Înregistrează Comandă Manuală</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nume Client *</label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="ex. Elena Popescu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Facturare *</label>
                  <input
                    type="email"
                    required
                    value={formBillingEmail}
                    onChange={(e) => setFormBillingEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="elena@exemplu.ro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formBillingPhone}
                    onChange={(e) => setFormBillingPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="07xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tip Entitate</label>
                  <select
                    value={formBillingType}
                    onChange={(e) => setFormBillingType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-brand-green outline-none"
                  >
                    <option value="individual">Persoană Fizică</option>
                    <option value="company">Persoană Juridică (PJ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oraș Facturare *</label>
                  <input
                    type="text"
                    required
                    value={formBillingCity}
                    onChange={(e) => setFormBillingCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="București"
                  />
                </div>
              </div>

              {formBillingType === 'company' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-3">
                  <span className="text-xs font-bold text-blue-900 block">Date Fiscale Companie (RO e-Factura)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Denumire Firmă *</label>
                      <input
                        type="text"
                        required={formBillingType === 'company'}
                        value={formCompanyName}
                        onChange={(e) => setFormCompanyName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-500 outline-none"
                        placeholder="SC MedSpital SRL"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Cod Fiscal (CUI) *</label>
                      <input
                        type="text"
                        required={formBillingType === 'company'}
                        value={formCompanyCui}
                        onChange={(e) => setFormCompanyCui(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-500 outline-none"
                        placeholder="RO12345678"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nr. Reg. Com.</label>
                      <input
                        type="text"
                        value={formCompanyRegCom}
                        onChange={(e) => setFormCompanyRegCom(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-500 outline-none"
                        placeholder="J40/123/2020"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adresă Facturare *</label>
                <input
                  type="text"
                  required
                  value={formBillingAddress}
                  onChange={(e) => setFormBillingAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  placeholder="Str. Aviatorilor nr. 12, Sector 1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Denumire Produs / Curs *</label>
                <input
                  type="text"
                  required
                  value={formItemTitle}
                  onChange={(e) => setFormItemTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  placeholder="Gestionarea Situațiilor Critice în Gardă"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Valoare Totală *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formTotalAmount}
                    onChange={(e) => setFormTotalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monedă</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="RON">RON</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Comandă</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="paid">Achitată (Paid)</option>
                    <option value="pending">În Așteptare (Pending)</option>
                    <option value="refunded">Rambursată (Refunded)</option>
                    <option value="failed">Eșuată (Failed)</option>
                  </select>
                </div>
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
                  <span>Salvează Comanda</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">Modificare Date Fiscale</span>
                <h3 className="font-serif font-bold text-lg text-brand-navy">Comanda #{editingOrder.order_number}</h3>
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nume Cumpărător *</label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Facturare *</label>
                  <input
                    type="email"
                    required
                    value={formBillingEmail}
                    onChange={(e) => setFormBillingEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formBillingPhone}
                    onChange={(e) => setFormBillingPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tip Entitate</label>
                  <select
                    value={formBillingType}
                    onChange={(e) => setFormBillingType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-brand-green outline-none"
                  >
                    <option value="individual">Persoană Fizică</option>
                    <option value="company">Persoană Juridică (PJ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Oraș Facturare *</label>
                  <input
                    type="text"
                    required
                    value={formBillingCity}
                    onChange={(e) => setFormBillingCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
              </div>

              {formBillingType === 'company' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-3">
                  <span className="text-xs font-bold text-blue-900 block">Date Fiscale Companie</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Denumire Firmă</label>
                      <input
                        type="text"
                        value={formCompanyName}
                        onChange={(e) => setFormCompanyName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Cod Fiscal (CUI)</label>
                      <input
                        type="text"
                        value={formCompanyCui}
                        onChange={(e) => setFormCompanyCui(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nr. Reg. Com.</label>
                      <input
                        type="text"
                        value={formCompanyRegCom}
                        onChange={(e) => setFormCompanyRegCom(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adresă Facturare *</label>
                <input
                  type="text"
                  required
                  value={formBillingAddress}
                  onChange={(e) => setFormBillingAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total (TVA inclus) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formTotalAmount}
                    onChange={(e) => setFormTotalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Comandă</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="paid">Achitată (Paid)</option>
                    <option value="pending">În Așteptare (Pending)</option>
                    <option value="refunded">Rambursată (Refunded)</option>
                    <option value="failed">Eșuată (Failed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Metodă Plată</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="card">Card Bancar (Stripe)</option>
                    <option value="bank_transfer">Ordin de Plată (OP)</option>
                    <option value="manual">Manual / Numerar</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
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
                  <span>Actualizează Comanda</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-lg">Ștergere Definitivă Comandă</h3>
                  <button onClick={() => setOrderToDelete(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">Acțiune ireversibilă</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 mb-5 text-sm text-slate-700 leading-relaxed">
              Sunteți sigur că doriți să ștergeți comanda{' '}
              <strong className="text-slate-900 font-mono font-bold">#{orderToDelete.order_number}</strong> emisă pentru{' '}
              <strong className="text-slate-900">{orderToDelete.customer_name}</strong> în valoare de{' '}
              <strong className="text-slate-900">{orderToDelete.total_amount} {orderToDelete.currency}</strong>?
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
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
