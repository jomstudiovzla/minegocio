# Mi Negocio — Instrucción maestra (versión 2, 6 de octubre de 2026)

Reemplaza a la "Instrucción de auditoría" original. Aquella describía una tienda con la clave en el código, pagos falsos y puntos que se perdían. Esa tienda ya no es la que está en `frontend/`. Este documento describe **lo que hay ahora, cómo comprobarlo y qué sigue**, con el mismo nivel de detalle: cada función, con ejemplo.

Documentos hermanos:
- `REMEDIACION_AUDITORIA.md` — qué se cambió y los pasos para publicar.
- `INTEGRACION_FACTURACION.md` — almacén, facturación y la ficha del sistema fiscal.

---

## 0. Las tres capas (léelo antes que nada)

Todo lo que dice este documento es cierto **en el disco**. No lo es todavía en las otras dos capas.

| Capa | Qué contiene hoy | Cómo se actualiza |
|---|---|---|
| **Disco** (`frontend/`) | La tienda corregida. Sin commit. | — |
| **Git y GitHub Pages** | Commit `d98137c`: la tienda vieja, con la clave en el código y pagos que nacen "Facturado". | Commit de `frontend/` + push a `main`. |
| **Firebase** (`minegocio2-c20ef`) | Las reglas viejas: cualquiera puede modificar el catálogo. | `firebase deploy --only firestore:rules` (y `storage`). |

Consecuencias:
1. Publicar `main` sin commitear este árbol vuelve a subir la tienda vieja.
2. Desplegar las reglas nuevas con el sitio viejo publicado rechaza todos sus pedidos.
3. Nunca se despliega el `firestore.rules` de `Ananas/`: abre la base completa.

**Lo comprobado:** TypeScript sin errores, 33 pruebas automáticas, ESLint sin errores nuevos, una revisión independiente del código y de las reglas, y la contra-auditoría externa de la primera ronda (sus huecos 5 a 10 ya están atendidos). Lo añadido después —Almacén, Facturación, bandejas, ficha de cliente, seguimiento— solo tiene pruebas automáticas y de tipos.
**Lo no comprobado:** la tienda en un navegador, `next build`, y las reglas en un emulador. La sección 9 es la lista para hacerlo.

---

## 1. Lo que ve el cliente, en orden

1. **Inicio (`/`).** Video, ofertas relámpago, categorías, productos, club. La franja de pagos muestra solo los métodos que el negocio tiene activos.
2. **Categoría, búsqueda y ficha.** "Agotado" significa cero unidades en tienda **y** en depósito. "¡Solo N!" aparece con 5 o menos. Si ya no quedan unidades, el botón de agregar no suma y no muestra el aviso de "añadido".
3. **Carrito.** El botón `+` se apaga al llegar al máximo disponible y muestra "Máx. N".
4. **Login o registro (`/login`).** Ver sección 3.
5. **Checkout (`/checkout`).** Ver sección 4.
6. **Confirmación.** Solo aparece si el pedido quedó guardado. Muestra número, estado, referencia y, si se paga en bolívares, el monto y la tasa. Botón **Ver mi pedido**.
7. **Mi cuenta (`/account`).**
   - Club: puntos, nivel y barra con el criterio único (sección 5).
   - Mis pedidos: cada uno con una frase que dice en qué va.
   - Detalle: seguimiento en cinco pasos, pago, referencia, comprobante imprimible, **Repetir este pedido** y, si el comprobante fue rechazado, formulario para reenviarlo.
   - Seguridad: cambiar contraseña, recuperar por correo, verificar correo.
8. **Campana de avisos.** Recibe un aviso cuando el pago se aprueba o se rechaza, cuando el pedido cambia de estado y cuando se cancela.

**Ejemplo completo.** María compra 18,00 USD y paga por Pago Móvil con tasa 62,50.
- El checkout le muestra banco, teléfono y RIF con botón **Copiar**, y "Monto exacto: Bs. 1.125,00" con **Copiar monto**.
- Escribe la referencia `9812`, el banco y el teléfono desde el que pagó, y sube la captura.
- El pedido queda `En revisión`. En la base: `uid`, `reference: "9812"`, `payer`, `rateUsd: 62.5`, `amountBs: 1125`, `capturePath` o `captureDocId`, `pointsEarned: 18`.
- Sus puntos pasan de 350 a 368 en `users/{uid}`, en la misma operación.
- En Mi cuenta ve: *"Estamos verificando tu pago contra la referencia que enviaste."*

---

## 2. Lo que ve el empleado

Entra por `/mi-negocio-admin`. Doce pestañas:

| Pestaña | Para qué | Detalle |
|---|---|---|
| **Pedidos** | El trabajo del día | Buscador (número, cliente, teléfono, referencia, factura) y siete bandejas: Todos, Verificar pago, Preparar, Entregar, Cobrar al entregar, Facturar, Cerrados. Cada bandeja muestra cuántos pedidos tiene. |
| **Cobros** | Datos de pago del negocio | Pago Móvil, Zelle, transferencia, Binance (con QR), PayPal, tarjeta, efectivo, y RIF/teléfono/WhatsApp del negocio. Un método incompleto no se ofrece al cliente. |
| **Almacén** | Que la página y el estante digan lo mismo | Ajuste rápido, cuadre por archivo con vista previa, historial de movimientos. |
| **Facturación** | Que todo lo cobrado tenga factura | Cola por facturar, registro del número, notas de crédito pendientes, exportación mensual con base e IVA. |
| **Ofertas relámpago** | Promociones con hora de cierre | Sin cambios. |
| **Inventario** | Catálogo | Resumen (unidades, valor al costo, agotados, sin costo), alta y edición con costo, depósito e IVA. |
| **Clientes** | CRM | Tarjetas que filtran (total, Oro, en riesgo, nuevos), niveles, buscador, y **ficha** por cliente: contacto, WhatsApp, pedidos y nota interna. |
| **Trazabilidad** | Quién hizo qué | Entradas al panel, pagos, precios, stock, catálogo, tasas, cobros y facturas. Cambio de clave y UID del admin. |
| **Cargar catálogo** | CSV | Fusión, reemplazo, plantilla y exportación con `;`. |
| **Tasas** | Dólar y euro | Automática (BCV) o manual; la manual vale para todos los clientes. |
| **Notificaciones** | Actividad | Sin cambios. |
| **Estadísticas** | Ventas y ganancia | Ventas cobradas, costo de lo vendido y ganancia real. |

### 2.1 Detalle de un pedido

- **Columna izquierda:** contacto, entrega (fecha, horario, zona, dirección), productos y totales.
- **Columna derecha:**
  1. *Detalle del pago:* método, total, referencia, banco/teléfono/correo de quien pagó, monto en Bs, tasa, captura ampliable.
  2. *Verificación:* **Aprobar pago** o **Rechazar comprobante** (con el motivo que verá el cliente). Efectivo: **Cobrado al entregar** con monto y moneda. Tarjeta: **Marcar pagado**.
  3. *Preparación y entrega:* mover a Procesando, Listo para retirar, En camino o Entregado. Un pago manual sin aprobar no se puede despachar.
  4. *Factura:* número registrado, o aviso de "cobrado y sin factura".
  5. *Contacto:* WhatsApp al cliente con el mensaje escrito; comprobante PDF.
  6. *Cancelar o devolver:* repone stock, revierte puntos y, si estaba cobrado, lo deja como "Reembolsado". Es definitivo.

### 2.2 Bandejas: a cuál cae cada pedido

| Situación del pedido | Bandeja |
|---|---|
| Pago en revisión, comprobante rechazado o pendiente de pago | Verificar pago |
| Pago aprobado, o efectivo, en estado Procesando o Facturado | Preparar |
| Listo para retirar o En camino, ya pagado | Entregar |
| Listo para retirar o En camino, en efectivo sin cobrar | Cobrar al entregar |
| Pago aprobado y sin número de factura (en cualquier estado no cancelado) | Facturar |
| Entregado o Cancelado | Cerrados |

---

## 3. Login: cada función, con ejemplo

### 3.1 Cliente en `/login`

1. **`?redirect=`.** Solo se obedecen rutas internas. `/login?redirect=/checkout` vuelve al checkout; `/login?redirect=https://otro-sitio` va a `/account`.
2. **Entrar con correo.** Error único: *"Correo o contraseña equivocada"*. Tras muchos intentos: *"Demasiados intentos. Espera unos minutos…"*.
3. **Registrarse.** Nombre (3+ letras), cédula `V-`, `E-` o `J-` más números, teléfono de 11 dígitos, correo, clave de 6+ y casilla de términos obligatoria.
   *Ejemplo válido:* María López, `v20111222` (se guarda `V-20111222`), `0414-555 0101` (se guarda `04145550101`).
   *Ejemplo rechazado:* cédula `20111222` → "debe empezar por V-, E- o J-".
4. **Ficha nueva.** `users/{uid}` con 350 puntos y nivel **Plata** (ver 5.1). Se envía el correo de verificación; no bloquea la compra.
5. **Cuenta sin ficha o ficha incompleta.** Pide nombre, cédula y teléfono. Si la ficha ya existía, solo se completan esos datos: los puntos no se tocan.
6. **Google.** Igual que antes; errores con mensaje genérico.
7. **Olvidé mi contraseña.** Envía el correo de Firebase. El mensaje es el mismo exista o no la cuenta.
8. **Correo de administración en esta pantalla.** No se prueba la clave aquí: lleva al panel. No se puede registrar ese correo desde el formulario.

### 3.2 Admin en `/mi-negocio-admin`

1. Al abrir, espera a que Firebase diga si hay sesión.
2. El formulario solo envía a Firebase el correo de administración; cualquier otro responde *"Credenciales incorrectas"* sin llamar a Firebase.
3. Nunca crea el usuario.
4. Si Firebase acepta, se registra el evento *"Inicio de sesión en el panel"*.
5. Si la clave usada tenía menos de 12 caracteres, obliga a cambiarla antes de mostrar el panel.
6. Cerrar sesión llama a `signOut()` y limpia pedidos, registro y avisos del navegador.

**Límites conocidos de la puerta admin:**
- El aviso de clave corta vive en el navegador. Quien conozca la clave vieja puede saltarlo. **La protección real es cambiar la clave en Firebase.**
- El administrador es "la cuenta con ese correo". Si la cuenta no existe en Firebase Auth, quien la registre primero es admin. Paso obligatorio: crearla o confirmar que existe, y después fijar su UID en las reglas.

---

## 4. Pago: cada función, con ejemplo

### 4.1 Checkout, paso a paso

1. **Sesión.** Sin sesión confirmada por Firebase, redirige a `/login?redirect=/checkout`.
2. **Zona.** San Luis y El Cafetal tienen reparto. "Otra zona de Caracas" solo permite retiro. La zona se guarda en el pedido.
3. **Envío.** Delivery 2,50 USD; gratis desde 15 USD. Retiro: 0.
4. **Datos.** Se rellenan desde el perfil, incluida la última dirección usada.
5. **Fecha.** Mínimo hoy. Horarios 9–12, 12–15, 15–18.
6. **Método de pago.** Solo los activos en Cobros. Si no hay ninguno, se dice y no se puede confirmar.
7. **Stock.** Si una cantidad supera lo disponible: *"pediste 6 y el máximo disponible es 4"* con botón **Dejar en 4**. No se puede confirmar hasta resolverlo.
8. **Puntos.** Hasta 350 por pedido, 0,01 USD cada uno, nunca más que el saldo ni que el subtotal.
9. **Confirmar.** Una sola transacción: relee precio y stock, guarda el pedido, descuenta stock, mueve los puntos y deja una línea en el registro. Si algo falla: *"No pudimos registrar el pedido. Tu carrito sigue intacto."*

### 4.2 Métodos

| Método | Qué muestra | Qué pide | Nace como | Pasa a Facturado cuando |
|---|---|---|---|---|
| Pago Móvil | Banco, teléfono, RIF, monto en Bs | Banco y teléfono de quien pagó, referencia (4+ dígitos), captura | En revisión | El admin aprueba |
| Transferencia | Banco, cuenta, beneficiario, RIF, monto en Bs | Banco de origen, referencia, captura | En revisión | El admin aprueba |
| Zelle | Correo y titular, monto en USD | Correo de quien pagó, confirmación (opcional), captura | En revisión | El admin aprueba |
| PayPal | Correo o enlace, total con comisión | Correo PayPal e ID de transacción | En revisión | El admin aprueba |
| Binance | QR real o Pay ID, monto en USDT | ID de orden o hash | En revisión | El admin aprueba |
| Tarjeta | Aviso: se envía un enlace de cobro | Nada | Pendiente de pago | El admin marca pagado |
| Efectivo | Monto en USD, Bs y EUR | Nada | Procesando | El admin marca "Cobrado al entregar" |

Sin tasa real (la API falló y no hay tasa manual) no se ofrece monto en bolívares y no se puede confirmar Pago Móvil ni transferencia.

**Ejemplo PayPal, misma compra de 18,00:** comisión `(18,00 + 0,30) / 0,946 − 18,00 = 1,34`. Total 19,34 USD. Puntos ganados: 18 (sobre el total base, no sobre la comisión).

### 4.3 Estados

| Estado del pedido | Estado del pago | Significa |
|---|---|---|
| En revisión | en_revision / rechazado | Esperando verificación o un comprobante nuevo |
| Pendiente de pago | pendiente | Tarjeta: esperando el cobro |
| Procesando | contra_entrega / aprobado | En preparación |
| Facturado | aprobado | Pago confirmado |
| Listo para retirar / En camino | — | En entrega |
| Entregado | — | Cerrado |
| Cancelado | anulado / reembolsado | Definitivo. Ni el admin puede revertirlo. |

---

## 5. Reglas de negocio (una sola fuente: `src/lib/commerce.ts`)

### 5.1 Club
- Bronce 0–199, Plata 200–499, Oro 500 o más.
- Bienvenida: 350 puntos, es decir, **Plata**. Para empezar en Bronce: bajar `WELCOME_POINTS` a menos de 200.
- Se gana 1 punto por dólar completo del total base. Se canjean hasta 350 por pedido.
- Al cancelar un pedido se revierten los ganados y se devuelven los usados.

### 5.2 Stock
- Disponible = tienda + depósito.
- Una venta baja la tienda; si queda en menos de 5, repone desde depósito hasta 15.
- Cancelar devuelve las unidades a la tienda.
- Ajustes manuales y conteos: `stockMovements`.

### 5.3 Ganancia
- (precio − costo) × unidades, solo de pedidos con pago confirmado.
- Un producto sin costo no entra y se avisa cuánto queda fuera.

### 5.4 IVA
- El precio incluye el IVA. Base = importe ÷ (1 + alícuota).
- *Ejemplo:* 11,60 al 16 % → base 10,00, IVA 1,60.

---

## 6. Datos: qué se guarda y dónde

| Colección | Quién lee | Quién escribe | Contenido |
|---|---|---|---|
| `products` | Todos | Admin. Cualquiera suma 1 vista. Cliente con sesión: solo descuento de venta. | Catálogo, `stock`, `warehouseStock`, `providerPrice`, `taxRate`, `sales`, `views` |
| `users/{uid}` | El dueño y el admin | El dueño (datos personales; puntos solo junto a un pedido nuevo suyo). Admin. | Ficha, `clubPoints`, `clubLevel`, `address`, `zone` |
| `users/{uid}/notifications` | El dueño y el admin | Admin crea; el dueño marca leído o borra | Avisos |
| `orders` | El dueño (filtrando por `uid`) y el admin | Cliente crea el suyo con estado inicial válido. Admin actualiza. Cliente solo reenvía comprobante rechazado. | Pedido, pago, `invoice` |
| `paymentProofs` | El dueño y el admin | Cliente crea; nadie modifica | Captura cuando no hay Storage |
| `adminLogs` | Admin | Admin. Cliente: una línea `pedido-<número>` junto a su pedido nuevo. | Trazabilidad |
| `stockMovements` | Admin | Admin crea; nadie modifica ni borra | Movimientos de almacén |
| `customerNotes` | Admin | Admin | Notas internas del CRM |
| `store/paymentConfig`, `store/rates`, `store/flashOffers` | Todos | Admin | Cobros y datos del negocio, tasas, ofertas |

**Pedido bien guardado (ejemplo):**

```json
{
  "id": "MINE-48219377",
  "uid": "abc123firebase",
  "status": "En revisión",
  "paymentMethod": "pagomovil",
  "paymentStatus": "en_revision",
  "reference": "9812",
  "payer": { "bank": "Banesco (0134)", "phone": "04145550101" },
  "paymentCurrency": "VES",
  "rateUsd": 62.5,
  "amountBs": 1125,
  "capturePath": "payments/abc123firebase/MINE-48219377-1791312000000.jpg",
  "subtotal": 18, "deliveryFee": 0, "discount": 0, "total": 18,
  "pointsUsed": 0, "pointsEarned": 18,
  "zone": "San Luis", "shippingMethod": "delivery"
}
```

Cuando se factura se agrega: `"invoice": { "number": "00012345", "controlNumber": "00-0012345", "date": "…", "by": "admin@…" }`.

---

## 7. Riesgos que siguen abiertos

| Riesgo | Por qué sigue | Cómo se cierra |
|---|---|---|
| La clave vieja es pública (página publicada, historial de git) | No es un problema de código | Cambiarla en Firebase Console. Hoy. |
| Admin = quien tenga ese correo | Las reglas comparan el correo | Confirmar que la cuenta existe; fijar su UID en `isAdmin()` |
| Precios de línea inventados por un cliente técnico | Las reglas no pueden recorrer las líneas | Cloud Function (plan Blaze). Mientras tanto: el admin ve los precios al verificar y hay tope de 5.000 USD. |
| Vaciar el stock sin pedido | Atarlo a un pedido rompería carritos de más de ~15 productos | Cloud Function. Mientras tanto: el conteo de Almacén detecta el descuadre. |
| Ventas del mostrador no llegan solas | No hay sistema conectado | `INTEGRACION_FACTURACION.md`, opciones B o C |
| La página no emite factura fiscal | No es su función | Sistema fiscal o imprenta digital; la página registra el número |
| Un solo usuario para todo el personal | No hay roles | Siguiente función 1 de la sección 8 |

---

## 8. Siguientes funciones, en orden

Cada una es una función cerrada, con su criterio de aceptación.

1. **Roles de personal.** Cajero (pedidos y cobro), almacén (Almacén e Inventario), dueño (todo). Colección `staff/{uid}` con el rol y reglas que la consulten.
   *Listo cuando:* un cajero entra con su propio correo, no ve Cobros ni Tasas, y cada movimiento lleva su nombre.
2. **Código del sistema por producto.** Campo `codigoSistema` y columna en el CSV.
   *Listo cuando:* el archivo de existencias del sistema entra sin editar códigos a mano.
3. **Puente o servidor de facturación** (según la ficha).
   *Listo cuando:* una venta en el mostrador baja el stock de la página sin intervención, y la cola "Por facturar" se vacía sola.
4. **Pedido creado en servidor** (Cloud Function, plan Blaze).
   *Listo cuando:* un pedido con un precio alterado es rechazado, y un cliente no puede cambiar `stock` directamente.
5. **Avisos automáticos por correo o WhatsApp.**
   *Listo cuando:* al aprobar un pago el cliente recibe el aviso sin que el empleado toque WhatsApp.
6. **Pasarela de tarjeta.** *Listo cuando:* el pedido pasa de "Pendiente de pago" a "Facturado" por confirmación del proveedor.
7. **Zonas con tarifa propia y horario de tienda.** *Listo cuando:* `/delivery` y el checkout leen las mismas zonas del panel y no se puede elegir un día cerrado.
8. **Cupones.**
9. **Segundo factor para el admin.**
10. **Rediseño visual, imágenes y video.** Pendiente de que elijas dirección: conservar azul y amarillo con otra composición, o identidad nueva.

---

## 9. Lista de pruebas en `localhost:3000`

Arranca con doble clic en `INICIAR_MI_NEGOCIO.command`. Marca cada línea.

**Como visitante**
- [ ] El inicio carga productos y no hay errores rojos en la consola.
- [ ] `/pagos` muestra solo los métodos activos (al principio, solo efectivo).
- [ ] `/checkout` sin sesión lleva a `/login?redirect=/checkout`.
- [ ] `/mi-negocio-admin` muestra el formulario, no el panel.

**Como cliente nuevo**
- [ ] Registro con cédula `20111222` → mensaje de error. Con `V-20111222` → entra.
- [ ] Mi cuenta muestra 350 puntos, nivel Plata, "Te faltan 150 pts para alcanzar Oro".
- [ ] Agregar un producto hasta el máximo: el `+` se apaga.
- [ ] Checkout en efectivo → pantalla de confirmación con número `MINE-` y 8 dígitos.
- [ ] Mi cuenta → el pedido aparece y sigue ahí al recargar.
- [ ] Cerrar sesión, recargar: sigue sin sesión.

**Como administrador**
- [ ] Entrar con clave equivocada → "Credenciales incorrectas" y no abre.
- [ ] Entrar con la clave real → abre. Trazabilidad muestra "Inicio de sesión en el panel".
- [ ] Cobros: cargar Pago Móvil y guardar → `/pagos` y el checkout lo muestran.
- [ ] Pedidos → Preparar: está el pedido en efectivo. Abrirlo → "Cobrado al entregar" → pasa a Facturar.
- [ ] Facturación: escribir un número → sale de "Por facturar". Repetir el mismo número en otro pedido → lo rechaza.
- [ ] Almacén: "Se vendió en tienda", 1 unidad → en otra ventana, el máximo de ese producto en el carrito baja 1 sin recargar.
- [ ] Almacén: descargar la hoja, cambiar un número, subirla → muestra una diferencia. Aplicar → queda en el historial.
- [ ] Cargar catálogo: "Exportar catálogo actual" y subir ese mismo archivo → todos "actualizados", ningún error, y la tienda queda igual.
- [ ] Clientes: abrir una ficha, guardar una nota, recargar → la nota sigue.
- [ ] Cancelar un pedido → el stock vuelve; los botones de aprobar desaparecen.

**Pago manual de punta a punta** (después de cargar Pago Móvil)
- [ ] Cliente: pedido por Pago Móvil con referencia `9812` y captura → "En revisión".
- [ ] Admin: ve `9812`, el banco, el teléfono y la captura. Rechazar con un motivo.
- [ ] Cliente: ve el motivo y reenvía. Admin: aprobar.
- [ ] Cliente: recibe el aviso en la campana y el seguimiento avanza a "Preparando".

**Después de desplegar las reglas**
- [ ] `npm run check:rules` termina con "Todo como debe estar."
- [ ] Repetir "Como cliente nuevo" y "Pago manual" contra producción.
