# Auditoría de Seguridad Defensiva – Mi Negocio

## Contexto
Se realizó una auditoría de seguridad centrada en las reglas de **Firestore** y **Storage**, así como en los flujos de pedido, pago y almacén de la aplicación estática (Next.js `output: export`) desplegada en Firebase Hosting. No se utilizó Burp Suite ni escáneres de vulnerabilidades externas, pues la aplicación no cuenta con un backend tradicional donde aplicar ese tipo de pruebas.

## Hallazgos
| Severidad | Hallazgo | Estado |
|---|---|---|
| 🔴 | **Credencial de administrador expuesta** – La clave antigua quedó en el historial de git y en exportaciones públicas. | **Requiere rotación** de la clave y fijar UID del admin en las reglas. |
| 🟠 | **Precios de línea no validados** contra el catálogo oficial. | Hueco conocido; se sugiere proteger con Cloud Functions (plan Blaze). |
| 🟠 | **Descuentos de stock sin pago** – Un cliente puede descontar stock sin pasar por el flujo de pago. | Hueco conocido; se sugiere Cloud Functions para validar pagos antes de actualizar stock. |
| 🟡 | **`isAdmin: true` al crear usuario** – Un cliente podía auto‑asignarse el flag `isAdmin` al crear su ficha. | **Corregido** (ver regla modificada). |

## Correcciones realizadas
- **Regla de creación de usuarios** en `firestore.rules` actualizada para rechazar cualquier intento de establecer `isAdmin: true` durante la creación del perfil:
```rules
match /users/{uid} {
  allow create: if request.auth != null && request.resource.data.keys().hasAll(["email", "name", ...]) &&
                request.resource.data.isAdmin == false;
  // resto de reglas ...
}
```
- El archivo de reglas ahora contiene **274 líneas** con el nuevo candado booleano.
- Se sincronizó la regla al entorno local del Mac.

## Verificación
El verificador automático `check:rules` no pudo ejecutarse en la VM actual debido a problemas de `esbuild/tsx`. Sin embargo, la regla es sintácticamente válida y se ha probado manualmente con `firebase emulators:start`.

## Recomendaciones urgentes
1. **Rotar la clave** del usuario admin (`admin@jomstudio.com`) en la consola de Firebase y actualizar su UID en las reglas.
2. Implementar **Cloud Functions** (plan Blaze) para:
   - Validar precios contra el catálogo.
   - Verificar que el pago se haya completado antes de decrementar stock.
3. Añadir pruebas unitarias para los flujos críticos de pedidos y puntos.

## Próximos pasos
- **Cuentas por empleado**: definir modelo de roles y permisos en Firestore y UI.
- **Rediseño visual**: aplicar mejoras de UI/UX al sitio (p.ej., glassmorphism, micro‑animaciones).

> **¿Cuál prefieres abordar primero?**

---
*Informe generado automáticamente por Antigravity AI.*
