/**
 * frontend/src/lib/addresses.ts
 * Gestión segura de libreta de direcciones y datos de cliente para Mi Negocio.
 *
 * Cumple con principios de ciberseguridad:
 * - Anti-XSS (sanitización de HTML y scripts)
 * - Anti-DoS en Firestore (límites estrictos de array y longitudes de campo)
 * - Funciones puras e idempotentes 100% testeables sin dependencias externas.
 */

import { normalizeZone } from './commerce';

export interface UserAddress {
  id: string;
  alias: string;        // ej. "Casa", "Trabajo", "Apartamento"
  address: string;      // Dirección completa (calle, edificio, apto)
  reference?: string;   // Punto de referencia (ej. "Frente a la plaza")
  zone: string;         // Zona de Caracas (ej. "San Luis", "El Cafetal")
  isDefault?: boolean;  // Marca de dirección preferida
  createdAt?: number;
}

export const MAX_SAVED_ADDRESSES = 5;
export const MIN_ADDRESS_LENGTH = 8;
export const MAX_ADDRESS_LENGTH = 250;
export const MAX_ALIAS_LENGTH = 30;
export const MAX_REFERENCE_LENGTH = 140;
export const MAX_NOTES_LENGTH = 250;

export const DEFAULT_ALIASES = ['Casa', 'Trabajo', 'Familiar', 'Otra'] as const;

/** Limpia texto eliminando tags HTML, caracteres de control y limitando longitud */
export function sanitizeText(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '') // Elimina etiquetas HTML/XSS
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Elimina caracteres de control invisibles
    .trim()
    .slice(0, maxLen);
}

/** Genera un identificador único seguro para la dirección */
export function generateAddressId(): string {
  return 'addr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

/** Valida una dirección antes de persistir */
export function validateAddress(input: Partial<UserAddress>): {
  valid: boolean;
  error?: string;
  sanitized?: UserAddress;
} {
  const address = sanitizeText(input.address, MAX_ADDRESS_LENGTH);
  if (address.length < MIN_ADDRESS_LENGTH) {
    return {
      valid: false,
      error: `La dirección debe tener al menos ${MIN_ADDRESS_LENGTH} caracteres (calle, edificio o casa).`,
    };
  }

  const alias = sanitizeText(input.alias || 'Dirección', MAX_ALIAS_LENGTH) || 'Dirección';
  const reference = sanitizeText(input.reference, MAX_REFERENCE_LENGTH);
  const zone = normalizeZone(input.zone);

  return {
    valid: true,
    sanitized: {
      id: input.id && input.id.trim() ? input.id.trim() : generateAddressId(),
      alias,
      address,
      reference: reference || undefined,
      zone,
      isDefault: !!input.isDefault,
      createdAt: input.createdAt || Date.now(),
    },
  };
}

/** Inserta o actualiza una dirección respetando el tope de direcciones */
export function upsertAddress(
  current: UserAddress[] = [],
  newAddr: UserAddress
): { success: boolean; addresses: UserAddress[]; error?: string } {
  const safeList = Array.isArray(current) ? [...current] : [];
  const existingIdx = safeList.findIndex(a => a.id === newAddr.id);

  if (existingIdx === -1 && safeList.length >= MAX_SAVED_ADDRESSES) {
    return {
      success: false,
      addresses: safeList,
      error: `Puedes preguardar un máximo de ${MAX_SAVED_ADDRESSES} direcciones. Elimina una para añadir otra.`,
    };
  }

  // Si esta se marca por defecto, desmarca las anteriores
  const updatedList = safeList.map(a => (newAddr.isDefault ? { ...a, isDefault: false } : a));

  if (existingIdx > -1) {
    updatedList[existingIdx] = newAddr;
  } else {
    // Si es la primera dirección guardada, que sea predeterminada automáticamente
    if (updatedList.length === 0) {
      newAddr.isDefault = true;
    }
    updatedList.push(newAddr);
  }

  return { success: true, addresses: updatedList };
}

/** Elimina una dirección por ID */
export function deleteAddress(current: UserAddress[] = [], idToDelete: string): UserAddress[] {
  const filtered = current.filter(a => a.id !== idToDelete);
  // Si eliminamos la que era por defecto y aún quedan, asigna la primera como por defecto
  if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
    filtered[0].isDefault = true;
  }
  return filtered;
}

/** Fija una dirección como predeterminada */
export function markAsDefaultAddress(current: UserAddress[] = [], id: string): UserAddress[] {
  return current.map(a => ({
    ...a,
    isDefault: a.id === id,
  }));
}

/** Obtiene la dirección predeterminada o la primera disponible */
export function getDefaultAddress(current?: UserAddress[]): UserAddress | undefined {
  if (!current || current.length === 0) return undefined;
  return current.find(a => a.isDefault) || current[0];
}
