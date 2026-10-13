import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, FileText, User } from 'lucide-react';
import { api } from '../../services/api';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAdminOrders()
      .then(setOrders)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Modul Financiar</span>
        <h1 className="text-3xl font-serif font-bold text-brand-navy">Comenzi & Tranzacții Facturate</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Înregistrări fiscale emise conform cerințelor RO e-Factura cu serie și număr unic.
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Nr. Comandă</th>
                <th className="p-4">Client / Cumpărător</th>
                <th className="p-4">Produse Achiziționate</th>
                <th className="p-4">Total (TVA inclus)</th>
                <th className="p-4">Data Plății</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nu există încă comenzi înregistrate.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-navy">
                      {o.order_number}
                    </td>
                    <td className="p-4 text-slate-800">
                      <div className="font-semibold">{o.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{o.billing_email}</div>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs">
                      {o.items?.map((it: any) => (
                        <div key={it.id} className="truncate">• {it.title}</div>
                      ))}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {o.total_amount} {o.currency}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(o.created_at).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="p-4">
                      <span className="badge-mint text-[10px] px-2 py-0.5">
                        {o.status === 'paid' ? 'Achitată' : o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
