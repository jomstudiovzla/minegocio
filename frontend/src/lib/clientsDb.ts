/**
 * Mi Negocio — Base de Datos de Clientes (Firestore)
 * Colección: `customers`
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Tipos ──────────────────────────────────────────────────────────────────

export type ClubLevel = 'bronze' | 'silver' | 'gold' | 'vip';
export type PaymentMethod = 'zelle' | 'pagoMovil' | 'efectivo' | 'paypal' | 'tarjeta';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  zone?: string;              // 'San Luis', 'El Cafetal', 'La Lagunita', etc.
  clubLevel: ClubLevel;
  ecoPoints: number;
  totalSpent: number;         // en USD
  totalOrders: number;
  lastOrderDate?: string;
  preferredPaymentMethods: PaymentMethod[];
  isActive: boolean;
  isVip: boolean;
  twoFactorEnabled: boolean;
  verifiedProfile: boolean;
  notes?: string;             // notas internas del admin
  createdAt: string;
  updatedAt: string;
  // Segmentos de CRM
  segment?: 'new' | 'occasional' | 'regular' | 'vip' | 'at_risk' | 'churned';
}

// ── Helpers internos ───────────────────────────────────────────────────────

const CUSTOMERS_COL = 'users';

function computeClubLevel(ecoPoints: number): ClubLevel {
  if (ecoPoints >= 15000) return 'vip';
  if (ecoPoints >= 5000)  return 'gold';
  if (ecoPoints >= 1000)  return 'silver';
  return 'bronze';
}

function computeSegment(customer: Partial<Customer>): Customer['segment'] {
  const totalOrders = customer.totalOrders ?? 0;
  const lastOrder = customer.lastOrderDate ? new Date(customer.lastOrderDate) : null;
  const daysSinceLastOrder = lastOrder
    ? (Date.now() - lastOrder.getTime()) / 86_400_000
    : Infinity;

  if (totalOrders === 0) return 'new';
  if (daysSinceLastOrder > 60) return 'churned';
  if (daysSinceLastOrder > 30) return 'at_risk';
  if (customer.isVip || (customer.ecoPoints ?? 0) >= 5000) return 'vip';
  if (totalOrders >= 10) return 'regular';
  if (totalOrders >= 3) return 'occasional';
  return 'new';
}

// ── CRUD ───────────────────────────────────────────────────────────────────

/** Obtener un cliente por ID */
export async function getCustomer(customerId: string): Promise<Customer | null> {
  const ref = doc(db, CUSTOMERS_COL, customerId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Customer;
}

/** Crear o actualizar un cliente */
export async function upsertCustomer(data: Omit<Customer, 'createdAt' | 'updatedAt' | 'clubLevel' | 'segment' | 'isVip'>): Promise<void> {
  const ref = doc(db, CUSTOMERS_COL, data.id);
  const existing = await getDoc(ref);
  const now = new Date().toISOString();

  const clubLevel = computeClubLevel(data.ecoPoints);
  const isVip = clubLevel === 'vip';
  const segment = computeSegment({ ...data, clubLevel, isVip });

  if (existing.exists()) {
    await updateDoc(ref, {
      ...data,
      clubLevel,
      isVip,
      segment,
      updatedAt: now,
    });
  } else {
    await setDoc(ref, {
      ...data,
      clubLevel,
      isVip,
      segment,
      createdAt: now,
      updatedAt: now,
    });
  }
}

/** Actualizar campos específicos de un cliente */
export async function updateCustomer(customerId: string, fields: Partial<Customer>): Promise<void> {
  const ref = doc(db, CUSTOMERS_COL, customerId);
  const now = new Date().toISOString();

  // Recalcular nivel y segmento si cambian puntos
  const updates: Record<string, unknown> = { ...fields, updatedAt: now };
  if (fields.ecoPoints !== undefined) {
    const level = computeClubLevel(fields.ecoPoints);
    updates.clubLevel = level;
    updates.isVip = level === 'vip';
  }

  await updateDoc(ref, updates);
}

/** Sumar EcoPuntos a un cliente (1 punto por cada $1 gastado) */
export async function addEcoPoints(customerId: string, amountUSD: number): Promise<void> {
  const customer = await getCustomer(customerId);
  if (!customer) return;

  const pointsToAdd = Math.floor(amountUSD);
  const newPoints = customer.ecoPoints + pointsToAdd;
  const newLevel = computeClubLevel(newPoints);

  await updateCustomer(customerId, {
    ecoPoints: newPoints,
    clubLevel: newLevel,
    isVip: newLevel === 'vip',
    totalSpent: customer.totalSpent + amountUSD,
    totalOrders: customer.totalOrders + 1,
    lastOrderDate: new Date().toISOString(),
  });
}

// ── Queries de CRM ─────────────────────────────────────────────────────────

/** Obtener todos los clientes */
export async function getAllCustomers(): Promise<Customer[]> {
  const col = collection(db, CUSTOMERS_COL);
  const q = query(col, orderBy('totalSpent', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
}

/** Clientes VIP activos */
export async function getVIPCustomers(): Promise<Customer[]> {
  const col = collection(db, CUSTOMERS_COL);
  const q = query(
    col,
    where('isVip', '==', true),
    where('isActive', '==', true),
    orderBy('ecoPoints', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
}

/** Clientes en riesgo de abandono (sin comprar en 30+ días) */
export async function getAtRiskCustomers(): Promise<Customer[]> {
  const all = await getAllCustomers();
  return all.filter(c => c.segment === 'at_risk' || c.segment === 'churned');
}

/** Nuevos clientes (últimos 7 días) */
export async function getNewCustomers(): Promise<Customer[]> {
  const threshold = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const col = collection(db, CUSTOMERS_COL);
  const q = query(col, where('createdAt', '>=', threshold), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
}

/** Resumen de segmentos CRM */
export async function getCustomerSegmentSummary(): Promise<Record<string, number>> {
  const all = await getAllCustomers();
  const summary: Record<string, number> = {};
  for (const c of all) {
    const seg = c.segment ?? 'unknown';
    summary[seg] = (summary[seg] ?? 0) + 1;
  }
  return summary;
}

/** Top clientes por gasto */
export async function getTopCustomers(n = 10): Promise<Customer[]> {
  const col = collection(db, CUSTOMERS_COL);
  const q = query(col, orderBy('totalSpent', 'desc'), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
}
