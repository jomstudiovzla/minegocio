/**
 * Mi Negocio — Datos de cobro.
 *
 * Banco, teléfono, RIF, Zelle, cuenta y QR viven en Firestore (`store/paymentConfig`)
 * y se editan desde el panel. El checkout y /pagos leen de aquí: ningún dato
 * bancario queda escrito en las páginas.
 *
 * Un método solo se ofrece al cliente si está encendido Y tiene sus datos completos.
 * Así nunca se le pide a nadie que transfiera a un destino de relleno.
 */
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { assertRealAdminWrite } from './sampleGate';
import type { PaymentMethod } from './commerce';

export interface PaymentConfig {
  pagomovil: { enabled: boolean; bank: string; phone: string; rif: string };
  zelle: { enabled: boolean; email: string; holder: string };
  transferencia: { enabled: boolean; bank: string; account: string; holder: string; rif: string };
  binance: { enabled: boolean; payId: string; qrDataUrl: string };
  paypal: { enabled: boolean; email: string; link: string };
  creditcard: { enabled: boolean; note: string };
  cash: { enabled: boolean };
  /** Identidad y contacto que se muestran en el pie de página y los botones de WhatsApp. */
  business: { rif: string; phone: string; whatsapp: string };
  updatedAt?: string;
}

/** Sin datos reales cargados, lo único que se puede ofrecer con honestidad es efectivo. */
export const EMPTY_PAYMENT_CONFIG: PaymentConfig = {
  pagomovil: { enabled: false, bank: '', phone: '', rif: '' },
  zelle: { enabled: false, email: '', holder: '' },
  transferencia: { enabled: false, bank: '', account: '', holder: '', rif: '' },
  binance: { enabled: false, payId: '', qrDataUrl: '' },
  paypal: { enabled: false, email: '', link: '' },
  creditcard: { enabled: false, note: '' },
  cash: { enabled: true },
  business: { rif: '', phone: '', whatsapp: '' },
};

export const PAYMENT_METHOD_ORDER: PaymentMethod[] = [
  'pagomovil',
  'zelle',
  'transferencia',
  'binance',
  'paypal',
  'creditcard',
  'cash',
];

export const VENEZUELAN_BANKS = [
  'Banesco (0134)',
  'Banco de Venezuela (0102)',
  'Mercantil (0105)',
  'Provincial BBVA (0108)',
  'BNC (0191)',
  'Bancamiga (0172)',
  'Banco del Tesoro (0163)',
  'Bicentenario (0175)',
  'Banplus (0174)',
  'Exterior (0115)',
  'Venezolano de Crédito (0104)',
  'Banco Caroní (0128)',
  'Banco Plaza (0138)',
  'Fondo Común BFC (0151)',
  '100% Banco (0156)',
  'Sofitasa (0137)',
  'Banco Activo (0171)',
  'Otro',
];

/** Mezcla lo guardado con la forma completa, por si el documento es viejo o parcial. */
export function mergePaymentConfig(raw: unknown): PaymentConfig {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Partial<PaymentConfig>;
  return {
    pagomovil: { ...EMPTY_PAYMENT_CONFIG.pagomovil, ...(data.pagomovil || {}) },
    zelle: { ...EMPTY_PAYMENT_CONFIG.zelle, ...(data.zelle || {}) },
    transferencia: { ...EMPTY_PAYMENT_CONFIG.transferencia, ...(data.transferencia || {}) },
    binance: { ...EMPTY_PAYMENT_CONFIG.binance, ...(data.binance || {}) },
    paypal: { ...EMPTY_PAYMENT_CONFIG.paypal, ...(data.paypal || {}) },
    creditcard: { ...EMPTY_PAYMENT_CONFIG.creditcard, ...(data.creditcard || {}) },
    cash: { ...EMPTY_PAYMENT_CONFIG.cash, ...(data.cash || {}) },
    business: { ...EMPTY_PAYMENT_CONFIG.business, ...(data.business || {}) },
    updatedAt: data.updatedAt,
  };
}

/** Campos que faltan para poder ofrecer el método. Lista vacía = completo. */
export function missingFields(config: PaymentConfig, method: PaymentMethod): string[] {
  const filled = (v: string) => v.trim().length > 0;
  switch (method) {
    case 'pagomovil': {
      const m = config.pagomovil;
      return [!filled(m.bank) && 'banco', !filled(m.phone) && 'teléfono', !filled(m.rif) && 'RIF o cédula'].filter(Boolean) as string[];
    }
    case 'zelle': {
      const m = config.zelle;
      return [!filled(m.email) && 'correo Zelle', !filled(m.holder) && 'titular'].filter(Boolean) as string[];
    }
    case 'transferencia': {
      const m = config.transferencia;
      return [
        !filled(m.bank) && 'banco',
        !filled(m.account) && 'número de cuenta',
        !filled(m.holder) && 'beneficiario',
        !filled(m.rif) && 'RIF',
      ].filter(Boolean) as string[];
    }
    case 'binance': {
      const m = config.binance;
      // Basta con el Pay ID o con el QR: cualquiera de los dos permite pagar.
      return !filled(m.payId) && !filled(m.qrDataUrl) ? ['Pay ID o imagen del QR'] : [];
    }
    case 'paypal': {
      const m = config.paypal;
      return !filled(m.email) && !filled(m.link) ? ['correo o enlace de PayPal'] : [];
    }
    case 'creditcard':
      // No hay pasarela conectada: sin explicar cómo se enviará el cobro, el
      // pedido quedaría "Pendiente de pago" sin un siguiente paso para nadie.
      return !filled(config.creditcard.note) ? ['cómo enviarás el enlace de cobro'] : [];
    case 'cash':
      return [];
  }
}

export function isMethodAvailable(config: PaymentConfig, method: PaymentMethod): boolean {
  return config[method].enabled && missingFields(config, method).length === 0;
}

export function availableMethods(config: PaymentConfig): PaymentMethod[] {
  return PAYMENT_METHOD_ORDER.filter(m => isMethodAvailable(config, m));
}

/**
 * Enlace de WhatsApp del negocio con un mensaje ya escrito.
 * Devuelve null si el número real todavía no se cargó en el panel.
 */
export function businessWhatsappLink(config: PaymentConfig | null, text?: string): string | null {
  const digits = (config?.business.whatsapp || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const international = digits.startsWith('58') ? digits : `58${digits.replace(/^0/, '')}`;
  return `https://wa.me/${international}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

const CONFIG_REF = () => doc(db, 'store', 'paymentConfig');

/** Escucha los datos de cobro. `loaded` evita mostrar "sin métodos" antes de tiempo. */
export function subscribePaymentConfig(
  onChange: (config: PaymentConfig) => void,
  onError?: (error: unknown) => void,
): () => void {
  return onSnapshot(
    CONFIG_REF(),
    snap => onChange(mergePaymentConfig(snap.exists() ? snap.data() : null)),
    error => {
      console.error('No se pudieron leer los datos de cobro', error);
      onError?.(error);
    },
  );
}

/** Solo el admin puede escribir (regla `store/{docId}`). */
export async function savePaymentConfig(config: PaymentConfig): Promise<void> {
  assertRealAdminWrite();
  await setDoc(CONFIG_REF(), { ...config, updatedAt: new Date().toISOString() });
}
