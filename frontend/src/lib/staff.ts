/**
 * Mi Negocio — Personal del panel (cuentas por empleado).
 *
 * Idea: el dueño sigue siendo la cuenta de administración (su correo en
 * `commerce.ts`). Además puede dar acceso al panel a empleados, cada uno con su
 * propia cuenta de Firebase Auth, para que las acciones queden a su nombre y no
 * todos compartan una sola clave.
 *
 * El rol de cada empleado vive en `staff/{uid}`. Las reglas de Firestore solo
 * dejan que el dueño escriba esa colección, así que un empleado no puede
 * ascenderse ni crear a otros. Este archivo es la capa de cliente; la frontera
 * de verdad son las reglas.
 *
 * En plan gratis no hay custom claims (eso necesita servidor), por eso el rol se
 * lee de un documento y no del token. Las reglas usan `get(staff/{uid})`.
 */
// Nota: Firebase se importa de forma dinámica dentro de cada función que lo
// usa, no al tope del archivo. Así la lógica pura de permisos (lo que está más
// abajo, sin Firebase) se puede importar y probar en Node sin arrastrar el SDK.

export type StaffRole = 'admin' | 'empleado';

/** Nivel de acceso efectivo de quien está usando el panel. */
export type AccessLevel = 'owner' | 'admin' | 'empleado';

export interface StaffMember {
  /** uid de Firebase Auth del empleado. */
  uid: string;
  email: string;
  name: string;
  role: StaffRole;
  /** Un empleado desactivado conserva su historial pero no entra al panel. */
  active: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Encargado',
  empleado: 'Empleado',
};

export const ACCESS_LABELS: Record<AccessLevel, string> = {
  owner: 'Dueño',
  admin: 'Encargado',
  empleado: 'Empleado',
};

/** Las pestañas del panel, agrupadas por el permiso que piden. */
export type AdminTab =
  | 'orders' | 'payments' | 'warehouse' | 'billing' | 'crm'
  | 'notifications' | 'stats' | 'flashOffers' | 'inventory'
  | 'security' | 'csv' | 'rates' | 'personal';

/** Tareas del día a día: las puede hacer cualquier persona con acceso al panel. */
const OPERATE_TABS: AdminTab[] = [
  'orders', 'payments', 'warehouse', 'billing', 'crm', 'notifications', 'stats',
];
/** Catálogo, precios y configuración: solo dueño y encargado. */
const MANAGE_TABS: AdminTab[] = [
  'flashOffers', 'inventory', 'security', 'csv', 'rates',
];
/** Gestión de personal: solo el dueño. */
const OWNER_TABS: AdminTab[] = ['personal'];

// ── Permisos (lógica pura, sin Firebase: se puede probar) ──────────────────

/** ¿Puede hacer tareas operativas (cobros, pedidos, almacén, facturación)? */
export function canOperate(level: AccessLevel | null): boolean {
  return level === 'owner' || level === 'admin' || level === 'empleado';
}

/** ¿Puede tocar catálogo, precios, tasas y configuración? */
export function canManageCatalog(level: AccessLevel | null): boolean {
  return level === 'owner' || level === 'admin';
}

/** ¿Puede dar o quitar acceso a empleados? Solo el dueño. */
export function canManageStaff(level: AccessLevel | null): boolean {
  return level === 'owner';
}

/** ¿Qué pestañas ve este nivel de acceso? */
export function canSeeTab(level: AccessLevel | null, tab: AdminTab): boolean {
  if (!level) return false;
  if (OPERATE_TABS.includes(tab)) return canOperate(level);
  if (MANAGE_TABS.includes(tab)) return canManageCatalog(level);
  if (OWNER_TABS.includes(tab)) return canManageStaff(level);
  return false;
}

/**
 * Nivel de acceso a partir del correo (dueño) y del documento de staff.
 * `ownerEmail` es el correo de administración; `staff` es `staff/{uid}` o null.
 */
export function accessLevelFor(
  isOwner: boolean,
  staff: Pick<StaffMember, 'role' | 'active'> | null,
): AccessLevel | null {
  if (isOwner) return 'owner';
  if (staff && staff.active) return staff.role;
  return null;
}

// ── Firestore ──────────────────────────────────────────────────────────────

/** Escucha la lista de personal (para la pestaña del dueño). */
export function subscribeStaff(cb: (members: StaffMember[]) => void): () => void {
  let unsub = () => {};
  let stopped = false;
  (async () => {
    const { db } = await import('./firebase');
    const { collection, onSnapshot } = await import('firebase/firestore');
    if (stopped) return;
    unsub = onSnapshot(collection(db, 'staff'), snap => {
      const list = snap.docs.map(d => ({ uid: d.id, ...(d.data() as Omit<StaffMember, 'uid'>) }));
      list.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
      cb(list);
    });
  })();
  return () => { stopped = true; unsub(); };
}

/** Lee el documento de staff de un uid una sola vez (para resolver el acceso al entrar). */
export async function fetchStaffDoc(uid: string): Promise<StaffMember | null> {
  const { db } = await import('./firebase');
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(db, 'staff', uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...(snap.data() as Omit<StaffMember, 'uid'>) };
}

async function assertSampleAllowsWrite(): Promise<void> {
  const { assertRealAdminWrite } = await import('./sampleGate');
  assertRealAdminWrite();
}

/** Da de alta o cambia el rol de un empleado. Solo el dueño pasa las reglas. */
export async function setStaffRole(
  member: Pick<StaffMember, 'uid' | 'email' | 'name' | 'role'>,
): Promise<void> {
  await assertSampleAllowsWrite();
  const { auth, db } = await import('./firebase');
  const { doc, getDoc, setDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  const ref = doc(db, 'staff', member.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      role: member.role,
      name: member.name,
      active: true,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      email: member.email,
      name: member.name,
      role: member.role,
      active: true,
      createdBy: auth.currentUser?.email || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

/** Desactiva a un empleado sin borrar su historial (ya no entra al panel). */
export async function deactivateStaff(uid: string): Promise<void> {
  await assertSampleAllowsWrite();
  const { db } = await import('./firebase');
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(db, 'staff', uid), { active: false, updatedAt: serverTimestamp() });
}

/** Vuelve a activar a un empleado desactivado. */
export async function reactivateStaff(uid: string): Promise<void> {
  await assertSampleAllowsWrite();
  const { db } = await import('./firebase');
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(db, 'staff', uid), { active: true, updatedAt: serverTimestamp() });
}

/** Borra por completo el acceso de un empleado. */
export async function removeStaff(uid: string): Promise<void> {
  await assertSampleAllowsWrite();
  const { db } = await import('./firebase');
  const { doc, deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'staff', uid));
}
