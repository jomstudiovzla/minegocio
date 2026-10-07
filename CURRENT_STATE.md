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
  3. **Diagnóstico & Robustez en Google Sign-In ([login/page.tsx](file:///Users/macbook/Documents/Antigravity/Mi%20Negocio/frontend/src/app/login/page.tsx)):**
     - Agregado reporte detallado de errores en pantalla y consola (`auth/popup-blocked`, `auth/operation-not-allowed`, etc.) en lugar de alertas opacas.
     - Nota: En ventanas de previsualización o webviews embebidas, el navegador bloquea las ventanas emergentes (`auth/popup-blocked`), por lo que el inicio de sesión con correo/contraseña o permitir ventanas emergentes resuelve el acceso de inmediato.
  4. **Subida Completa a GitHub (`origin/main`):**
     - Todos los cambios de ambas fases (editor de fotos de producto en admin, libreta de direcciones para clientes, suite de 66 tests, workflows) están commiteados (`0a97803`) y enviados a GitHub `main`.
  5. **Firebase Storage:**
     - El despliegue de `storage.rules` reporta que Firebase Storage requiere ser activado con 1 clic en Firebase Console (`minegocio2-c20ef/storage -> Get Started`). Una vez activado allí, las reglas de storage se sincronizan sin problemas.
