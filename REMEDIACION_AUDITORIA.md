# Mi Negocio — Remediación de la auditoría (6 de octubre de 2026)

Este documento explica qué se cambió, qué falta por hacer **a mano** para que quede activo en producción, y qué riesgos siguen abiertos. El código está en `frontend/`. El respaldo del estado anterior está en `backups/respaldo-2026-10-06-pre-auditoria.tgz` y en el commit `d98137c` de git.

## 1. Lo que tienes que hacer tú, en este orden

Nada de esto se puede hacer desde el código: son acciones en Firebase o decisiones del negocio.

1. **Cambia hoy la clave de administración.** La clave anterior estaba escrita en la página publicada y en el historial del repositorio, así que hay que darla por conocida. Firebase Console → Authentication → Users → `admin@jomstudio.com` → restablecer contraseña (12 caracteres o más). Si esa cuenta no existe, créala ahí mismo: mientras no exista, cualquiera podría registrarla.
2. **Prueba en tu computadora.** Doble clic en `INICIAR_MI_NEGOCIO.command` y abre `http://localhost:3000`.
3. **Carga los datos reales de cobro.** Entra a `/mi-negocio-admin` → pestaña **Cobros**. Los datos bancarios de ejemplo se quitaron de la página; hasta que cargues los reales, la tienda solo ofrece efectivo. En la misma pestaña van el RIF, el teléfono y el WhatsApp del negocio.
4. **Publica el sitio** (commit y push a `main`; GitHub Pages lo despliega solo).
5. **Despliega las reglas justo después**, cuando el sitio nuevo ya esté arriba:
   ```bash
   cd frontend
   npx firebase-tools deploy --only firestore:rules
   # si tienes Firebase Storage activado, además:
   npx firebase-tools deploy --only storage
   ```
   Si pide iniciar sesión: `npx firebase-tools login`. El orden importa: las reglas nuevas rechazan los pedidos del sitio viejo (porque no traen `uid` y nacían "Facturado").
6. **Comprueba las reglas:** `npm run check:rules` (se conecta sin sesión y verifica que el catálogo ya no se puede modificar, que los pedidos no se pueden leer, etc.).
7. **Blinda al administrador por UID.** En el panel → Trazabilidad aparece el UID de la cuenta admin. Cópialo en `isAdmin()` de `firestore.rules` y `storage.rules` (hay un comentario que dice dónde) y vuelve a desplegar.

## 2. Qué quedó hecho, función por función

| # | Función de la auditoría | Estado | Dónde |
|---|---|---|---|
| 1 | Catálogo seguro | Hecho. Lectura pública; precio, alta y baja solo admin. El público solo puede sumar una vista; un cliente con sesión solo puede descontar stock en la misma cantidad que suben las ventas. | `firestore.rules` |
| 2 | Una sola puerta admin | Hecho. Sin clave en el código, sin crear el usuario desde el navegador, el panel solo abre si Firebase confirma el correo. Si se entra con una clave de menos de 12 caracteres, obliga a cambiarla. `signOut()` real. | `mi-negocio-admin/page.tsx`, `login/page.tsx`, `useStore.ts` |
| 3 | Pedido que el cliente puede ver | Hecho. El pedido guarda `uid`; el cliente solo escucha sus pedidos; pedidos y registro del panel solo se escuchan con sesión de admin. | `FirebaseSync.tsx`, `lib/orders.ts` |
| 4 | Pago manual verificable | Hecho. Se guardan referencia, banco/teléfono/correo de quien pagó, moneda, tasa, monto en Bs y ruta de la captura. El admin aprueba, o rechaza el comprobante y lo pide de nuevo; el cliente lo reenvía desde Mi cuenta. | `checkout/page.tsx`, `components/admin/OrderPaymentPanel.tsx`, `components/account/ResubmitProof.tsx` |
| 5 | Sin cobro falso | Hecho. Se quitó el formulario de tarjeta, el botón falso de PayPal y el `[Binance QR]`. Ningún pedido nace "Facturado" (lo impiden el código y las reglas). | `lib/commerce.ts` (`initialStatusFor`), `firestore.rules` |
| 6 | Puntos reales | Hecho. Puntos y nivel se escriben en `users/{uid}` en la misma transacción del pedido. Un solo criterio: 0–199 Bronce, 200–499 Plata, 500+ Oro, usado en cuenta, checkout, banner, CRM y reglas. Envío gratis: 15 USD en todas partes. | `lib/commerce.ts`, `lib/orders.ts` |
| 7 | Stock antes de vender | Hecho. Se comprueba en pantalla y de nuevo dentro de la transacción; el mensaje muestra el máximo y ofrece ajustar. | `lib/orders.ts`, `checkout/page.tsx` |
| 8 | Datos de cobro en el panel | Hecho. Pestaña **Cobros**. `/pagos`, el inicio y el checkout leen de ahí. Un método sin datos completos no se ofrece. | `lib/paymentConfig.ts`, `components/admin/PaymentConfigTab.tsx` |
| 9 | CSV usable | Hecho. Plantilla, exportación y lector usan `;` y los mismos encabezados. Acepta decimales con coma. Detecta archivos separados por comas y no carga nada a medias. | `lib/catalogCsv.ts` |
| 10 | CRM conectado | Hecho. Lee `users`, lo une con los pedidos reales; niveles Bronce/Plata/Oro. | `lib/clientsDb.ts`, `components/admin/CrmTab.tsx` |
| 11 | Un solo inventario | Hecho. El inventario es `products`. La ganancia sale de (precio − costo) × unidades de pedidos cobrados; lo que no tiene costo cargado se avisa aparte. | `lib/inventoryDb.ts`, panel → Inventario y Estadísticas |
| 12 | Cuenta del cliente | Hecho. Cierre de sesión real, pedidos filtrados, detalle con estado de pago, sin "frutería", Seguridad cambia la contraseña. | `account/page.tsx`, `components/account/SecurityCard.tsx` |
| 13 | Entrega | Hecho. Fecha mínima hoy, zona guardada en el pedido, zona sin reparto → solo retiro. | `checkout/page.tsx` |
| 14 | Factura, devolución, aviso | Parcial. Comprobante imprimible/PDF del pedido (no es factura fiscal). Devolución que repone stock y revierte puntos. Aviso al cliente en la campana cuando cambia el pago o el estado, y botón de WhatsApp para el admin. | `components/OrderReceipt.tsx`, `lib/orders.ts` |

Además: "Olvidé mi contraseña", verificación de correo (se envía, no bloquea), casilla obligatoria de términos al registrarse, validación de cédula (V-/E-/J-) y teléfono (11 dígitos), y registro en Trazabilidad de entradas al panel, pagos, cambios de precio, de stock, de catálogo, de tasas y de datos de cobro.

## 3. Correcciones que no estaban en la auditoría

- **La tasa manual solo valía en el navegador del admin.** Ahora se guarda en Firebase y aplica a todos.
- **Sin tasa real no se cobra en bolívares.** Antes, si fallaba la API, se mostraba un "monto exacto" calculado con una tasa de arranque.
- **Editar un producto podía borrar una venta.** Se reescribía el producto completo; ahora solo viajan los campos editados.
- **Rutas de imagen con prefijo doble** al editar o fusionar el catálogo en producción.
- **Datos de contacto de relleno** (RIF `J-12345678-9`, teléfono y WhatsApp ficticios) en el pie, el inicio y cuatro páginas: ahora salen del panel y, si no están cargados, no se muestran.
- **`push_to_firestore.ts` tenía la clave de admin escrita.** Ahora la lee de la variable `ADMIN_PASSWORD`.
- **`/delivery` prometía tarifas por zona que el checkout no aplica.** Ahora muestra lo que el checkout hace: San Luis y El Cafetal con reparto; el resto, retiro.

## 3 bis. Segunda ronda: huecos de la contra-auditoría

| Hueco | Qué se hizo |
|---|---|
| 5. Reemplazar la captura después de aprobada | Cerrado. Cada envío crea un documento nuevo en `paymentProofs` y las reglas prohíben modificarlo. La captura anterior queda como evidencia. |
| 6. Revivir un pedido cancelado | Cerrado en las reglas: ni la cuenta de administración puede pasar un pedido de "Cancelado" a otro estado ni desmarcar el stock devuelto. |
| 7. Importar un CSV pisa ventas | Cerrado. La fusión actualiza solo los campos que trae el archivo; vistas, ventas y el stock que el archivo no menciona no se tocan. |
| 8. Llenar el registro del panel | Cerrado. Un cliente solo puede escribir una línea por pedido, con id fijo `pedido-<número>`, y solo en la misma operación en que crea ese pedido a su nombre. |
| 9. Reintentos que ocultan un rechazo | Cerrado. Un `permission-denied` se muestra de inmediato y queda en la consola. El número de pedido pasa a 8 dígitos (`MINE-12345678`) para que no haga falta reintentar por coincidencias. |
| 10. Tarjeta sin siguiente paso | Acotado. No se puede encender sin escribir cómo se enviará el enlace de cobro; el pedido aparece en "Pagos por verificar". Sigue siendo un cobro manual: no hay pasarela. |
| 4. Vaciar el stock sin pedido | **Sigue abierto.** Atar cada descuento de stock a un pedido cuesta una consulta de reglas por producto, y Firestore permite 20 por operación: los carritos de más de unos 15 productos distintos empezarían a fallar. Además no impediría un pedido falso. Se cierra con una Cloud Function. |
| 3. Precios de línea | **Sigue abierto**, por la misma razón: las reglas no pueden recorrer las líneas del pedido. |
| 1 y 2. Clave vieja y cuenta admin | No son de código: se cierran con los pasos 1 y 7 de la sección 1. |

## 3 ter. Tercera ronda: almacén, facturación y facilidad de uso

Con Firebase en el plan gratis y sin conocer todavía el sistema de facturación. Detalle en `INSTRUCCION_MAESTRA.md` e `INTEGRACION_FACTURACION.md`.

| Área | Qué se agregó |
|---|---|
| Almacén (pestaña nueva) | Ajuste rápido de un producto (llegó mercancía, se vendió en tienda, merma, conteo), cuadre de todo el almacén con un archivo —con vista previa de diferencias antes de aplicar— e historial de movimientos con usuario, hora y motivo. |
| Facturación (pestaña nueva) | Cola de pedidos cobrados sin factura, registro del número de factura y de control (sin repetir números), aviso de cancelados que requieren nota de crédito, y exportación mensual con base e IVA por línea. |
| IVA por producto | Campo `taxRate` (16 %, 8 % o exento) en Inventario → editar. Sin definir, la exportación no inventa el impuesto. |
| Pedidos | Buscador y siete bandejas de trabajo con contador. |
| Clientes | Ficha por cliente: contacto, WhatsApp, pedidos y nota interna que el cliente no puede leer. |
| Cliente | Seguimiento del pedido en cinco pasos, "Repetir este pedido", y botones de copiar para los datos y el monto del pago. |
| Reglas | `stockMovements` (solo admin; no se editan ni se borran) y `customerNotes` (solo admin). |
| Plantilla CSV | Los códigos de ejemplo ya no pueden coincidir con productos reales. |

**Lo que esto no es:** la página sigue sin emitir facturas fiscales y sin enterarse sola de las ventas del mostrador. Registra el número de factura que emite tu sistema y recibe las existencias por ajuste o por archivo.

## 4. Decisiones que tomé y puedes cambiar

- **350 puntos de bienvenida = nivel Plata.** Con un solo criterio, un cliente nuevo empieza en Plata. Si prefieres que empiece en Bronce, baja `WELCOME_POINTS` en `src/lib/commerce.ts` (y el tope `<= 350` en `firestore.rules`).
- **PayPal y Binance son pagos manuales verificados** (el cliente paga en su app y pega el ID); nacen "En revisión". Tarjeta nace "Pendiente de pago" y está apagada: no hay pasarela conectada.
- **Los puntos se ganan al crear el pedido** (como pide la auditoría) y se revierten si el pedido se cancela.
- **"Agotado" significa sin unidades en tienda ni en depósito.**
- **Tope de 5.000 USD por pedido en línea.**

## 5. Riesgos que siguen abiertos

Sin un servidor propio (Cloud Functions), el navegador del cliente sigue siendo quien escribe el pedido. Las reglas cierran lo principal, pero no todo:

- Un cliente con conocimientos técnicos puede crear un pedido con precios inventados (el admin lo ve al verificar y lo cancela), ganar puntos con él hasta que se cancele, o poner en cero el stock de un producto.
- El administrador se identifica por correo. El paso 7 de arriba lo ata al UID.
- No hay cobro automático con tarjeta, PayPal ni cripto; ni roles de personal, segundo factor, cupones, factura fiscal, ni avisos automáticos por WhatsApp o correo.

La solución de fondo para los dos primeros puntos es mover la creación del pedido a una Cloud Function (requiere plan Blaze).

## 6. Cómo comprobar

```bash
cd frontend
npm test              # 33 pruebas: totales, puntos, stock, niveles, CSV, conteo de almacén, base e IVA
npm run typecheck     # TypeScript
npm run check:rules   # reglas en producción, después de desplegarlas
```

Lo que se verificó al entregar: TypeScript sin errores, las 33 pruebas en verde, ESLint sin errores nuevos de hooks, y una revisión independiente del código y de las reglas. **No se pudo abrir la tienda en el navegador ni ejecutar `next build`** (el servidor local no estaba encendido y el entorno de trabajo no tiene red para instalar dependencias), ni probar las reglas en un emulador. Por eso el paso 2 y el paso 6 son importantes.
