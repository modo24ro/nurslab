import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowRight, Building, User } from 'lucide-react';
import { api } from '../services/api';
import { Course, PricingPlan } from '../types';
import { useAuth } from '../context/AuthContext';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  const planId = searchParams.get('plan_id');

  const { user } = useAuth();
  const navigate = useNavigate();

  const [itemTitle, setItemTitle] = useState('Achiziție Serviciu Educațional NursLab');
  const [itemPrice, setItemPrice] = useState(199);
  const [itemCurrency, setItemCurrency] = useState('RON');

  // Billing form state
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [billingEmail, setBillingEmail] = useState(user?.email || '');
  const [billingPhone, setBillingPhone] = useState(user?.phone || '');
  const [billingType, setBillingType] = useState<'individual' | 'company'>('individual');
  const [companyName, setCompanyName] = useState('');
  const [companyCui, setCompanyCui] = useState('');
  const [companyRegCom, setCompanyRegCom] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('București');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      api.getCourses().then((courses) => {
        const found = courses.find((c) => c.id === courseId);
        if (found) {
          setItemTitle(`Curs: ${found.title}`);
          setItemPrice(found.price);
          setItemCurrency(found.currency);
        }
      });
    } else if (planId) {
      api.getPricingPlans().then((plans) => {
        const found = plans.find((p) => p.id === planId);
        if (found) {
          setItemTitle(`Abonament: ${found.name}`);
          setItemPrice(found.price);
          setItemCurrency(found.currency);
        }
      });
    }
  }, [courseId, planId]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vă rugăm să vă autentificați pentru a finaliza comanda.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      const items = [];
      if (courseId) {
        items.push({ item_type: 'course', item_id: courseId });
      } else if (planId) {
        items.push({ item_type: 'subscription', item_id: planId });
      } else {
        items.push({ item_type: 'course', item_id: 'default' });
      }

      const orderData = await api.checkout({
        items,
        customer_name: customerName,
        billing_email: billingEmail,
        billing_phone: billingPhone,
        billing_type: billingType,
        company_name: billingType === 'company' ? companyName : undefined,
        company_cui: billingType === 'company' ? companyCui : undefined,
        company_reg_com: billingType === 'company' ? companyRegCom : undefined,
        billing_address: billingAddress || 'Strada Medicală Nr. 1',
        billing_city: billingCity,
      });

      setOrderComplete(orderData);
    } catch (err: any) {
      alert(err.message || 'Eroare la procesarea plății');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="bg-brand-sand min-h-screen py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center border border-slate-200/80 shadow-card space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-brand-green-mint text-brand-green mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="badge-mint text-xs">Plată Confirmată</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-navy">
              Comandă Finalizată cu Succes!
            </h1>
            <p className="text-sm text-slate-600">
              Comandă nr. <strong>{orderComplete.order_number}</strong>
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-left text-xs text-slate-600 space-y-1.5 border border-slate-100">
            <p><strong>Total achitat:</strong> {orderComplete.total_amount} {orderComplete.currency}</p>
            <p><strong>Beneficiar factură:</strong> {orderComplete.customer_name}</p>
            <p><strong>Factură fiscală:</strong> Serie NLB generată automat conform RO e-Factura</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard" className="btn-primary w-full text-xs justify-center py-3">
              Mergi la Panoul de Cursuri
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-sand min-h-screen py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Securitate Bancară 256-bit</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">
            Finalizare Comandă & Facturare
          </h1>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Billing Data (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            
            {/* Billing Type Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Tip de Facturare</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingType('individual')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    billingType === 'individual'
                      ? 'bg-brand-green-mint border-brand-green text-brand-green'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Persoană Fizică</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingType('company')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    billingType === 'company'
                      ? 'bg-brand-green-mint border-brand-green text-brand-green'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Companie / Spital (CUI)</span>
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nume și Prenume *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Elena Ionescu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Factură *</label>
                  <input
                    type="email"
                    required
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="email@spital.ro"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(e.target.value)}
                    placeholder="07xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
              </div>

              {/* Company Details if selected */}
              {billingType === 'company' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Denumire Firmă / Instituție Medicală *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Clinica Med SRL"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cod Fiscal (CUI / CIF) *</label>
                      <input
                        type="text"
                        required
                        value={companyCui}
                        onChange={(e) => setCompanyCui(e.target.value)}
                        placeholder="RO12345678"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nr. Reg. Comerțului</label>
                      <input
                        type="text"
                        value={companyRegCom}
                        onChange={(e) => setCompanyRegCom(e.target.value)}
                        placeholder="J40/1234/2026"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Oraș *</label>
                  <input
                    type="text"
                    required
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    placeholder="București"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adresă Sediu / Domiciliu *</label>
                  <input
                    type="text"
                    required
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Str. Sănătății Nr. 12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Payment Card Simulation */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Date Card Bancar</span>
                <span className="text-[11px] text-emerald-600 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Sandbox Securizat
                </span>
              </label>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5 text-brand-navy" />
                  <span className="text-xs font-mono text-slate-400">Visa / Mastercard</span>
                </div>
                <input
                  type="text"
                  readOnly
                  value="4242 •••• •••• 4242 (Card Test NursLab)"
                  className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-700"
                />
              </div>
            </div>

          </div>

          {/* Right Summary: (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-xl font-serif font-bold text-brand-navy">Sumar Comandă</h2>

            <div className="space-y-3 pb-4 border-b border-slate-100 text-sm">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-slate-800">{itemTitle}</span>
                <span className="font-bold text-brand-navy shrink-0">{itemPrice} {itemCurrency}</span>
              </div>
              <p className="text-xs text-slate-500">
                Include acces la lecții video, fișe clinice și diplomă cu verificare publică.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-500 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{(itemPrice / 1.19).toFixed(2)} {itemCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (19% conform Cod Fiscal)</span>
                <span>{(itemPrice - (itemPrice / 1.19)).toFixed(2)} {itemCurrency}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-brand-navy pt-2">
                <span>Total de plată</span>
                <span className="text-xl text-brand-green">{itemPrice} {itemCurrency}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary w-full text-base py-3.5 justify-center shadow-md hover:shadow-lg font-bold"
            >
              {isProcessing ? 'Se procesează plata...' : `Plătește în siguranță (${itemPrice} RON)`}
            </button>

            <div className="text-center text-[11px] text-slate-400 space-y-1">
              <p>Plată securizată prin provider bancar atestat.</p>
              <p>Factura va fi emisă automat și salvată în contul dumneavoastră.</p>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
