# Mi Negocio — Departamentos y subagentes

Fecha: 6 de octubre de 2026. Este documento sustituye a `DEPARTMENT_PLAN.md`.
Los roles, los niveles y las células de calidad y seguridad están en `ORGANIGRAMA.md`. Este archivo sigue siendo el mapa del código.
Cada departamento nombra el archivo real, la función que le toca y la prueba que dice “listo”.
Nada de aquí está publicado todavía: el arreglo sigue sin commit, las reglas no están desplegadas y el buzón del dominio no está en la bóveda de credenciales.

La tienda que manda es `frontend/`. El catálogo en vivo sale de Firestore (`products`), no de `mockDb.ts`. `mockDb.ts` aporta las categorías y un catálogo de respaldo. Las fotos públicas viven en `frontend/public/images/products/scraped/`.

## 0. Lo mínimo que ya tiene que funcionar

Antes de abrir un departamento nuevo, estos ocho pasos son la tienda usable:

1. Rotar la clave de `admin@jomstudio.com` en Firebase (`minegocio2-c20ef`). Doce caracteres o más. No volver a escribirla en el código.
2. Un visitante ve productos en `/` y solo efectivo en `/pagos`, hasta que Cobros tenga datos reales.
3. Un cliente se registra, compra y, si el guardado falla, conserva el carrito.
4. Ningún pedido nace Facturado. El admin aprueba el pago y entonces sí.
5. El cliente ve solo sus pedidos. Cierra sesión de verdad.
6. El panel abre solo si Firebase acepta el correo de admin.
7. Commit del árbol `frontend/`, rebuild, publicar, y después desplegar `frontend/firestore.rules` y `frontend/storage.rules`.
8. Cargar Pago Móvil, Zelle o transferencia reales en la pestaña Cobros.

## 1. Seguridad y accesos

Subagentes: Portero, Reglas, Personal.

| Subagente | Función | Archivo | Listo cuando |
|---|---|---|---|
| Portero | Una sola cuenta admin por correo. El panel no se abre si Firebase niega la clave. Salir llama a `signOut`. | `src/app/mi-negocio-admin/page.tsx`, `src/app/login/page.tsx`, `src/store/useStore.ts` | Una clave equivocada deja el formulario. La buena abre Trazabilidad con “Inicio de sesión en el panel”. |
| Reglas | Precio, alta y baja de producto solo admin. El cliente lee sus pedidos. La cola de correo no permite elegir otro destinatario. | `frontend/firestore.rules`, `frontend/storage.rules` | `npm run check:rules` dice que todo está en orden, y solo después de desplegar. |
| Personal | Todavía no existe. El siguiente modelo es `staff/{uid}` con rol cajero, almacén o dueño. El cajero no ve Cobros ni Tasas. | Aún no hay colección | Un cajero entra con su correo y cada movimiento lleva su nombre. |

La pared de 12 caracteres es una bandera en el navegador (`mn-admin-clave-corta`). Entrar con Google con ese correo no pasa por esa pared. `isAdmin()` compara el correo, no el UID. El UID se copia desde Trazabilidad cuando la cuenta ya existe.

## 2. Catálogo y fotos

Subagentes: Fotos, Ficha, CSV.

Hoy, 6 de octubre:

- `mockDb.ts` nombra 130 fotos. Las 130 están en `frontend/public/images/products/scraped/`. Antes estaban solo en `images/products/scraped/` de la raíz; se copiaron al sitio.
- `public/data/inventario_extenso.csv` nombra 190 fotos. Las 190 están en esa misma carpeta. En total hay 1108 archivos.
- Las categorías no tienen foto: usan el ícono de `mockDb.ts` (`categories`). La foto del detalle es `product.image`.
- Lo que el cliente ve en la tienda encendida son los documentos `products` de Firestore. Si un documento apunta a otra ruta, copiar el archivo no lo cambia. Hay que corregir el campo `image` de ese documento.

| Subagente | Función | Listo cuando |
|---|---|---|
| Fotos | Cada `image` del catálogo activo resuelve a un archivo que existe. Si la foto no es del producto, se reemplaza. No se vuelve a descargar el catálogo de otro supermercado. | En `/` y en la ficha, la foto corresponde al nombre. Un archivo ausente no deja el hueco invisible: se ve el fallo. |
| Ficha | Nombre, precio, unidad, subcategoría, costo (`providerPrice`), IVA 16/8/0, stock de tienda y depósito. | Editar sin tocar el stock no pisa una venta que entró en ese momento. |
| CSV | Plantilla, export y lectura con `;` y los mismos encabezados. | Exportar y volver a subir deja el catálogo igual. |

No se corrió `download_images.ts`. Ese script lee el CSV y baja URLs `http`. El CSV actual ya usa rutas locales.

## 3. Pedidos y pagos

Subagentes: Caja, Comprobante, Estados.

| Subagente | Función | Archivo |
|---|---|---|
| Caja | Calcula totales, envío (gratis desde 15 USD), puntos y estado inicial. Relee precio y stock dentro de la transacción. | `src/lib/commerce.ts`, `src/lib/orders.ts`, `src/app/checkout/page.tsx` |
| Comprobante | Guarda referencia, quién pagó, tasa, bolívares y la ruta de la captura. La imagen no va dentro del pedido. | `orders.ts`, `storage.rules`, `components/admin/OrderPaymentPanel.tsx` |
| Estados | Efectivo: Procesando. Pago móvil, transferencia, Zelle, PayPal, Binance: En revisión. Tarjeta: Pendiente de pago, y solo si Cobros la enciende. Facturado lo pone el admin al confirmar el dinero. | `initialStatusFor` |

Ejemplo. María paga 13,00 USD por Pago Móvil, referencia `9812`, tasa 62,50. El pedido guarda `amountBs: 812.50`. No nace Facturado. El admin ve `9812` y la captura, rechaza o aprueba. Si rechaza, María reenvía desde Mi cuenta. Un pedido Cancelado no se revive reenviando el comprobante.

## 4. Almacén

Subagentes: Existencias, Huecos, Devolución de unidades.

| Subagente | Función | Listo cuando |
|---|---|---|
| Existencias | Ajuste, conteo con vista previa, historial. Una venta baja tienda + depósito en las unidades vendidas. | La hoja descargada, sin tocarla, no muestra diferencias. |
| Huecos | Compara cada línea del pedido con `stock + warehouseStock`. Si falta, ofrece hasta dos productos de la misma subcategoría que cubran la cantidad. | La carta al admin dice el nombre que falta y los dos cambios, y no ofrece un vino para reemplazar una cerveza. |
| Devolución de unidades | Cancelar repone el stock de tienda, resta ventas y devuelve los puntos. | El botón de aprobar desaparece. El pago queda `anulado` o `reembolsado`. |

El código de esta comparación está en `findStockGaps` (`src/lib/mail.ts`). No reserva el sustituto: el admin confirma el cambio con el cliente.

## 5. Correo del dominio

Subagentes: Carta al cliente, Carta al admin, Buzón.

No hay clave de buzón en `~/.jom-credentials`. `admin@jomstudio.com` es la cuenta de Firebase Auth, no un SMTP comprobado. Por eso las cartas se escriben y se encolan, y no se marcaron como enviadas.

| Qué pasa | Quién la recibe | Cuándo |
|---|---|---|
| Proceso del pedido, líneas, totales, tasa, bolívares y factura si ya tiene número | El correo de la sesión del cliente | Al crear el pedido, al aprobar o rechazar el pago, al cambiar estado y al cancelar |
| “Todo está bien. Se puede preparar.” | `admin@jomstudio.com` | Al crear el pedido, porque la transacción ya rechazó la venta sin stock |
| “Falta esto en el almacén. Se puede cambiar por A o por B.” | `admin@jomstudio.com` | El cliente pulsa **Avisar al almacén** en Mi cuenta |
| “Solicita la devolución.” | `admin@jomstudio.com` | El cliente pulsa **Pedir devolución** |

Textos de ejemplo, con el pedido de María:

Cliente, cuando el pago se aprueba y ya hay factura:

```
Hola María,

Pago aprobado
Verificamos el pago de tu pedido #MINE-48219377. Ya lo estamos preparando.

Estado: Facturado
Pago: Pago Móvil · aprobado
Referencia: 9812
Monto en bolívares: Bs. 812.50 (tasa 62.50)

Artículos
- Huevos cartón x 30 × 1 1 Unidad · $7.00
- Cerveza Polar lata × 6 1 Unidad · $6.00

Total $13.00

Factura registrada
Número: 00012345
Control: 00-0012345
```

Admin, si la Polar ya no alcanza y hay Solera y Cardenal:

```
Pedido #MINE-48219377
Cliente: María · maria@ejemplo.com · 04141234567 · V-20111222

Falta esto en el almacén:
- Cerveza Polar lata: pidió 6, hay 2. Se puede cambiar por Cerveza Solera lata o por Cerveza Cardenal lata.
```

Admin, si pide la devolución:

```
Solicita la devolución.
Si el pago ya estaba aprobado, cancela el pedido en el panel: el stock vuelve a la tienda y el pago queda como reembolsado.
```

Dónde se ve sin abrir el buzón: Mi cuenta → Ver detalle → “Correo de este pedido”. El admin las ve en Panel → Correos. Si las reglas no están publicadas, ambas pantallas lo dicen y dejan el texto local; no fingen que el correo salió.

Dónde se guarda: colección `outboundMail`. El cliente solo puede crear una carta a su propio correo de sesión, o una solicitud a `admin@jomstudio.com`. No puede poner otro destinatario. El asunto y el texto se cortan a 179 y 7999 caracteres porque la regla exige un tamaño menor a 180 y a 8000. El admin puede marcar `enviado` o `error`, y solo esos campos.

Para que salga al buzón de verdad, en la máquina de prueba y sin escribir la clave en un archivo:

```
SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS MAIL_FROM ADMIN_PASSWORD
cd frontend && npx tsx src/scripts/deliverMail.ts
```

`SMTP_PORT` tiene que ser 465 (TLS directo) o 587 (STARTTLS). Si falta algo, el script no entra a Firebase y no abre un socket. Si está todo, entra como admin, lee las cartas `pendiente` y abre SMTP. Marca `enviado` solo cuando el servidor responde 250 al contenido. Si la clave es rechazada, marca `error` y el mensaje no incluye la clave. Este turno no se ejecutó contra Firebase ni contra un buzón real: no hay host SMTP en `~/.jom-credentials`.

La campana de la tienda sigue funcionando aparte (`users/{uid}/notifications`). El correo no la reemplaza.

## 6. Facturación

Subagente: Registro fiscal.

La página no emite factura fiscal. Guarda el número que produjo el sistema del negocio: `invoice.number`, `invoice.controlNumber`, `invoice.date`. La cola “Por facturar” son pedidos cobrados, no cancelados y sin número. Repetir el mismo número en otro pedido se rechaza.

La carta del cliente incluye ese bloque solo cuando el número ya está. Mientras no esté, dice que la factura todavía no tiene número.

Archivos: `src/lib/billingExport.ts`, pestaña Facturación, `components/OrderReceipt.tsx`.

## 7. Clientes

Subagente: Ficha.

`CrmTab` lee `users` y los junta con los pedidos. Oro es el nivel de 500 puntos o más, no un monto viejo de 15000. La ficha guarda una nota interna en `customerNotes`, solo el admin.

El cliente, en Mi cuenta, ve puntos, nivel, sus pedidos, el seguimiento, el comprobante imprimible, repetir pedido, reenviar el comprobante si fue rechazado, y la carta de la sección 5.

## 8. Entrega

Subagente: Zonas.

San Luis y El Cafetal tienen reparto. Otra zona de Caracas queda en retiro. Envío 2,50 USD, gratis desde 15 USD, también en `/delivery`. La fecha no puede ser anterior a hoy.

## 9. Publicación

Subagente: Capas.

| Capa | Hoy |
|---|---|
| Disco `frontend/` | Reglas nuevas, cartas, pestaña Correos, SMTP listo sin buzón, fotos copiadas. Sin commit. |
| Git `d98137c` | La tienda vieja, con la clave en el código. |
| Firebase | Reglas viejas hasta que se desplieguen. |
| GitHub Pages | El export viejo (`_next`, `frontend/out`, HTML de la raíz) todavía puede llevar la clave. Hay que regenerar el sitio antes de publicar. |

Orden: rotar clave, commit, rebuild, publicar, desplegar reglas de `frontend/` (nunca las de `Ananas/`), cargar Cobros, copiar el UID dentro de `isAdmin()`.

## 10. Pruebas de esta ronda

`npm test`: 46 pruebas en verde. Cinco son de las cartas (incluye catálogo vacío) y ocho del protocolo SMTP, sin red.
`npm run typecheck`: sin errores.
No se abrió el navegador, no se ejecutó `next build`, no se desplegaron reglas, no se corrió `deliverMail.ts` y no se envió un correo a un buzón real.
