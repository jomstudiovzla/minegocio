"use client";
import { useEffect, useState } from 'react';
import { UserPlus, Search, Shield, Trash2, Power, CheckCircle, AlertTriangle, Crown } from 'lucide-react';
import {
  subscribeStaff,
  setStaffRole,
  deactivateStaff,
  reactivateStaff,
  removeStaff,
  ROLE_LABELS,
  type StaffMember,
  type StaffRole,
} from '@/lib/staff';
import { fetchUserProfiles } from '@/lib/clientsDb';
import { logAdminEvent } from '@/lib/orders';

interface Found {
  uid: string;
  name: string;
  email: string;
}

/**
 * Gestión de personal (solo el dueño). El empleado primero se registra como
 * cliente normal en la página; aquí el dueño lo busca por su correo y le da
 * acceso al panel con un rol. No se crean cuentas ni se piden claves.
 */
export default function StaffTab() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('empleado');
  const [found, setFound] = useState<Found | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => subscribeStaff(setMembers), []);

  const search = async () => {
    const wanted = email.trim().toLowerCase();
    setFound(null);
    setMsg(null);
    if (!wanted) return;
    setBusy(true);
    try {
      const users = await fetchUserProfiles();
      const match = users.find(u => String((u as { email?: string }).email || '').toLowerCase() === wanted);
      if (!match) {
        setMsg({ type: 'error', text: 'No hay ningún cliente registrado con ese correo. Pídele que primero cree su cuenta en la página (Registrarme) y vuelve a buscarlo.' });
        return;
      }
      const m = match as { id?: string; name?: string; email?: string };
      setFound({ uid: String(m.id), name: String(m.name || 'Sin nombre'), email: String(m.email || wanted) });
    } catch {
      setMsg({ type: 'error', text: 'No se pudo buscar. Revisa tu conexión e inténtalo de nuevo.' });
    } finally {
      setBusy(false);
    }
  };

  const grant = async () => {
    if (!found) return;
    setBusy(true);
    setMsg(null);
    try {
      await setStaffRole({ uid: found.uid, email: found.email, name: found.name, role });
      await logAdminEvent(`👥 Acceso al panel otorgado a ${found.email} como ${ROLE_LABELS[role]}.`, 'login');
      setMsg({ type: 'ok', text: `${found.name} ya tiene acceso como ${ROLE_LABELS[role]}.` });
      setFound(null);
      setEmail('');
    } catch {
      setMsg({ type: 'error', text: 'No se pudo guardar. Solo el dueño puede dar acceso.' });
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (m: StaffMember, next: StaffRole) => {
    if (next === m.role) return;
    await setStaffRole({ uid: m.uid, email: m.email, name: m.name, role: next });
    await logAdminEvent(`👥 ${m.email} ahora es ${ROLE_LABELS[next]}.`, 'login');
  };

  const toggleActive = async (m: StaffMember) => {
    if (m.active) {
      await deactivateStaff(m.uid);
      await logAdminEvent(`🚫 Acceso suspendido a ${m.email}.`, 'login');
    } else {
      await reactivateStaff(m.uid);
      await logAdminEvent(`✅ Acceso reactivado a ${m.email}.`, 'login');
    }
  };

  const remove = async (m: StaffMember) => {
    if (!window.confirm(`Quitar del todo el acceso de ${m.email}? Su cuenta de cliente no se borra.`)) return;
    await removeStaff(m.uid);
    await logAdminEvent(`👋 Acceso al panel retirado a ${m.email}.`, 'login');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-1">
          <UserPlus size={20} className="text-mi-blue" /> Dar acceso a un empleado
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          El empleado primero crea su cuenta en la página como cualquier cliente. Luego búscalo aquí por su
          correo y dale acceso. Así cada acción (aprobar pagos, ajustar almacén, facturar) queda a su nombre.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') search(); }}
            placeholder="correo@empleado.com"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mi-blue transition"
          />
          <button
            onClick={search}
            disabled={busy}
            className="flex items-center justify-center gap-2 bg-mi-blue text-white font-bold px-5 py-3 rounded-xl hover:bg-mi-blue-mid transition disabled:opacity-60"
          >
            <Search size={16} /> Buscar
          </button>
        </div>

        {found && (
          <div className="mt-4 border border-mi-blue/20 bg-mi-blue-low rounded-2xl p-4">
            <p className="font-bold text-gray-800">{found.name}</p>
            <p className="text-sm text-gray-500 mb-3">{found.email}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-bold text-gray-700">Rol:</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as StaffRole)}
                className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mi-blue"
              >
                <option value="empleado">Empleado — cobros, pedidos, almacén, facturación</option>
                <option value="admin">Encargado — además catálogo, precios y tasas</option>
              </select>
              <button
                onClick={grant}
                disabled={busy}
                className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition disabled:opacity-60"
              >
                <CheckCircle size={16} /> Dar acceso
              </button>
            </div>
          </div>
        )}

        {msg && (
          <div className={`mt-4 text-sm font-bold p-3 rounded-xl flex items-start gap-2 ${
            msg.type === 'ok' ? 'bg-green-50 text-green-700'
            : msg.type === 'error' ? 'bg-red-50 text-red-600'
            : 'bg-mi-blue-low text-mi-blue'
          }`}>
            {msg.type === 'ok' ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-5">
          <Shield size={20} className="text-mi-blue" /> Personal con acceso ({members.length})
        </h2>

        {members.length === 0 ? (
          <p className="text-sm text-gray-400 font-medium">Todavía no has dado acceso a nadie. El dueño siempre tiene acceso con su propia cuenta.</p>
        ) : (
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.uid} className={`flex flex-col sm:flex-row sm:items-center gap-3 border rounded-2xl p-4 ${m.active ? 'border-gray-100' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 flex items-center gap-2">
                    {m.role === 'admin' && <Crown size={14} className="text-mi-yellow-dark" />}
                    {m.name}
                    {!m.active && <span className="text-xs font-bold text-gray-400">(suspendido)</span>}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{m.email}</p>
                </div>
                <select
                  value={m.role}
                  onChange={e => changeRole(m, e.target.value as StaffRole)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mi-blue"
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Encargado</option>
                </select>
                <button
                  onClick={() => toggleActive(m)}
                  className={`flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg transition ${m.active ? 'text-yellow-700 hover:bg-yellow-50' : 'text-green-700 hover:bg-green-50'}`}
                >
                  <Power size={15} /> {m.active ? 'Suspender' : 'Reactivar'}
                </button>
                <button
                  onClick={() => remove(m)}
                  className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                >
                  <Trash2 size={15} /> Quitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
