"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { AlertTriangle, ArrowDownToLine, CheckCircle, ClipboardCheck, Download, PackageMinus, PackagePlus, Search, Store, Trash2, Upload, Warehouse } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { availableStock } from '@/lib/commerce';
import {
  COUNT_DELIMITER,
  MOVEMENT_LABELS,
  buildCountSheet,
  compareCount,
  parseCountRows,
  type CountComparison,
  type MovementType,
} from '@/lib/stockCount';
import { StockError, adjustStock, applyCount, subscribeStockMovements, type StockMovement } from '@/lib/warehouse';

const inputClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue/20 focus:border-mi-blue transition bg-white';

const ACTIONS: { type: MovementType; label: string; help: string; icon: typeof PackagePlus; quantityLabel: string }[] = [
  { type: 'entrada', label: 'Llegó mercancía', help: 'Suma unidades que entregó el proveedor.', icon: PackagePlus, quantityLabel: 'Unidades que entraron' },
  { type: 'venta_tienda', label: 'Se vendió en tienda', help: 'Resta lo que se facturó en el mostrador y no pasó por la página.', icon: Store, quantityLabel: 'Unidades vendidas' },
  { type: 'merma', label: 'Merma o daño', help: 'Resta producto vencido, roto o perdido.', icon: PackageMinus, quantityLabel: 'Unidades perdidas' },
  { type: 'conteo', label: 'Lo conté', help: 'Deja el número exacto que hay en el estante.', icon: ClipboardCheck, quantityLabel: 'Unidades que hay ahora' },
];

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

/**
 * Almacén: lo que el empleado necesita para que la página y el estante digan lo mismo.
 *  1. Ajuste rápido de un producto (entrada, venta en tienda, merma, conteo).
 *  2. Conteo completo o existencias del sistema de facturación, con vista previa.
 *  3. Historial de movimientos.
 */
export default function WarehouseTab() {
  const products = useStore(state => state.products);

  // ── Ajuste rápido ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<MovementType>('entrada');
  const [place, setPlace] = useState<'tienda' | 'deposito'>('tienda');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const selected = products.find(p => p.id === selectedId) ?? null;
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return products.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)).slice(0, 8);
  }, [search, products]);
  const currentAction = ACTIONS.find(a => a.type === action)!;

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !selected) return;
    setMessage(null);
    const units = Number(quantity);
    if (quantity.trim() === '' || !Number.isInteger(units) || units < 0) {
      setMessage({ type: 'error', text: 'Escribe la cantidad en unidades enteras.' });
      return;
    }
    if ((action === 'merma' || action === 'conteo') && reason.trim().length < 3) {
      setMessage({ type: 'error', text: 'Escribe el motivo: quien revise el almacén tiene que entender este ajuste.' });
      return;
    }
    setBusy(true);
    try {
      const movement = await adjustStock({ productId: selected.id, type: action, place, quantity: units, reason });
      setMessage({
        type: 'ok',
        text: `${selected.name}: tienda ${movement.stockAfter}, depósito ${movement.warehouseAfter}. La página ya muestra ${movement.stockAfter + movement.warehouseAfter} disponibles.`,
      });
      setQuantity('');
      setReason('');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof StockError ? error.message : 'No se pudo guardar el ajuste. Revisa tu conexión y tu sesión.' });
    } finally {
      setBusy(false);
    }
  };

  // ── Conteo / existencias del sistema ──────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<'conteo' | 'importacion'>('conteo');
  const [comparison, setComparison] = useState<CountComparison | null>(null);
  const [fileName, setFileName] = useState('');
  const [countError, setCountError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [countResult, setCountResult] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCountError('');
    setCountResult(null);
    setComparison(null);
    setConfirming(false);
    setFileName(file.name);
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      delimiter: COUNT_DELIMITER,
      skipEmptyLines: true,
      complete: results => {
        const first = results.data[0] ? Object.keys(results.data[0]) : [];
        if (first.length === 1 && first[0].includes(',')) {
          setCountError('El archivo está separado por comas. Guárdalo separado por punto y coma (;), como la hoja de conteo que se descarga aquí.');
          return;
        }
        const parsed = parseCountRows(results.data);
        if (parsed.errors.length > 0) {
          setCountError(`No se aplicó nada. Corrige el archivo: ${parsed.errors.slice(0, 5).join(' · ')}${parsed.errors.length > 5 ? ` · y ${parsed.errors.length - 5} más` : ''}`);
          return;
        }
        if (parsed.rows.length === 0) {
          setCountError('El archivo no trae productos. Debe tener las columnas id;name;stock;warehouseStock.');
          return;
        }
        setComparison(compareCount(products, parsed.rows));
      },
      error: () => setCountError('No se pudo leer el archivo.'),
    });
  };

  const handleApplyCount = async () => {
    if (!comparison || progress) return;
    setConfirming(false);
    setProgress({ done: 0, total: comparison.differences.length });
    try {
      const result = await applyCount(
        comparison.differences,
        source,
        `Archivo: ${fileName}`,
        (done, total) => setProgress({ done, total }),
      );
      setCountResult(
        result.failed.length === 0
          ? { type: 'ok', text: `Listo: ${result.applied} productos quedaron con el número del archivo. La página ya vende con esas existencias.` }
          : { type: 'error', text: `Se ajustaron ${result.applied}. Fallaron ${result.failed.length}: ${result.failed.slice(0, 4).map(f => f.name).join(', ')}. Vuelve a subir el archivo para reintentar esos.` },
      );
      setComparison(null);
    } catch {
      setCountResult({ type: 'error', text: 'No se pudo aplicar el conteo. Revisa tu conexión y tu sesión.' });
    } finally {
      setProgress(null);
    }
  };

  // ── Historial ─────────────────────────────────────────────────────────────
  const [movements, setMovements] = useState<StockMovement[] | null>(null);
  const [movementsError, setMovementsError] = useState(false);
  const [movementFilter, setMovementFilter] = useState('');
  useEffect(() => subscribeStockMovements(setMovements, () => setMovementsError(true)), []);
  const shownMovements = useMemo(() => {
    const q = movementFilter.trim().toLowerCase();
    const list = movements ?? [];
    return q ? list.filter(m => `${m.productName} ${m.productId} ${m.reason}`.toLowerCase().includes(q)) : list;
  }, [movements, movementFilter]);

  const outOfStock = products.filter(p => availableStock(p) === 0).length;
  const storeEmpty = products.filter(p => (p.stock || 0) === 0 && (p.warehouseStock || 0) > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-mi-blue/10 p-2.5 rounded-xl"><Warehouse size={22} className="text-mi-blue" /></div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Almacén</h2>
            <p className="text-gray-400 text-xs font-medium">
              Lo que cambies aquí lo ve la tienda en segundos. Las ventas de la página ya se descuentan solas; aquí va todo lo que pasa fuera de ella.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] text-gray-400 font-bold uppercase">Productos</p>
            <p className="text-xl font-black text-gray-800">{products.length}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] text-gray-400 font-bold uppercase">Agotados en la página</p>
            <p className={`text-xl font-black ${outOfStock ? 'text-red-600' : 'text-green-700'}`}>{outOfStock}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] text-gray-400 font-bold uppercase">Solo en depósito</p>
            <p className={`text-xl font-black ${storeEmpty ? 'text-orange-600' : 'text-green-700'}`}>{storeEmpty}</p>
            <p className="text-[11px] text-gray-400 font-medium">Hay que subirlos al estante</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-[11px] text-gray-400 font-bold uppercase">Movimientos registrados</p>
            <p className="text-xl font-black text-gray-800">{movements ? movements.length : '…'}{movements && movements.length >= 150 ? '+' : ''}</p>
          </div>
        </div>
      </div>

      {/* 1. Ajuste rápido */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-black text-gray-800">1. Ajuste rápido de un producto</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">Busca el producto, di qué pasó y cuántas unidades. Queda registrado con tu usuario y la hora.</p>
        </div>

        <div className="relative max-w-xl">
          <label htmlFor="wh-search" className="block text-xs font-bold text-gray-600 mb-1.5">Producto (nombre o código)</label>
          <div className="relative">
            <input
              id="wh-search"
              type="search"
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedId(null); setMessage(null); }}
              placeholder="Ej. harina, PRD-014"
              autoComplete="off"
              className={`${inputClass} pl-10`}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          {!selected && matches.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
              {matches.map(p => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { setSelectedId(p.id); setSearch(p.name); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-mi-blue-ice flex items-center justify-between gap-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-gray-800 truncate">{p.name}</span>
                      <span className="block text-[11px] text-gray-400 font-mono">{p.id}</span>
                    </span>
                    <span className="text-xs font-bold text-gray-500 shrink-0">Tienda {p.stock || 0} · Depósito {p.warehouseStock || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!selected && search.trim().length >= 2 && matches.length === 0 && (
            <p className="text-xs font-bold text-gray-400 mt-2">Ningún producto coincide.</p>
          )}
        </div>

        {selected && (
          <form onSubmit={handleAdjust} className="space-y-5">
            <div className="bg-mi-blue-ice border border-mi-blue-fixed rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-gray-800">{selected.name}</p>
                <p className="text-[11px] text-gray-500 font-mono">{selected.id} · {selected.unit}</p>
              </div>
              <div className="flex gap-6 text-center">
                <div><p className="text-[11px] text-gray-500 font-bold uppercase">Tienda</p><p className="text-xl font-black text-mi-blue">{selected.stock || 0}</p></div>
                <div><p className="text-[11px] text-gray-500 font-bold uppercase">Depósito</p><p className="text-xl font-black text-mi-blue">{selected.warehouseStock || 0}</p></div>
              </div>
            </div>

            <fieldset>
              <legend className="block text-xs font-bold text-gray-600 mb-2">¿Qué pasó?</legend>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {ACTIONS.map(({ type, label, help, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setAction(type); setMessage(null); }}
                    aria-pressed={action === type}
                    className={`text-left p-4 rounded-2xl border transition ${action === type ? 'border-mi-blue bg-mi-blue-ice' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Icon size={20} className={action === type ? 'text-mi-blue' : 'text-gray-400'} />
                    <span className="block font-bold text-gray-800 text-sm mt-2">{label}</span>
                    <span className="block text-[11px] text-gray-500 font-medium mt-0.5">{help}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="wh-place" className="block text-xs font-bold text-gray-600 mb-1.5">¿Dónde?</label>
                <select id="wh-place" value={place} onChange={e => setPlace(e.target.value as 'tienda' | 'deposito')} className={inputClass}>
                  <option value="tienda">Tienda (estante)</option>
                  <option value="deposito">Depósito</option>
                </select>
              </div>
              <div>
                <label htmlFor="wh-qty" className="block text-xs font-bold text-gray-600 mb-1.5">{currentAction.quantityLabel}</label>
                <input id="wh-qty" type="number" inputMode="numeric" min="0" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="wh-reason" className="block text-xs font-bold text-gray-600 mb-1.5">
                  Motivo o nota {action === 'merma' || action === 'conteo' ? '(obligatorio)' : '(opcional)'}
                </label>
                <input
                  id="wh-reason"
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={action === 'entrada' ? 'Ej. Factura de proveedor 00123' : action === 'venta_tienda' ? 'Ej. Factura de caja 004512' : action === 'merma' ? 'Ej. Vencido el 05/10' : 'Ej. Conteo del lunes'}
                  className={inputClass}
                />
              </div>
            </div>

            <button type="submit" disabled={busy} className="bg-mi-blue text-white font-bold px-8 py-3 rounded-xl hover:bg-mi-blue-mid transition disabled:bg-gray-300">
              {busy ? 'Guardando…' : 'Guardar ajuste'}
            </button>
          </form>
        )}

        {message && (
          <div role={message.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-xl flex items-center gap-2 font-bold text-sm ${message.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'ok' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} {message.text}
          </div>
        )}
      </div>

      {/* 2. Conteo completo */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-black text-gray-800">2. Cuadrar todo el almacén con un archivo</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Para el conteo físico, o para traer las existencias del sistema de facturación. Primero ves las diferencias; nada cambia hasta que confirmes.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <li className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
            <p className="font-bold text-gray-800">Paso 1 · Descarga la hoja</p>
            <p className="text-xs text-gray-500 font-medium">Trae cada producto con lo que la página cree que hay.</p>
            <button
              type="button"
              onClick={() => downloadCsv(buildCountSheet(products), `conteo-almacen-${new Date().toISOString().slice(0, 10)}.csv`)}
              className="flex items-center gap-2 text-sm font-bold text-mi-blue bg-white border border-mi-blue-fixed px-4 py-2 rounded-xl hover:bg-mi-blue-ice transition"
            >
              <Download size={15} /> Hoja de conteo
            </button>
          </li>
          <li className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
            <p className="font-bold text-gray-800">Paso 2 · Corrige los números</p>
            <p className="text-xs text-gray-500 font-medium">
              Cambia solo <code className="bg-gray-200 px-1 rounded">stock</code> (tienda) y <code className="bg-gray-200 px-1 rounded">warehouseStock</code> (depósito). O usa el archivo de existencias de tu sistema con las columnas <code className="bg-gray-200 px-1 rounded">codigo;existencia</code>.
            </p>
          </li>
          <li className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
            <p className="font-bold text-gray-800">Paso 3 · Súbela</p>
            <label htmlFor="wh-source" className="sr-only">Origen del archivo</label>
            <select id="wh-source" value={source} onChange={e => setSource(e.target.value as 'conteo' | 'importacion')} className={inputClass}>
              <option value="conteo">Es un conteo físico</option>
              <option value="importacion">Son las existencias del sistema de facturación</option>
            </select>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm font-bold text-white bg-mi-blue px-4 py-2 rounded-xl hover:bg-mi-blue-mid transition"
            >
              <Upload size={15} /> Subir archivo
            </button>
          </li>
        </ol>

        {countError && <div role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold flex items-start gap-2"><AlertTriangle size={18} className="shrink-0 mt-0.5" /> {countError}</div>}
        {countResult && (
          <div role={countResult.type === 'error' ? 'alert' : 'status'} className={`p-4 rounded-xl flex items-start gap-2 font-bold text-sm ${countResult.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {countResult.type === 'ok' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />} {countResult.text}
          </div>
        )}

        {comparison && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                <p className="text-[11px] text-green-700 font-bold uppercase">Coinciden</p>
                <p className="text-xl font-black text-green-700">{comparison.matching}</p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                <p className="text-[11px] text-orange-700 font-bold uppercase">Con diferencia</p>
                <p className="text-xl font-black text-orange-700">{comparison.differences.length}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-[11px] text-gray-500 font-bold uppercase">No están en el archivo</p>
                <p className="text-xl font-black text-gray-800">{comparison.notCounted}</p>
                <p className="text-[11px] text-gray-400 font-medium">No se tocan</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p className="text-[11px] text-gray-500 font-bold uppercase">Códigos desconocidos</p>
                <p className={`text-xl font-black ${comparison.unknownIds.length ? 'text-red-600' : 'text-gray-800'}`}>{comparison.unknownIds.length}</p>
              </div>
            </div>

            {comparison.unknownIds.length > 0 && (
              <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
                Estos códigos del archivo no existen en la página y se ignoran: {comparison.unknownIds.slice(0, 12).join(', ')}{comparison.unknownIds.length > 12 ? ` y ${comparison.unknownIds.length - 12} más` : ''}.
                Si son productos nuevos, créalos primero en Inventario o con el CSV del catálogo.
              </p>
            )}

            {comparison.differences.length === 0 ? (
              <p className="text-sm font-bold text-green-700 bg-green-50 border border-green-100 rounded-xl p-4">La página y el archivo dicen lo mismo. No hay nada que ajustar.</p>
            ) : (
              <>
                <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-100 rounded-2xl">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider">
                        <th className="py-3 px-3">Producto</th>
                        <th className="py-3 px-3 text-right">Tienda: página → archivo</th>
                        <th className="py-3 px-3 text-right">Depósito: página → archivo</th>
                        <th className="py-3 px-3 text-right">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                      {comparison.differences.slice(0, 300).map(d => (
                        <tr key={d.id}>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-gray-800 block">{d.name}</span>
                            <span className="text-[11px] text-gray-400 font-mono">{d.id}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right">{d.webStock} → <strong>{d.countedStock}</strong></td>
                          <td className="py-2.5 px-3 text-right">{d.webWarehouse} → <strong>{d.countedWarehouse}</strong></td>
                          <td className={`py-2.5 px-3 text-right font-black ${d.deltaStock + d.deltaWarehouse < 0 ? 'text-red-600' : 'text-green-700'}`}>
                            {signed(d.deltaStock + d.deltaWarehouse)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {comparison.differences.length > 300 && <p className="text-xs text-gray-400 font-bold">Se muestran las 300 diferencias más grandes de {comparison.differences.length}. Se aplican todas.</p>}

                {progress ? (
                  <p role="status" className="text-sm font-bold text-mi-blue bg-mi-blue-ice border border-mi-blue-fixed rounded-xl p-4">
                    Aplicando… {progress.done} de {progress.total}. No cierres esta pestaña.
                  </p>
                ) : confirming ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-3">
                    <p className="text-sm font-bold text-orange-900">
                      Vas a dejar {comparison.differences.length} productos con el número del archivo. La página venderá con esas existencias de inmediato. Queda un movimiento por cada producto.
                    </p>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setConfirming(false)} className="bg-white border border-gray-200 text-gray-600 font-bold px-5 py-2.5 rounded-xl text-sm">Volver</button>
                      <button type="button" onClick={handleApplyCount} className="bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-700 transition">Sí, aplicar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => setConfirming(true)} className="flex items-center gap-2 bg-mi-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-mi-blue-mid transition">
                      <ArrowDownToLine size={16} /> Aplicar {comparison.differences.length} ajustes
                    </button>
                    <button type="button" onClick={() => setComparison(null)} className="flex items-center gap-2 bg-gray-100 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition">
                      <Trash2 size={16} /> Descartar archivo
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Historial */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-gray-800">3. Movimientos del almacén</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Ajustes manuales, conteos e importaciones. Las ventas de la página están en Pedidos.</p>
          </div>
          <input
            type="search"
            value={movementFilter}
            onChange={e => setMovementFilter(e.target.value)}
            placeholder="Filtrar por producto o motivo"
            aria-label="Filtrar movimientos"
            className="w-full sm:max-w-xs bg-gray-50 border border-gray-200 rounded-full py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-mi-blue-light/40"
          />
        </div>

        {movementsError ? (
          <p role="alert" className="text-sm font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl p-4">
            No se pudieron leer los movimientos. Hace falta desplegar las reglas nuevas de Firestore (colección stockMovements).
          </p>
        ) : !movements ? (
          <p className="text-sm text-gray-400 font-bold py-6 text-center">Cargando movimientos…</p>
        ) : shownMovements.length === 0 ? (
          <p className="text-sm text-gray-400 font-bold py-6 text-center">Todavía no hay movimientos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase font-black tracking-wider">
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Producto</th>
                  <th className="py-3 px-3">Movimiento</th>
                  <th className="py-3 px-3 text-right">Tienda</th>
                  <th className="py-3 px-3 text-right">Depósito</th>
                  <th className="py-3 px-3">Motivo</th>
                  <th className="py-3 px-3">Quién</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {shownMovements.map(m => (
                  <tr key={m.id}>
                    <td className="py-2.5 px-3 text-xs whitespace-nowrap">{new Date(m.date).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-gray-800 block">{m.productName}</span>
                      <span className="text-[11px] text-gray-400 font-mono">{m.productId}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs font-bold">{MOVEMENT_LABELS[m.type] ?? m.type}</td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className={m.deltaStock < 0 ? 'text-red-600 font-black' : m.deltaStock > 0 ? 'text-green-700 font-black' : 'text-gray-400'}>{signed(m.deltaStock)}</span>
                      <span className="text-[11px] text-gray-400"> → {m.stockAfter}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className={m.deltaWarehouse < 0 ? 'text-red-600 font-black' : m.deltaWarehouse > 0 ? 'text-green-700 font-black' : 'text-gray-400'}>{signed(m.deltaWarehouse)}</span>
                      <span className="text-[11px] text-gray-400"> → {m.warehouseAfter}</span>
                    </td>
                    <td className="py-2.5 px-3 text-xs">{m.reason || '—'}</td>
                    <td className="py-2.5 px-3 text-xs break-all">{m.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
