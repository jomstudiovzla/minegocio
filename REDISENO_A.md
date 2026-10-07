# Mi Negocio — Rediseño visual (dirección "Abasto fresco")

Fecha: 6 de octubre de 2026. Decisión del dueño: **opción A — "Abasto fresco"**: cálida y con energía, foto de producto protagonista, **el amarillo es el color de la acción** (agregar, pagar, confirmar) y el azul es la estructura.

## Base construida (esta fase)

Lo que la auditoría de diseño marcó como prioridad #1, para que repintar la tienda sea editar pocos archivos y no 51:

- **Accesibilidad global** (`layout.tsx`, `globals.css`): se permite el zoom en móvil (antes bloqueado), foco visible al navegar con teclado en toda la tienda, y respeto a "reducir movimiento".
- **Tokens nuevos** (`globals.css`): colores con significado (éxito, peligro, aviso, info), 3 radios, 2 sombras y tamaños de texto pequeños nombrados. Se quitaron los 4 tokens `ananas-*` que nadie usaba.
- **5 componentes base** (`src/components/ui/`): `Button`, `Field`/`SelectField`, `Card`, `Badge`, `Modal` (accesible: rol de diálogo, cierra con Escape, bloquea el fondo). El `Button` ya trae la dirección A: **primario = amarillo con texto azul**; secundario = azul.

## Dirección A aplicada (primer repintado visible)

- El botón **"Agregar"** de todas las tarjetas de producto pasó de azul a **amarillo** (acción) — es el elemento más repetido de la tienda.
- El **"Finalizar Compra"** del carrito pasó a amarillo, para que todo el flujo de compra use el mismo color de acción.
- El **"Comprar Ahora"** del Hero ya era amarillo: ahora el criterio es consistente.

Regla de color de A, para seguir migrando igual:
- **Amarillo** = acción principal (agregar, pagar, confirmar).
- **Azul** = estructura, navegación y acciones de apoyo (pasos +/−, enlaces, encabezados).
- Rojo/verde/naranja = solo estados (error, éxito, aviso), vía los tokens nuevos.

## Qué falta (migración pantalla por pantalla)

Pasar cada pantalla a los componentes base y al criterio de color de A. Conviene hacerlo **con el servidor encendido** (`INICIAR_MI_NEGOCIO.command`) para revisar capturas e ir afinando, en este orden de impacto: Navbar → Hero → tarjetas (hecho el botón) → checkout → cuenta → panel admin → páginas de contenido. También sustituir los 5 `alert/confirm` del navegador por el `Modal` nuevo.

## Verificación

- `tsc --noEmit`: sin errores.
- No se pudo revisar en el navegador: el servidor de desarrollo estaba caído y el Mac en pantalla completa. Al encender el servidor se revisa el resultado y se continúa.
