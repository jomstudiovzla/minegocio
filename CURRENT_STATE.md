# Estado Actual — Mi Negocio (Blindaje, Reglas Desplegadas & Sincronización GitHub)

- **Cliente Activo:** Antigravity IDE (AI Router v4.0)
- **Fase:** Producción & Sincronización Completa (Main)
- **Estado de Tareas:**
  1. **Blindaje de Reglas de Firestore ([firestore.rules](file:///Users/macbook/Documents/Antigravity/Mi%20Negocio/frontend/firestore.rules)):**
     - Añadido control anti-DoS en el backend: `request.resource.data.addresses.size() <= 5` en `validNewProfile` e `isProfileEdit`.
     - **Desplegado en producción exitosamente:** `firebase deploy --only firestore:rules --project minegocio2-c20ef`.
     - Verificado al 100% con `npm run check:rules` ("Todo como debe estar").
  2. **Persistencia de Sesión Corregida ([FirebaseSync.tsx](file:///Users/macbook/Documents/Antigravity/Mi%20Negocio/frontend/src/components/FirebaseSync.tsx)):**
     - Se corrigió el bug por el cual `onAuthStateChanged` borraba la sesión de muestra/admin local (`readSampleAdminSession`) reseteando el usuario a `null` al recargar.
  3. **Solución a `auth/argument-error` en Google Sign-In ([firebase.ts](file:///Users/macbook/Documents/Antigravity/Mi%20Negocio/frontend/src/lib/firebase.ts)):**
     - Causa identificada con rigor: `initializeAuth(app, { persistence: [...] })` no incluía `popupRedirectResolver`. Al llamar a `signInWithPopup`, el SDK de Firebase intentaba invocar `_withDefaultResolver` y lanzaba `auth/argument-error`.
     - Se agregó `browserPopupRedirectResolver` a la inicialización de `auth`.
     - En `login/page.tsx` se añadió `provider.setCustomParameters({ prompt: 'select_account' })` y captura explícita de `auth/argument-error`.
  4. **Subida Completa a GitHub (`origin/main`):**
     - Commits `0a97803` y `960e0da` commiteados y enviados a GitHub `main`.
  5. **Firebase Storage:**
     - El proyecto configurado en el código es **`minegocio2-c20ef`**. Para activar Storage, se debe hacer clic en "Get Started" específicamente en `https://console.firebase.google.com/project/minegocio2-c20ef/storage`.
