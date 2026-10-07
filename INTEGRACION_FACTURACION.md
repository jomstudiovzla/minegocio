# Mi Negocio — Conexión con el sistema de facturación y el almacén

Este documento sirve para dos cosas:

1. Explicar cómo trabajan **hoy** la página, el almacén y la facturación, sin ningún sistema conectado y con Firebase en el plan gratis.
2. Dejar una **ficha para llenar** cuando sepas qué sistema de facturación usa el negocio. Con la ficha llena, conectar es un trabajo acotado y está descrito en la sección 5.

> No soy contador ni abogado. Lo fiscal de la sección 6 es un resumen de fuentes públicas para que sepas qué preguntar; confírmalo con el contador del negocio antes de decidir.

---

## 1. Qué hace la página hoy y qué no

| Tema | Hoy | Lo que no hace |
|---|---|---|
| Existencias | La tienda lee `products` en tiempo real. Una venta en la página descuenta stock en la misma operación del pedido. Un ajuste en el panel se ve en la tienda en segundos. | No se entera sola de lo que se vende en el mostrador. Eso entra por **Almacén** (ajuste rápido o archivo). |
| Factura | Marca qué pedidos cobrados no tienen factura, guarda el número de factura y de control, y avisa si un pedido facturado se canceló (nota de crédito). | **No emite facturas fiscales.** La factura la emite el sistema o la máquina fiscal del negocio. |
| IVA | Cada producto puede tener su alícuota (16 %, 8 % o exento). Los precios ya incluyen el IVA; la exportación separa base e impuesto. | No decide qué producto es exento: eso lo define el contador. Un producto sin alícuota sale como `SIN DEFINIR`. |
| Moneda | Los pedidos se guardan en USD, con la tasa y el monto en bolívares cuando el pago es en bolívares. | No convierte a bolívares para el libro de ventas: lo hace el sistema fiscal con la tasa del día de la factura. |

---

## 2. La jornada del empleado (sin sistema conectado)

Todo ocurre en `/mi-negocio-admin`.

**Al abrir**
1. **Pedidos → Verificar pago.** Compara la referencia con el banco. *Aprobar pago* o *Rechazar comprobante* (el cliente lo reenvía desde su cuenta).
2. **Pedidos → Preparar.** Arma lo aprobado y lo que es en efectivo. Mueve a *Listo para retirar* o *En camino*.

**Durante el día**
3. **Almacén → Ajuste rápido.** Cada vez que pase algo fuera de la página:
   - *Llegó mercancía*: suma lo que entregó el proveedor.
   - *Se vendió en tienda*: resta lo facturado en el mostrador.
   - *Merma o daño*: resta lo vencido o roto (pide el motivo).
   - *Lo conté*: deja el número exacto del estante (pide el motivo).
4. **Pedidos → Cobrar al entregar.** Al recibir el efectivo, *Cobrado al entregar* con el monto y la moneda.

**Al cerrar**
5. **Facturación → Por facturar.** Por cada pedido cobrado: emite la factura en el sistema fiscal y escribe aquí el número. La lista debe quedar en cero.
6. **Almacén → Cuadrar con un archivo** (una vez a la semana, o a diario si el sistema exporta existencias): sube el archivo, revisa las diferencias y aplica.

**Cada mes**
7. **Facturación → Descargar ventas del mes.** Se entrega al contador o se carga en el sistema administrativo.

---

## 3. Ficha del sistema de facturación (llénala cuando lo sepas)

| Pregunta | Respuesta |
|---|---|
| Nombre y versión del sistema (Profit Plus, Saint, A2, Valery, otro) | `__________` |
| ¿Usa máquina fiscal? Marca y modelo | `__________` |
| ¿El negocio ya contrató una imprenta digital autorizada? ¿Cuál? | `__________` |
| ¿Dónde corre? (una PC en la tienda, servidor propio, en la nube) | `__________` |
| ¿Exporta **existencias** a Excel/CSV? ¿Con qué columnas? | `__________` |
| ¿Exporta **ventas del día** a Excel/CSV? ¿Con qué columnas? | `__________` |
| ¿Importa **pedidos o facturas** desde un archivo? ¿En qué formato? | `__________` |
| ¿Tiene API o servicio web? ¿Hay documentación? | `__________` |
| ¿Se puede leer su base de datos (SQL Server, Firebird, MySQL)? | `__________` |
| ¿El código del producto en el sistema es el mismo `id` de la página (`PRD-001`)? | `__________` |
| ¿Maneja tienda y depósito por separado o una sola existencia? | `__________` |
| ¿En qué moneda factura y de dónde toma la tasa? | `__________` |
| Persona de soporte del sistema (nombre y teléfono) | `__________` |
| Contador del negocio (nombre y teléfono) | `__________` |

**Lo más importante de la ficha es la fila del código del producto.** Si el sistema usa otros códigos, hay que agregar a cada producto de la página el código del sistema antes de conectar nada (un campo `codigoSistema` en `products`, cargado por CSV).

---

## 4. Los archivos que ya entiende la página

Todos se separan con **punto y coma (`;`)** y aceptan decimales con coma.

**Existencias o conteo → Almacén → Subir archivo**

```
id;name;stock;warehouseStock
PRD-001;Harina PAN;12;100
```

También acepta los encabezados que suelen traer los sistemas: `codigo` o `sku` en lugar de `id`; `existencia`, `existencias` o `cantidad` en lugar de `stock`; `deposito` o `almacen` en lugar de `warehouseStock`. Si el archivo solo trae una columna de cantidad, el depósito no se toca.

**Ventas → Facturación → Descargar**

```
fecha;pedido;factura;control;cliente;cedula_rif;codigo;descripcion;cantidad;precio_unitario;importe;alicuota;base;iva;metodo_pago;referencia
```

Una fila por línea vendida, más una fila `ENVIO`, `COMISION` o `DESCUENTO` cuando aplica, de modo que la suma de `importe` es el total cobrado.

---

## 5. Tres formas de conectar, de menor a mayor esfuerzo

### A. Por archivo (funciona hoy, plan gratis)
El sistema exporta existencias y el empleado las sube; la página exporta ventas y el empleado las carga. Es lo que describe la sección 2.

- **Qué hay que hacer al conocer el sistema:** comparar sus columnas con las de la sección 4. Si no coinciden, se agregan los nombres a las listas de alias en `frontend/src/lib/stockCount.ts` (`ID_ALIASES`, `STOCK_ALIASES`, `WAREHOUSE_ALIASES`) o se cambia el orden de columnas en `frontend/src/lib/billingExport.ts` (`SALES_HEADERS`).
- **Desfase:** el que haya entre una subida y otra. Con subida diaria, un día.

### B. Un puente en la PC de la tienda (plan gratis, casi tiempo real)
Un programa pequeño en la computadora donde corre el sistema lee su base de datos o sus archivos cada pocos minutos y escribe en Firestore con una cuenta de servicio. No necesita Cloud Functions.

- **Requisitos:** que la fila "¿se puede leer su base de datos?" o "¿tiene API?" de la ficha sea sí; una PC encendida en horario de tienda; la clave de servicio de Firebase guardada solo en esa PC.
- **Qué escribe:** existencias en `products` (campos `stock` y `warehouseStock`) y un movimiento en `stockMovements` por cada cambio, igual que hace hoy `adjustStock` en `frontend/src/lib/warehouse.ts`. En sentido contrario, lee los pedidos cobrados sin factura y, cuando el sistema los factura, escribe `invoice` en el pedido.
- **Desfase:** minutos.
- **Riesgo que hay que cuidar:** que el puente y la página no descuenten la misma venta dos veces. Las ventas de la página ya descuentan stock; el puente solo debe traer las ventas del mostrador.

### C. Servidor propio (requiere plan Blaze)
Una Cloud Function crea el pedido, valida precios y stock en el servidor, y habla con la API del sistema o de la imprenta digital para emitir la factura al aprobar el pago.

- **Además cierra los dos riesgos que siguen abiertos** en `REMEDIACION_AUDITORIA.md`: precios de línea inventados y vaciado de stock desde el navegador.
- **Desfase:** segundos.

**Recomendación:** empezar con A desde ya, y decidir entre B y C cuando la ficha esté llena. Si el sistema no tiene API ni base legible, B y C no son posibles con ese sistema y la decisión pasa a ser cambiar de sistema o quedarse en A.

---

## 6. Lo fiscal que conviene confirmar con el contador

1. **Factura por medios digitales.** Una providencia del SENIAT publicada en la Gaceta Oficial N.º 43.032 (19 de diciembre de 2024) obliga a quienes venden por medios electrónicos o portales web a emitir sus facturas por medios digitales, a través de una **imprenta digital autorizada**, con aplicación para los obligados desde el 1 de marzo de 2025. Según el mismo resumen, quien además usa máquina fiscal debe usar ambos medios y llevar el libro de ventas separado por tipo de operación. Pregunta: *¿las ventas de la página nos obligan a contratar una imprenta digital?*
2. **Alícuotas.** La general es 16 %. Hay una reducida de 8 % y exenciones para alimentos de la cesta básica, entre otros. Pregunta: *¿qué productos del catálogo son exentos, cuáles van al 8 % y cuáles al 16 %?* Con esa lista se marca cada producto en Inventario → editar → IVA.
3. **Envío, comisión y descuento.** La exportación calcula el envío y la comisión a la alícuota general y deja el descuento del club en su propia fila sin base ni IVA. Pregunta: *¿cómo se factura el envío y cómo se reparte el descuento por puntos?*
4. **Moneda de la factura y tasa.** Los pedidos están en USD. Pregunta: *¿con qué tasa y en qué momento se convierte para la factura y el libro?*
5. **Devoluciones.** Cuando se cancela un pedido ya facturado, la página lo lista en "Requieren nota de crédito". La nota se emite en el sistema fiscal.

Fuentes consultadas el 6 de octubre de 2026:
- [Forvis Mazars — Facturación digital](https://www.forvismazars.com/ve/es/insights/forvis-mazars-insights/fmi-0125-facturacion-digital)
- [Finanzas Digital — Gaceta Oficial N.º 43.032](https://finanzasdigital.com/gaceta-oficial-n-43-032-medios-digitales-emision-facturas/)
- [PwC — Medios digitales para facturas 2025](https://www.pwc.com/ve/es/assets/documentos/stl/Nota-de-actualidad-Medios-Digitales-para-Facturas-2025.pdf)
- [ivacalculator.com — Preguntas frecuentes sobre el IVA en Venezuela](https://ivacalculator.com/venezuela/faq-iva/)

---

## 7. Dónde está cada pieza en el código

| Pieza | Archivo |
|---|---|
| Comparar un archivo con el catálogo, sin tocar nada | `frontend/src/lib/stockCount.ts` |
| Ajustar stock y dejar el movimiento | `frontend/src/lib/warehouse.ts` |
| Pantalla de Almacén | `frontend/src/components/admin/WarehouseTab.tsx` |
| Base e IVA, exportación de ventas, "por facturar" | `frontend/src/lib/billingExport.ts` |
| Guardar o corregir el número de factura | `frontend/src/lib/billing.ts` |
| Pantalla de Facturación | `frontend/src/components/admin/BillingTab.tsx` |
| Alícuota por producto (`taxRate`) | `frontend/src/core/domain/entities/Product.ts` |
| Reglas de `stockMovements` | `frontend/firestore.rules` |
| Pruebas | `frontend/tests/warehouse.test.ts`, `frontend/tests/billing.test.ts` |
