import React, { useState, useEffect } from 'react';
import { HeartHandshake, Phone, Mail, MapPin, AlertCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { HomeNursingRequest } from '../../types';

export const AdminHomeNursingPage: React.FC = () => {
  const [requests, setRequests] = useState<HomeNursingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAdminHomeNursingRequests()
      .then(setRequests)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateHomeNursingStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      alert(err.message || 'Eroare la actualizarea statusului');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Servicii Clinice Mobile</span>
        <h1 className="text-3xl font-serif font-bold text-brand-navy">Solicitări Îngrijiri la Domiciliu</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cereri primite de la pacienți pentru administrare tratamente, pansamente și vizite medicale la domiciliu.
        </p>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Nume Solicitant</th>
                <th className="p-4">Serviciu & Urgență</th>
                <th className="p-4">Oraș & Adresă</th>
                <th className="p-4">Telefon & Email</th>
                <th className="p-4">Data Solicitării</th>
                <th className="p-4">Status Intervenție</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nu există încă solicitări de îngrijire la domiciliu înregistrate.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-brand-navy">
                      <div>{r.full_name}</div>
                      {r.patient_condition && (
                        <div className="text-[11px] text-slate-400 font-normal italic mt-0.5 line-clamp-1">
                          {r.patient_condition}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs">
                      <div>{r.service_type}</div>
                      {r.urgency_level === 'urgent' && (
                        <span className="badge-coral text-[9px] px-1.5 py-0.5 mt-1 inline-block">Urgent</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{r.city}</div>
                      <div className="text-[11px] text-slate-500">{r.address}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{r.phone}</div>
                      <div className="text-[11px] text-slate-400">{r.email}</div>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="p-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                          r.status === 'completed'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : r.status === 'scheduled'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-amber-50 border-amber-300 text-amber-800'
                        }`}
                      >
                        <option value="pending">În așteptare</option>
                        <option value="contacted">Contactat</option>
                        <option value="scheduled">Asistent Programat</option>
                        <option value="completed">Finalizat</option>
                      </select>
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
