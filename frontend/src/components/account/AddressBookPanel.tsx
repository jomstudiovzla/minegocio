"use client";
import React, { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase, Users, Star, AlertCircle, Edit2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  type UserAddress,
  MAX_SAVED_ADDRESSES,
  DEFAULT_ALIASES,
  validateAddress,
  upsertAddress,
  deleteAddress,
  markAsDefaultAddress,
  sanitizeText,
  MAX_NOTES_LENGTH,
} from '@/lib/addresses';
import { DELIVERY_ZONES } from '@/lib/commerce';

const ALIAS_ICONS: Record<string, React.ReactNode> = {
  Casa: <Home size={16} className="text-mi-blue" />,
  Trabajo: <Briefcase size={16} className="text-mi-blue" />,
  Familiar: <Users size={16} className="text-mi-blue" />,
  Otra: <MapPin size={16} className="text-mi-blue" />,
};

export default function AddressBookPanel() {
  const { user } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulario de dirección
  const [alias, setAlias] = useState<string>('Casa');
  const [customAlias, setCustomAlias] = useState('');
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState('');
  const [zone, setZone] = useState('San Luis');
  const [isDefault, setIsDefault] = useState(false);

  // Formulario de datos frecuentes del perfil
  const [cedula, setCedula] = useState(user?.cedula || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [deliveryNotes, setDeliveryNotes] = useState(user?.deliveryNotes || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  React.useEffect(() => {
    if (user) {
      setCedula(prev => prev || user.cedula || '');
      setPhone(prev => prev || user.phone || '');
      setDeliveryNotes(prev => prev || user.deliveryNotes || '');
    }
  }, [user]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!user) return null;

  const savedAddresses: UserAddress[] = user.addresses || [];

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setAlias('Casa');
    setCustomAlias('');
    setAddress('');
    setReference('');
    setZone(user.zone || 'San Luis');
    setIsDefault(savedAddresses.length === 0);
    setIsEditing(true);
  };

  const handleOpenEdit = (item: UserAddress) => {
    setEditingId(item.id);
    if ((DEFAULT_ALIASES as readonly string[]).includes(item.alias)) {
      setAlias(item.alias);
      setCustomAlias('');
    } else {
      setAlias('Otra');
      setCustomAlias(item.alias);
    }
    setAddress(item.address);
    setReference(item.reference || '');
    setZone(item.zone);
    setIsDefault(!!item.isDefault);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAlias = alias === 'Otra' && customAlias.trim() ? customAlias.trim() : alias;
    const validated = validateAddress({
      id: editingId || undefined,
      alias: finalAlias,
      address,
      reference,
      zone,
      isDefault,
    });

    if (!validated.valid || !validated.sanitized) {
      showFeedback('error', validated.error || 'Dirección inválida');
      return;
    }

    const res = upsertAddress(savedAddresses, validated.sanitized);
    if (!res.success) {
      showFeedback('error', res.error || 'Error al guardar');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        addresses: res.addresses,
        // Mantener retrocompatibilidad con campos base
        ...(validated.sanitized.isDefault ? { address: validated.sanitized.address, zone: validated.sanitized.zone } : {}),
      });

      // Actualizar estado en store local
      useStore.setState(state => ({
        user: state.user ? { ...state.user, addresses: res.addresses } : null,
      }));

      setIsEditing(false);
      setEditingId(null);
      showFeedback('success', editingId ? 'Dirección actualizada con éxito' : 'Dirección guardada en tu libreta');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de red';
      showFeedback('error', 'No se pudo guardar en la base de datos: ' + msg);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = deleteAddress(savedAddresses, id);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { addresses: updated });
      useStore.setState(state => ({
        user: state.user ? { ...state.user, addresses: updated } : null,
      }));
      showFeedback('success', 'Dirección eliminada');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      showFeedback('error', 'Error al eliminar: ' + msg);
    }
  };

  const handleSetDefault = async (id: string) => {
    const updated = markAsDefaultAddress(savedAddresses, id);
    const target = updated.find(a => a.id === id);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        addresses: updated,
        ...(target ? { address: target.address, zone: target.zone } : {}),
      });
      useStore.setState(state => ({
        user: state.user ? { ...state.user, addresses: updated } : null,
      }));
      showFeedback('success', 'Dirección fijada como predeterminada');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      showFeedback('error', 'Error al actualizar predeterminada: ' + msg);
    }
  };

  const handleSaveFrequentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const cleanedCedula = sanitizeText(cedula, 20);
      const cleanedPhone = sanitizeText(phone, 20);
      const cleanedNotes = sanitizeText(deliveryNotes, MAX_NOTES_LENGTH);

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        cedula: cleanedCedula,
        phone: cleanedPhone,
        deliveryNotes: cleanedNotes,
      });

      useStore.setState(state => ({
        user: state.user
          ? {
              ...state.user,
              cedula: cleanedCedula,
              phone: cleanedPhone,
              deliveryNotes: cleanedNotes,
            }
          : null,
      }));

      showFeedback('success', 'Datos frecuentes actualizados');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      showFeedback('error', 'Error al guardar datos: ' + msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <MapPin className="text-mi-blue" />
            Mis Direcciones de Entrega
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Preguarda hasta {MAX_SAVED_ADDRESSES} direcciones para pedir con un solo clic desde el checkout.
          </p>
        </div>

        {!isEditing && savedAddresses.length < MAX_SAVED_ADDRESSES && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-mi-blue hover:bg-mi-blue-mid text-white text-sm font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Agregar Dirección
          </button>
        )}
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Formulario de Agregar / Editar Dirección */}
      {isEditing && (
        <form onSubmit={handleSaveAddress} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-5 animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <h4 className="font-bold text-gray-800 text-base">
              {editingId ? 'Editar Dirección' : 'Nueva Dirección de Entrega'}
            </h4>
            <button type="button" onClick={handleCancel} className="text-xs font-bold text-gray-400 hover:text-gray-600">
              Cancelar
            </button>
          </div>

          {/* Alias / Etiqueta */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Identificador (Alias)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DEFAULT_ALIASES.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAlias(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    alias === item
                      ? 'bg-mi-blue text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-mi-blue'
                  }`}
                >
                  {ALIAS_ICONS[item]}
                  {item}
                </button>
              ))}
            </div>
            {alias === 'Otra' && (
              <input
                type="text"
                placeholder="Ej. Casa de playa, Consultorio, Oficina 4"
                value={customAlias}
                onChange={e => setCustomAlias(e.target.value)}
                maxLength={30}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-mi-blue"
              />
            )}
          </div>

          {/* Dirección y Zona */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Dirección Completa *</label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Calle, Edificio/Quinta, Piso, Número de Apto o Casa"
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-mi-blue resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Zona / Sector *</label>
              <select
                value={zone}
                onChange={e => setZone(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-mi-blue"
              >
                {DELIVERY_ZONES.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.id} {z.hasDelivery ? '(Delivery activo)' : '(Solo retiro)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Punto de referencia */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Punto de Referencia (Opcional)</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Ej. Al lado de la panadería, portón blanco, timbre 3B"
              maxLength={140}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-mi-blue"
            />
          </div>

          {/* Marcar como default */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefaultCheck"
              checked={isDefault}
              onChange={e => setIsDefault(e.target.checked)}
              className="rounded text-mi-blue focus:ring-mi-blue cursor-pointer h-4 w-4"
            />
            <label htmlFor="isDefaultCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
              Marcar como dirección predeterminada de entrega
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-mi-blue hover:bg-mi-blue-mid text-white text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
            >
              Guardar Dirección
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Direcciones Guardadas */}
      <div className="space-y-3">
        {savedAddresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <MapPin className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-sm font-bold text-gray-600">No tienes direcciones preguardadas.</p>
            <p className="text-xs text-gray-400 mt-1">Guarda tu Casa u Oficina para no tener que escribirlas al pagar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map(item => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                  item.isDefault
                    ? 'border-mi-blue bg-mi-blue-ice/30 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="flex items-center gap-1.5 font-bold text-gray-800 text-sm">
                      {ALIAS_ICONS[item.alias] || <MapPin size={16} className="text-mi-blue" />}
                      {item.alias}
                    </span>
                    {item.isDefault && (
                      <span className="bg-mi-blue text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 leading-snug">{item.address}</p>
                  <p className="text-xs text-mi-blue font-bold mt-1">Zona: {item.zone}</p>
                  {item.reference && (
                    <p className="text-xs text-gray-500 mt-1 italic">Ref: {item.reference}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100 text-xs font-bold">
                  {!item.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(item.id)}
                      className="text-mi-blue hover:underline cursor-pointer"
                    >
                      Hacer predeterminada
                    </button>
                  ) : (
                    <span className="text-gray-400">Uso por defecto</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="text-gray-500 hover:text-mi-blue p-1 rounded-md transition"
                      title="Editar dirección"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-md transition"
                      title="Eliminar dirección"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección 2: Datos Frecuentes de Facturación y Entrega */}
      <div className="pt-6 border-t border-gray-100">
        <h4 className="text-lg font-black text-gray-800 mb-2">Datos Frecuentes de Facturación y Contacto</h4>
        <p className="text-xs text-gray-500 mb-6">
          Se autocompletan en tu pantalla de pago para que no tengas que escribirlos cada vez.
        </p>

        <form onSubmit={handleSaveFrequentInfo} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Cédula o RIF Habitual</label>
            <input
              type="text"
              value={cedula}
              onChange={e => setCedula(e.target.value)}
              placeholder="Ej. V-18234567"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-mi-blue focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Teléfono o WhatsApp Principal</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ej. 0414-1234567"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-mi-blue focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Instrucciones Frecuentes de Entrega</label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={e => setDeliveryNotes(e.target.value)}
              placeholder="Ej. Dejar con el vigilante en garita, tocar timbre 3B o llamar al llegar"
              maxLength={MAX_NOTES_LENGTH}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium focus:outline-none focus:border-mi-blue focus:bg-white resize-none"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="bg-mi-blue hover:bg-mi-blue-mid disabled:opacity-50 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
            >
              {isSavingProfile ? 'Guardando...' : 'Guardar Datos Frecuentes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
