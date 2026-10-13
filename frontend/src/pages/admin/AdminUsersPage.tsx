import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = () => {
    setIsLoading(true);
    api.getAdminUsers(search)
      .then(setUsers)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Eroare la schimbarea rolului');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Securitate & Roluri</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Utilizatori & Permisiuni</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administrează conturile de cursanți, formatori medicali și administratori ai platformei.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume sau email..."
            className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Utilizator</th>
                <th className="p-4">Email & Telefon</th>
                <th className="p-4">Afiliere Medicală</th>
                <th className="p-4">Rol în Sistem</th>
                <th className="p-4">Status Cont</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-brand-navy text-sm">{u.full_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.id.substring(0, 8)}...</div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div>{u.email}</div>
                    {u.phone && <div className="text-[11px] text-slate-400">{u.phone}</div>}
                  </td>
                  <td className="p-4 text-slate-600 max-w-xs">
                    <div>{u.hospital_affiliation || 'Nespecificat'}</div>
                    {u.nursing_specialty && (
                      <div className="text-[11px] text-brand-green font-medium">{u.nursing_specialty}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="student">Student / Cursant</option>
                      <option value="instructor">Formator / Instructor</option>
                      <option value="content_editor">Editor Conținut</option>
                      <option value="admin">Administrator</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {u.is_active ? (
                      <span className="badge-mint text-[10px] px-2 py-0.5">Activ</span>
                    ) : (
                      <span className="badge-coral text-[10px] px-2 py-0.5">Inactiv</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
