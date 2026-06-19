'use client';

import { useEffect } from 'react';
import { collection, onSnapshot, query, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useStore, Order, AdminLog } from '@/store/useStore';
import { ProductRepository } from '@/core/infrastructure/repositories/ProductRepository';

export default function FirebaseSync() {
  const setProducts = useStore(state => state.setProducts);
  const setOrders = useStore(state => state.setOrders);
  const setAdminLogs = useStore(state => state.setAdminLogs);
  const login = useStore(state => state.login);
  const logout = useStore(state => state.logout);

  useEffect(() => {
    console.log("FirebaseSync montado. Suscribiendo a colecciones...");

    // 1. Productos a través de Clean Architecture
    const unsubProducts = ProductRepository.subscribeToAllProducts((prods) => {
      setProducts(prods as any);
    });

    // 2. Autenticación y Perfil de Usuario en Tiempo Real
    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Escuchar el documento del usuario en Firestore en tiempo real
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubUserDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            login(snap.data() as any);
          } else {
            // Documento no existe (puede estar a mitad de registro o ser admin local)
            if (firebaseUser.email === 'admin@jomstudio.com') {
               login({ id: 'admin', name: 'Administrador', email: 'admin@jomstudio.com', clubPoints: 0, clubLevel: 'Oro' } as any);
            }
          }
        });
      } else {
        if (unsubUserDoc) {
          unsubUserDoc();
          unsubUserDoc = null;
        }
        // No forzamos logout general por si hay navegación local, pero aquí se podría manejar.
      }
    });

    // 3. Órdenes
    let previousOrders: Record<string, string> = {};
    const qOrders = query(collection(db, "orders"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ords: Order[] = [];
      snapshot.forEach(doc => {
        const order = doc.data() as Order;
        ords.push(order);

        if (previousOrders[order.id] && previousOrders[order.id] !== order.status) {
          if (useStore.getState().user?.id !== 'admin') {
            useStore.getState().addUserNotification({
              title: `Pedido ${order.id}`,
              message: `El estado de tu pedido ha cambiado a: ${order.status}`
            });
          }
        }
        previousOrders[order.id] = order.status;
      });
      // Ordenar localmente por fecha
      ords.sort((a, b) => {
        const timeA = a.createdAt || new Date(a.date).getTime();
        const timeB = b.createdAt || new Date(b.date).getTime();
        if (isNaN(timeA) || isNaN(timeB)) return 0;
        return timeB - timeA;
      });
      setOrders(ords);
    });

    // 4. Logs de Admin
    const qLogs = query(collection(db, "adminLogs"));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const logs: AdminLog[] = [];
      snapshot.forEach(doc => {
        logs.push(doc.data() as AdminLog);
      });
      logs.sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        if (isNaN(timeA) || isNaN(timeB)) return 0;
        return timeB - timeA;
      });
      setAdminLogs(logs);
    });

    return () => {
      unsubProducts();
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
      unsubOrders();
      unsubLogs();
    };
  }, [setProducts, setOrders, setAdminLogs, login, logout]);

  return null;
}
