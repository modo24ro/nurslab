import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { WorkshopInterestRegistration } from '../../types';

export const AdminWorkshopsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<WorkshopInterestRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.getAdminWorkshopRegistrations()
      .then(setRegistrations)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateWorkshopRegistrationStatus(id, newStatus);
      setRegistrations((prev) =>
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
        <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Leads & Participanți</span>
        <h1 className="text-3xl font-serif font-bold text-brand-navy">Înscrieri Workshopuri în Orașe</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Date de contact ale asistenților medicali interesați de workshopuri practice în orașul lor.
        </p>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Nume Participant</th>
                <th className="p-4">Oraș</th>
                <th className="p-4">Tema Solicitată</th>
                <th className="p-4">Telefon & Email</th>
                <th className="p-4">Data Înscrierii</th>
                <th className="p-4">Status & Acțiune</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Nu există încă înregistrări în lista de interes pentru workshopuri.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-brand-navy">{r.full_name}</td>
                    <td className="p-4 font-semibold text-slate-700">{r.city_name}</td>
                    <td className="p-4 text-slate-600 max-w-xs">{r.topic_title}</td>
                    <td className="p-4 text-slate-600">
                      <div>{r.phone}</div>
                      <div className="text-[11px] text-slate-400">{r.email}</div>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('ro-RO')}
                    </td >
                    <td className="p-4">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
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
