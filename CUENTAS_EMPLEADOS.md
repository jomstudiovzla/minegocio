# Mi Negocio — Cuentas por empleado (roles y trazabilidad)

Fecha: 6 de octubre de 2026. Cierra el problema de que todos compartían la cuenta de administración y no se sabía quién hacía cada cosa.

## Qué cambia

Ahora hay tres niveles de acceso al panel:

| Nivel | Quién | Qué puede hacer |
|---|---|---|
| **Dueño** | La cuenta `admin@jomstudio.com` | Todo, incluida la pestaña **Personal** (dar y quitar acceso). |
| **Encargado** | Empleado con rol `admin` | Todo lo operativo + catálogo, precios, tasas, ofertas, trazabilidad. No gestiona personal. |
| **Empleado** | Empleado con rol `empleado` | Pedidos, Cobros, Almacén, Facturación, Clientes, Notificaciones, Estadísticas. |

Cada empleado entra con **su propia cuenta**, así cada acción (aprobar un pago, ajustar almacén, facturar, cancelar) queda registrada **a su nombre** en Notificaciones/Trazabilidad y en el pedido (`paidBy`). Eso ya estaba a medias: el registro guardaba el `actor`; ahora se muestra y tiene sentido porque cada quien tiene su cuenta.

En plan gratis no se pueden usar "custom claims" (eso necesita servidor), así que el rol vive en un documento `staff/{uid}` en Firestore. Las reglas solo dejan que el **dueño** escriba ahí: ni un encargado puede crear otro encargado ni ascenderse.

## Cómo das acceso a un empleado (3 pasos, sin tocar Firebase)

1. **El empleado se registra** en la página como cualquier cliente (botón *Registrarme* en `/login`) con su correo.
2. Tú entras al panel → pestaña **Personal** → escribes su correo → **Buscar**.
3. Eliges el rol (Empleado o Encargado) → **Dar acceso**. Listo, ya puede entrar a `/mi-negocio-admin` con su correo y clave.

Para quitar o pausar acceso: en **Personal**, *Suspender* (conserva su historial) o *Quitar* (borra el acceso; su cuenta de cliente no se toca). No hace falta crear cuentas ni claves en la consola de Firebase.

## Seguridad

- La frontera real son las reglas de Firestore y Storage, no la interfaz. Aunque alguien forzara la pantalla, no puede escribir lo que su rol no permite.
- Catálogo, precios, tasas y configuración de cobro: solo dueño y encargado (`isStaffAdmin`).
- Tareas del día (pedidos, cobros, almacén, facturación, notas de cliente): cualquier personal activo (`isStaff`).
- Borrar pedidos: solo dueño o encargado.
- Un empleado suspendido (`active: false`) deja de entrar al instante.

## Archivos tocados

| Pieza | Archivo |
|---|---|
| Roles, permisos y helpers de personal | `frontend/src/lib/staff.ts` |
| Pruebas de permisos (5 casos) | `frontend/tests/staff.test.ts` |
| Pestaña Personal del dueño | `frontend/src/components/admin/StaffTab.tsx` |
| Acceso al panel por rol + pestañas | `frontend/src/app/mi-negocio-admin/page.tsx` |
| Modo panel para empleados (todos los pedidos) | `frontend/src/components/FirebaseSync.tsx` |
| Reglas `staff/{uid}` + `isStaff`/`isStaffAdmin` | `frontend/firestore.rules` |
| Lectura de capturas por personal | `frontend/storage.rules` |

## Verificación hecha

- `tsc --noEmit`: sin errores.
- Pruebas de permisos de personal: 5/5 en verde.
- No se pudo abrir el navegador en localhost en esta sesión: el servidor de desarrollo se cayó solo (error de módulo nativo de Next/SWC) y el Mac estaba en un Space a pantalla completa. Para verlo: doble clic en `INICIAR_MI_NEGOCIO.command` y abrir `/mi-negocio-admin`.

## Para que funcione en producción (tú)

1. Rotar la clave de `admin@jomstudio.com` y fijar su UID en las reglas (sigue pendiente de la auditoría de seguridad).
2. Desplegar las reglas: `firebase deploy --only firestore:rules,storage`.
3. Cada empleado se registra una vez en la página; tú le das acceso en **Personal**.
