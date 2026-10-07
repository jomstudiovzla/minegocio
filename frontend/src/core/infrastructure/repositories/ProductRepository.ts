import { db } from '@/lib/firebase';
import { assertRealAdminWrite } from '@/lib/sampleGate';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch, query, where, onSnapshot, increment } from 'firebase/firestore';
import { ProductSchema, ProductEntity } from '@/core/domain/entities/Product';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/minegocio' : '';

/** Ruta lista para mostrar en GitHub Pages. No pone el prefijo dos veces. */
function withBasePath(image: string): string {
  if (!BASE_PATH || !image || !image.startsWith('/')) return image;
  return image.startsWith(BASE_PATH + '/') ? image : BASE_PATH + image;
}

/** Ruta tal como debe guardarse en la base: sin el prefijo del sitio. */
function stripBasePath<T extends { image?: string }>(data: T): T {
  if (!BASE_PATH || !data.image || !data.image.startsWith(BASE_PATH + '/')) return data;
  return { ...data, image: data.image.slice(BASE_PATH.length) };
}

export class ProductRepository {
  private static collectionName = 'products';

  /**
   * Suscribe a los productos de la tienda en tiempo real
   * (Solo devuelve los que están activos)
   */
  static subscribeToActiveProducts(callback: (products: ProductEntity[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      where('isActive', '==', true)
    );

    return onSnapshot(q, (snapshot) => {
      const products: ProductEntity[] = [];
      snapshot.forEach((doc) => {
        try {
          const parsed = ProductSchema.parse(doc.data());
          parsed.image = withBasePath(parsed.image);
          products.push(parsed);
        } catch (error) {
          console.error(`Error de validación (Zod) en producto ${doc.id}:`, error);
        }
      });
      callback(products);
    });
  }

  /**
   * Suscribe a TODOS los productos (útil para el panel de Admin)
   */
  static subscribeToAllProducts(callback: (products: ProductEntity[]) => void) {
    const q = query(collection(db, this.collectionName));

    return onSnapshot(q, (snapshot) => {
      const products: ProductEntity[] = [];
      snapshot.forEach((doc) => {
        try {
          const parsed = ProductSchema.parse(doc.data());
          parsed.image = withBasePath(parsed.image);
          products.push(parsed);
        } catch (error) {
          console.error(`Error de validación (Zod) en producto ${doc.id}:`, error);
        }
      });
      callback(products);
    });
  }

  /**
   * Actualizar un producto usando validación segura
   */
  static async updateProduct(id: string, data: Partial<ProductEntity>) {
    // Validamos parcialmente los datos
    const parsed = stripBasePath(ProductSchema.partial().parse(data)) as Record<string, unknown>;
    // Solo se escriben los campos que llegaron. Zod rellena valores por defecto
    // (stock 0, ventas 0…) en los que faltan, y escribirlos borraría datos reales.
    const safeData: Record<string, unknown> = {};
    for (const key of Object.keys(data) as (keyof ProductEntity)[]) {
      if (data[key] !== undefined) safeData[key] = parsed[key];
    }
    if (Object.keys(safeData).length === 0) return;
    assertRealAdminWrite();

    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, safeData);
  }

  /**
   * Crear o sobrescribir un producto
   */
  static async setProduct(product: ProductEntity) {
    assertRealAdminWrite();
    const safeProduct = stripBasePath(ProductSchema.parse(product));
    const docRef = doc(db, this.collectionName, safeProduct.id);
    await setDoc(docRef, safeProduct);
  }

  /**
   * Carga masiva de catálogo de forma segura y transaccional
   */
  static async batchUploadProducts(products: unknown[]) {
    assertRealAdminWrite();
    const batch = writeBatch(db);
    let validCount = 0;
    let errorCount = 0;

    for (const p of products) {
      try {
        const safeProduct = stripBasePath(ProductSchema.parse(p));
        const docRef = doc(db, this.collectionName, safeProduct.id);
        batch.set(docRef, safeProduct);
        validCount++;
      } catch (error) {
        console.warn('Saltando producto inválido durante carga masiva:', error);
        errorCount++;
      }
    }

    await batch.commit();
    return { validCount, errorCount };
  }

  /**
   * Fusión de un CSV con el catálogo sin pisar lo que cambia mientras tanto.
   *
   *  - Producto que ya existe: se actualizan SOLO los campos que trae el archivo.
   *    Vistas, ventas y —si el archivo no los trae— stock de tienda y depósito no
   *    se tocan, así una venta que entra durante la importación no se pierde.
   *  - Producto nuevo: se crea completo, con los valores por defecto del esquema.
   */
  static async batchMergeProducts(rows: Array<Partial<ProductEntity> & { id: string }>, existingIds: Set<string>) {
    assertRealAdminWrite();
    const batch = writeBatch(db);
    let updatedCount = 0;
    let addedCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      try {
        const docRef = doc(db, this.collectionName, row.id);
        if (existingIds.has(row.id)) {
          const parsed = stripBasePath(ProductSchema.partial().parse(row)) as Record<string, unknown>;
          const patch: Record<string, unknown> = {};
          for (const key of Object.keys(row) as (keyof ProductEntity)[]) {
            // Nunca desde un CSV: los mueve la tienda con cada visita y cada venta.
            if (key === 'id' || key === 'views' || key === 'sales') continue;
            const value = row[key];
            if (value === undefined || value === '' ) continue;
            patch[key] = parsed[key];
          }
          if (Object.keys(patch).length > 0) batch.update(docRef, patch);
          updatedCount++;
        } else {
          batch.set(docRef, stripBasePath(ProductSchema.parse(row)));
          addedCount++;
        }
      } catch (error) {
        console.warn('Saltando producto inválido durante la fusión:', row.id, error);
        errorCount++;
      }
    }

    await batch.commit();
    return { updatedCount, addedCount, errorCount };
  }

  /**
   * Reemplazo total del catálogo: elimina los productos actuales y carga los nuevos
   */
  static async batchReplaceProducts(products: unknown[]) {
    assertRealAdminWrite();
    // 1. Obtener todos los productos actuales
    const q = query(collection(db, this.collectionName));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    let deletedCount = 0;
    
    // 2. Eliminar todos los productos existentes
    snapshot.forEach((document) => {
      batch.delete(document.ref);
      deletedCount++;
    });

    let validCount = 0;
    let errorCount = 0;

    // 3. Insertar los nuevos productos
    for (const p of products) {
      try {
        const safeProduct = stripBasePath(ProductSchema.parse(p));
        const docRef = doc(db, this.collectionName, safeProduct.id);
        batch.set(docRef, safeProduct);
        validCount++;
      } catch (error) {
        console.warn('Saltando producto inválido durante reemplazo:', error);
        errorCount++;
      }
    }

    await batch.commit();
    return { validCount, errorCount, deletedCount };
  }

  /**
   * Incrementar las vistas de un producto en tiempo real
   */
  static async incrementView(id: string) {
    const docRef = doc(db, this.collectionName, id);
    try {
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (e) {
      console.warn('No se pudieron actualizar las vistas en Firebase', e);
    }
  }
}
