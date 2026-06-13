"use client";
import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { useStore } from '@/store/useStore';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Product } from '@/data/mockDb';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const setProducts = useStore(state => state.setProducts);
  const products = useStore(state => state.products);
  const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error', msg: string}>({type: 'idle', msg: ''});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        try {
          const newProducts: Product[] = results.data.map((row: any) => ({
            id: String(row.id),
            name: row.name,
            price: Number(row.price),
            category: row.category,
            subcategory: row.subcategory,
            image: row.image,
            unit: row.unit || '1 Unidad',
            labels: row.labels ? String(row.labels).split('|') : undefined
          }));
          
          setProducts(newProducts);
          setStatus({type: 'success', msg: `Se cargaron ${newProducts.length} productos exitosamente.`});
        } catch (err: any) {
          setStatus({type: 'error', msg: 'Error procesando archivo: ' + err.message});
        }
      },
      error: (error: any) => {
        setStatus({type: 'error', msg: 'Error parseando CSV: ' + error.message});
      }
    });
  };

  const handleDownloadTemplate = () => {
    const template = "id,name,price,category,subcategory,image,unit,labels\np1,Tomates Perita,3.49,frutas-vegetales,Frescos,https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400,1 Kg,Oferta|Fresco\np2,Lechosa,1.75,frutas-vegetales,Enteras,https://images.unsplash.com/photo-1615486171448-4fd1ab2c88f3?w=400,1 Kg,";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ananas-catalogo-template.csv';
    a.click();
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 min-h-[70vh]">
      <h1 className="text-4xl font-black text-gray-800 mb-2">Panel de Administración</h1>
      <p className="text-gray-500 mb-10">Sube una hoja de cálculo CSV para actualizar el catálogo de productos en tiempo real.</p>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-md mx-auto aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-ananas-green transition group mb-8"
        >
          <Upload size={48} className="text-gray-300 group-hover:text-ananas-green transition mb-4" />
          <p className="text-gray-600 font-bold">Haz clic o arrastra un archivo CSV aquí</p>
          <p className="text-sm text-gray-400 mt-2">Formatos aceptados: .csv</p>
        </div>

        {status.type === 'success' && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 font-bold">
            <CheckCircle size={20} /> {status.msg}
          </div>
        )}

        {status.type === 'error' && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 font-bold">
            <AlertTriangle size={20} /> {status.msg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleDownloadTemplate}
            className="text-gray-500 font-bold bg-gray-100 px-6 py-3 rounded-xl hover:bg-gray-200 transition w-full sm:w-auto"
          >
            Descargar Plantilla CSV
          </button>
          
          {status.type === 'success' && (
            <button 
              onClick={() => router.push('/')}
              className="text-white font-bold bg-ananas-green px-6 py-3 rounded-xl hover:bg-ananas-dark transition w-full sm:w-auto shadow-lg shadow-ananas-green/20"
            >
              Ver Tienda Actualizada
            </button>
          )}
        </div>
        
        <div className="mt-8 text-left border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-400 mb-2 font-bold">Resumen del sistema:</p>
            <p className="text-xs text-gray-500">Productos actualmente en el catálogo: <strong className="text-gray-800">{products.length}</strong></p>
        </div>
      </div>
    </div>
  );
}
