"use client";
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Crown, RefreshCw, Star, User as UserIcon, Users } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  buildCustomers,
  fetchUserProfiles,
  getAtRiskCustomers,
  getCustomerSegmentSummary,
  getLevelDistribution,
  getNewCustomers,
  getVIPCustomers,
  SEGMENT_LABELS,
  type Customer,
} from '@/lib/clientsDb';
import { CLUB_LEVELS } from '@/lib/commerce';
import CustomerDetail from '@/components/admin/CustomerDetail';

const SEGMENT_STYLE: Record<Customer['segment'], string> = {
  nuevo: 'bg-green-50 text-green-700',
  ocasional: 'bg-blue-50 text-blue-700',
  frecuente: 'bg-indigo-50 text-indigo-700',
  oro: 'bg-yellow-50 text-yellow-700',
  en_riesgo: 'bg-orange-50 text-orange-700',
  inactivo: 'bg-gray-100 text-gray-600',
};

type Filter = 'todos' | 'oro' | 'riesgo' | 'nuevos';

/** CRM conectado a `users` y a los pedidos reales. */
export default function CrmTab() {
  const orders = useStore(state => state.orders);
  const [profiles, setProfiles] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setProfiles(await fetchUserProfiles());
    } catch (e) {
      console.error(e);
      setError('No se pudieron leer los clientes. Comprueba que entraste con la cuenta de administración y que las reglas de Firestore están desplegadas.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Las fichas se leen una vez; los acumulados se recalculan solos cuando entra un pedido.
  const customers = useMemo<Customer[] | null>(() => (profiles ? buildCustomers(profiles, orders) : null), [profiles, orders]);

  const vip = useMemo(() => (customers ? getVIPCustomers(customers) : []), [customers]);
  const atRisk = useMemo(() => (customers ? getAtRiskCustomers(customers) : []), [customers]);
  const fresh = useMemo(() => (customers ? getNewCustomers(customers) : []), [customers]);
  const summary = useMemo(() => (customers ? getCustomerSegmentSummary(customers) : null), [customers]);
  const levels = useMemo(() => (customers ? getLevelDistribution(customers) : null), [customers]);

  const shown = useMemo(() => {
    const base = filter === 'oro' ? vip : filter === 'riesgo' ? atRisk : filter === 'nuevos' ? fresh : customers ?? [];
    const q = search.trim().toLowerCase();
    return q ? base.filter(c => `${c.name} ${c.email} ${c.phone ?? ''} ${c.cedula ?? ''}`.toLowerCase().includes(q)) : base;
  }, [filter, vip, atRisk, fresh, customers, search]);

  const count = (n: number | undefined) => (customers ? String(n ?? 0) : '…');

  const cards: { key: Filter; label: string; value: string; icon: typeof Users; color: string }[] = [
    { key: 'todos', label: 'Total Clientes', value: count(customers?.length), icon: Users, color: 'bg-blue-50 text-blue-600' },
    { key: 'oro', label: 'Clientes Oro', value: count(vip.length), icon: Crown, color: 'bg-yellow-50 text-yellow-600' },
    { key: 'riesgo', label: 'En Riesgo (+30 días)', value: count(atRisk.length), icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
    { key: 'nuevos', label: 'Nuevos (7 días)', value: count(fresh.length), icon: UserIcon, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-mi-yellow/10 p-2.5 rounded-xl"><Crown size={22} className="text-mi-yellow" /></div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Clientes — Club Mi Negocio</h2>
            <p className="text-gray-400 text-xs font-medium">Fichas de la colección users unidas con sus pedidos reales.</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm font-bold text-mi-blue bg-mi-blue-ice border border-mi-blue-fixed px-4 py-2 rounded-xl hover:bg-mi-blue-low transition w-fit">
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {error && <div role="alert" className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-sm font-bold">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ key, label, value, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`text-left border rounded-2xl p-4 flex items-center gap-3 transition ${filter === key ? 'bg-mi-blue-ice border-mi-blue' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}
          >
            <div className={`p-2.5 rounded-xl ${color}`}><Icon size={20} /></div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
              <p className="text-xl font-black text-gray-800">{value}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-mi-blue to-mi-blue-mid rounded-2xl p-6 text-white">
        <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Star size={18} className="text-mi-yellow" /> Niveles del club (los mismos de la tienda)</h3>
        <div className="grid grid-cols-3 gap-4">
          {CLUB_LEVELS.map(level => (
            <div key={level.name} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">{level.badge}</div>
              <p className="font-black text-white">{level.name}</p>
              <p className="text-xs text-white/60">{level.max === Infinity ? `${level.min}+ pts` : `${level.min}–${level.max} pts`}</p>
              <p className="text-lg font-black text-mi-yellow mt-1">{levels ? levels[level.name] : '…'}</p>
              <p className="text-[10px] text-white/50">clientes</p>
            </div>
          ))}
        </div>
        {summary && (
          <p className="text-xs text-white/70 mt-4">
            Segmentos: {(Object.keys(summary) as Customer['segment'][]).map(s => `${SEGMENT_LABELS[s]} ${summary[s]}`).join(' · ')}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-800 text-lg">{shown.length} {shown.length === 1 ? 'cliente' : 'clientes'}</h3>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo, teléfono o cédula"
            aria-label="Buscar clientes"
            className="w-full sm:max-w-sm bg-gray-50 border border-gray-200 rounded-full py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue-light/40"
          />
        </div>

        {!customers && !error ? (
          <p className="text-sm text-gray-400 font-bold py-10 text-center">Cargando clientes…</p>
        ) : shown.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">No hay clientes en este grupo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider">
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Contacto</th>
                  <th className="py-3 px-3">Nivel</th>
                  <th className="py-3 px-3 text-right">Puntos</th>
                  <th className="py-3 px-3 text-right">Pedidos</th>
                  <th className="py-3 px-3 text-right">Cobrado</th>
                  <th className="py-3 px-3">Última compra</th>
                  <th className="py-3 px-3">Segmento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {shown.map(c => (
                  <Fragment key={c.id}>
                    <tr className={`hover:bg-gray-50/50 ${openId === c.id ? 'bg-gray-50' : ''}`}>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => setOpenId(openId === c.id ? null : c.id)}
                          aria-expanded={openId === c.id}
                          className="text-left"
                        >
                          <span className="font-bold text-mi-blue block underline decoration-dotted underline-offset-2">{c.name}</span>
                          <span className="text-xs text-gray-400">{c.cedula || '—'} · {openId === c.id ? 'cerrar ficha' : 'ver ficha'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <span className="block break-all">{c.email}</span>
                        <span className="text-xs text-gray-400">{c.phone || '—'}</span>
                      </td>
                      <td className="py-3 px-3 font-bold">{CLUB_LEVELS.find(l => l.name === c.clubLevel)?.badge} {c.clubLevel}</td>
                      <td className="py-3 px-3 text-right font-bold">{c.clubPoints}</td>
                      <td className="py-3 px-3 text-right">{c.totalOrders}</td>
                      <td className="py-3 px-3 text-right font-black text-gray-800">${c.totalSpent.toFixed(2)}</td>
                      <td className="py-3 px-3 text-xs">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('es-VE') : 'Sin compras'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${SEGMENT_STYLE[c.segment]}`}>{SEGMENT_LABELS[c.segment]}</span>
                      </td>
                    </tr>
                    {openId === c.id && (
                      <tr>
                        <td colSpan={8} className="p-3"><CustomerDetail customer={c} /></td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
