"use client";
import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, resolveImage, type Order } from '@/store/useStore';
import { Crown, Upload, CheckCircle, AlertTriangle, LogOut, Package, ClipboardList, ShieldAlert, Image as ImageIcon, Check, Mail, User as UserIcon, MapPin, DollarSign, TrendingUp, Search, Layers, Edit, BarChart2, Plus, Users, Shield, Zap, Wallet, Download, Warehouse, Receipt } from 'lucide-react';
import { Product } from '@/data/mockDb';
import { ProductRepository } from '@/core/infrastructure/repositories/ProductRepository';
import { useRouter } from 'next/navigation';
import {
  ADMIN_MIN_PASSWORD,
  PAYMENT_ICONS,
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  SAMPLE_ADMIN_PASSWORD,
  SAMPLE_ADMIN_USER,
  SAMPLE_WRITE_MESSAGE,
  clearSampleAdminSession,
  computeProfit,
  effectivePaymentStatus,
  isAdminEmail,
  isPaidOrder,
  isSampleAdminLogin,
  readSampleAdminSession,
  writeSampleAdminSession,
} from '@/lib/commerce';
import { CSV_DELIMITER, buildCatalogCsv, buildTemplateCsv, parseCatalogRows, type CatalogRow } from '@/lib/catalogCsv';
import { hasProof, logAdminEvent } from '@/lib/orders';
import { availableMethods } from '@/lib/paymentConfig';
import { marginPercent as productMargin, summarizeInventory } from '@/lib/inventoryDb';
import {
  accessLevelFor,
  canManageCatalog,
  canManageStaff,
  canSeeTab,
  fetchStaffDoc,
  type AccessLevel,
} from '@/lib/staff';
import CrmTab from '@/components/admin/CrmTab';
import StaffTab from '@/components/admin/StaffTab';
import PaymentConfigTab from '@/components/admin/PaymentConfigTab';
import OrderPaymentPanel from '@/components/admin/OrderPaymentPanel';
import SecurityCard from '@/components/account/SecurityCard';
import WarehouseTab from '@/components/admin/WarehouseTab';
import BillingTab from '@/components/admin/BillingTab';
import { needsInvoice, isValidTaxRate, TAX_LABELS, TAX_RATES, type TaxRate } from '@/lib/billingExport';

/** Marca local: la última entrada al panel fue con una clave de menos de 12 caracteres. */
const WEAK_PASSWORD_FLAG = 'mn-admin-clave-corta';

/** Lee un CSV del catálogo con el mismo separador que usa la plantilla (punto y coma). */
function readCatalogFile(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      delimiter: CSV_DELIMITER,
      skipEmptyLines: true,
      complete: results => resolve(results.data),
      error: error => reject(error),
    });
  });
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const setProducts = useStore(state => state.setProducts);
  const products = useStore(state => state.products);
  const orders = useStore(state => state.orders);
  const logout = useStore(state => state.logout);
  const paymentConfig = useStore(state => state.paymentConfig);
  const rates = useStore(state => state.rates);
  const isAutoRates = useStore(state => state.isAutoRates);
  const setIsAutoRates = useStore(state => state.setIsAutoRates);
  const setRates = useStore(state => state.setRates);
  const adminLogs = useStore(state => state.adminLogs);
  const clearAdminLogs = useStore(state => state.clearAdminLogs);
  const flashOffersConfig = useStore(state => state.flashOffersConfig);
  
  const [status, setStatus] = useState<{type: 'idle' | 'loading' | 'success' | 'error', msg: string}>({type: 'idle', msg: ''});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Authentication state. Firebase abre el panel real. La muestra usa admin / admin solo en este navegador.
  const [adminEmail, setAdminEmail] = useState(SAMPLE_ADMIN_USER);
  const [adminPassword, setAdminPassword] = useState(SAMPLE_ADMIN_PASSWORD);
  const [authState, setAuthState] = useState<'checking' | 'out' | 'other' | 'admin' | 'staff'>('checking');
  const [sampleMode, setSampleMode] = useState(false);
  // Nivel de acceso de quien entró: dueño, encargado o empleado. Decide qué pestañas ve.
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  // Si la clave con la que se entró es corta, hay que cambiarla antes de usar el panel.
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [adminUid, setAdminUid] = useState('');
  // Dueño o empleado activo: cualquiera de los dos abre el panel.
  const hasPanelAccess = authState === 'admin' || authState === 'staff';

  // Dashboard layout state
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'csv' | 'rates' | 'notifications' | 'stats' | 'crm' | 'security' | 'flashOffers' | 'payments' | 'warehouse' | 'billing' | 'personal'>('orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  // Bandejas de trabajo del empleado: cada una responde "¿qué me toca hacer ahora?".
  const [orderQueue, setOrderQueue] = useState<'todos' | 'verificar' | 'cobrar' | 'preparar' | 'despachar' | 'facturar' | 'cerrados'>('todos');
  const [orderSearch, setOrderSearch] = useState('');
  // El detalle siempre muestra el pedido tal como está ahora en la base.
  const selectedOrder = orders.find(o => o.id === selectedOrderId) ?? null;
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Exchange rates input state
  const [usdRateInput, setUsdRateInput] = useState(rates.usd.toString());
  const [eurRateInput, setEurRateInput] = useState(rates.eur.toString());

  useEffect(() => {
    setUsdRateInput(rates.usd.toString());
    setEurRateInput(rates.eur.toString());
  }, [rates.usd, rates.eur]);
  
  // Search state for inventory
  const [inventorySearch, setInventorySearch] = useState('');

  // Flash Offers state
  const [flashHours, setFlashHours] = useState<number>(24);
  const [flashSearch, setFlashSearch] = useState('');

  const guardSample = (): boolean => {
    if (!readSampleAdminSession()) return false;
    setStatus({ type: 'error', msg: SAMPLE_WRITE_MESSAGE });
    return true;
  };

  const openSampleSession = () => {
    writeSampleAdminSession();
    setSampleMode(true);
    setMustChangePassword(false);
    setAuthState('admin');
    setAccessLevel('owner');
    setAdminUid('');
    setAdminPassword('');
    setLoginError('');
  };

  const handleSaveFlashOffer = async () => {
    if (guardSample()) return;
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      const end = new Date();
      end.setHours(end.getHours() + flashHours);
      
      const config = {
        active: true,
        endTime: end.toISOString(),
        productIds: flashOffersConfig?.productIds || []
      };
      await setDoc(doc(db, "store", "flashOffers"), config);
      setStatus({type: 'success', msg: 'Oferta Relámpago activada con éxito.'});
    } catch(e) {
      setStatus({type: 'error', msg: 'Error guardando oferta relámpago.'});
    }
  };

  const handleToggleFlashProduct = async (productId: string) => {
    if (guardSample()) return;
    try {
      const currentIds = flashOffersConfig?.productIds || [];
      const newIds = currentIds.includes(productId) 
        ? currentIds.filter(id => id !== productId) 
        : [...currentIds, productId];

      const { db } = await import('@/lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      const config = {
        active: flashOffersConfig?.active || false,
        endTime: flashOffersConfig?.endTime || new Date().toISOString(),
        productIds: newIds
      };
      await setDoc(doc(db, "store", "flashOffers"), config);
      
      // Optimistic update
      useStore.getState().setFlashOffersConfig(config);
    } catch(e: any) {
      console.error("Flash Offer Toggle Error:", e);
      setStatus({type: 'error', msg: `Error al seleccionar: ${e.message}`});
    }
  };

  const handleDisableFlashOffers = async () => {
    if (guardSample()) return;
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');
      const config = {
        active: false,
        endTime: flashOffersConfig?.endTime || new Date().toISOString(),
        productIds: flashOffersConfig?.productIds || []
      };
      await setDoc(doc(db, "store", "flashOffers"), config);
      setStatus({type: 'success', msg: 'Oferta Relámpago apagada.'});
    } catch(e) {}
  };

  // Edit product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: 0,
    providerPrice: 0,
    stock: 0,
    warehouseStock: 0,
    description: '',
    unit: '',
    image: '',
    taxRate: '' as '' | TaxRate,
  });
  // true mientras sube una foto nueva del producto a Firebase Storage.
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Add product state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addProductForm, setAddProductForm] = useState({
    id: '',
    name: '',
    price: 0,
    category: 'viveres',
    subcategory: '',
    image: '',
    unit: '1 Unidad',
    stock: 0,
    warehouseStock: 0,
    providerPrice: 0,
    description: '',
  });

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setEditForm({
      name: p.name,
      price: p.price,
      providerPrice: p.providerPrice || 0,
      stock: p.stock || 0,
      warehouseStock: p.warehouseStock || 0,
      description: p.description || '',
      unit: p.unit || '1 Unidad',
      image: p.image || '',
      taxRate: isValidTaxRate(p.taxRate) ? p.taxRate : '',
    });
  };

  /**
   * Sube una foto nueva del producto a Firebase Storage y deja su URL en el
   * formulario. No guarda todavía: el cambio se aplica al pulsar "Guardar
   * Cambios". En modo muestra no toca Storage.
   */
  const handleEditImageUpload = async (file: File) => {
    if (!editingProduct) return;
    if (guardSample()) return;
    setIsUploadingImage(true);
    try {
      const { storage } = await import('@/lib/firebase');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { compressImage } = await import('@/lib/orders');
      const blob = await compressImage(file);
      const path = `products/${editingProduct.id}_${Date.now()}.jpg`;
      await uploadBytes(ref(storage, path), blob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(ref(storage, path));
      setEditForm(prev => ({ ...prev, image: url }));
      setStatus({ type: 'success', msg: 'Foto subida. Pulsa "Guardar Cambios" para aplicarla.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: `No se pudo subir la foto: ${err?.message || 'revisa tu conexión'}` });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProduct = {
      ...editingProduct,
      name: editForm.name,
      price: Number(editForm.price),
      providerPrice: editForm.providerPrice ? Number(editForm.providerPrice) : undefined,
      stock: Number(editForm.stock),
      warehouseStock: Number(editForm.warehouseStock),
      description: editForm.description,
      unit: editForm.unit,
    };

    // Solo viajan a la base los campos del formulario, y el stock únicamente si el
    // admin lo tocó: así no se pisa una venta que entró mientras el formulario estaba abierto.
    const patch: Partial<Product> = {
      name: updatedProduct.name,
      price: updatedProduct.price,
      description: updatedProduct.description,
      unit: updatedProduct.unit,
    };
    if (updatedProduct.providerPrice !== undefined) patch.providerPrice = updatedProduct.providerPrice;
    // La foto solo viaja si cambió: así cambiar el precio no reescribe la imagen.
    if (editForm.image && editForm.image !== editingProduct.image) patch.image = editForm.image;
    if (editForm.taxRate !== '' && editForm.taxRate !== editingProduct.taxRate) patch.taxRate = editForm.taxRate;
    if ((editingProduct.stock || 0) !== updatedProduct.stock) patch.stock = updatedProduct.stock;
    if ((editingProduct.warehouseStock || 0) !== updatedProduct.warehouseStock) patch.warehouseStock = updatedProduct.warehouseStock;

    if (guardSample()) return;
    try {
      await ProductRepository.updateProduct(updatedProduct.id, patch);
      const changes: string[] = [];
      if (Number(editingProduct.price) !== updatedProduct.price) {
        changes.push(`precio $${Number(editingProduct.price).toFixed(2)} → $${updatedProduct.price.toFixed(2)}`);
      }
      if ((editingProduct.providerPrice || 0) !== (updatedProduct.providerPrice || 0)) {
        changes.push(`costo $${(editingProduct.providerPrice || 0).toFixed(2)} → $${(updatedProduct.providerPrice || 0).toFixed(2)}`);
      }
      if ((editingProduct.stock || 0) !== updatedProduct.stock || (editingProduct.warehouseStock || 0) !== updatedProduct.warehouseStock) {
        changes.push(`stock tienda ${editingProduct.stock || 0} → ${updatedProduct.stock}, depósito ${editingProduct.warehouseStock || 0} → ${updatedProduct.warehouseStock}`);
      }
      if (editForm.image && editForm.image !== editingProduct.image) {
        changes.push('foto actualizada');
      }
      if (changes.length > 0) {
        await logAdminEvent(`✏️ ${updatedProduct.name} (${updatedProduct.id}): ${changes.join('; ')}.`, changes[0].startsWith('precio') ? 'price' : 'stock');
      }
      setEditingProduct(null);
      setStatus({type: 'success', msg: `Producto "${editForm.name}" actualizado con éxito en Firebase.`});
    } catch (err: any) {
      setStatus({type: 'error', msg: `Error actualizando producto: ${err.message}`});
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = addProductForm.id.trim() || `prod-${Date.now()}`;
    
    // Check if ID already exists
    if (products.some(p => p.id === newId)) {
      if (!window.confirm(`El producto con ID ${newId} ya existe. ¿Deseas sobrescribirlo?`)) {
        return;
      }
    }

    const newProduct: Product = {
      id: newId,
      name: addProductForm.name,
      price: Number(addProductForm.price),
      category: addProductForm.category,
      subcategory: addProductForm.subcategory || '',
      image: addProductForm.image || '/images/products/default.jpg',
      unit: addProductForm.unit,
      stock: Number(addProductForm.stock),
      warehouseStock: Number(addProductForm.warehouseStock) || 0,
      providerPrice: addProductForm.providerPrice > 0 ? Number(addProductForm.providerPrice) : undefined,
      description: addProductForm.description || undefined,
    };

    if (guardSample()) return;
    try {
      await ProductRepository.setProduct(newProduct as any);
      setShowAddProduct(false);
      setAddProductForm({
        id: '', name: '', price: 0, category: 'viveres', subcategory: '', image: '', unit: '1 Unidad', stock: 0, warehouseStock: 0, providerPrice: 0, description: ''
      });
      await logAdminEvent(`➕ Producto creado: ${newProduct.name} (${newProduct.id}) a $${newProduct.price.toFixed(2)}.`, 'catalog');
      setStatus({type: 'success', msg: `Producto "${newProduct.name}" creado con éxito en Firebase.`});
    } catch (err: any) {
      setStatus({type: 'error', msg: `Error creando producto: ${err.message}`});
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Firebase abre la cuenta real. La muestra (usuario admin) abre el panel sin Firebase.
  useEffect(() => {
    if (!mounted) return;
    let unsubscribe = () => {};
    let cancelled = false;
    Promise.all([import('@/lib/firebase'), import('firebase/auth')]).then(([{ auth }, { onAuthStateChanged }]) => {
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        const owner = isAdminEmail(firebaseUser?.email);
        if (owner && firebaseUser) {
          clearSampleAdminSession();
          setSampleMode(false);
        } else if (readSampleAdminSession()) {
          setSampleMode(true);
          setMustChangePassword(false);
          setAuthState('admin');
          setAccessLevel('owner');
          if (!firebaseUser) setAdminUid('');
          return;
        } else {
          setSampleMode(false);
        }
        if (!firebaseUser) {
          setAuthState('out');
          setAccessLevel(null);
          setAdminUid('');
          return;
        }
        setAdminUid(owner ? firebaseUser.uid : '');
        if (owner) {
          setAuthState('admin');
          setAccessLevel('owner');
          try {
            if (localStorage.getItem(WEAK_PASSWORD_FLAG) === '1') setMustChangePassword(true);
          } catch { /* sin almacenamiento */ }
          return;
        }
        // No es el dueño: ¿tiene acceso como empleado? Lo dice staff/{uid}.
        const uid = firebaseUser.uid;
        fetchStaffDoc(uid)
          .then((member) => {
            if (auth.currentUser?.uid !== uid) return;
            const level = accessLevelFor(false, member);
            setAccessLevel(level);
            setAuthState(level ? 'staff' : 'other');
          })
          .catch(() => {
            if (auth.currentUser?.uid === uid) {
              setAccessLevel(null);
              setAuthState('other');
            }
          });
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [mounted]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginBusy) return;
    setLoginError('');
    const email = adminEmail.trim().toLowerCase();
    if (!email || !adminPassword) {
      setLoginError('Escribe tu usuario y tu clave.');
      return;
    }
    if (isSampleAdminLogin(email, adminPassword)) {
      openSampleSession();
      return;
    }
    if (email === SAMPLE_ADMIN_USER) {
      setLoginError('Credenciales incorrectas.');
      return;
    }
    setLoginBusy(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const { signInWithEmailAndPassword, signOut } = await import('firebase/auth');
      // Solo se entra si Firebase acepta la clave. Aquí nunca se crea el usuario.
      const cred = await signInWithEmailAndPassword(auth, email, adminPassword);
      const owner = isAdminEmail(email);
      if (!owner) {
        // Empleado: debe tener acceso activo en staff/{uid}. Si no, se cierra la sesión.
        const member = await fetchStaffDoc(cred.user.uid);
        if (!member || !member.active) {
          await signOut(auth);
          setLoginError('Esta cuenta no tiene acceso al panel. Pídele al dueño que te dé acceso en Personal.');
          return;
        }
      } else if (adminPassword.length < ADMIN_MIN_PASSWORD) {
        setMustChangePassword(true);
        // Recargar la página no salta el cambio de clave.
        try { localStorage.setItem(WEAK_PASSWORD_FLAG, '1'); } catch { /* sin almacenamiento */ }
      }
      await logAdminEvent(
        owner ? '🔐 Inicio de sesión del dueño en el panel.' : `🔐 Inicio de sesión de empleado (${email}).`,
        'login',
      );
      setAdminPassword('');
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests') {
        setLoginError('Demasiados intentos fallidos. Espera unos minutos antes de volver a probar.');
      } else if (err?.code === 'auth/network-request-failed') {
        setLoginError('Sin conexión con Firebase. Revisa tu internet.');
      } else {
        setLoginError('Credenciales incorrectas.');
      }
    } finally {
      setLoginBusy(false);
    }
  };

  const handleForcedPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginBusy) return;
    setLoginError('');
    if (newPassword.length < ADMIN_MIN_PASSWORD) {
      setLoginError(`La clave nueva debe tener al menos ${ADMIN_MIN_PASSWORD} caracteres.`);
      return;
    }
    if (newPassword !== newPasswordRepeat) {
      setLoginError('Las dos claves no coinciden.');
      return;
    }
    setLoginBusy(true);
    try {
      const { auth } = await import('@/lib/firebase');
      const { updatePassword } = await import('firebase/auth');
      if (!auth.currentUser) throw new Error('sin sesión');
      await updatePassword(auth.currentUser, newPassword);
      try { localStorage.removeItem(WEAK_PASSWORD_FLAG); } catch { /* sin almacenamiento */ }
      await logAdminEvent('🔑 La clave de administración fue cambiada.', 'login');
      setNewPassword('');
      setNewPasswordRepeat('');
      setMustChangePassword(false);
    } catch (err: any) {
      setLoginError(
        err?.code === 'auth/requires-recent-login'
          ? 'Por seguridad, cierra sesión, entra de nuevo y repite el cambio.'
          : 'No se pudo cambiar la clave. Inténtalo de nuevo.',
      );
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    clearSampleAdminSession();
    setSampleMode(false);
    setAdminEmail(SAMPLE_ADMIN_USER);
    setAdminPassword(SAMPLE_ADMIN_PASSWORD);
    setMustChangePassword(false);
    // Cierra la sesión de Firebase de verdad y limpia el estado local.
    await logout();
  };

  /** Lee y valida el CSV. Devuelve null (y deja el mensaje puesto) si no se puede usar. */
  const loadCatalogCsv = async (file: File): Promise<CatalogRow[] | null> => {
    const data = await readCatalogFile(file);
    const parsed = parseCatalogRows(data);
    if (parsed.wrongDelimiter) {
      setStatus({type: 'error', msg: 'El archivo está separado por comas. Este panel usa punto y coma (;): descarga la plantilla y pega ahí tus datos.'});
      return null;
    }
    if (parsed.rows.length === 0 && parsed.errors.length === 0) {
      setStatus({type: 'error', msg: 'El archivo no trae productos. Revisa que tenga la fila de encabezados de la plantilla.'});
      return null;
    }
    if (parsed.errors.length > 0) {
      setStatus({type: 'error', msg: `No se cargó nada. Corrige el archivo: ${parsed.errors.slice(0, 5).join(' · ')}${parsed.errors.length > 5 ? ` · y ${parsed.errors.length - 5} más` : ''}`});
      return null;
    }
    return parsed.rows;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (guardSample()) return;
    setStatus({ type: 'loading', msg: 'Leyendo el archivo…' });
    try {
      const rows = await loadCatalogCsv(file);
      if (!rows) return;

      // Solo viajan a la base los campos que trae el archivo. Vistas, ventas y el
      // stock que el archivo no menciona no se tocan: una venta que entre durante
      // la importación no se pierde.
      const existingIds = new Set(products.map(p => p.id));
      const patches = rows.map((row) => {
        if (!existingIds.has(row.id)) return row;
        const patch: Partial<CatalogRow> & { id: string } = { id: row.id };
        if (row.name) patch.name = row.name;
        if (row.price > 0) patch.price = row.price;
        if (row.category) patch.category = row.category;
        if (row.subcategory) patch.subcategory = row.subcategory;
        if (row.image) patch.image = row.image;
        // "1 Unidad" es el relleno del lector cuando la celda viene vacía.
        if (row.unit && row.unit !== '1 Unidad') patch.unit = row.unit;
        if (row.labels !== undefined) patch.labels = row.labels;
        if (row.description !== undefined) patch.description = row.description;
        if (row.providerPrice !== undefined) patch.providerPrice = row.providerPrice;
        if (row.stock !== undefined) patch.stock = row.stock;
        if (row.warehouseStock !== undefined) patch.warehouseStock = row.warehouseStock;
        return patch;
      });

      const { updatedCount, addedCount, errorCount } = await ProductRepository.batchMergeProducts(patches, existingIds);
      await logAdminEvent(`📥 CSV fusionado (${file.name}): ${updatedCount} actualizados, ${addedCount} nuevos, ${errorCount} con error.`, 'catalog');
      setStatus({
        type: errorCount > 0 ? 'error' : 'success',
        msg: `Fusión lista: ${updatedCount} actualizados y ${addedCount} nuevos. ${errorCount > 0 ? `${errorCount} filas no pasaron la validación (revisa categoría e imagen).` : ''}`
      });
    } catch (err) {
      setStatus({type: 'error', msg: 'Error procesando archivo: ' + (err as Error).message});
    }
  };

  const handleFileReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (guardSample()) return;
    setStatus({ type: 'loading', msg: 'Leyendo el archivo…' });
    try {
      const rows = await loadCatalogCsv(file);
      if (!rows) return;
      if (!window.confirm(`Vas a BORRAR los ${products.length} productos actuales y dejar solo los ${rows.length} del archivo. ¿Continuar?`)) {
        setStatus({ type: 'idle', msg: '' });
        return;
      }
      setStatus({ type: 'loading', msg: 'Reemplazando todo el catálogo en Firebase...' });
      const { validCount, errorCount, deletedCount } = await ProductRepository.batchReplaceProducts(rows);
      await logAdminEvent(`♻️ Catálogo reemplazado (${file.name}): ${deletedCount} eliminados, ${validCount} insertados, ${errorCount} con error.`, 'catalog');
      setStatus({
        type: 'success', 
        msg: `Reemplazo exitoso: se eliminaron ${deletedCount} y se insertaron ${validCount} productos. Errores: ${errorCount}.`
      });
    } catch (err) {
      setStatus({type: 'error', msg: 'Error procesando archivo: ' + (err as Error).message});
    }
  };

  const handleDownloadTemplate = () => {
    downloadCsv(buildTemplateCsv(), 'mi-negocio-catalogo-plantilla.csv');
  };

  const handleExportCatalog = () => {
    const basePath = process.env.NODE_ENV === 'production' ? '/minegocio' : '';
    downloadCsv(
      buildCatalogCsv(products.map(p => ({
        ...p,
        // La ruta se exporta sin el prefijo del sitio para que vuelva a entrar igual.
        image: basePath && p.image.startsWith(basePath + '/') ? p.image.slice(basePath.length) : p.image,
      }))),
      `mi-negocio-catalogo-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  if (!mounted) return null;

  // Estadísticas: una venta cuenta cuando el dinero fue confirmado, no cuando se creó el pedido.
  const paidOrders = orders.filter(isPaidOrder);
  const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total, 0);
  // Ganancia real: (precio − costo) × unidades, con el costo cargado en cada producto.
  const costById: Record<string, number | undefined> = {};
  products.forEach(p => { costById[p.id] = p.providerPrice; });
  const profit = computeProfit(paidOrders.flatMap(o => o.items), costById);
  const pendingOrdersCount = orders.filter(o => o.status !== 'Cancelado' && ['en_revision', 'rechazado', 'pendiente'].includes(effectivePaymentStatus(o))).length;
  const cashToCollect = orders.filter(o => o.status !== 'Cancelado' && effectivePaymentStatus(o) === 'contra_entrega').length;
  const activeMethods = paymentConfig ? availableMethods(paymentConfig) : null;
  const inventory = summarizeInventory(products);
  const invoicePending = orders.filter(needsInvoice).length;

  // Bandejas de pedidos: cada pedido cae en la que describe su siguiente paso.
  const queueOf = (o: Order): 'verificar' | 'cobrar' | 'preparar' | 'despachar' | 'cerrados' => {
    if (o.status === 'Cancelado' || o.status === 'Entregado') return 'cerrados';
    const pay = effectivePaymentStatus(o);
    if (['en_revision', 'rechazado', 'pendiente'].includes(pay)) return 'verificar';
    if (o.status === 'Listo para retirar' || o.status === 'En camino') return pay === 'contra_entrega' ? 'cobrar' : 'despachar';
    return 'preparar';
  };
  const queueCounts = { verificar: 0, cobrar: 0, preparar: 0, despachar: 0, cerrados: 0 };
  orders.forEach(o => { queueCounts[queueOf(o)] += 1; });
  const orderQuery = orderSearch.trim().toLowerCase();
  const visibleOrders = orders.filter(o => {
    if (orderQueue === 'facturar' ? !needsInvoice(o) : orderQueue !== 'todos' && queueOf(o) !== orderQueue) return false;
    if (!orderQuery) return true;
    return `${o.id} ${o.customerDetails?.name ?? ''} ${o.customerDetails?.phone ?? ''} ${o.customerDetails?.cedula ?? ''} ${o.reference ?? ''} ${o.invoice?.number ?? ''}`.toLowerCase().includes(orderQuery);
  });
  const QUEUES: { key: typeof orderQueue; label: string; count: number; help: string }[] = [
    { key: 'todos', label: 'Todos', count: orders.length, help: 'Todos los pedidos' },
    { key: 'verificar', label: 'Verificar pago', count: queueCounts.verificar, help: 'Revisa la referencia y aprueba o rechaza' },
    { key: 'preparar', label: 'Preparar', count: queueCounts.preparar, help: 'Pago listo o efectivo: arma el pedido' },
    { key: 'despachar', label: 'Entregar', count: queueCounts.despachar, help: 'Listos o en camino, ya pagados' },
    { key: 'cobrar', label: 'Cobrar al entregar', count: queueCounts.cobrar, help: 'Efectivo en camino o por retirar' },
    { key: 'facturar', label: 'Facturar', count: invoicePending, help: 'Cobrados sin número de factura' },
    { key: 'cerrados', label: 'Cerrados', count: queueCounts.cerrados, help: 'Entregados y cancelados' },
  ];

  // Filter products for inventory search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
    p.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    p.id.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  // ------------------ PUERTA DEL PANEL ------------------
  if (authState === 'checking') {
    return <div className="max-w-md mx-auto py-32 px-4 text-center text-gray-400 font-bold">Comprobando la sesión…</div>;
  }

  if (!hasPanelAccess) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="w-16 h-16 bg-mi-blue/10 text-mi-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={36} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2 text-center">
            Panel de Mi Negocio
          </h1>
          <p className="text-center text-gray-500 mb-8 font-medium">
            Muestra: usuario <span className="font-bold text-gray-800">admin</span> y clave <span className="font-bold text-gray-800">admin</span>.
          </p>

          {authState === 'other' && (
            <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm font-bold p-3 rounded-xl mb-5 text-center">
              Esta cuenta no tiene acceso al panel. Si eres empleado, pídele al dueño que te dé acceso en la pestaña Personal.
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-bold text-gray-700 mb-1">Usuario</label>
              <input 
                id="admin-email"
                required 
                type="text" 
                autoComplete="username"
                value={adminEmail} 
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mi-blue transition"
              />
            </div>
            
            <div>
              <label htmlFor="admin-password" className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
              <input 
                id="admin-password"
                required 
                type="password" 
                autoComplete="current-password"
                value={adminPassword} 
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mi-blue transition"
              />
            </div>

            {loginError && (
              <div role="alert" className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg text-center">
                {loginError}
              </div>
            )}

            <button type="submit" disabled={loginBusy} className="w-full bg-mi-blue text-white font-bold text-lg py-4 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20 disabled:opacity-60">
              {loginBusy ? 'Verificando…' : 'Iniciar Sesión'}
            </button>
            <p className="text-center text-xs text-gray-400 font-medium">
              Esa entrada es local. No cambia la cuenta de Firebase.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Entró con una clave corta: no pasa al panel hasta poner una de 12 o más.
  if (mustChangePassword) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={36} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2 text-center">Cambia la clave de administración</h1>
          <p className="text-center text-gray-500 mb-8 font-medium text-sm">
            La clave con la que entraste es demasiado corta y estuvo escrita en el código de la página.
            Crea una nueva de al menos {ADMIN_MIN_PASSWORD} caracteres para continuar.
          </p>
          <form onSubmit={handleForcedPasswordChange} className="space-y-5">
            <div>
              <label htmlFor="new-admin-password" className="block text-sm font-bold text-gray-700 mb-1">Clave nueva</label>
              <input id="new-admin-password" required type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mi-blue transition" />
            </div>
            <div>
              <label htmlFor="new-admin-password-2" className="block text-sm font-bold text-gray-700 mb-1">Repite la clave nueva</label>
              <input id="new-admin-password-2" required type="password" autoComplete="new-password" value={newPasswordRepeat} onChange={e => setNewPasswordRepeat(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mi-blue transition" />
            </div>
            {loginError && <div role="alert" className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg text-center">{loginError}</div>}
            <button type="submit" disabled={loginBusy} className="w-full bg-mi-blue text-white font-bold text-lg py-4 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20 disabled:opacity-60">
              {loginBusy ? 'Guardando…' : 'Guardar clave y entrar'}
            </button>
            <button type="button" onClick={handleLogout} className="w-full text-sm font-bold text-gray-500 hover:text-red-500 transition">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ------------------ ADMIN PANEL DASHBOARD ------------------
return (
    <div className="max-w-[1600px] w-[96%] mx-auto py-12 px-4 min-h-[80vh] space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-8 text-white shadow-xl shadow-yellow-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Crown size={160} className="-mr-10 -mt-10" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="text-white" fill="currentColor" size={32} />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Panel de Control</h1>
          </div>
          <p className="text-yellow-100 font-medium text-sm md:text-base">
            Hola <span className="font-bold text-white">Administrador</span>, gestiona los pedidos, estadísticas e inventario en tiempo real.
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 w-fit relative z-10"
        >
          <LogOut size={16} /> Cerrar Sesión
        </button>
      </div>

      {sampleMode && (
        <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm font-bold p-4 rounded-2xl">
          Muestra local con el usuario admin. Puedes recorrer el panel. Los cambios no se guardan en Firebase.
        </div>
      )}

      {/* Statistics Dashboard Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 rounded-2xl bg-green-50 text-green-600">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Ventas cobradas</span>
            <span className="text-2xl font-black text-gray-800">${totalRevenue.toFixed(2)}</span>
            <span className="text-[11px] text-gray-400 font-medium block">{paidOrders.length} pedidos con pago confirmado</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 rounded-2xl bg-yellow-50 text-yellow-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Ganancia real</span>
            <span className="text-2xl font-black text-gray-800">${profit.profit.toFixed(2)}</span>
            <span className="text-[11px] text-gray-400 font-medium block">
              {profit.linesWithoutCost > 0 ? `Faltan costos: $${profit.revenueWithoutCost.toFixed(2)} sin calcular` : '(precio − costo) × unidades'}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Pagos por verificar</span>
            <span className="text-2xl font-black text-gray-800">{pendingOrdersCount}</span>
            <span className="text-[11px] text-gray-400 font-medium block">{cashToCollect} en efectivo por cobrar</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
            <Layers size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-bold uppercase">Catálogo Activo</span>
            <span className="text-2xl font-black text-gray-800">{products.length} ítems</span>
          </div>
        </div>
      </div>

      {activeMethods && !activeMethods.some(m => m !== 'cash') && (
        <button
          onClick={() => setActiveTab('payments')}
          className="w-full text-left bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3 text-yellow-900 hover:bg-yellow-100 transition"
        >
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <span className="text-sm font-bold">
            Faltan los datos de cobro reales. Hoy los clientes solo pueden pagar en efectivo. Toca aquí para cargar Pago Móvil, Zelle, transferencia, Binance o PayPal.
          </span>
        </button>
      )}

      {/* Tabs Selector */}
      <div className="flex gap-1 md:gap-2 border-b border-gray-200 pb-0 pt-3 mt-2 overflow-x-auto scrollbar-hide whitespace-nowrap px-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'orders' 
              ? 'border-yellow-500 text-yellow-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <ClipboardList size={16} /> Pedidos ({pendingOrdersCount} por verificar)
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'payments' 
              ? 'border-yellow-500 text-yellow-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Wallet size={16} /> Cobros
        </button>
        <button
          onClick={() => setActiveTab('warehouse')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'warehouse' 
              ? 'border-yellow-500 text-yellow-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Warehouse size={16} /> Almacén
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'billing' 
              ? 'border-yellow-500 text-yellow-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Receipt size={16} /> Facturación{invoicePending > 0 ? ` (${invoicePending})` : ''}
        </button>
        {canManageCatalog(accessLevel) && (
        <button
          onClick={() => setActiveTab('flashOffers')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'flashOffers'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Zap size={16} /> Ofertas Relámpago
        </button>
        )}
        {canManageCatalog(accessLevel) && (
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'inventory'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Package size={16} /> Inventario ({products.length})
        </button>
        )}
        <button
          onClick={() => setActiveTab('crm')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'crm'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users size={16} /> Clientes
        </button>
        {canManageCatalog(accessLevel) && (
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'security'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Shield size={16} /> Trazabilidad
        </button>
        )}
        {canManageCatalog(accessLevel) && (
        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'csv'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Upload size={16} /> Cargar Catálogo
        </button>
        )}
        {canManageCatalog(accessLevel) && (
        <button
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'rates'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <TrendingUp size={16} /> Tasas
        </button>
        )}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'notifications' 
              ? 'border-yellow-500 text-yellow-600' 
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Layers size={16} />
            {adminLogs.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                {adminLogs.length}
              </span>
            )}
          </div>
          Notificaciones
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'stats'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <BarChart2 size={16} /> Estadísticas
        </button>
        {canManageStaff(accessLevel) && (
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-1.5 pb-2 px-1 md:px-2 font-bold text-xs md:text-sm transition-all border-b-2 ${
            activeTab === 'personal'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <UserIcon size={16} /> Personal
        </button>
        )}
      </div>

      {['orders', 'inventory', 'flashOffers', 'stats', 'notifications', 'security'].includes(activeTab) && status.type !== 'idle' && (
        <div
          role={status.type === 'error' ? 'alert' : 'status'}
          className={`p-4 rounded-xl flex items-center justify-between gap-3 font-bold text-sm ${
            status.type === 'success' ? 'bg-green-50 text-green-700' : status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
          }`}
        >
          <span className="flex items-center gap-2">
            {status.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} {status.msg}
          </span>
          <button onClick={() => setStatus({ type: 'idle', msg: '' })} className="text-xs underline shrink-0">Cerrar</button>
        </div>
      )}

      {/* ------------------ TAB FLASH OFFERS ------------------ */}
      {activeTab === 'flashOffers' && canManageCatalog(accessLevel) && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-mi-yellow/10 p-2.5 rounded-xl"><Zap size={22} className="text-mi-yellow" /></div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Ofertas Relámpago</h2>
                <p className="text-gray-400 text-xs font-medium">Controla los productos y el tiempo de tus ofertas flash.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {flashOffersConfig?.active ? (
                <button onClick={handleDisableFlashOffers} className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl text-sm transition hover:bg-red-100">
                  Apagar Oferta Activa
                </button>
              ) : (
                <span className="bg-gray-100 text-gray-500 font-bold px-4 py-2 rounded-xl text-sm">
                  Oferta Inactiva
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Configuración</h3>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Duración (horas a partir de ahora)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" max="72" value={flashHours} onChange={e => setFlashHours(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg p-2 font-bold" />
                  <span className="text-sm text-gray-500 font-bold">hrs</span>
                </div>
              </div>
              <button onClick={handleSaveFlashOffer} className="w-full bg-mi-yellow text-mi-blue font-black py-3 rounded-xl hover:brightness-110 transition shadow-md shadow-mi-yellow/30">
                Guardar y Activar Oferta
              </button>
              {flashOffersConfig?.active && (
                <p className="text-xs text-center text-green-600 font-bold">
                  Finaliza: {new Date(flashOffersConfig.endTime).toLocaleString()}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-lg">Productos Seleccionados ({(flashOffersConfig?.productIds || []).length})</h3>
                <div className="relative w-1/2">
                  <input type="text" placeholder="Buscar catálogo..." value={flashSearch} onChange={e => setFlashSearch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 px-4 text-xs focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                {products.filter(p => p.name.toLowerCase().includes(flashSearch.toLowerCase())).map(p => {
                  const isSelected = (flashOffersConfig?.productIds || []).includes(p.id);
                  return (
                    <div key={p.id} onClick={() => handleToggleFlashProduct(p.id)} className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border transition ${isSelected ? 'bg-yellow-50 border-yellow-400 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-yellow-500' : 'border-2 border-gray-300'}`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      <img src={resolveImage(p.image)} className="w-8 h-8 object-contain mix-blend-multiply" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-500">${p.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ TAB CLIENTES (CRM) ------------------ */}
      {activeTab === 'crm' && <CrmTab />}
      {activeTab === 'personal' && canManageStaff(accessLevel) && <StaffTab />}

      {/* ------------------ TAB COBROS ------------------ */}
      {activeTab === 'payments' && <PaymentConfigTab />}

      {/* ------------------ TAB ALMACÉN ------------------ */}
      {activeTab === 'warehouse' && <WarehouseTab />}

      {/* ------------------ TAB FACTURACIÓN ------------------ */}
      {activeTab === 'billing' && <BillingTab />}

      {/* ------------------ TAB SECURITY LOG (TRAZABILIDAD) ------------------ */}
      {activeTab === 'security' && canManageCatalog(accessLevel) && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-mi-blue/10 p-2.5 rounded-xl"><Shield size={22} className="text-mi-blue" /></div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">Log de Seguridad — Trazabilidad</h2>
              <p className="text-gray-400 text-xs font-medium">Registro en tiempo real: entradas al panel, pagos aprobados o rechazados, cambios de precio, de stock, de catálogo y de datos de cobro.</p>
            </div>
          </div>

          {adminLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Shield size={56} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">No hay eventos registrados aún.</p>
              <p className="text-sm mt-1">Los eventos de seguridad aparecerán aquí en tiempo real.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {adminLogs.map((log, i) => (
                <div
                  key={log.id ?? i}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${
                    !log.read ? 'bg-mi-blue-ice border-mi-blue-low' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="bg-mi-blue/10 p-2 rounded-xl flex-shrink-0">
                    <Shield size={16} className="text-mi-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!log.read ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                      {log.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(log.date).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  {!log.read && <span className="w-2 h-2 bg-mi-yellow rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              ))}
              <button
                onClick={clearAdminLogs}
                className="text-xs text-red-400 hover:text-red-600 font-bold mt-2 transition cursor-pointer"
              >
                Limpiar todos los registros
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && canManageCatalog(accessLevel) && (
        <>
          <SecurityCard minLength={ADMIN_MIN_PASSWORD} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-2">
            <h3 className="text-lg font-black text-gray-800">Identidad de la cuenta de administración</h3>
            <p className="text-sm text-gray-600 font-medium">
              UID de esta cuenta: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs break-all">{adminUid || '—'}</code>
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Para blindar el panel, copia este UID en <code className="bg-gray-100 px-1 rounded">firestore.rules</code> y <code className="bg-gray-100 px-1 rounded">storage.rules</code> (función <code className="bg-gray-100 px-1 rounded">isAdmin</code>) y vuelve a desplegar las reglas.
              Así no basta con conocer el correo: tiene que ser exactamente esta cuenta.
            </p>
          </div>
        </>
      )}

      {/* ------------------ TAB 1: ORDERS MANAGEMENT ------------------ */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <Package className="text-mi-blue-mid" /> Pedidos
            </h2>
            <div className="relative w-full md:max-w-sm">
              <input
                type="search"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder="Buscar por número, cliente, teléfono, referencia o factura"
                aria-label="Buscar pedidos"
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue-light/40"
              />
              <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {QUEUES.map(q => (
              <button
                key={q.key}
                onClick={() => setOrderQueue(q.key)}
                aria-pressed={orderQueue === q.key}
                title={q.help}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border transition ${
                  orderQueue === q.key ? 'bg-mi-blue text-white border-mi-blue' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {q.label} <span className={orderQueue === q.key ? 'text-white/70' : q.count > 0 && q.key !== 'todos' && q.key !== 'cerrados' ? 'text-orange-600' : 'text-gray-400'}>{q.count}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 font-medium -mt-2">{QUEUES.find(q => q.key === orderQueue)?.help}.</p>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold">No hay pedidos registrados en la tienda.</p>
              <p className="text-sm">Los pedidos que realicen los usuarios aparecerán aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider pb-4">
                    <th className="py-4 px-4">Pedido / Fecha</th>
                    <th className="py-4 px-4">Cliente</th>
                    <th className="py-4 px-4">Método de Pago</th>
                    <th className="py-4 px-4">Total</th>
                    <th className="py-4 px-4">Estado</th>
                    <th className="py-4 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-medium">
                  {visibleOrders.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-gray-400 font-bold">No hay pedidos en esta bandeja.</td></tr>
                  )}
                  {visibleOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-4">
                        <span className="font-black text-gray-800 block">#{order.id}</span>
                        <span className="text-xs text-gray-400">{order.date}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-800 font-bold block">{order.customerDetails?.name || 'Cliente'}</span>
                        <span className="text-xs text-gray-500">{order.shippingMethod === 'delivery' ? '📦 Delivery' : '🏪 Retiro'} · {order.items.length} productos</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700 font-bold block">
                          {PAYMENT_ICONS[order.paymentMethod]} {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {order.reference ? `Ref. ${order.reference}` : PAYMENT_STATUS_LABELS[effectivePaymentStatus(order)]}
                        </span>
                        {hasProof(order) && (
                          <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                            <ImageIcon size={10} /> Captura adjunta
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-black text-mi-blue-mid text-base">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Facturado' || order.status === 'Entregado' ? 'bg-green-100 text-green-700' :
                          order.status === 'En revisión' || order.status === 'Pendiente de pago' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                        {effectivePaymentStatus(order) === 'rechazado' && order.status !== 'Cancelado' && (
                          <span className="block text-[10px] font-bold text-red-600 mt-1">Comprobante rechazado</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => setSelectedOrderId(order.id)}
                          className="bg-mi-blue-mid/10 hover:bg-mi-blue-mid hover:text-white text-mi-blue-mid text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          Verificar Pedido
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------ TAB 2: INVENTORY VIEWER ------------------ */}
      {activeTab === 'inventory' && canManageCatalog(accessLevel) && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-800">Inventario de Productos</h2>
              <p className="text-gray-400 text-xs font-medium">Un solo inventario: lo que ves aquí es lo que vende la tienda (tienda + depósito + costo).</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Buscar por nombre o ID..."
                  value={inventorySearch}
                  onChange={e => setInventorySearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue-light focus:border-transparent transition"
                />
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
              </div>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-mi-blue-mid text-white font-bold px-4 py-2.5 rounded-full hover:bg-mi-blue transition shadow-md flex items-center gap-2"
              >
                <Plus size={18} /> {showAddProduct ? 'Cancelar' : 'Cargar Producto'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Unidades (tienda + depósito)</p>
              <p className="text-xl font-black text-gray-800">{inventory.totalUnits.toLocaleString('es-VE')}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Valor al costo</p>
              <p className="text-xl font-black text-gray-800">${inventory.valueAtCost.toFixed(2)}</p>
            </div>
            <button type="button" onClick={() => setInventorySearch('')} className="text-left bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Agotados / por agotarse</p>
              <p className="text-xl font-black text-red-600">{inventory.outOfStock.length} <span className="text-gray-400 text-sm">/ {inventory.lowStock.length}</span></p>
            </button>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-[11px] text-gray-400 font-bold uppercase">Sin costo cargado</p>
              <p className={`text-xl font-black ${inventory.withoutCost.length ? 'text-orange-600' : 'text-green-700'}`}>{inventory.withoutCost.length}</p>
            </div>
          </div>

          {showAddProduct && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner mb-6">
              <h3 className="text-lg font-black text-gray-800 mb-4">Añadir Nuevo Producto (Firebase en Vivo)</h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">ID del Producto (Opcional)</label>
                  <input type="text" value={addProductForm.id} onChange={e => setAddProductForm({...addProductForm, id: e.target.value})} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Ej. p123" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Nombre *</label>
                  <input type="text" value={addProductForm.name} onChange={e => setAddProductForm({...addProductForm, name: e.target.value})} className="border border-gray-200 rounded-lg p-2 text-sm" required placeholder="Ej. Manzanas Frescas" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Precio de Venta ($) *</label>
                  <input type="number" step="0.01" value={addProductForm.price} onChange={e => setAddProductForm({...addProductForm, price: Number(e.target.value)})} className="border border-gray-200 rounded-lg p-2 text-sm" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Categoría *</label>
                  <select value={addProductForm.category} onChange={e => setAddProductForm({...addProductForm, category: e.target.value})} className="border border-gray-200 rounded-lg p-2 text-sm">
                    <option value="frutas-vegetales">Frutas y Vegetales</option>
                    <option value="refrigerados-congelados">Refrigerados y Congelados</option>
                    <option value="viveres">Víveres</option>
                    <option value="cuidado-personal-salud">Cuidado Personal</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="licores">Licores</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Subcategoría</label>
                  <input type="text" value={addProductForm.subcategory} onChange={e => setAddProductForm({...addProductForm, subcategory: e.target.value})} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Opcional" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">URL de Imagen</label>
                  <input type="text" value={addProductForm.image} onChange={e => setAddProductForm({...addProductForm, image: e.target.value})} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="https://..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Unidad</label>
                  <input type="text" value={addProductForm.unit} onChange={e => setAddProductForm({...addProductForm, unit: e.target.value})} className="border border-gray-200 rounded-lg p-2 text-sm" placeholder="Ej. 1 Kg" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Stock Tienda</label>
                  <input type="number" min="0" value={addProductForm.stock} onChange={e => setAddProductForm({...addProductForm, stock: Number(e.target.value)})} className="border border-gray-200 rounded-lg p-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Stock Depósito</label>
                  <input type="number" min="0" value={addProductForm.warehouseStock} onChange={e => setAddProductForm({...addProductForm, warehouseStock: Number(e.target.value)})} className="border border-gray-200 rounded-lg p-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">Costo Proveedor ($)</label>
                  <input type="number" step="0.01" min="0" value={addProductForm.providerPrice} onChange={e => setAddProductForm({...addProductForm, providerPrice: Number(e.target.value)})} className="border border-gray-200 rounded-lg p-2 text-sm" />
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                  <button type="submit" className="bg-mi-blue-mid text-white font-bold py-2 px-6 rounded-lg hover:bg-mi-blue transition shadow-md">
                    Guardar en Firebase
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider pb-4">
                  <th className="py-4 px-4">Producto</th>
                  <th className="py-4 px-4">ID</th>
                  <th className="py-4 px-4">Categoría</th>
                  <th className="py-4 px-4">Costo (USD)</th>
                  <th className="py-4 px-4">Venta (USD)</th>
                  <th className="py-4 px-4">Margen</th>
                  <th className="py-4 px-4">Stock Tienda</th>
                  <th className="py-4 px-4">Stock Depósito</th>
                  <th className="py-4 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                {filteredProducts.map(p => {
                  const margin = productMargin(p);
                  const marginPercent = margin !== null ? margin.toFixed(0) : null;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/30 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-gray-100">
                          <img src={resolveImage(p.image)} alt={p.name} className="max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <span className="font-bold text-gray-800 truncate max-w-[180px] block" title={p.name}>{p.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-400 font-bold">{p.id}</td>
                      <td className="py-3 px-4 capitalize text-xs font-semibold">
                        <div className="text-gray-600">{p.category.replace('-', ' ')}</div>
                        {p.subcategory && (
                          <div className="text-[10px] text-gray-400 mt-0.5 font-medium">Sub: {p.subcategory}</div>
                        )}
                      </td>
                      
                      {/* Cost Price */}
                      <td className="py-3 px-4 text-gray-600 font-bold">
                        {p.providerPrice !== undefined ? `$${p.providerPrice.toFixed(2)}` : '—'}
                      </td>
                      
                      {/* Sale Price */}
                      <td className="py-3 px-4 font-black text-gray-800">${p.price.toFixed(2)} <span className="text-[10px] text-gray-400 font-bold">/ {p.unit}</span></td>
                      
                      {/* Margin */}
                      <td className="py-3 px-4">
                        {marginPercent !== null ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            Number(marginPercent) < 15 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-700'
                          }`}>
                            {marginPercent}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          (p.stock || 0) < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                        }`}>
                          {p.stock || 0} unds
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-500">{p.warehouseStock || 0} unds</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => startEdit(p)}
                          className="bg-mi-blue-mid/10 hover:bg-mi-blue-mid hover:text-white text-mi-blue-mid p-2 rounded-xl transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------ TAB 3: CSV CATALOG UPLOAD ------------------ */}
      {activeTab === 'csv' && canManageCatalog(accessLevel) && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center space-y-6 animate-in fade-in duration-300">
          <div className="text-left max-w-lg mx-auto">
            <h2 className="text-2xl font-black text-gray-800">Cargar Catálogo por CSV (Fusión)</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Actualiza o agrega productos, precios y fotos subiendo un archivo CSV. No elimina productos existentes.</p>
            <p className="text-gray-400 font-medium text-xs mt-2">
              El archivo se separa con <strong>punto y coma (;)</strong> y lleva estos encabezados:{' '}
              <code className="bg-gray-100 px-1 rounded">id;name;price;category;subcategory;image;unit;labels;description;providerPrice;stock;warehouseStock</code>.
              La plantilla y la exportación ya salen así, y se pueden volver a subir tal cual.
            </p>
          </div>
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md mx-auto aspect-[3/1] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-mi-blue transition group mb-8"
          >
            <Upload size={36} className="text-gray-300 group-hover:text-mi-blue transition mb-2" />
            <p className="text-gray-600 font-bold">Haz clic o arrastra un archivo CSV aquí</p>
          </div>

          <div className="text-left max-w-lg mx-auto mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-black text-red-600">Reemplazar Inventario (Peligro)</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Borra absolutamente todo el catálogo actual y lo reemplaza con el nuevo CSV.</p>
          </div>

          <input 
            type="file" 
            accept=".csv" 
            ref={replaceFileInputRef} 
            className="hidden" 
            onChange={handleFileReplace} 
          />
          
          <div 
            onClick={() => replaceFileInputRef.current?.click()}
            className="w-full max-w-md mx-auto aspect-[3/1] border-2 border-dashed border-red-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-500 transition group mb-8"
          >
            <Upload size={36} className="text-red-300 group-hover:text-red-500 transition mb-2" />
            <p className="text-gray-600 font-bold group-hover:text-red-600">Haz clic para Reemplazar Inventario</p>
          </div>

          <div 
            onClick={async () => {
              if (guardSample()) return;
              if (window.confirm("¿ESTÁS SEGURO? Esto eliminará todos los productos del inventario y de la base de datos de Firebase. Esta acción no se puede deshacer.")) {
                setStatus({type: 'loading', msg: 'Borrando inventario...'});
                try {
                  const { db } = await import('@/lib/firebase');
                  const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
                  const snapshot = await getDocs(collection(db, "products"));
                  const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "products", d.id)));
                  await Promise.all(deletePromises);
                  useStore.getState().setProducts([]);
                  await logAdminEvent(`🗑️ Inventario completo borrado (${snapshot.size} productos).`, 'catalog');
                  setStatus({type: 'success', msg: 'Inventario borrado exitosamente.'});
                } catch (e: any) {
                  console.error(e);
                  setStatus({type: 'error', msg: `Error borrando inventario: ${e.message}`});
                }
              }
            }}
            className="w-full max-w-md mx-auto aspect-[5/1] bg-red-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-red-700 transition shadow-lg group mb-8"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert size={24} className="text-white" />
              <p className="text-white font-black text-lg">Borrar Todo el Inventario</p>
            </div>
          </div>

          {status.type === 'success' && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 font-bold max-w-md mx-auto">
              <CheckCircle size={20} /> {status.msg}
            </div>
          )}

          {status.type === 'error' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 font-bold max-w-md mx-auto">
              <AlertTriangle size={20} /> {status.msg}
            </div>
          )}

          {status.type === 'loading' && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 font-bold max-w-md mx-auto">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></span>
              {status.msg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleDownloadTemplate}
              className="text-gray-500 font-bold bg-gray-100 px-6 py-3 rounded-xl hover:bg-gray-200 transition w-full sm:w-auto cursor-pointer"
            >
              <Download size={16} className="inline mr-1.5 -mt-0.5" /> Descargar Plantilla CSV
            </button>
            <button 
              onClick={handleExportCatalog}
              className="text-gray-500 font-bold bg-gray-100 px-6 py-3 rounded-xl hover:bg-gray-200 transition w-full sm:w-auto cursor-pointer"
            >
              <Download size={16} className="inline mr-1.5 -mt-0.5" /> Exportar catálogo actual
            </button>
            
            {status.type === 'success' && (
              <button 
                onClick={() => router.push('/')}
                className="text-white font-bold bg-mi-blue px-6 py-3 rounded-xl hover:bg-mi-blue-mid transition w-full sm:w-auto shadow-lg shadow-mi-blue/20 cursor-pointer"
              >
                Ver Tienda Actualizada
              </button>
            )}
          </div>
          
          <div className="mt-8 text-left border-t border-gray-100 pt-6 max-w-md mx-auto">
              <p className="text-sm text-gray-400 mb-2 font-bold">Resumen de Inventario:</p>
              <p className="text-xs text-gray-500">Productos actualmente cargados: <strong className="text-gray-800">{products.length}</strong></p>
          </div>
        </div>
      )}

      {/* ------------------ TAB 4: EXCHANGE RATES CONFIGURATION ------------------ */}
      {activeTab === 'rates' && canManageCatalog(accessLevel) && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-mi-blue" /> Configuración de Tasas de Cambio
              </h2>
              <p className="text-gray-500 font-medium text-sm mt-1">
                Administra cómo se actualizan y calculan los precios de la tienda en tiempo real.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isAutoRates}
                  onChange={async (e) => {
                    if (guardSample()) return;
                    const auto = e.target.checked;
                    setIsAutoRates(auto);
                    setStatus({type: 'idle', msg: ''});
                    if (auto) {
                      // Volver a automático vale para todos los clientes, no solo para este navegador.
                      try {
                        const { db } = await import('@/lib/firebase');
                        const { doc, setDoc } = await import('firebase/firestore');
                        await setDoc(doc(db, 'store', 'rates'), { auto: true, updatedAt: new Date().toISOString() });
                        await logAdminEvent('💱 Tasas en modo automático (BCV).', 'config');
                        useStore.getState().fetchRates();
                      } catch {
                        setStatus({type: 'error', msg: 'No se pudo guardar el modo automático en Firebase.'});
                      }
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-mi-blue focus:ring-mi-blue accent-mi-blue mt-0.5"
                />
                <div>
                  <span className="font-bold text-gray-800 text-sm block">Actualizar tasas automáticamente</span>
                  <span className="text-xs text-gray-500 block">
                    Consulta las tasas oficiales del Banco Central de Venezuela en tiempo real al cargar la página.
                  </span>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tasa del Dólar (USD / VES)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs.</span>
                    <input 
                      type="number"
                      step="0.01"
                      disabled={isAutoRates}
                      value={usdRateInput}
                      onChange={(e) => setUsdRateInput(e.target.value)}
                      placeholder="Ej. 587.41"
                      className="w-full bg-white disabled:bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-gray-800 focus:outline-none focus:border-mi-blue transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Tasa del Euro (EUR / VES)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Bs.</span>
                    <input 
                      type="number"
                      step="0.01"
                      disabled={isAutoRates}
                      value={eurRateInput}
                      onChange={(e) => setEurRateInput(e.target.value)}
                      placeholder="Ej. 683.03"
                      className="w-full bg-white disabled:bg-gray-100 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-bold text-gray-800 focus:outline-none focus:border-mi-blue transition"
                    />
                  </div>
                </div>
              </div>

              {isAutoRates && (
                <p className="text-xs text-mi-blue font-bold bg-blue-50 p-3.5 rounded-xl border border-blue-100">
                  💡 Las tasas están controladas automáticamente por la API del BCV (Dólar: Bs. {rates.usd.toFixed(2)} / Euro: Bs. {rates.eur.toFixed(2)}). Para configurarlas manualmente, desmarca la casilla de actualización automática.
                </p>
              )}

              {!isAutoRates && (
                <button 
                  onClick={async () => {
                    if (guardSample()) return;
                    const usdVal = parseFloat(usdRateInput);
                    const eurVal = parseFloat(eurRateInput);
                    if (isNaN(usdVal) || usdVal <= 0 || isNaN(eurVal) || eurVal <= 0) {
                      setStatus({type: 'error', msg: 'Las tasas ingresadas deben ser números mayores a 0.'});
                      return;
                    }
                    try {
                      // La tasa manual se guarda en Firebase: todos los clientes pagan con la misma.
                      const { db } = await import('@/lib/firebase');
                      const { doc, setDoc } = await import('firebase/firestore');
                      await setDoc(doc(db, 'store', 'rates'), { auto: false, usd: usdVal, eur: eurVal, updatedAt: new Date().toISOString() });
                      await logAdminEvent(`💱 Tasas manuales: USD Bs. ${usdVal.toFixed(2)} / EUR Bs. ${eurVal.toFixed(2)}.`, 'config');
                      setRates(usdVal, eurVal);
                      setStatus({type: 'success', msg: 'Tasas guardadas. Ya aplican para todos los clientes.'});
                    } catch {
                      setStatus({type: 'error', msg: 'No se pudieron guardar las tasas en Firebase.'});
                    }
                  }}
                  className="w-full bg-mi-blue text-white font-bold py-3.5 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20 cursor-pointer animate-in fade-in duration-200"
                >
                  Guardar Tasas Manuales
                </button>
              )}
            </div>

            {status.type === 'success' && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                <CheckCircle size={20} /> {status.msg}
              </div>
            )}

            {status.type === 'error' && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                <AlertTriangle size={20} /> {status.msg}
              </div>
            )}
            
            <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400 font-bold">
              Última actualización registrada: {rates.lastUpdated || 'No registrada'}
            </div>
          </div>
        </div>
      )}

      {/* ------------------ TAB 5: NOTIFICATIONS & RESTOCK ------------------ */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <Layers className="text-mi-blue" /> Actividad y Reposición
              </h2>
              <p className="text-gray-500 font-medium text-sm mt-1">
                Registro automático de ventas y reposición de inventario desde el almacén.
              </p>
            </div>
            {adminLogs.length > 0 && (
              <button 
                onClick={() => {
                  if (window.confirm('¿Limpiar todas las notificaciones?')) {
                    clearAdminLogs();
                  }
                }}
                className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
              >
                Limpiar Historial
              </button>
            )}
          </div>

          {adminLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
              <ShieldAlert size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold">No hay notificaciones recientes</p>
              <p className="text-sm">Las compras realizadas en la tienda aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminLogs.map((log) => (
                <div key={log.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="mt-1">
                    {log.message.includes('Reposición') ? (
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Package size={16} /></div>
                    ) : (
                      <div className="bg-green-100 text-green-600 p-2 rounded-full"><CheckCircle size={16} /></div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold mb-1">
                      {new Date(log.date).toLocaleString('es-VE')}
                      {log.actor && log.actor !== 'sistema' && <span className="text-mi-blue"> · {log.actor}</span>}
                    </p>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------ ORDER DETAILS / VERIFICATION MODAL ------------------ */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-gray-100 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedOrderId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Detalles y Verificación de Pedido</h3>
            <p className="text-sm font-bold text-mi-blue mb-6">#{selectedOrder.id}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: Info & Products */}
              <div className="space-y-6">
                
                {/* Contact details */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5"><UserIcon size={14} className="text-mi-blue" /> Datos de Contacto</h4>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p className="flex items-center gap-2"><strong className="text-gray-700 font-bold">Cliente:</strong> {selectedOrder.customerDetails?.name || 'Invitado'} ({selectedOrder.shippingMethod === 'delivery' ? '📦 Delivery' : '🏪 Retiro'})</p>
                    {selectedOrder.customerDetails?.cedula && <p className="flex items-center gap-2"><strong>Cédula/RIF:</strong> {selectedOrder.customerDetails.cedula}</p>}
                    <p className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> Correo: {selectedOrder.customerDetails?.email || 'N/A'}</p>
                    {selectedOrder.customerDetails?.phone && <p className="flex items-center gap-2"><strong>Teléfono:</strong> {selectedOrder.customerDetails.phone}</p>}
                  </div>
                  <div className="pt-2 border-t border-gray-200 mt-2 text-sm">
                    <span className="text-xs text-gray-400 block uppercase font-bold mb-1">Entrega</span>
                    <span className="font-medium text-gray-700">{selectedOrder.deliveryDate} · {selectedOrder.deliveryTime}{selectedOrder.zone ? ` · Zona: ${selectedOrder.zone}` : ''}</span>
                  </div>
                  {selectedOrder.shippingMethod === 'delivery' && selectedOrder.address && (
                    <div className="pt-2 border-t border-gray-200 mt-2 text-sm">
                      <span className="text-xs text-gray-400 block uppercase font-bold mb-1"><MapPin size={12} className="inline mr-1" /> Dirección</span>
                      <span className="font-medium text-gray-700">{selectedOrder.address}, {selectedOrder.zone || 'San Luis, El Cafetal'}</span>
                    </div>
                  )}
                </div>

                {/* Products */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Productos Comprados ({selectedOrder.items.length})</h4>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-3">
                          <img 
                            src={resolveImage(item.image)} 
                            alt={item.name} 
                            className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.visibility = 'hidden';
                            }}
                          />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} x ${item.price.toFixed(2)} / {item.unit}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-gray-800 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-800">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo de Envío</span>
                    <span className="font-bold text-gray-800">
                      {selectedOrder.deliveryFee > 0 ? `$${selectedOrder.deliveryFee.toFixed(2)}` : 'Gratis'}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-red-500 font-semibold">
                      <span>Descuento Club Mi Negocio</span>
                      <span className="font-bold">-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {(selectedOrder.paypalFee ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Comisión PayPal</span>
                      <span className="font-bold text-gray-800">${selectedOrder.paypalFee!.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total Pedido</span>
                    <span className="text-mi-blue text-xl">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: pago, verificación y entrega */}
              <OrderPaymentPanel key={selectedOrder.id} order={selectedOrder} onZoom={setLightboxImage} />

            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for screenshot preview */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            ✕
          </button>
          <img 
            src={lightboxImage} 
            alt="Capture full size" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200" 
          />
        </div>
      )}

      {/* ------------------ PRODUCT EDITING MODAL ------------------ */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              type="button"
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition cursor-pointer font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-gray-800 mb-1">Editar Producto</h3>
            <p className="text-xs font-bold text-mi-blue mb-6 uppercase tracking-wider">ID: {editingProduct.id}</p>

            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-sm"
                />
              </div>

              {/* Foto del producto: vista previa + subir archivo o pegar URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Foto del Producto</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                    {editForm.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImage(editForm.image)} alt="Foto actual del producto" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-300" size={28} />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${isUploadingImage ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-mi-blue-ice text-mi-blue hover:bg-mi-blue-low cursor-pointer'}`}>
                      <Upload size={16} />
                      {isUploadingImage ? 'Subiendo…' : 'Subir nueva foto'}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleEditImageUpload(f); e.target.value = ''; }}
                      />
                    </label>
                    <input
                      type="text"
                      value={editForm.image}
                      onChange={e => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="O pega una URL de imagen (https://…)"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Precio de Venta ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    min="0"
                    value={editForm.price}
                    onChange={e => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Costo Proveedor ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={editForm.providerPrice}
                    onChange={e => setEditForm(prev => ({ ...prev, providerPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Unidad (ej. 1 Kg)</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.unit}
                    onChange={e => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="edit-tax" className="block text-sm font-bold text-gray-700 mb-1.5">IVA (el precio ya lo incluye)</label>
                  <select
                    id="edit-tax"
                    value={editForm.taxRate === '' ? '' : String(editForm.taxRate)}
                    onChange={e => setEditForm(prev => ({ ...prev, taxRate: e.target.value === '' ? '' : (Number(e.target.value) as TaxRate) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-sm bg-white"
                  >
                    <option value="">Sin definir (pregunta a tu contador)</option>
                    {TAX_RATES.map(rate => <option key={rate} value={rate}>{TAX_LABELS[rate]}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Tienda</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editForm.stock}
                    onChange={e => setEditForm(prev => ({ ...prev, stock: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Stock Depósito</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={editForm.warehouseStock}
                    onChange={e => setEditForm(prev => ({ ...prev, warehouseStock: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción del Producto</label>
                <textarea 
                  rows={4}
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Escribe una descripción atractiva para este producto..."
                  className="w-full border border-gray-200 rounded-xl p-4 font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue transition text-sm resize-none"
                />
              </div>

              <div className="flex gap-4 pt-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/2 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200 transition text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-mi-blue text-white font-bold py-3 rounded-xl hover:bg-mi-blue-mid transition shadow-lg shadow-mi-blue/20 text-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ TAB 5: STATS ------------------ */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <BarChart2 className="text-mi-blue" /> Estadísticas de Productos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-bold uppercase">Ventas cobradas</p>
              <p className="text-2xl font-black text-gray-800">${totalRevenue.toFixed(2)}</p>
              <p className="text-[11px] text-gray-500 font-medium">{paidOrders.length} pedidos con pago confirmado (incluye envío y comisiones)</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-bold uppercase">Costo de lo vendido</p>
              <p className="text-2xl font-black text-gray-800">${profit.cost.toFixed(2)}</p>
              <p className="text-[11px] text-gray-500 font-medium">Con el costo de proveedor de cada producto</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-bold uppercase">Ganancia real</p>
              <p className="text-2xl font-black text-green-700">${profit.profit.toFixed(2)}</p>
              <p className="text-[11px] text-gray-500 font-medium">(precio − costo) × unidades</p>
            </div>
          </div>
          {profit.linesWithoutCost > 0 && (
            <p className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-xl p-3">
              {profit.linesWithoutCost} líneas vendidas (${profit.revenueWithoutCost.toFixed(2)}) son de productos sin costo cargado y no entran en la ganancia.
              Completa el &quot;Costo Proveedor&quot; en Inventario para que la cifra sea exacta.
            </p>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider pb-4">
                  <th className="py-4 px-4">Producto</th>
                  <th className="py-4 px-4 text-center">Vistas</th>
                  <th className="py-4 px-4 text-center">Ventas</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm font-medium">
                {[...products].sort((a,b) => ((b.views || 0) + (b.sales || 0)) - ((a.views || 0) + (a.sales || 0))).map((product) => {
                  const views = product.views || 0;
                  const sales = product.sales || 0;
                  const isStagnant = views === 0 && sales === 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-800 block">{product.name}</span>
                        <span className="text-xs text-gray-400">{product.id}</span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-gray-600">{views}</td>
                      <td className="py-4 px-4 text-center font-bold text-gray-600">{sales}</td>
                      <td className="py-4 px-4 text-center">
                        {isStagnant ? (
                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-[10px] uppercase font-black">Estancado</span>
                        ) : sales > 0 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] uppercase font-black">Vendido</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] uppercase font-black">Solo Visto</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
