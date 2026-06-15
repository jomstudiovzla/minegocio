import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, writeBatch, query, where, onSnapshot, increment } from 'firebase/firestore';
import { ProductSchema, ProductEntity } from '@/core/domain/entities/Product';

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
    const safeData = ProductSchema.partial().parse(data);
    
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, safeData);
  }

  /**
   * Crear o sobrescribir un producto
   */
  static async setProduct(product: ProductEntity) {
    const safeProduct = ProductSchema.parse(product);
    const docRef = doc(db, this.collectionName, safeProduct.id);
    await setDoc(docRef, safeProduct);
  }

  /**
   * Carga masiva de catálogo de forma segura y transaccional
   */
  static async batchUploadProducts(products: unknown[]) {
    const batch = writeBatch(db);
    let validCount = 0;
    let errorCount = 0;

    for (const p of products) {
      try {
        const safeProduct = ProductSchema.parse(p);
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
