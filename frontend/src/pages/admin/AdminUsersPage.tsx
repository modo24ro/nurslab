import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Plus, Edit2, Trash2, CheckCircle2, Shield,
  AlertTriangle, Filter, UserCheck, UserX, X, RefreshCw, Check,
  Mail, Phone, Building2, Stethoscope, Lock, Key
} from 'lucide-react';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';
import { Toast } from '../../components/common/Toast';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('student');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formPhone, setFormPhone] = useState('');
  const [formHospital, setFormHospital] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formBio, setFormBio] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: 'error', message: err.message || 'Eroare la încărcarea utilizatorilor.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Filter by Role
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Filter by Status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter((u) => u.is_active === isActive);
    }

    // Live search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((u) => {
        const name = (u.full_name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();
        const hospital = (u.hospital_affiliation || '').toLowerCase();
        const specialty = (u.nursing_specialty || '').toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          hospital.includes(q) ||
          specialty.includes(q)
        );
      });
    }

    return result;
  }, [users, roleFilter, statusFilter, searchQuery]);

  // KPI calculations
  const totalStudents = useMemo(() => users.filter((u) => u.role === 'student').length, [users]);
  const totalInstructors = useMemo(() => users.filter((u) => u.role === 'instructor').length, [users]);
  const totalAdmins = useMemo(() => users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length, [users]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('student');
    setFormIsActive(true);
    setFormPhone('');
    setFormHospital('');
    setFormSpecialty('');
    setFormBio('');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormFullName(user.full_name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormIsActive(user.is_active);
    setFormPhone(user.phone || '');
    setFormHospital(user.hospital_affiliation || '');
    setFormSpecialty(user.nursing_specialty || '');
    setFormBio(user.bio || '');
  };

  // Submit Create
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        full_name: formFullName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        is_active: formIsActive,
        is_verified: true,
        phone: formPhone || null,
        hospital_affiliation: formHospital || null,
        nursing_specialty: formSpecialty || null,
        bio: formBio || null
      };

      const created = await api.createAdminUser(payload);
      setUsers((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setFeedback({ type: 'success', message: `Utilizatorul ${created.full_name} a fost creat cu succes!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la crearea utilizatorului.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const payload: any = {
        full_name: formFullName,
        email: formEmail,
        role: formRole,
        is_active: formIsActive,
        phone: formPhone || null,
        hospital_affiliation: formHospital || null,
        nursing_specialty: formSpecialty || null,
        bio: formBio || null
      };
      if (formPassword.trim()) {
        payload.password = formPassword.trim();
      }

      const updated = await api.updateAdminUser(editingUser.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
      setEditingUser(null);
      setFeedback({ type: 'success', message: `Datele utilizatorului ${updated.full_name} au fost actualizate!` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la actualizarea utilizatorului.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Role Change
  const handleQuickRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setFeedback({ type: 'success', message: 'Rolul de acces a fost actualizat!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la actualizarea rolului.' });
    }
  };

  // Delete User
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await api.deleteAdminUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setFeedback({ type: 'success', message: `Utilizatorul ${userToDelete.full_name} a fost șters din sistem.` });
      setUserToDelete(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Eroare la ștergerea utilizatorului.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-wider">Securitate & Permisiuni</span>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">Utilizatori & Permisiuni</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestiune conturi cursanți, asistenți medicali, formatori clinici și administratori de sistem.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Adaugă Utilizator Nou</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Utilizatori</span>
            <Users className="w-4 h-4 text-brand-green" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{users.length}</p>
          <p className="text-[11px] text-slate-500">Conturi înregistrate pe platformă</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cursanți / Asistenți</span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{totalStudents}</p>
          <p className="text-[11px] text-blue-600 font-medium">Înscriși la cursuri & webinarii</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Formatori / Instructori</span>
            <Stethoscope className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{totalInstructors}</p>
          <p className="text-[11px] text-slate-500">Cadre medicale & speakeri</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Administratori</span>
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{totalAdmins}</p>
          <p className="text-[11px] text-slate-500">Acces deplin de gestiune CMS & Setări</p>
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
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Căutare live după nume, email, telefon, spital sau specialitate medicală..."
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
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="all">Toate Rolurile</option>
              <option value="student">Student / Cursant</option>
              <option value="instructor">Formator / Instructor</option>
              <option value="content_editor">Editor Conținut</option>
              <option value="admin">Administrator</option>
              <option value="super_admin">Super Administrator</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="all">Toate Statusurile</option>
              <option value="active">Doar Activi</option>
              <option value="inactive">Doar Inactivi</option>
            </select>

            <button
              onClick={loadUsers}
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
            Afișare <strong className="text-slate-800">{filteredUsers.length}</strong> din <strong>{users.length}</strong> utilizatori
          </span>
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="text-brand-green hover:underline font-semibold"
            >
              Resetează toate filtrele
            </button>
          )}
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
                <th className="p-4">Afiliere & Specialitate</th>
                <th className="p-4">Rol în Sistem</th>
                <th className="p-4">Status Cont</th>
                <th className="p-4 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-green" />
                    Se încarcă lista de utilizatori...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    Nu s-au găsit utilizatori conform criteriilor de căutare.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-brand-navy text-sm">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {u.id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="font-medium text-slate-800">{u.email}</div>
                      {u.phone ? (
                        <div className="text-[11px] text-slate-500 mt-0.5">{u.phone}</div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Fără telefon</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs">
                      <div className="font-medium text-slate-800">{u.hospital_affiliation || 'Nespecificat'}</div>
                      {u.nursing_specialty && (
                        <div className="text-[11px] text-brand-green font-semibold mt-0.5">
                          {u.nursing_specialty}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleQuickRoleChange(u.id, e.target.value as UserRole)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer transition-colors ${
                          u.role === 'super_admin'
                            ? 'bg-purple-50 border-purple-200 text-purple-900'
                            : u.role === 'admin'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : u.role === 'instructor'
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
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
                        <span className="badge-mint text-[10px] font-bold px-2.5 py-1">
                          Activ
                        </span>
                      ) : (
                        <span className="badge-coral text-[10px] font-bold px-2.5 py-1">
                          Inactiv
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editează utilizator"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Șterge utilizator"
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

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 text-brand-navy">
                <Plus className="w-5 h-5 text-brand-green" />
                <h3 className="font-serif font-bold text-lg text-brand-navy">Adaugă Utilizator Nou</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nume Complet *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="ex. As. Med. Cristina Voinea"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="cristina@spital.ro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parolă Inițială *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="Minim 6 caractere"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Număr Telefon</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="07xxxxxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rol în Sistem *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="student">Student / Cursant</option>
                    <option value="instructor">Formator / Instructor</option>
                    <option value="content_editor">Editor Conținut</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Cont</label>
                  <select
                    value={formIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormIsActive(e.target.value === 'active')}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="active">Cont Activ</option>
                    <option value="inactive">Cont Inactiv / Suspendat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Spital / Instituție</label>
                  <input
                    type="text"
                    value={formHospital}
                    onChange={(e) => setFormHospital(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="Spitalul Clinic de Urgență Floreasca"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialitate Medicală</label>
                  <input
                    type="text"
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="ATI / Urgențe / Chirurgie"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Biografie / Note Profesionale</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  placeholder="Informații suplimentare despre experiența clinică..."
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
                  <span>Creează Contul</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">Editare Profil & Rol</span>
                <h3 className="font-serif font-bold text-lg text-brand-navy">{editingUser.full_name}</h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nume Complet *</label>
                  <input
                    type="text"
                    required
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Schimbă Parola <span className="text-[10px] text-slate-400 font-normal">(lasă gol dacă nu schimbi)</span>
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                    placeholder="Parolă nouă opțională"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Număr Telefon</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rol în Sistem *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="student">Student / Cursant</option>
                    <option value="instructor">Formator / Instructor</option>
                    <option value="content_editor">Editor Conținut</option>
                    <option value="admin">Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Cont</label>
                  <select
                    value={formIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormIsActive(e.target.value === 'active')}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-brand-green outline-none"
                  >
                    <option value="active">Cont Activ</option>
                    <option value="inactive">Cont Inactiv / Suspendat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Spital / Instituție</label>
                  <input
                    type="text"
                    value={formHospital}
                    onChange={(e) => setFormHospital(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Specialitate Medicală</label>
                  <input
                    type="text"
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Biografie / Note Profesionale</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-green outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
                  <span>Actualizează Utilizatorul</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 text-lg">Ștergere Cont Utilizator</h3>
                  <button onClick={() => setUserToDelete(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">Acțiune permanentă</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 mb-5 text-sm text-slate-700 leading-relaxed">
              Sunteți sigur că doriți să ștergeți definitiv contul pentru{' '}
              <strong className="text-slate-900 font-bold">{userToDelete.full_name}</strong> (
              <span className="font-mono text-xs">{userToDelete.email}</span>)? Utilizatorul își va pierde accesul la cursurile și datele sale.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
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
