/**
 * Mi Negocio — Clientes (CRM) sobre la colección `users`.
 *
 * Los niveles son los mismos de la tienda (Bronce, Plata, Oro): salen de
 * levelForPoints(). Los acumulados de cada cliente se calculan con sus pedidos
 * reales, así también cuentan las compras anteriores a esta versión.
 */
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { isPaidOrder, levelForPoints, round2, type ClubLevel } from './commerce';

export type Segment = 'nuevo' | 'ocasional' | 'frecuente' | 'oro' | 'en_riesgo' | 'inactivo';

export const SEGMENT_LABELS: Record<Segment, string> = {
  nuevo: 'Nuevo',
  ocasional: 'Ocasional',
  frecuente: 'Frecuente',
  oro: 'Oro',
  en_riesgo: 'En riesgo',
  inactivo: 'Inactivo',
};

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cedula?: string;
  address?: string;
  zone?: string;
  clubPoints: number;
  clubLevel: ClubLevel;
  /** Pedidos no cancelados. */
  totalOrders: number;
  /** Suma de pedidos con pago confirmado, en USD. */
  totalSpent: number;
  lastOrderAt?: number;
  createdAt?: string;
  segment: Segment;
}

/** Lo mínimo que se necesita de un pedido para armar el CRM. */
export interface OrderForCrm {
  uid?: string;
  total: number;
  status: string;
  paymentStatus?: string;
  paymentMethod: string;
  createdAt?: number;
  customerDetails?: { email?: string };
}

const DAY = 86_400_000;

export function computeSegment(c: { totalOrders: number; lastOrderAt?: number; clubLevel: ClubLevel }, now = Date.now()): Segment {
  if (c.totalOrders === 0 || !c.lastOrderAt) return 'nuevo';
  const days = (now - c.lastOrderAt) / DAY;
  if (days > 60) return 'inactivo';
  if (days > 30) return 'en_riesgo';
  if (c.clubLevel === 'Oro') return 'oro';
  if (c.totalOrders >= 10) return 'frecuente';
  if (c.totalOrders >= 3) return 'ocasional';
  return 'nuevo';
}

/** Une las fichas de `users` con los pedidos. Función pura: se puede probar sin Firebase. */
export function buildCustomers(users: Record<string, unknown>[], orders: OrderForCrm[], now = Date.now()): Customer[] {
  const byUid = new Map<string, OrderForCrm[]>();
  const byEmail = new Map<string, OrderForCrm[]>();
  for (const order of orders) {
    if (order.uid) {
      byUid.set(order.uid, [...(byUid.get(order.uid) ?? []), order]);
    } else {
      // Pedidos viejos sin uid: se asocian por el correo con el que se hicieron.
      const email = (order.customerDetails?.email || '').toLowerCase();
      if (email) byEmail.set(email, [...(byEmail.get(email) ?? []), order]);
    }
  }

  return users
    .map(raw => {
      const id = String(raw.id ?? '');
      const email = String(raw.email ?? '').toLowerCase();
      const mine = [...(byUid.get(id) ?? []), ...(byEmail.get(email) ?? [])].filter(o => o.status !== 'Cancelado');
      const paid = mine.filter(o => isPaidOrder(o as never));
      const clubPoints = Math.max(0, Math.floor(Number(raw.clubPoints) || 0));
      const clubLevel = levelForPoints(clubPoints);
      const lastOrderAt = mine.reduce<number | undefined>((max, o) => (o.createdAt && (!max || o.createdAt > max) ? o.createdAt : max), undefined);
      const base = {
        id,
        name: String(raw.name ?? 'Sin nombre'),
        email,
        phone: raw.phone ? String(raw.phone) : undefined,
        cedula: raw.cedula ? String(raw.cedula) : undefined,
        address: raw.address ? String(raw.address) : undefined,
        zone: raw.zone ? String(raw.zone) : undefined,
        clubPoints,
        clubLevel,
        totalOrders: mine.length,
        totalSpent: round2(paid.reduce((acc, o) => acc + (Number(o.total) || 0), 0)),
        lastOrderAt,
        createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
      };
      return { ...base, segment: computeSegment(base, now) };
    })
    .filter(c => c.id)
    .sort((a, b) => b.totalSpent - a.totalSpent || b.clubPoints - a.clubPoints);
}

/** Lee todas las fichas de `users`. Solo funciona con la sesión del administrador. */
export async function fetchUserProfiles(): Promise<Record<string, unknown>[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ ...d.data(), id: d.id }));
}

/** Fichas + pedidos ya unidos. */
export async function getAllCustomers(orders: OrderForCrm[]): Promise<Customer[]> {
  return buildCustomers(await fetchUserProfiles(), orders);
}

/** Cuántos clientes hay en cada segmento. */
export function getCustomerSegmentSummary(customers: Customer[]): Record<Segment, number> {
  const summary: Record<Segment, number> = { nuevo: 0, ocasional: 0, frecuente: 0, oro: 0, en_riesgo: 0, inactivo: 0 };
  for (const c of customers) summary[c.segment] += 1;
  return summary;
}

/** Clientes del nivel más alto del club. */
export function getVIPCustomers(customers: Customer[]): Customer[] {
  return customers.filter(c => c.clubLevel === 'Oro');
}

/** Compraron alguna vez y llevan más de 30 días sin volver. */
export function getAtRiskCustomers(customers: Customer[]): Customer[] {
  return customers.filter(c => c.segment === 'en_riesgo' || c.segment === 'inactivo');
}

/** Registrados en los últimos 7 días. */
export function getNewCustomers(customers: Customer[], now = Date.now()): Customer[] {
  return customers.filter(c => c.createdAt && now - new Date(c.createdAt).getTime() <= 7 * DAY);
}

export function getLevelDistribution(customers: Customer[]): Record<ClubLevel, number> {
  const out: Record<ClubLevel, number> = { Bronce: 0, Plata: 0, Oro: 0 };
  for (const c of customers) out[c.clubLevel] += 1;
  return out;
}
