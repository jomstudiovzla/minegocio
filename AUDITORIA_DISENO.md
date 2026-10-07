# Mi Negocio — Auditoría del sistema de diseño

Fecha: 6 de octubre de 2026. Alcance: `frontend/src` (51 archivos `.tsx` y `globals.css`). Los números salen de contar clases y valores en el código; la puntuación es una estimación mía, no una medida estándar.

## Resumen

**Componentes revisados:** 29 compartidos + 4 patrones repetidos (botón, campo, tarjeta, etiqueta) | **Problemas encontrados:** 14 | **Puntuación:** 35/100

La marca está bien definida en color (azul `#001b62` y amarillo `#F8B808`) y esos tokens sí se usan. Lo que falta es todo lo demás: no hay componentes base, así que cada pantalla vuelve a dibujar sus botones, campos y tarjetas a mano. Por eso la tienda se ve "parecida pero no igual" de una página a otra, y por eso un rediseño hoy obligaría a tocar 51 archivos en vez de 5.

| Área | Puntos | Por qué |
|---|---|---|
| Tokens | 12/30 | Solo color y fuente. Sin escala de espaciado, radios, sombras ni movimiento. |
| Componentes | 5/30 | Ningún primitivo compartido (Button, Input, Card, Badge, Modal). |
| Consistencia | 10/20 | La paleta de marca se respeta; forma, tamaño y peso no. |
| Accesibilidad | 8/20 | Zoom bloqueado, modales sin rol, foco quitado en 43 sitios. |

## Consistencia de nombres

| Problema | Dónde | Recomendación |
|---|---|---|
| Dos amarillos de marca: el token `#F8B808` y `#fcbc11` escrito a mano (3 veces) | `.tsx` varios | Dejar solo `mi-yellow`. |
| Amarillo de Tailwind (`yellow-400`, etc.) usado 106 veces junto a `mi-yellow` (107 veces) | Etiquetas de producto, avisos | Decidir: `mi-yellow` para marca, un token `warning` para avisos. |
| Azul de Tailwind (`blue-*`, 31 usos) e `indigo` (3) junto a `mi-blue` (433) | Panel admin sobre todo | Reemplazar por la escala `mi-blue-*`. |
| 4 tokens `ananas-*` heredados, 0 usos | `globals.css` | Borrarlos. |
| La escala azul se nombra por adjetivo (`mid`, `light`, `pale`, `fixed`, `surface`, `low`, `ice`); `ice` y `mi-bg` son el mismo color | `globals.css` | Pasar a escala numérica (`mi-blue-50…900`) o a nombres de función (`surface`, `border`, `text`). |
| Sin colores de significado: rojo (174 usos), verde (122), naranja (55), morado (14) se eligen pantalla por pantalla | Todo | Crear `success`, `danger`, `warning`, `info`. |
| La categoría se muestra con su código (`frutas-vegetales`) en el carrito | `cart/page.tsx` | Mostrar el nombre legible. |

## Cobertura de tokens

| Categoría | Definidos | Valores escritos a mano |
|---|---|---|
| Colores | 14 de marca + 4 heredados sin uso | 17 hex en `.tsx` (13 distintos) y 25 hex en `globals.css` fuera de `@theme` |
| Espaciado | 0 | 207 valores arbitrarios (`w-[96%]` ×19, `max-w-[1600px]` ×19, …) |
| Tipografía | 1 (familia) | `text-[11px]` ×67 y `text-[10px]` ×32; pesos: bold 524, black 267, medium 222, semibold 19 |
| Radios | 0 | 6 radios estándar en uso (xl 203, 2xl 124, full 114, 3xl 79, lg 56, md 4) + 7 arbitrarios (`[2rem]`, `[2.5rem]`, `[1.5rem]`) |
| Sombras | 0 | 5 niveles mezclados (sm 85, lg 33, md 32, xl 17, 2xl 11) |
| Movimiento | 0 | Duraciones sueltas en cada componente; sin `prefers-reduced-motion` |
| Capas (z-index) | 0 | `z-[9999]`, `z-[60]` y otros a mano |

## Estado de los componentes

| Componente | Estados | Variantes | Documentación | Nota |
|---|---|---|---|---|
| Botón principal | ⚠️ hover y disabled a veces; sin "cargando" común | ❌ 21 formas distintas en 37 usos (23 archivos) | ❌ | 2/10 |
| Campo de texto | ⚠️ foco sí; error cada pantalla a su modo | ❌ 14 formas en 34 usos (11 archivos) | ❌ | 3/10 |
| Tarjeta | — | ⚠️ 13 formas en 73 usos; domina `p-6/p-8 rounded-3xl shadow-sm` | ❌ | 4/10 |
| Etiqueta (badge) | — | ❌ 5 formas en 8 usos | ❌ | 3/10 |
| Ventana modal | ❌ 7 modales, ninguno con `role="dialog"` ni cierre con Esc garantizado | ❌ cada uno propio | ❌ | 2/10 |
| Avisos | ⚠️ `CartToast` propio + 5 `alert/confirm` del navegador | ❌ | ❌ | 3/10 |
| Foto de producto | ✅ cargada / no disponible | ✅ tarjeta, ficha, miniatura | ⚠️ comentario en el archivo | 7/10 |
| Línea de tiempo del pedido | ✅ | ✅ | ⚠️ | 7/10 |

`ProductImage` se creó hoy al probar en localhost: 130 productos del catálogo apuntan a fotos que no existen en `public/images/products/scraped/` y salían como imagen rota.

### Accesibilidad

- `layout.tsx` fija `maximumScale: 1` y `userScalable: false`: una persona con baja visión no puede ampliar la página en el teléfono.
- 43 `outline-none` y ningún `focus-visible:`; con teclado no siempre se ve dónde estás.
- 152 botones y 17 `aria-label`: los botones de solo ícono (corazón, papelera, cerrar) no tienen nombre para lectores de pantalla.
- `text-gray-400` aparece 166 veces, a menudo sobre blanco y en 10–11 px: contraste bajo.
- 1 imagen sin `alt` en el panel.

## Acciones por prioridad

1. **Crear 5 primitivos y migrar**: `Button` (principal, secundario, peligro, fantasma; tamaños sm/md/lg; estado cargando), `Field`, `Card`, `Badge`, `Modal`. Es lo que más reduce trabajo: ~150 puntos de uso pasan a depender de 5 archivos, y es el requisito para cualquier rediseño.
2. **Completar los tokens en `globals.css`**: colores de significado, 3 radios (control, tarjeta, píldora), 3 sombras, 2 tamaños de texto pequeño que reemplacen `text-[10px]`/`text-[11px]`, ancho de contenedor y capas z.
3. **Arreglar lo de accesibilidad que afecta a clientes**: quitar el bloqueo de zoom, foco visible, `aria-label` en botones de ícono, `role="dialog"` en modales, cambiar los 5 `alert/confirm` por el modal propio.
4. **Limpiar**: unificar el amarillo, quitar `ananas-*`, reemplazar `blue-*`/`indigo-*`/`yellow-*` de Tailwind por los de marca.
5. **Fotos**: conseguir las 130 fotos que faltan o subirlas desde Inventario; el aviso "Foto no disponible" es solo un parche visual.

Los pasos 1 y 2 son la primera mitad de un rediseño visual. Hechos esos, cambiar el aspecto de toda la tienda es editar tokens y 5 componentes.
