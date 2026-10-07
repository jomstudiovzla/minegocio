'use client';

import { useEffect } from 'react';
import { collection, onSnapshot, query, doc, where, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useStore, Order, AdminLog, User, UserNotification } from '@/store/useStore';
import { ProductRepository } from '@/core/infrastructure/repositories/ProductRepository';
import { isAdminEmail, levelForPoints, readSampleAdminSession } from '@/lib/commerce';
import { subscribePaymentConfig } from '@/lib/paymentConfig';

function sortOrders(orders: Order[]): Order[] {
  return orders.sort((a, b) => {
    const timeA = a.createdAt || new Date(a.date).getTime();
    const timeB = b.createdAt || new Date(b.date).getTime();
    if (isNaN(timeA) || isNaN(timeB)) return 0;
    return timeB - timeA;
  });
}

/**
 * Fuente única de verdad entre Firebase y la tienda.
 *
 * - Lo público (catálogo, ofertas, datos de cobro, tasas) se escucha siempre.
 * - Lo privado depende de quién confirmó Firebase que eres:
 *     · cliente → solo SUS pedidos y sus avisos;
 *     · admin   → todos los pedidos y el registro del panel.
 * - Si Firebase dice que no hay sesión, este navegador deja de mostrar la cuenta.
 *   Nadie es "admin" por lo que diga el almacenamiento local.
 */
export default function FirebaseSync() {
  useEffect(() => {
    const store = useStore.getState;

    // ── Público ────────────────────────────────────────────────────────────
    const unsubProducts = ProductRepository.subscribeToAllProducts((prods) => {
      store().setProducts(prods);
    });

    const unsubFlashOffers = onSnapshot(
      doc(db, 'store', 'flashOffers'),
      (snap) => store().setFlashOffersConfig(snap.exists() ? (snap.data() as never) : null),
      (error) => console.error('Ofertas relámpago no disponibles', error),
    );

    const unsubPaymentConfig = subscribePaymentConfig((config) => store().setPaymentConfig(config));

    // Tasas: si el admin fijó una tasa manual, vale para todos los clientes.
    const unsubRates = onSnapshot(
      doc(db, 'store', 'rates'),
      (snap) => {
        const data = snap.exists() ? snap.data() : null;
        if (data && data.auto === false && Number(data.usd) > 0 && Number(data.eur) > 0) {
          store().setIsAutoRates(false);
          store().setRates(Number(data.usd), Number(data.eur));
        } else {
          const wasManual = !store().isAutoRates;
          store().setIsAutoRates(true);
          if (wasManual) store().fetchRates();
        }
      },
      (error) => console.error('Tasas manuales no disponibles', error),
    );

    // ── Privado ────────────────────────────────────────────────────────────
    let unsubPrivate: Array<() => void> = [];
    const stopPrivate = () => {
      unsubPrivate.forEach((fn) => fn());
      unsubPrivate = [];
    };

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      stopPrivate();

      if (!firebaseUser) {
        if (readSampleAdminSession()) {
          store().setAuthReady(true);
          return;
        }
        store().clearSession();
        store().setAuthReady(true);
        return;
      }

      const uid = firebaseUser.uid;
      const email = (firebaseUser.email || '').toLowerCase();
      const admin = isAdminEmail(email);

      // Perfil
      unsubPrivate.push(
        onSnapshot(
          doc(db, 'users', uid),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              const points = Math.max(0, Math.floor(Number(data.clubPoints) || 0));
              const profile: User = {
                ...(data as User),
                id: uid,
                email: data.email || email,
                name: data.name || firebaseUser.displayName || 'Cliente',
                clubPoints: points,
                // El nivel siempre sale de los puntos: un solo criterio en toda la tienda.
                clubLevel: levelForPoints(points),
                isAdmin: admin,
              };
              store().login(profile);
            } else if (admin) {
              store().login({ id: uid, name: 'Administrador', email, clubPoints: 0, clubLevel: 'Oro', isAdmin: true });
            } else {
              // Cuenta de Auth sin ficha: /login pide los datos que faltan y la crea.
              const current = store().user;
              if (current && current.id !== uid) store().clearSession();
            }
            store().setAuthReady(true);
          },
          (error) => {
            console.error('No se pudo leer el perfil', error);
            store().setAuthReady(true);
          },
        ),
      );

      // El panel (todos los pedidos + registro) lo ve el dueño y cualquier
      // empleado activo. El cliente solo ve lo suyo.
      const startPanel = () => {
        unsubPrivate.push(
          onSnapshot(
            query(collection(db, 'orders')),
            (snapshot) => store().setOrders(sortOrders(snapshot.docs.map((d) => d.data() as Order))),
            (error) => console.error('No se pudieron leer los pedidos', error),
          ),
        );
        unsubPrivate.push(
          onSnapshot(
            query(collection(db, 'adminLogs')),
            (snapshot) => {
              const logs = snapshot.docs.map((d) => d.data() as AdminLog);
              logs.sort((a, b) => {
                const timeA = new Date(a.date).getTime();
                const timeB = new Date(b.date).getTime();
                if (isNaN(timeA) || isNaN(timeB)) return 0;
                return timeB - timeA;
              });
              store().setAdminLogs(logs);
            },
            (error) => console.error('No se pudo leer el registro del panel', error),
          ),
        );
        store().setUserNotifications([]);
      };

      const startCustomer = () => {
        // El cliente solo pide sus pedidos: la regla de Firestore exige este filtro.
        unsubPrivate.push(
          onSnapshot(
            query(collection(db, 'orders'), where('uid', '==', uid)),
            (snapshot) => store().setOrders(sortOrders(snapshot.docs.map((d) => d.data() as Order))),
            (error) => console.error('No se pudieron leer tus pedidos', error),
          ),
        );
        unsubPrivate.push(
          onSnapshot(
            query(collection(db, `users/${uid}/notifications`)),
            (snapshot) => {
              const notifs = snapshot.docs.map((d) => d.data() as UserNotification);
              notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              store().setUserNotifications(notifs);
            },
            (error) => console.error('No se pudieron leer tus avisos', error),
          ),
        );
        store().setAdminLogs([]);
      };

      if (admin) {
        startPanel();
      } else {
        // ¿Es un empleado con acceso? Se decide por staff/{uid} en Firestore.
        getDoc(doc(db, 'staff', uid))
          .then((snap) => {
            // Si la sesión cambió mientras leíamos, no montamos nada.
            if (auth.currentUser?.uid !== uid) return;
            if (snap.exists() && (snap.data() as { active?: boolean }).active === true) startPanel();
            else startCustomer();
          })
          .catch(() => {
            if (auth.currentUser?.uid === uid) startCustomer();
          });
      }
    });

    return () => {
      unsubProducts();
      unsubFlashOffers();
      unsubPaymentConfig();
      unsubRates();
      unsubAuth();
      stopPrivate();
    };
  }, []);

  return null;
}
