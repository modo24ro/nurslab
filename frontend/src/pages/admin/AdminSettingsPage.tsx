import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Settings, Globe, Mail, Building2, CreditCard, Layers, ShieldCheck,
  Save, RefreshCw, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle,
  XCircle, Send, Check, X, Search, Lock, Eye, EyeOff, Sliders,
  HelpCircle, ArrowRight, ExternalLink, Activity, Info
} from 'lucide-react';
import { api } from '../../services/api';
import { CategoryAdmin, CatalogOption } from '../../types';
import { Toast } from '../../components/common/Toast';
import { useModal } from '../../context/ModalContext';

type SettingsTab = 'general' | 'categories' | 'email' | 'billing' | 'payments' | 'system';
const VALID_TABS: SettingsTab[] = ['general', 'categories', 'email', 'billing', 'payments', 'system'];

export const AdminSettingsPage: React.FC = () => {
  const { showAlert, showConfirm } = useModal();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract initial tab from URL query (?tab=... / ?tag=...) or hash (#...)
  const getTabFromUrl = useCallback((): SettingsTab => {
    const fromQuery = (searchParams.get('tab') || searchParams.get('tag')) as SettingsTab | null;
    if (fromQuery && VALID_TABS.includes(fromQuery)) {
      return fromQuery;
    }
    const fromHash = location.hash.replace(/^#/, '') as SettingsTab;
    if (fromHash && VALID_TABS.includes(fromHash)) {
      return fromHash;
    }
    return 'general';
  }, [searchParams, location.hash]);

  const [activeTab, setActiveTab] = useState<SettingsTab>(getTabFromUrl);

  // Sync tab with URL when browser history navigation happens
  useEffect(() => {
    const targetTab = getTabFromUrl();
    if (targetTab && targetTab !== activeTab) {
      setActiveTab(targetTab);
    }
  }, [getTabFromUrl, activeTab]);

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
    navigate({
      pathname: '/admin/settings',
      search: `?tab=${tabId}`,
      hash: `#${tabId}`,
    }, { replace: true });
  };
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Raw Settings state from backend
  const [settingsMap, setSettingsMap] = useState<Record<string, any>>({});
  // Local edit values: setting_key -> value string
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  // Secrets edit toggle: which keys are currently being edited with new plaintext
  const [editingSecrets, setEditingSecrets] = useState<Record<string, boolean>>({});

  // Categories state
  const [categories, setCategories] = useState<CategoryAdmin[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryFilterActive, setCategoryFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryAdmin | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'activity',
    display_order: 1,
    is_active: true,
  });
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);
  const [categoryDeleteModal, setCategoryDeleteModal] = useState<CategoryAdmin | null>(null);

  // Catalogs state
  const [catalogs, setCatalogs] = useState<{
    course_levels: CatalogOption[];
    course_formats: CatalogOption[];
    instructor_specialties: CatalogOption[];
    lesson_types: CatalogOption[];
    certificate_types: CatalogOption[];
  }>({
    course_levels: [],
    course_formats: [],
    instructor_specialties: [],
    lesson_types: [],
    certificate_types: [],
  });
  const [activeCatalogKey, setActiveCatalogKey] = useState<keyof typeof catalogs>('course_levels');
  const [newCatalogOption, setNewCatalogOption] = useState({ value: '', label: '', description: '' });

  // Email test state
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Stripe test state
  const [testingStripe, setTestingStripe] = useState(false);
  const [testStripeResult, setTestStripeResult] = useState<{ success: boolean; message: string } | null>(null);

  // Stripe Live Mode Confirmation Modal State
  const [stripeLiveModalOpen, setStripeLiveModalOpen] = useState(false);

  // Load all settings & catalogs on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [settingsRes, categoriesRes, catalogsRes] = await Promise.all([
        api.getSettings(),
        api.getAdminCategories().catch(() => []),
        api.getCatalogs().catch(() => ({})),
      ]);

      if (settingsRes && settingsRes.settings) {
        setSettingsMap(settingsRes.settings);
        const initialFormValues: Record<string, string> = {};
        Object.entries(settingsRes.settings).forEach(([key, item]: [string, any]) => {
          initialFormValues[key] = item.value ?? '';
        });
        setFormValues(initialFormValues);
      }

      if (Array.isArray(categoriesRes)) {
        setCategories(categoriesRes);
      }

      if (catalogsRes) {
        setCatalogs({
          course_levels: catalogsRes.course_levels || [],
          course_formats: catalogsRes.course_formats || [],
          instructor_specialties: catalogsRes.instructor_specialties || [],
          lesson_types: catalogsRes.lesson_types || [],
          certificate_types: catalogsRes.certificate_types || [],
        });
      }
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Eroare la încărcarea setărilor din baza de date.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      // Build payload: exclude masked secret values that were not altered
      const payload: Record<string, string> = {};
      Object.entries(formValues).forEach(([key, val]) => {
        const item = settingsMap[key];
        if (item && item.is_secret) {
          // Only send if the admin explicitly clicked edit and typed a new secret
          if (editingSecrets[key] && val && val !== '••••••••') {
            payload[key] = val;
          }
        } else {
          payload[key] = val;
        }
      });

      await api.updateSettingsBulk(payload);
      setFeedback({ type: 'success', message: 'Setările au fost salvate și aplicate cu succes!' });
      setHasUnsavedChanges(false);
      setEditingSecrets({});
      // Reload to update masked states
      const settingsRes = await api.getSettings();
      if (settingsRes && settingsRes.settings) {
        setSettingsMap(settingsRes.settings);
        const updatedFormValues: Record<string, string> = {};
        Object.entries(settingsRes.settings).forEach(([k, item]: [string, any]) => {
          updatedFormValues[k] = item.value ?? '';
        });
        setFormValues(updatedFormValues);
      }
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Eroare la salvarea setărilor.' });
    } finally {
      setSaving(false);
    }
  };

  // Category CRUD Handlers
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      icon: 'activity',
      display_order: categories.length + 1,
      is_active: true,
    });
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat: CategoryAdmin) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'activity',
      display_order: cat.display_order,
      is_active: cat.is_active,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryActionLoading(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryForm);
        setFeedback({ type: 'success', message: `Categoria '${categoryForm.name}' a fost actualizată.` });
      } else {
        await api.createCategory(categoryForm);
        setFeedback({ type: 'success', message: `Categoria '${categoryForm.name}' a fost creată cu succes.` });
      }
      setCategoryModalOpen(false);
      const updatedCats = await api.getAdminCategories();
      setCategories(updatedCats);
    } catch (err: any) {
      showAlert(err.message || 'Eroare la salvarea categoriei', { type: 'error', title: 'Salvare Categorie' });
    } finally {
      setCategoryActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryDeleteModal) return;
    setCategoryActionLoading(true);
    try {
      await api.deleteCategory(categoryDeleteModal.id);
      setFeedback({ type: 'success', message: `Categoria '${categoryDeleteModal.name}' a fost ștearsă.` });
      setCategoryDeleteModal(null);
      const updatedCats = await api.getAdminCategories();
      setCategories(updatedCats);
    } catch (err: any) {
      showAlert(err.message || 'Nu s-a putut șterge categoria.', { type: 'error', title: 'Ștergere Categorie' });
    } finally {
      setCategoryActionLoading(false);
    }
  };

  // Catalogs Handlers
  const handleAddCatalogOption = async () => {
    if (!newCatalogOption.value.trim() || !newCatalogOption.label.trim()) {
      showAlert('Completați codul (value) și denumirea (label).', { type: 'warning', title: 'Câmpuri Obligatorii' });
      return;
    }
    const currentList = catalogs[activeCatalogKey] || [];
    if (currentList.some((item) => item.value === newCatalogOption.value.trim())) {
      showAlert(`Opțiunea cu codul '${newCatalogOption.value}' există deja.`, { type: 'warning', title: 'Opțiune Existentă' });
      return;
    }
    const updatedList = [...currentList, { ...newCatalogOption, value: newCatalogOption.value.trim() }];
    try {
      await api.updateCatalog(activeCatalogKey, updatedList);
      setCatalogs((prev) => ({ ...prev, [activeCatalogKey]: updatedList }));
      setNewCatalogOption({ value: '', label: '', description: '' });
      setFeedback({ type: 'success', message: 'Catalogul a fost actualizat cu succes.' });
    } catch (err: any) {
      showAlert(err.message || 'Eroare la actualizarea catalogului.', { type: 'error', title: 'Actualizare Catalog' });
    }
  };

  const handleRemoveCatalogOption = async (valToRemove: string) => {
    const confirmed = await showConfirm(`Confirmați eliminarea opțiunii '${valToRemove}' din catalog?`, {
      title: 'Ștergere Opțiune Catalog',
      type: 'warning',
      confirmText: 'Da, elimină',
      cancelText: 'Anulează',
    });
    if (!confirmed) return;
    const currentList = catalogs[activeCatalogKey] || [];
    const updatedList = currentList.filter((item) => item.value !== valToRemove);
    try {
      await api.updateCatalog(activeCatalogKey, updatedList);
      setCatalogs((prev) => ({ ...prev, [activeCatalogKey]: updatedList }));
      setFeedback({ type: 'success', message: 'Opțiunea a fost ștearsă din catalog.' });
    } catch (err: any) {
      showAlert(err.message || 'Eroare la ștergerea opțiunii.', { type: 'error', title: 'Ștergere Opțiune' });
    }
  };

  // Test Email Runner
  const handleRunEmailTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient) return;
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const payload: any = {
        to_email: testEmailRecipient,
        smtp_host: formValues['email_smtp_host'],
        smtp_port: parseInt(formValues['email_smtp_port'] || '587', 10),
        smtp_encryption: formValues['email_smtp_encryption'],
        smtp_username: formValues['email_smtp_username'],
        smtp_from_name: formValues['email_smtp_from_name'],
        smtp_from_email: formValues['email_smtp_from_email'],
      };
      // If user typed a new password in form, pass it; otherwise pass masked so backend uses saved
      if (editingSecrets['email_smtp_password']) {
        payload.smtp_password = formValues['email_smtp_password'];
      }

      const res = await api.testSmtpEmail(payload);
      setTestEmailResult({ success: true, message: res.message || 'Conexiune reușită și email trimis!' });
    } catch (err: any) {
      setTestEmailResult({ success: false, message: err.message || 'Eșec conexiune SMTP.' });
    } finally {
      setTestingEmail(false);
    }
  };

  // Test Stripe Runner
  const handleRunStripeTest = async () => {
    setTestingStripe(true);
    setTestStripeResult(null);
    try {
      const payload: any = {
        stripe_mode: formValues['payment_stripe_mode'] || 'test',
      };
      if (editingSecrets['payment_stripe_secret_key']) {
        payload.stripe_secret_key = formValues['payment_stripe_secret_key'];
      }
      const res = await api.testStripePayment(payload);
      setTestStripeResult({ success: true, message: res.message || 'Configurația Stripe este validă!' });
    } catch (err: any) {
      setTestStripeResult({ success: false, message: err.message || 'Eroare la validarea Stripe.' });
    } finally {
      setTestingStripe(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.slug.toLowerCase().includes(categorySearch.toLowerCase());
    const matchesActive =
      categoryFilterActive === 'all' ||
      (categoryFilterActive === 'active' && c.is_active) ||
      (categoryFilterActive === 'inactive' && !c.is_active);
    return matchesSearch && matchesActive;
  });

  // Calculate configuration readiness badges for tabs
  const tabStatus = {
    general: formValues['general_site_name'] && formValues['general_contact_email'],
    categories: categories.length > 0,
    email: formValues['email_smtp_host'] && formValues['email_smtp_from_email'],
    billing: formValues['billing_company_name'] && formValues['billing_cui'],
    payments: formValues['payment_stripe_publishable_key'] ? true : false,
    system: true,
  };

  if (loading) {
    return (
      <div className="w-full p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-green" />
          <p className="font-medium text-sm">Se încarcă modulul de configurare centralizat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-brand-navy text-brand-green">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
              Setări Platformă & Configurare
            </h1>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Gestiune centralizată a parametrilor platformei, datelor de facturare, serverului SMTP, cataloagelor și integrărilor de plată.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              Modificări nesalvate
            </span>
          )}
          <button
            onClick={loadAllData}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-medium flex items-center gap-1.5 transition-colors"
            title="Reîncarcă setările din baza de date"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reîncarcă</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className={`px-5 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-all ${
              hasUnsavedChanges
                ? 'bg-brand-green text-white hover:bg-emerald-600 ring-2 ring-brand-green/30'
                : 'bg-brand-navy text-white hover:bg-slate-800'
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvează Toate Modificările
              </>
            )}
          </button>
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-px scrollbar-none">
        {[
          { id: 'general', label: '1. Site & General', icon: Globe, ready: tabStatus.general },
          { id: 'categories', label: '2. Categorii & Cataloage', icon: Layers, ready: tabStatus.categories },
          { id: 'email', label: '3. Email & SMTP', icon: Mail, ready: tabStatus.email },
          { id: 'billing', label: '4. Facturare & Companie', icon: Building2, ready: tabStatus.billing },
          { id: 'payments', label: '5. Plăți & Stripe', icon: CreditCard, ready: tabStatus.payments },
          { id: 'system', label: '6. Sistem & Integrări', icon: Sliders, ready: tabStatus.system },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'border-brand-green text-brand-navy bg-white/60 rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-green' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.ready ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Configurat" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Necesită atenție" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL WEBSITE SETTINGS */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Informații Generale & Identitate Publică
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aceste date sunt utilizate pe site-ul public, în antetul și subsolul paginilor, precum și în metadatele de căutare.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nume Website / Platformă
                </label>
                <input
                  type="text"
                  value={formValues['general_site_name'] || ''}
                  onChange={(e) => handleFieldChange('general_site_name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
                  placeholder="ex: NursLab - Formare Medicală Continuă"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Titlul principal afișat în browser și pe paginile publice.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nume Organizație / Proiect
                </label>
                <input
                  type="text"
                  value={formValues['general_organization_name'] || ''}
                  onChange={(e) => handleFieldChange('general_organization_name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
                  placeholder="ex: Asociația NursLab Practică Medicală"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  URL Public Principal (Canonical Base)
                </label>
                <input
                  type="url"
                  value={formValues['general_site_url'] || ''}
                  onChange={(e) => handleFieldChange('general_site_url', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none"
                  placeholder="https://nurslab.ro"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Limbă Implicită & Fus Orar
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formValues['general_default_language'] || 'ro'}
                    onChange={(e) => handleFieldChange('general_default_language', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                  >
                    <option value="ro">Română (RO)</option>
                    <option value="en">Engleză (EN)</option>
                  </select>
                  <select
                    value={formValues['general_default_timezone'] || 'Europe/Bucharest'}
                    onChange={(e) => handleFieldChange('general_default_timezone', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                  >
                    <option value="Europe/Bucharest">Europe/Bucharest (UTC+2/+3)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Date de Contact Publice</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Email de Contact Public
                  </label>
                  <input
                    type="email"
                    value={formValues['general_contact_email'] || ''}
                    onChange={(e) => handleFieldChange('general_contact_email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="contact@nurslab.ro"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Telefon Asistență
                  </label>
                  <input
                    type="text"
                    value={formValues['general_contact_phone'] || ''}
                    onChange={(e) => handleFieldChange('general_contact_phone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="+40 720 000 000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Adresă Sediul Principal
                  </label>
                  <input
                    type="text"
                    value={formValues['general_contact_address'] || ''}
                    onChange={(e) => handleFieldChange('general_contact_address', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="București, Sector 1"
                  />
                </div>
              </div>
            </div>

            {/* Branding, Logo & Favicon */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Imagini Brand & Favicon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    URL Logo Platformă
                  </label>
                  <input
                    type="text"
                    value={formValues['general_logo_url'] || ''}
                    onChange={(e) => handleFieldChange('general_logo_url', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="/images/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    URL Favicon
                  </label>
                  <input
                    type="text"
                    value={formValues['general_favicon_url'] || ''}
                    onChange={(e) => handleFieldChange('general_favicon_url', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Canale Social Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Facebook</label>
                  <input
                    type="url"
                    value={formValues['general_social_facebook'] || ''}
                    onChange={(e) => handleFieldChange('general_social_facebook', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                    placeholder="https://facebook.com/nurslab"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Instagram</label>
                  <input
                    type="url"
                    value={formValues['general_social_instagram'] || ''}
                    onChange={(e) => handleFieldChange('general_social_instagram', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                    placeholder="https://instagram.com/nurslab"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={formValues['general_social_linkedin'] || ''}
                    onChange={(e) => handleFieldChange('general_social_linkedin', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                    placeholder="https://linkedin.com/company/nurslab"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">YouTube</label>
                  <input
                    type="url"
                    value={formValues['general_social_youtube'] || ''}
                    onChange={(e) => handleFieldChange('general_social_youtube', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                    placeholder="https://youtube.com/@nurslab"
                  />
                </div>
              </div>
            </div>

            {/* SEO & Maintenance */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">SEO Implicit & Mentenanță</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    SEO Meta Title Implicit
                  </label>
                  <input
                    type="text"
                    value={formValues['general_seo_title'] || ''}
                    onChange={(e) => handleFieldChange('general_seo_title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="NursLab | Formare și Practică Clinică în Nursing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Mod Mentenanță
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formValues['general_maintenance_mode'] === 'true'}
                        onChange={(e) =>
                          handleFieldChange('general_maintenance_mode', e.target.checked ? 'true' : 'false')
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                    <span className="text-xs text-slate-600 font-medium">
                      {formValues['general_maintenance_mode'] === 'true'
                        ? 'Activ (doar administratorii pot naviga)'
                        : 'Inactiv (site-ul este public și operațional)'}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    SEO Meta Description Implicit
                  </label>
                  <textarea
                    rows={2}
                    value={formValues['general_seo_description'] || ''}
                    onChange={(e) => handleFieldChange('general_seo_description', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="Platforma modernă educațională dedicată asistenților medicali și profesioniștilor din sănătate."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSE CATEGORIES & REUSABLE CATALOGS */}
      {activeTab === 'categories' && (
        <div className="space-y-8">
          {/* Categories Management Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  Categorii Dinamice de Cursuri
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestionați categoriile disponibile în editorul de cursuri (/admin/courses) și pe catalogul public.
                </p>
              </div>
              <button
                onClick={openCreateCategory}
                className="px-4 py-2 rounded-xl bg-brand-green text-white hover:bg-emerald-600 text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Adaugă Categorie
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Caută categorie după nume sau slug..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-green"
                />
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                <span className="text-slate-500">Stare:</span>
                <select
                  value={categoryFilterActive}
                  onChange={(e: any) => setCategoryFilterActive(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  <option value="all">Toate ({categories.length})</option>
                  <option value="active">Doar Active</option>
                  <option value="inactive">Dezactivate</option>
                </select>
              </div>
            </div>

            {/* Categories Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Ordine</th>
                    <th className="px-4 py-3">Nume Categorie</th>
                    <th className="px-4 py-3">Slug URL</th>
                    <th className="px-4 py-3">Cursuri Asociate</th>
                    <th className="px-4 py-3">Stare</th>
                    <th className="px-4 py-3 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Nicio categorie găsită conform criteriilor.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">
                          #{cat.display_order}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 text-sm">{cat.name}</div>
                          {cat.description && (
                            <div className="text-slate-500 text-[11px] truncate max-w-xs">
                              {cat.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <code className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                            {cat.slug}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              cat.courses_count > 0
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {cat.courses_count} cursuri
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {cat.is_active ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                              <Check className="w-3 h-3" /> Activ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                              Dezactivat
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-brand-navy hover:bg-slate-100"
                              title="Editează Categorie"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setCategoryDeleteModal(cat)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Șterge Categorie"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Reusable Catalogs Management Panel */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Cataloage & Liste Reutilizabile în Formulare
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Opțiuni configurabile pentru niveluri, formate de predare, specialități medicale și tipuri de conținut.
              </p>
            </div>

            {/* Catalog Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
              {[
                { key: 'course_levels', label: 'Niveluri Cursuri' },
                { key: 'course_formats', label: 'Formate Cursuri' },
                { key: 'instructor_specialties', label: 'Specialități Instructori' },
                { key: 'lesson_types', label: 'Tipuri Lecții' },
                { key: 'certificate_types', label: 'Tipuri Certificate' },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveCatalogKey(c.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCatalogKey === c.key
                      ? 'bg-brand-navy text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label} ({catalogs[c.key as keyof typeof catalogs]?.length || 0})
                </button>
              ))}
            </div>

            {/* Active Catalog Options List */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(catalogs[activeCatalogKey] || []).map((opt) => (
                  <div
                    key={opt.value}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{opt.label}</div>
                      <div className="font-mono text-[10px] text-slate-400">val: {opt.value}</div>
                      {opt.description && (
                        <div className="text-slate-500 text-[11px] mt-1">{opt.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveCatalogOption(opt.value)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Elimină opțiune"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Option Form */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/30 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Cod (ex: beginner sau live_online)"
                  value={newCatalogOption.value}
                  onChange={(e) =>
                    setNewCatalogOption((p) => ({ ...p, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }))
                  }
                  className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Denumire afișată (ex: Începător)"
                  value={newCatalogOption.label}
                  onChange={(e) => setNewCatalogOption((p) => ({ ...p, label: e.target.value }))}
                  className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCatalogOption}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adaugă în Catalog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL SERVER & SMTP */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  Configurare Server Email & SMTP
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setări utilizate pentru confirmarea conturilor, resetarea parolelor, notificări și trimiterea diplomelor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTestEmailRecipient(formValues['general_contact_email'] || '');
                  setTestEmailModalOpen(true);
                  setTestEmailResult(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
              >
                <Send className="w-4 h-4" />
                Trimite Email de Test
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Gazdă Server SMTP (Hostname)
                </label>
                <input
                  type="text"
                  value={formValues['email_smtp_host'] || ''}
                  onChange={(e) => handleFieldChange('email_smtp_host', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  placeholder="ex: mail.nurslab.ro sau smtp.sendgrid.net"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Port Conexiune
                </label>
                <input
                  type="number"
                  value={formValues['email_smtp_port'] || '587'}
                  onChange={(e) => handleFieldChange('email_smtp_port', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mod Criptare Conexiune
                </label>
                <select
                  value={formValues['email_smtp_encryption'] || 'tls'}
                  onChange={(e) => handleFieldChange('email_smtp_encryption', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                >
                  <option value="tls">STARTTLS / TLS (Recomandat - Port 587)</option>
                  <option value="ssl">Implicit SSL (Port 465)</option>
                  <option value="none">Fără Criptare (Doar rețele interne)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Utilizator Autentificare SMTP
                </label>
                <input
                  type="text"
                  value={formValues['email_smtp_username'] || ''}
                  onChange={(e) => handleFieldChange('email_smtp_username', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  placeholder="noreply@nurslab.ro"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Parolă SMTP</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSecrets((prev) => ({
                        ...prev,
                        email_smtp_password: !prev.email_smtp_password,
                      }));
                      if (!editingSecrets.email_smtp_password) {
                        handleFieldChange('email_smtp_password', '');
                      }
                    }}
                    className="text-[10px] text-brand-green font-bold hover:underline"
                  >
                    {editingSecrets.email_smtp_password ? 'Anulează modificarea' : 'Schimbă parola'}
                  </button>
                </label>
                {editingSecrets.email_smtp_password ? (
                  <input
                    type="password"
                    value={formValues['email_smtp_password'] || ''}
                    onChange={(e) => handleFieldChange('email_smtp_password', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/30 text-sm outline-none"
                    placeholder="Introduceți noua parolă..."
                  />
                ) : (
                  <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm font-mono flex items-center justify-between">
                    <span>••••••••••••</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nume Expeditor (From Name)
                </label>
                <input
                  type="text"
                  value={formValues['email_smtp_from_name'] || ''}
                  onChange={(e) => handleFieldChange('email_smtp_from_name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  placeholder="NursLab Medical Academy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Adresă Expeditor (From Email)
                </label>
                <input
                  type="email"
                  value={formValues['email_smtp_from_email'] || ''}
                  onChange={(e) => handleFieldChange('email_smtp_from_email', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  placeholder="noreply@nurslab.ro"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Adresă Răspuns (Reply-To)
                </label>
                <input
                  type="email"
                  value={formValues['email_smtp_reply_to'] || ''}
                  onChange={(e) => handleFieldChange('email_smtp_reply_to', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  placeholder="suport@nurslab.ro"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong>Securitate & Verificare TLS:</strong> NursLab verifică automat certificatele SSL/TLS ale serverului de mail. Parolele SMTP sunt stocate securizat în baza de date și nu sunt niciodată returnate în clar către interfața browserului.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BILLING & ORGANIZATION */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Profil Juridic, Date Fiscale & Emitere Facturi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Informații oficiale utilizate la generarea automată a facturilor proforme și fiscale (seria NLB conform legislației din România).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Denumire Companie / Entitate Juridică
                </label>
                <input
                  type="text"
                  value={formValues['billing_company_name'] || ''}
                  onChange={(e) => handleFieldChange('billing_company_name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  placeholder="SC NursLab Healthcare S.R.L."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Cod Unic Înregistrare (CUI / CIF)
                </label>
                <input
                  type="text"
                  value={formValues['billing_cui'] || ''}
                  onChange={(e) => handleFieldChange('billing_cui', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                  placeholder="RO12345678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nr. Înmatriculare Registrul Comerțului
                </label>
                <input
                  type="text"
                  value={formValues['billing_reg_com'] || ''}
                  onChange={(e) => handleFieldChange('billing_reg_com', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                  placeholder="J40/1234/2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Sediul Social (Adresă Completă)
                </label>
                <input
                  type="text"
                  value={formValues['billing_address'] || ''}
                  onChange={(e) => handleFieldChange('billing_address', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  placeholder="Str. Medicinii Nr. 12, Corp A"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Oraș & Județ
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formValues['billing_city'] || ''}
                    onChange={(e) => handleFieldChange('billing_city', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="București"
                  />
                  <input
                    type="text"
                    value={formValues['billing_county'] || ''}
                    onChange={(e) => handleFieldChange('billing_county', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="Sector 1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Țară & Cod Poștal
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formValues['billing_country'] || 'România'}
                    onChange={(e) => handleFieldChange('billing_country', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="România"
                  />
                  <input
                    type="text"
                    value={formValues['billing_postal_code'] || ''}
                    onChange={(e) => handleFieldChange('billing_postal_code', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="010101"
                  />
                </div>
              </div>
            </div>

            {/* Invoicing Series & Bank Details */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Parametri Numerotare & Date Bancare</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Serie Factură
                  </label>
                  <input
                    type="text"
                    value={formValues['billing_invoice_series'] || 'NLB'}
                    onChange={(e) => handleFieldChange('billing_invoice_series', e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono font-bold"
                    placeholder="NLB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Următorul Număr Factură
                  </label>
                  <input
                    type="number"
                    value={formValues['billing_invoice_start_number'] || '1001'}
                    onChange={(e) => handleFieldChange('billing_invoice_start_number', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                    placeholder="1001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Cota TVA (%)
                  </label>
                  <input
                    type="number"
                    value={formValues['billing_vat_rate'] || '19'}
                    onChange={(e) => handleFieldChange('billing_vat_rate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                    placeholder="19"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Monedă Facturare
                  </label>
                  <select
                    value={formValues['billing_currency'] || 'RON'}
                    onChange={(e) => handleFieldChange('billing_currency', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                  >
                    <option value="RON">RON (Lei)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Bancă
                  </label>
                  <input
                    type="text"
                    value={formValues['billing_bank_name'] || ''}
                    onChange={(e) => handleFieldChange('billing_bank_name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="Banca Transilvania"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Cont IBAN
                  </label>
                  <input
                    type="text"
                    value={formValues['billing_bank_iban'] || ''}
                    onChange={(e) => handleFieldChange('billing_bank_iban', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                    placeholder="RO98BTRL00000000000000XX"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Notă Subsol Factură (Termeni & Mențiuni Legale)
                  </label>
                  <input
                    type="text"
                    value={formValues['billing_invoice_footer_note'] || ''}
                    onChange={(e) => handleFieldChange('billing_invoice_footer_note', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="Factura este valabilă fără ștampilă și semnătură conform Legii 227/2015 privind Codul Fiscal."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENT PROVIDER & STRIPE */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">
                  Integrare Procesare Plăți Online (Stripe)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configurați cheile API Stripe, modulul de testare/producție și endpoint-ul securizat de Webhook.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunStripeTest}
                disabled={testingStripe}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
              >
                {testingStripe ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Se verifică...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    Verifică Conexiune Stripe
                  </>
                )}
              </button>
            </div>

            {testStripeResult && (
              <div
                className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
                  testStripeResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {testStripeResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{testStripeResult.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Activare Modul Plăți Stripe
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formValues['payment_stripe_enabled'] === 'true'}
                      onChange={(e) =>
                        handleFieldChange('payment_stripe_enabled', e.target.checked ? 'true' : 'false')
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-xs text-slate-700 font-bold">
                    {formValues['payment_stripe_enabled'] === 'true'
                      ? 'Plățile online sunt active'
                      : 'Plățile online sunt dezactivate'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Mediu de Execuție (Environment)
                </label>
                <select
                  value={formValues['payment_stripe_mode'] || 'test'}
                  onChange={(e) => {
                    const newMode = e.target.value;
                    if (newMode === 'live') {
                      setStripeLiveModalOpen(true);
                    } else {
                      handleFieldChange('payment_stripe_mode', 'test');
                    }
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-bold outline-none transition-colors ${
                    formValues['payment_stripe_mode'] === 'live'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="test">Test Mode (Tranzacții simulate sandbox)</option>
                  <option value="live">Live Mode (Carduri reale & producție)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Publishable Key (Client Key)
                </label>
                <input
                  type="text"
                  value={formValues['payment_stripe_publishable_key'] || ''}
                  onChange={(e) => handleFieldChange('payment_stripe_publishable_key', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono text-xs"
                  placeholder="pk_test_... sau pk_live_..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Secret API Key</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSecrets((prev) => ({
                        ...prev,
                        payment_stripe_secret_key: !prev.payment_stripe_secret_key,
                      }));
                      if (!editingSecrets.payment_stripe_secret_key) {
                        handleFieldChange('payment_stripe_secret_key', '');
                      }
                    }}
                    className="text-[10px] text-brand-green font-bold hover:underline"
                  >
                    {editingSecrets.payment_stripe_secret_key ? 'Anulează' : 'Schimbă cheia secretă'}
                  </button>
                </label>
                {editingSecrets.payment_stripe_secret_key ? (
                  <input
                    type="password"
                    value={formValues['payment_stripe_secret_key'] || ''}
                    onChange={(e) => handleFieldChange('payment_stripe_secret_key', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/30 text-sm outline-none font-mono text-xs"
                    placeholder="sk_test_... sau sk_live_..."
                  />
                ) : (
                  <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm font-mono flex items-center justify-between">
                    <span>••••••••••••••••••••••••</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Webhook Signing Secret (whsec_...)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSecrets((prev) => ({
                        ...prev,
                        payment_stripe_webhook_secret: !prev.payment_stripe_webhook_secret,
                      }));
                      if (!editingSecrets.payment_stripe_webhook_secret) {
                        handleFieldChange('payment_stripe_webhook_secret', '');
                      }
                    }}
                    className="text-[10px] text-brand-green font-bold hover:underline"
                  >
                    {editingSecrets.payment_stripe_webhook_secret ? 'Anulează' : 'Schimbă secret webhook'}
                  </button>
                </label>
                {editingSecrets.payment_stripe_webhook_secret ? (
                  <input
                    type="password"
                    value={formValues['payment_stripe_webhook_secret'] || ''}
                    onChange={(e) => handleFieldChange('payment_stripe_webhook_secret', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/30 text-sm outline-none font-mono text-xs"
                    placeholder="whsec_..."
                  />
                ) : (
                  <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm font-mono flex items-center justify-between">
                    <span>••••••••••••••••••••••••</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Webhook Endpoint Instructions */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Info className="w-4 h-4 text-blue-600" />
                URL Webhook pentru Panoul Stripe Dashboard:
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 select-all flex-1">
                  https://nurslab.ro/api/v1/payments/webhook
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('https://nurslab.ro/api/v1/payments/webhook');
                    showAlert('URL-ul Webhook a fost copiat în clipboard!', { type: 'success', title: 'Clipboard' });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Copiază URL
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Evenimente Stripe obligatorii: <code>checkout.session.completed</code>, <code>invoice.paid</code>, <code>payment_intent.succeeded</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM, SECURITY & INTEGRATIONS */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Sistem, Încărcări Media & Instrumente Analytics
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Limite maxime pentru fișiere media, protecție roboți și scripturi de urmărire trafic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Limită Maximă Încărcare Fișier (MB)
                </label>
                <input
                  type="number"
                  value={formValues['system_max_upload_size_mb'] || '25'}
                  onChange={(e) => handleFieldChange('system_max_upload_size_mb', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                  placeholder="25"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Dimensiunea maximă acceptată pentru imagini, PDF-uri și materiale didactice.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Extensii Permise la Încărcare
                </label>
                <input
                  type="text"
                  value={formValues['system_allowed_extensions'] || 'jpg,jpeg,png,webp,pdf,mp4'}
                  onChange={(e) => handleFieldChange('system_allowed_extensions', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                  placeholder="jpg,jpeg,png,webp,pdf,mp4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Furnizor Streaming Video
                </label>
                <select
                  value={formValues['system_video_provider'] || 'bunny'}
                  onChange={(e) => handleFieldChange('system_video_provider', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                >
                  <option value="bunny">Bunny.net Stream (Recomandat)</option>
                  <option value="vimeo">Vimeo Pro</option>
                  <option value="cloudflare">Cloudflare Stream</option>
                  <option value="local">Self-hosted / Direct MP4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Protecție Bot / Captcha la Înregistrare
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formValues['system_captcha_enabled'] === 'true'}
                      onChange={(e) =>
                        handleFieldChange('system_captcha_enabled', e.target.checked ? 'true' : 'false')
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                  </label>
                  <span className="text-xs text-slate-700 font-bold">
                    {formValues['system_captcha_enabled'] === 'true'
                      ? 'Activ (Cloudflare Turnstile)'
                      : 'Inactiv'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Google Analytics 4 ID (G-XXXXXXXXXX)
                </label>
                <input
                  type="text"
                  value={formValues['system_ga_measurement_id'] || ''}
                  onChange={(e) => handleFieldChange('system_ga_measurement_id', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                  placeholder="G-..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meta Pixel ID (Facebook Pixel)
                </label>
                <input
                  type="text"
                  value={formValues['system_fb_pixel_id'] || ''}
                  onChange={(e) => handleFieldChange('system_fb_pixel_id', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none font-mono"
                  placeholder="1234567890..."
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-green" />
                <span className="text-xs text-slate-600 font-medium">
                  Toate modificările aduse configurației de sistem sunt înregistrate în jurnalul de audit (Audit Logs).
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY CREATE / EDIT */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="font-serif font-bold text-slate-900 text-lg">
                {editingCategory ? 'Editează Categorie' : 'Adaugă Categorie Nouă'}
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nume Categorie *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    setCategoryForm((p) => ({
                      ...p,
                      name,
                      slug: editingCategory ? p.slug : autoSlug,
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-green"
                  placeholder="ex: Urgențe & Terapie Intensivă"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Slug URL * (identificator unic)
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm((p) => ({
                      ...p,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-xs outline-none focus:border-brand-green"
                  placeholder="urgente-terapie-intensiva"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descriere Scurtă
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-green"
                  placeholder="Manevre critice, protocoale ATI și resuscitare..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ordine Afișare
                  </label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) =>
                      setCategoryForm((p) => ({ ...p, display_order: parseInt(e.target.value, 10) || 1 }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Iconiță (Nume Lucide)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    placeholder="activity, shield, heart"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-xs font-bold text-slate-700">Categorie Activă (vizibilă în liste)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={categoryActionLoading}
                  className="px-5 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-emerald-600 shadow-sm"
                >
                  {categoryActionLoading ? 'Se procesează...' : editingCategory ? 'Actualizează' : 'Creează Categorie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY DELETE SAFETY CHECK */}
      {categoryDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-slate-900 text-lg">Ștergere Categorie</h3>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Sunteți pe cale să ștergeți categoria{' '}
              <strong className="text-slate-900">"{categoryDeleteModal.name}"</strong>.
            </p>

            {categoryDeleteModal.courses_count > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 mb-6">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Ștergerea este blocată din motive de siguranță!
                </div>
                <p>
                  Această categorie este asociată cu{' '}
                  <strong>{categoryDeleteModal.courses_count} cursuri</strong> existente.
                  Pentru a proteja integritatea bazei de date, reatribuiți mai întâi acele cursuri altei categorii sau
                  alegeți să <strong>dezactivați</strong> categoria în loc să o ștergeți.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mb-6">
                Această categorie nu are cursuri asociate și poate fi ștearsă în deplină siguranță.
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryDeleteModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Anulează
              </button>
              {categoryDeleteModal.courses_count === 0 && (
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  disabled={categoryActionLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm"
                >
                  {categoryActionLoading ? 'Se șterge...' : 'Confirmă Ștergerea'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TEST EMAIL */}
      {testEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Mail className="w-5 h-5" />
                <h3 className="font-serif font-bold text-slate-900 text-lg">Test Conexiune SMTP</h3>
              </div>
              <button
                onClick={() => setTestEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRunEmailTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Adresă Email Destinatar *
                </label>
                <input
                  type="email"
                  required
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  placeholder="nume@exemplu.ro"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Va fi expediat un email de probă folosind parametrii SMTP specificați în formular.
                </span>
              </div>

              {testEmailResult && (
                <div
                  className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                    testEmailResult.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {testEmailResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{testEmailResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTestEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Închide
                </button>
                <button
                  type="submit"
                  disabled={testingEmail}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
                >
                  {testingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Se trimite...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Trimite Test
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STRIPE LIVE MODE CONFIRMATION */}
      {stripeLiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-lg">
                    Confirmare Activare Mod LIVE Stripe
                  </h3>
                  <button
                    onClick={() => setStripeLiveModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                  Atenție la datele financiare reale
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-5 text-sm text-slate-700 leading-relaxed">
              <p className="font-bold text-amber-950 mb-2">
                ATENȚIE: Sunteți pe cale să comutați Stripe în modul LIVE (Producție). Asigurați-vă că folosiți cheile reale de producție! Continuați?
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside mt-2.5">
                <li>Plățile procesate vor debita carduri bancare reale cu fonduri efective.</li>
                <li>Asigurați-vă că ați configurat cheile <span className="font-mono text-slate-800 font-semibold">pk_live_...</span> și <span className="font-mono text-slate-800 font-semibold">sk_live_...</span></li>
                <li>Verificați endpoint-ul de Webhook configurat în Dashboard-ul Stripe LIVE.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStripeLiveModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Rămâi în Test Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  handleFieldChange('payment_stripe_mode', 'live');
                  setStripeLiveModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                Confirmă Comutarea în Modul LIVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

