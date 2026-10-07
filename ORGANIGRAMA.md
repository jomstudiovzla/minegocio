# Organigrama operativo — Mi Negocio

Fecha: 6 de octubre de 2026.

Este archivo dice quién hace qué, en qué nivel, y cómo se separan la tarea principal, la secundaria y el resto. El mapa de archivos sigue en `DEPARTAMENTOS.md`. Lo que el cliente y el panel hacen hoy está en `INSTRUCCION_MAESTRA.md`. Los hallazgos de reglas están en `AUDITORIA_SEGURIDAD.md`.

No crea cuentas, no crea colecciones y no cambia la tienda. Hoy una sola cuenta abre el panel: el correo `admin@jomstudio.com` en el proyecto Firebase `minegocio2-c20ef`. El panel se abre solo si Firebase acepta ese correo (`authState === 'admin'`). No existe una colección `roles` ni `empleados`. El modelo futuro, cuando se construya, es `staff/{uid}` con tres roles: cajero, almacén y dueño. Hasta entonces este organigrama es el tablero de trabajo, no un login.

## Cómo se lee

| Nivel | Nombre | Qué decide |
|---|---|---|
| L0 | Dirección | Publicar, precios, reglas, datos de cobro |
| L1 | Dirección de área | Operación, Estética, Funcionalidad o Base de datos |
| L2 | Departamento | Una función de la tienda, con pestaña o archivo |
| L3 | Célula | Trabajo, Calidad o Seguridad de ese departamento |
| L4 | Tarea | Principal, secundaria u otra |

Cada departamento L2 tiene tres células L3:

- **Trabajo.** Hace la tarea.
- **Calidad.** Comprueba que el resultado es el correcto. Tiene una prueba y un “listo cuando”.
- **Seguridad.** Dice quién lee, quién escribe y qué no sale al cliente.

Esas células no son usuarios ni documentos. Son la lista que se recorre antes de dar el departamento por cerrado.

Clases de tarea:

- **Principal.** La razón del departamento. Si esta falla, el departamento no está listo.
- **Secundaria.** Lo que sostiene la principal con lo que ya hay en el código.
- **Otra.** Nombrada para más adelante. No se construye desde este archivo.

## Roles

Un rol es un puesto del tablero. Solo el dueño tiene cuenta hoy.

| Rol | Nivel | Tarea principal | Tarea secundaria | No le toca | Cuenta hoy |
|---|---|---|---|---|---|
| Dueño | L0 | Decidir publicación, precios y reglas | Cobros, tasas, facturas, trazabilidad | — | Sí. Un correo |
| Cajero | L2 Pedidos | Verificar pagos y mover bandejas | WhatsApp del pedido y comprobante PDF | Cobros, Tasas, reglas, borrar catálogo | No |
| Almacén | L2 Almacén | Cuadrar tienda y depósito | Huecos y sustitutos de la misma subcategoría | Precio, Cobros, Tasas | No |
| Atención | L2 Clientes | Ficha del cliente y nota interna | Puntos y nivel del club | Mostrar la nota al cliente | La ficha existe. El puesto no |
| Diseño | L1 Estética | Tokens, iconos, fotos y ficha visual | Separar color de marca y color de anaquel | Reglas y precios | No |
| Datos | L1 Base de datos | Esquema, colecciones y qué está publicado | Estado local del navegador | Desplegar reglas por su cuenta | No |
| Calidad | L3 | La prueba de “listo cuando” | Anotar el fallo con el archivo | Saltarse la célula de seguridad | Checklist |
| Seguridad | L3 | Quién lee y quién escribe | Parar si un dato interno sale al cliente | Escanear o atacar la tienda | Checklist |

Cuando exista `staff/{uid}`, el cajero entra con su correo, no ve Cobros ni Tasas, y cada movimiento lleva su nombre. Eso está escrito en `INSTRUCCION_MAESTRA.md` §8 y en `DEPARTAMENTOS.md` §1. Este documento no lo implementa.

## Árbol

```text
L0 Dueño  (hoy: admin@jomstudio.com)
├── L1 Operación
│   ├── L2 Catálogo y fotos
│   ├── L2 Pedidos y pagos
│   ├── L2 Almacén
│   ├── L2 Entrega
│   ├── L2 Clientes
│   ├── L2 Facturación
│   └── L2 Correo del dominio
├── L1 Estética
│   ├── L2 Diseño
│   │   ├── Sistema de color
│   │   ├── Iconos
│   │   ├── Imágenes
│   │   └── Información de la ficha
│   └── L2 Estética de la tienda
├── L1 Funcionalidad
│   ├── L2 Recorrido del cliente
│   └── L2 Panel (13 pestañas)
├── L1 Base de datos
│   ├── L2 Firestore
│   ├── L2 Reglas locales
│   └── L2 Estado del navegador
└── L1 Seguridad y accesos
    ├── L2 Portero
    ├── L2 Reglas
    ├── L2 Personal (aún no hay colección)
    └── L2 Publicación
```

Dentro de cada L2 van las tres células: Trabajo, Calidad, Seguridad.

## Matriz

Estado: **código** = ya está en `frontend/` sin estar publicado. **mapa** = solo este tablero. **hueco** = la instrucción lo pide y el código no lo tiene.

| Departamento | Principal | Secundaria | Otra | Calidad, listo cuando | Seguridad | Dónde se ve | Estado |
|---|---|---|---|---|---|---|---|
| Portero | El panel abre solo si Firebase acepta el correo admin. Salir llama a `signOut` | La pared de 12 caracteres es la bandera `mn-admin-clave-corta` del navegador. Entrar con Google con ese correo no pasa por esa pared | Segundo factor | Una clave equivocada deja el formulario. La buena deja en Trazabilidad “Inicio de sesión en el panel” | `isAdmin()` compara el correo, no el UID. El UID se copia desde Trazabilidad cuando la cuenta ya existe | `/login`, `/mi-negocio-admin` | código |
| Reglas | Precio, alta y baja de producto solo admin. El cliente lee sus pedidos | La cola de correo no deja elegir otro destinatario | Desplegar `frontend/firestore.rules` y `frontend/storage.rules` después de publicar el sitio nuevo | `npm run check:rules` en orden, y solo entonces desplegar | No desplegar las reglas de `Ananas/`. No desplegar estas reglas mientras la página publicada siga siendo la vieja: el sitio viejo dejaría de crear pedidos | `frontend/firestore.rules`, `frontend/storage.rules` | código, sin desplegar |
| Personal | Tres puestos: cajero, almacén, dueño | El nombre de quien movió stock o aprobó un pago queda en el movimiento | `staff/{uid}` | Un cajero entra con su correo y no ve Cobros ni Tasas | No hay colección `roles` ni `empleados`. Una colección escribible por el cliente no es el modelo | Aún no hay colección | hueco |
| Catálogo y fotos | Cada `image` del catálogo activo abre un archivo y la foto es de ese nombre | Ficha: nombre, precio, unidad, subcategoría, costo, IVA 16/8/0, stock de tienda y de depósito | Campo `codigoSistema` | Un archivo ausente se ve como fallo. Exportar el CSV y volver a subirlo deja el catálogo igual | Alta, precio y baja: admin. Cualquiera puede sumar una vista. El cliente con sesión solo descuenta la venta que las reglas permiten | Pestañas Inventario y Cargar catálogo | código |
| Pedidos y pagos | Ningún pedido nace Facturado. El admin confirma el dinero | Referencia, quién pagó, tasa, bolívares y ruta de la captura. La imagen no va dentro del pedido | Pasarela de tarjeta que cobre de verdad | Efectivo nace Procesando. Pago móvil, transferencia, Zelle, PayPal y Binance nacen En revisión. Tarjeta nace Pendiente de pago solo si Cobros la enciende. Un cancelado no revive al reenviar el comprobante | El cliente ve solo sus pedidos. Tope de pedido 5.000 USD | Pestaña Pedidos. Cobros es del dueño | código |
| Almacén | Una venta baja tienda y depósito en las unidades vendidas | Si falta stock, hasta dos productos de la misma subcategoría cubren la cantidad. El admin confirma el cambio | Ventas de mostrador que bajen solas el stock de la página | La hoja descargada, sin tocarla, no muestra diferencias. No se ofrece un vino para cambiar una cerveza | `stockMovements` lo crea el admin y nadie lo modifica ni lo borra | Pestaña Almacén. Comparación en `findStockGaps` | código |
| Entrega | San Luis y El Cafetal tienen reparto. Otra zona de Caracas queda en retiro | Envío 2,50 USD, gratis desde 15 USD. La fecha no puede ser anterior a hoy | Zonas y horarios editados en el panel | `/delivery` y el checkout dicen la misma zona y la misma tarifa | La zona no cambia el precio del producto | `/delivery`, `src/lib/commerce.ts` | código |
| Clientes | La ficha junta `users` y los pedidos | Nota interna en `customerNotes`. Oro es 500 puntos o más | Cupones | Bronce 0–199, Plata 200–499, Oro 500+. El alta de bienvenida de 350 puntos deja al cliente en Plata | La nota interna la lee y la escribe el admin. El cliente no la ve | Pestaña Clientes. Mi cuenta para el cliente | código |
| Facturación | Guardar número, control y fecha que ya produjo el sistema del negocio | La cola “Por facturar” son pedidos cobrados, no cancelados y sin número. El mismo número no se repite | La página no emite la factura fiscal | La carta al cliente incluye el bloque solo cuando el número ya está | El número lo escribe el admin sobre el pedido | Pestaña Facturación, `src/lib/billing.ts` | código |
| Correo | Escribir la carta y encolarla en `outboundMail` | El cliente la ve en Mi cuenta. El admin la ve en Correos | Salir al buzón cuando haya SMTP en la bóveda, fuera del código | Si las reglas no están publicadas, las dos pantallas lo dicen y no fingen que el correo salió | El cliente escribe a su correo de sesión o a `admin@jomstudio.com`. No elige otro destinatario. Asunto menor de 180 caracteres. Cuerpo menor de 8000 | Pestaña Correos | código, encolado, no enviado |
| Diseño | Un solo sistema de color, en `globals.css` | Iconos de anaquel (emoji) separados de los iconos de interfaz (Lucide) | Rediseño visual, después de publicar y de los puestos | Un control de marca usa la escala `mi-*`. Un anaquel usa el color de su categoría | No hay secretos en el CSS. La foto pública es la de `public/` | Sección Diseño, abajo | código de tokens. Puesto: mapa |
| Estética | Una sola cara: azul, amarillo, Plus Jakarta Sans, fondo `#f9f9ff`, texto `#111c2d` | Gestos distintos: vuelo al carrito, corazones, +1, −1, “Quitado”, “Enlace copiado” | Otra composición o una identidad nueva | Con movimiento reducido no hay vuelo de punta a punta, y la acción igual queda confirmada | Si no hay stock, agregar no vuela y no muestra el aviso de añadido | `globals.css`, `src/lib/gestures.ts` | código |
| Funcionalidad | El cliente ve, elige, compra y sigue su pedido con `commerce.ts` | El panel hace el día en 13 pestañas | Pedido creado en servidor, para que un precio alterado se rechace | Los totales, el envío, los puntos y el estado inicial salen de una sola fuente | La función no abre un camino que la regla cierra. La página estática no envía correo desde el navegador | `src/lib/commerce.ts`, `src/lib/orders.ts` | código |
| Base de datos | El catálogo y los pedidos vivos están en Firestore. `mockDb.ts` aporta categorías y respaldo | El navegador guarda solo carrito, usuario, zona, moneda, tasas automáticas y ofertas relámpago | No se abre una colección de personal en este paso | `ProductSchema` rechaza precio negativo, stock negativo e IVA distinto de 16, 8 o 0 | Reglas locales sin desplegar. El cliente no escribe precios ni notas internas | Sección Base de datos, abajo | código |
| Publicación | Disco, git, Firebase y Pages son cuatro capas distintas | Orden: rotar la clave, commit, rebuild, publicar, desplegar reglas de `frontend/`, cargar Cobros, fijar el UID | — | El export nuevo no arrastra la clave vieja | Publicar el commit `d98137c` sin el árbol de trabajo republica el sitio viejo | `DEPARTAMENTOS.md` §0 y §9 | hueco de publicación |

## L1 Operación — tareas por departamento

### Catálogo y fotos

- **Principal.** La foto que ve el cliente es `product.image` del documento `products`. Copiar un archivo no reescribe ese campo.
- **Secundaria.** `mockDb.ts` nombra 130 fotos y el CSV `inventario_extenso.csv` nombra 190. Esas rutas están en `frontend/public/images/products/scraped/`. La carpeta tiene 1108 archivos. Las categorías no usan foto.
- **Otra.** No se vuelve a bajar el catálogo de otro supermercado. `download_images.ts` no se corre: el CSV ya usa rutas locales.

### Pedidos y pagos

Bandejas de la pestaña Pedidos: Todos, Verificar pago, Preparar, Entregar, Cobrar al entregar, Facturar, Cerrados.

- **Principal.** Aprobar el pago es lo que pasa el pedido a Facturado.
- **Secundaria.** Rechazar deja el motivo que ve el cliente. Desde Mi cuenta se reenvía el comprobante.
- **Otra.** Tarjeta, PayPal y Binance no son un cobro real hasta que Cobros tenga el método y, más adelante, una pasarela.

Datos de cobro (Pago Móvil, Zelle, transferencia, Binance, PayPal, tarjeta, efectivo, RIF, teléfono, WhatsApp) viven en la pestaña Cobros. Un método incompleto no se ofrece. Esa pestaña es del dueño. El cajero futuro no la ve.

### Almacén

- **Principal.** Ajuste, conteo con vista previa, historial.
- **Secundaria.** La carta al admin nombra lo que falta y los dos cambios posibles. No reserva el sustituto.
- **Otra.** Cancelar repone el stock de tienda, resta ventas y devuelve los puntos. El pago queda anulado o reembolsado.

### Entrega, clientes, facturación, correo

El detalle de cartas, números de factura y zonas está en `DEPARTAMENTOS.md` §5 a §8. Aquí solo cambia el nivel: son L2 de Operación, cada uno con sus células de calidad y seguridad de la matriz.

## L1 Estética — Diseño

El diseño no es un rediseño. Es el sistema que ya usa la tienda, para que estética, función y datos no se mezclen.

### Sistema de color

Marca, en `frontend/src/app/globals.css` dentro de `@theme`:

| Token | Hex | Uso |
|---|---|---|
| `mi-blue` | `#001b62` | Azul de marca |
| `mi-blue-mid` | `#103088` | Azul medio |
| `mi-blue-light` | `#3f58b0` | Azul claro |
| `mi-blue-pale` | `#b6c4ff` | Azul pálido |
| `mi-blue-fixed` | `#dce1ff` | Azul fijo. El gesto “−1” usa este |
| `mi-blue-surface` | `#e7eeff` | Superficie |
| `mi-blue-low` | `#f0f3ff` | Superficie baja |
| `mi-blue-ice` | `#f9f9ff` | Hielo |
| `mi-yellow` | `#F8B808` | Amarillo Pantone. Acción y anillo del vuelo al carrito |
| `mi-yellow-light` | `#fde98a` | Amarillo claro |
| `mi-yellow-dark` | `#7a5900` | Amarillo oscuro. El fallo de copiar enlace usa este |
| `mi-yellow-on` | `#5c4200` | Texto sobre amarillo |
| `mi-bg` | `#f9f9ff` | Fondo |
| Texto del cuerpo | `#111c2d` | Texto |
| Fuente | Plus Jakarta Sans, luego Inter | `--font-sans` |

Los alias `--color-ananas-*` apuntan a esta misma escala azul. No son una segunda marca.

Anaquel, en `frontend/src/data/mockDb.ts`. Son fichas de categoría, no la marca:

| Categoría | Id | Icono | Clases |
|---|---|---|---|
| Frutas y Vegetales | `frutas-vegetales` | 🍎 | `bg-red-100 text-red-600` |
| Refrigerados | `refrigerados-congelados` | ❄️ | `bg-blue-100 text-blue-600` |
| Víveres | `viveres` | 🥫 | `bg-orange-100 text-orange-600` |
| Cuidado Personal | `cuidado-personal-salud` | 🧴 | `bg-teal-100 text-teal-600` |
| Limpieza | `limpieza` | 🧽 | `bg-cyan-100 text-cyan-600` |
| Licores | `licores` | 🍷 | `bg-purple-100 text-purple-600` |

Calidad de color: un botón de la tienda sale de la tabla de marca. Una ficha de categoría sale de la tabla de anaquel. Mezclarlas es un fallo de esta célula.

### Iconos

| Capa | Qué es | Dónde |
|---|---|---|
| Anaquel | Emoji de la categoría | `categories` en `mockDb.ts` |
| Interfaz | Lucide, importado en cada pantalla | Panel: `ClipboardList`, `Wallet`, `Warehouse`, `Receipt`, `Mail`, `Zap`, `Package`, `Users`, `Shield`, `TrendingUp`, `BarChart2`. Tienda: búsqueda, carrito, usuario, camión, y los de cada página |
| Club | 🥉 Bronce, 🥈 Plata, 🥇 Oro | `CLUB_LEVELS` en `commerce.ts` |

No hay un mapa único de iconos. La célula de diseño lo trata como hueco de orden, no como motivo para cambiar los iconos ya puestos.

### Imágenes

| Dato | Valor |
|---|---|
| Carpeta pública | `frontend/public/images/products/scraped/` |
| Campo que manda | `product.image` en Firestore |
| Forma válida | URL o ruta que empieza por `/` (`ProductSchema`) |
| Categorías | Emoji. No foto |
| Descarga nueva | Fuera de este organigrama. Las rutas locales ya están |

Calidad de imagen: en el inicio y en la ficha, la foto corresponde al nombre. Si el archivo no está, el hueco se ve.

Seguridad de imagen: la captura de un pago se guarda como ruta (`capturePath` o `paymentProofs`), no como documento incrustado en el pedido.

### Información detallada de la ficha

`ProductSchema` en `frontend/src/core/domain/entities/Product.ts`:

| Campo | Qué es | Obligatorio |
|---|---|---|
| `id` | Identificador | Sí |
| `name` | Nombre | Sí |
| `price` | Precio. El IVA ya va incluido | Sí, cero o más |
| `category` | Id de categoría | Sí |
| `subcategory` | Subcategoría. Si falta, `General` | Sí, con default |
| `image` | Foto | Sí |
| `unit` | Unidad. Default `Unidad` | No |
| `labels` | Textos como Oferta o Nuevo | No |
| `stock` | Unidades en tienda | Default 0 |
| `warehouseStock` | Unidades en depósito | Default 0 |
| `description` | Texto largo | Default vacío |
| `providerPrice` | Costo | No |
| `taxRate` | 16, 8 o 0. Sin definir, la exportación de factura marca la línea “SIN DEFINIR” | No |
| `views` | Vistas | Default 0 |
| `sales` | Ventas | Default 0 |
| `isActive` | Visible. Baja lógica, sin borrar el documento | Default verdadero |

Subcategorías que ya nombra el anaquel: Frutas, Verduras y hortalizas, Tubérculos, Verdes y hojas, Carnes, Pollo, Charcutería, Quesos, Congelados listos, Granos, Arroz y pasta, Enlatados, Aceites y salsas, Bebidas, Higiene personal, Cuidado corporal, Farmacia básica, Ropa, Cocina, Baño, Desinfección, Accesorios de limpieza, Cervezas, Rones, Whisky, Vinos, Otros destilados.

## L1 Estética — cara de la tienda

- **Principal.** Fondo, texto, fuente y los dos colores de marca se leen de `globals.css`.
- **Secundaria.** Los gestos del catálogo ya distinguen la acción: la foto vuela al carrito solo si `addToCart` devuelve verdadero; favorito enciende o apaga; la cantidad muestra +1 o −1; quitar la línea dice “Quitado”; compartir dice “Enlace copiado”.
- **Otra.** Los degradados `.gold-shimmer` y `.text-gradient-blue` siguen en la hoja. No son el sistema de color de esta tabla y no se tocan desde el organigrama.

## L1 Funcionalidad

Reglas de una sola fuente, `src/lib/commerce.ts`:

| Regla | Valor |
|---|---|
| Envío | 2,50 USD. Gratis desde 15 USD |
| Club | Bronce 0–199, Plata 200–499, Oro 500+ |
| Bienvenida | 350 puntos, queda en Plata |
| Tope de puntos por pedido | 350 |
| Tope del pedido | 5.000 USD |
| Sumar al carrito por encima del stock | Devuelve falso. No hay aviso de éxito ni vuelo |
| Bajar cantidad en la ficha | No quita la última unidad. Quitar es `removeFromCart` |
| Favorito | Optimista. Si Firestore falla, vuelve atrás |

Pestañas del panel, en el orden del código de `mi-negocio-admin/page.tsx`:

| Pestaña | Departamento L2 | Rol futuro |
|---|---|---|
| Pedidos | Pedidos y pagos | Cajero y dueño |
| Cobros | Pedidos y pagos | Dueño |
| Almacén | Almacén | Almacén y dueño |
| Facturación | Facturación | Dueño |
| Correos | Correo | Dueño |
| Ofertas relámpago | Catálogo | Dueño |
| Inventario | Catálogo | Almacén y dueño |
| Clientes | Clientes | Atención y dueño |
| Trazabilidad | Portero | Dueño |
| Cargar catálogo | Catálogo | Dueño |
| Tasas | Base de datos / dueño | Dueño |
| Notificaciones | Clientes | Dueño |
| Estadísticas | Funcionalidad | Dueño |

La instrucción maestra cuenta doce pestañas y no lista Correos. El código tiene las trece de esta tabla. Manda el código.

Calidad de funcionalidad: las pruebas se corren dentro de `frontend/` (`npm test` y `npm run typecheck`). Este archivo no las volvió a ejecutar.

## L1 Base de datos

### Lo que el código escribe

| Colección o documento | Quién lo usa | Contenido |
|---|---|---|
| `products` | Todos leen. El admin escribe precio y ficha | Catálogo vivo |
| `users/{uid}` | El cliente su ficha. El admin el CRM | Puntos, nivel, dirección, zona, favoritos |
| `users/{uid}/notifications` | Campana de la tienda | Avisos. El correo no la reemplaza |
| `orders` | El cliente los suyos. El admin todos | Pedido, pago, factura |
| `paymentProofs` | Cliente crea. Nadie modifica | Captura cuando no hay Storage |
| `stockMovements` | Admin | Historial de almacén |
| `customerNotes` | Admin | Nota interna |
| `outboundMail` | Cliente crea la suya. Admin marca enviado o error | Cartas encoladas |
| `adminLogs` | Admin. El cliente una línea junto a su pedido nuevo | Trazabilidad |
| `store/paymentConfig` | Todos leen. Admin escribe | Cobros |
| `store/flashOffers` | Ofertas relámpago | Ids, hora de cierre, activa |

La factura no es una colección aparte en el código de hoy: `billing.ts` guarda `invoice` dentro del pedido.

### Lo que la regla nombra y este recorrido no vio escrito por la tienda

`frontend/firestore.rules` también tiene `match` para `inventory`, `invoices`, `payments` y `exchangeRates`. Las pestañas Inventario, Cobros y Facturación no son esas colecciones: Inventario edita `products`, Cobros edita `store/paymentConfig`, Facturación edita el pedido. Tasas, en la instrucción, es `store/rates`. Antes de usar esas cuatro colecciones de la regla hay que confirmar en el archivo de reglas quién puede escribir. No se abren “por si acaso”.

### Estado del navegador

Zustand persiste en `mi-negocio-storage-v2` solo: `cart`, `user`, `zone`, `currency`, `isAutoRates`, `flashOffersConfig`. `products` arranca vacío y lo llena `FirebaseSync.tsx` desde Firestore.

### Células

- **Calidad.** Un producto que no pasa `ProductSchema` no entra al catálogo en memoria.
- **Seguridad.** No se crea `roles` ni `empleados`. El personal futuro es `staff/{uid}`, y solo después de rotar la clave, publicar el sitio nuevo y desplegar las reglas de `frontend/`.

## L1 Seguridad y accesos

Esta dirección es transversal: su célula de seguridad no sustituye la de cada departamento. Revisa que las demás células digan la verdad.

Hallazgos que siguen abiertos, según `AUDITORIA_SEGURIDAD.md` y la instrucción §7:

1. La clave vieja del admin quedó en el historial y en la página publicada. Se rota en la consola de Firebase. No se escribe en el código.
2. El admin es quien tiene ese correo. El UID todavía no está fijado dentro de `isAdmin()`.
3. Un precio de línea inventado no lo puede recorrer la regla. Mientras no haya Cloud Function, el admin ve el precio al verificar y el tope es 5.000 USD.
4. Un descuadre de stock sin pedido lo ve el conteo de Almacén.

`AUDITORIA_SEGURIDAD.md` dice que esa revisión fue de reglas, pedidos, pagos y almacén, sin escáner externo. La célula de seguridad de este organigrama sigue en ese modo: lee reglas y flujos. No lanza ataques.

## Qué queda fuera

El texto que pedía orquestar “cuentas por empleado”, un pipeline de descarga y un pentest se ordena así:

| Pedido de ese texto | Dónde vive aquí |
|---|---|
| Roles y permisos antes del rediseño | Tabla de roles. El rediseño queda en “Otra” de Diseño y de Estética |
| Cuentas de cajero, almacén y dueño | Puesto Personal. Colección futura `staff/{uid}` |
| Colección `roles` / `empleados` en la consola | Fuera. No es el modelo y no se crea |
| Bajar fotos, reescribir `mockDb.ts` y hacer commit solo | Fuera. Las fotos locales ya están. `DEPARTMENT_PLAN.md` está obsoleto |
| Validar que una foto sea imagen y que el id no arme una ruta | Célula de calidad de Catálogo, como criterio. Sin script nuevo |
| Pipeline de subagentes de imagen, Storage y CI | Las células Trabajo / Calidad / Seguridad de cada L2. Sin agentes que desplieguen |
| Escáner, reconocimiento y pruebas de ataque | Fuera. La seguridad de este tablero es defensiva |
| Rediseño visual ahora | Fuera de este paso. Primero el orden de publicación de `DEPARTAMENTOS.md` §0 |

## Orden para usar el tablero

1. Leer la fila Publicación. Esa es la tarea principal del dueño.
2. Recorrer una fila L2: tarea principal, prueba de calidad, límite de seguridad.
3. Dejar en “Otra” lo que la instrucción §8 ya ordenó: puestos `staff/{uid}`, `codigoSistema`, puente fiscal, pedido en servidor, correo automático, pasarela, zonas, cupones, segundo factor, rediseño.

Ningún paso de esa lista se ejecuta desde este archivo.
