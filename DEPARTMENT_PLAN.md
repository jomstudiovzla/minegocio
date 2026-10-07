# Project Department & Sub‑Agent Plan – Mi Negocio

> Este archivo no es la hoja de ruta. Tiene rutas que no existen (`download_images.ts` no lee `mockDb.ts`, no hay `priceValidator.ts`, las reglas no están en la raíz). La versión que sí corresponde al código está en `DEPARTAMENTOS.md`.

**Objetivo:** Definir, con nivel de detalle 100 %, los departamentos y los sub‑agentes que ejecutarán cada una de las funcionalidades del proyecto, y establecer un plan concreto para corregir **todas** las fotos de los productos y sus detalles en las categorías, garantizando la funcionalidad mínima operativa.

---

## 1. Visión General del Sistema

- **Frontend (React / TypeScript)** – UI interactiva, consumo de datos vía Firebase.
- **Backend‑lite (Firebase Firestore & Functions)** – Persistencia de usuarios, pedidos, productos y lógica de negocio.
- **Assets (Imágenes de productos)** – Almacenadas en `/public/images/products/` y referenciadas en `mockDb.ts`.
- **Seguridad** – Reglas de Firestore/Storage, validación de precios y stock.
- **CI/CD** – Deploy en Firebase Hosting con pruebas automáticas.

---

## 2. Departamentos & Sub‑Agentes

| Departamento | Sub‑Agente | Responsabilidades principales | Artefactos clave |
|--------------|------------|------------------------------|-----------------|
| **Frontend Development** | **UI Component Engineer** | - Implementar componentes reutilizables (lista, detalle, carrito).<br>- Garantizar que cada componente tenga pruebas unitarias.<br>- Mantener la arquitectura del estado (`useStore`). | `src/components/…`, `src/store/useStore.ts` |
| | **Image Asset Manager** | - Verificar y normalizar la ruta de **todas** las imágenes en `mockDb.ts`.<br>- Descargar imágenes faltantes usando `download_images.ts` y almacenarlas en `public/images/products/`.<br>- Actualizar los campos `image` con rutas relativas correctas (`/images/products/...`). | `src/data/mockDb.ts`, `download_images.ts` |
| | **Interaction Specialist** | - Añadir los handlers mínimos para: agregar al carrito, cambiar de categoría, navegar a detalle de producto.<br>- Implementar lógica de **`needsInvoice`**, **`isInvoiced`** en la pestaña de facturación. | `src/components/**`, `src/lib/billingExport.ts` |
| | **Accessibility Auditor** | - Ejecutar auditoría de accesibilidad con la skill `a11y‑debugging`.
- Corregir ARIA, contrastes y foco. | - |
| **Backend / Data** | **Firestore Sync Engineer** | - Configurar `FirebaseSync.ts` para sincronizar `products`, `categories` y `users` en tiempo real.
- Validar que los documentos tengan campos obligatorios (`id`, `name`, `price`, `image`). | `src/lib/firebaseSync.ts` |
| | **Data Validation Agent** | - Implementar funciones de validación de precios contra catálogo (`priceValidator`).
- Añadir Cloud Function que rechace escritura de precios inconsistentes. | `functions/src/priceValidator.ts` (a crear) |
| | **Pricing Validation Agent** | - Revisar y corregir **todas** las imágenes de precios en la UI (etiquetas, badges).
- Garantizar que la prop `price` siempre se muestre con 2 decimales (`round2`). | `src/lib/commerce.ts` |
| | **Stock Management Agent** | - Crear Cloud Function que verifique que el stock no pueda decrementarse sin pago confirmado.
- Añadir campo `stock` y `warehouseStock` en Firestore y sincronizar en `mockDb.ts`. | `functions/src/stockGuard.ts` (a crear) |
| **UI/UX Design** | **Visual Designer** | - Definir paleta de colores premium (gradientes, glassmorphism).
- Aplicar estilos a los componentes críticos (navbar, tarjetas de producto, botones). | `src/styles/index.css` |
| | **Motion Designer** | - Añadir micro‑animaciones (hover, transiciones) usando Tailwind utilities (`transition`, `duration-200`). | - |
| | **Brand System Curator** | - Crear tokens de diseño (`--color-primary`, `--radius-base`).
- Documentar en `README.md`. | - |
| **Quality Assurance** | **Unit Test Writer** | - Generar pruebas para `buildCustomers`, `computeSegment`, `getVIPCustomers`.
- Usar Jest con `ts-jest`. | `src/lib/**.test.ts` |
| | **E2E Test Engineer** | - Implementar Playwright tests que cubran flujo de compra y facturación.
- Verificar que las imágenes se carguen sin 404. | `e2e/` |
| | **Regression Tester** | - Ejecutar pruebas de regresión después de cada corrección de imágenes.
- Mantener checklist de tickets. | - |
| **Security** | **Rules Auditor** | - Revisar `firestore.rules` y `storage.rules` para bloquear `isAdmin:true` y acceso a imágenes no autorizadas.
- Ejecutar la skill `firebase‑security‑rules‑auditor`. | `firestore.rules` |
| | **Credential Manager** | - Rotar la clave de administrador expuesta.
- Actualizar UID en reglas. | - |
| | **Cloud Function Security** | - Añadir validaciones en las funciones de precios/stock.
- Aplicar principle of least privilege a los Service Accounts. | `functions/**` |
| **DevOps / CI** | **Build Pipeline Engineer** | - Configurar GitHub Actions (`github‑actions‑templates`) para lint, test y build.
- Generar artefacto de distribución (`npm run build`). | `.github/workflows/ci.yml` |
| | **Deploy Automation** | - Automatizar `firebase deploy --only hosting,firestore,functions`.
- Añadir pre‑deploy checks de imágenes. | - |
| | **Monitoring** | - Implementar Firebase Performance Monitoring y Crashlytics.
- Configurar alertas para fallos de carga de imágenes. | - |

---

## 3. Plan de Corrección de Imágenes de Productos

1. **Inventario de imágenes**
   - Ejecutar `node download_images.ts` (ya disponible) para descargar todas las URLs referenciadas en `mockDb.ts`.
   - Guardar en `public/images/products/` con nombre `{id}.jpg`.
2. **Actualización de `mockDb.ts`**
   - Reemplazar cada campo `image` con la ruta relativa:
     ```ts
     image: "/images/products/<id>.jpg",
     ```
   - Validar que **todos** los objetos `Product` tengan este campo.
3. **Validación**
   - Añadir test unitario `products.test.ts` que recorra `products` y lance error si la ruta no existe en el FS.
   - Ejecutar pruebas en CI.
4. **Categorías**
   - Cada `Category` tiene un `icon` (emoji). Verificar que la UI muestre iconos y que los nombres coincidan con los `subcategories` de productos.
   - Si falta alguna subcategoría, crear archivo `src/components/CategoryBadge.tsx` que renderice badge con color definido.
5. **Deploy**
   - Después de la corrección, ejecutar `firebase deploy --only hosting` para que las imágenes estén disponibles.

---

## 4. Funcionalidad Mínima Necesaria (MVP)

| Feature | Descripción | Sub‑Agente Responsable |
|---------|-------------|------------------------|
| **Catálogo de productos** | Listado de tarjetas con imagen, nombre, precio y botón *Agregar al carrito*. | UI Component Engineer |
| **Detalle del producto** | Vista con foto ampliada, descripción, stock disponible y botón comprar. | Interaction Specialist |
| **Carrito** | Añadir/Eliminar productos, cálculo de total, persistencia en `localStorage`. | UI Component Engineer |
| **Facturación básica** | Mostrar pedidos pagados, permitir registrar número de factura (campo `PendingRow`). | Interaction Specialist |
| **Sincronización de datos** | Mantener `products`, `categories` y `users` actualizados en tiempo real. | Firestore Sync Engineer |
| **Validación de precios/stock** | Impedir que se cree un pedido si el stock es 0 o el precio difiere del catálogo. | Data Validation Agent |
| **Seguridad** | Regla que evita crear usuarios con `isAdmin:true`; regla de Storage que solo permite lectura a usuarios autenticados. | Rules Auditor |
| **Tests** | Unit tests para lógica del negocio + E2E flujo compra‑factura. | QA sub‑agentes |
| **CI/CD** | Lint → Test → Build → Deploy automático. | DevOps sub‑agentes |

---

## 5. Checklist de Entregables

- [ ] **Imagenes descargadas** (ejecutar `node download_images.ts`).
- [ ] **`mockDb.ts` actualizado** con rutas correctas.
- [ ] **Componentes UI** creados y estilizados.
- [ ] **Funciones de negocio** (`computeSegment`, `buildCustomers`, etc.) cubiertas por pruebas.
- [ ] **Reglas de seguridad** revisadas y auditadas.
- [ ] **Cloud Functions** para validación de precios y stock implementadas.
- [ ] **CI pipeline** configurada y pasando.
- [ ] **Documentación** (este `DEPARTMENT_PLAN.md`) incluida en el repo.

---

## 6. Próximos Pasos Inmediatos
1. Ejecutar `node download_images.ts` y validar que no haya errores de red.
2. Commit de cambios en `mockDb.ts` (ruta de imágenes) y abrir PR.
3. Asignar sub‑agentes a tareas según tabla anterior.
4. Iniciar Sprint 1 (2 semanas) centrado en **Imagenes + Catálogo**.

---

*Este documento está pensado para ser la hoja de ruta definitiva del proyecto, permitiendo que cada sub‑agente trabaje de forma aislada pero coordinada, garantizando que **todas** las fotos de los productos y sus detalles queden correctas y que la funcionalidad mínima esté operativa al 100 %.*

---

[Ver `mockDb.ts`](file:///Users/macbook/Documents/Antigravity/Mi%20Negocio/frontend/src/data/mockDb.ts)
[Ver `download_images.ts`](file:///Users/macbook/Documents/Antigravity/Mi%20Negocio/frontend/download_images.ts)
[Ver `firestore.rules`](file:///Users/macbook/Documents/Antigravity/Mi%20Negocio/firestore.rules)
