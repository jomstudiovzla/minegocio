# Fotos del catálogo

Nota del 6 de octubre de 2026. El trabajo reemplazó bytes de JPEG locales. No se editó `inventario_extenso.csv`, no se escribió Firestore y no se publicó ni se hizo commit.

La tienda lee `products.image`. Esas rutas siguen siendo `/images/products/scraped/pN.jpg`. Cambiar el archivo en esa ruta cambia la foto sin tocar el documento.

## Qué quedó

De 190 productos:

- 57 fotos se reemplazaron porque el archivo actual no coincidía con una foto local ya confirmada.
- 15 ya tenían los bytes correctos y no se tocaron.
- 9 siguen con la foto anterior, a propósito.

El reparto de las 57: 33 desde la copia local `Ananas/`, 13 por nombre exacto dentro de `frontend/public/images/products/scraped/`, 11 por revisión visual de archivos `scraped_p*.jpg` que ya estaban en esa carpeta.

Respaldo de los 57 archivos anteriores: `/tmp/mn-photo-backup/`. Cada uno se llama `PRD-XXX_pN.jpg`. Esa carpeta está fuera de `frontend/public`, así que no entra en una publicación. Para devolver una foto: copiar el respaldo encima del `pN.jpg` del mismo nombre.

Comprobación: los 57 destinos quedaron con el mismo MD5 que su origen y distinto del respaldo, y siguen siendo JPEG. `http://localhost:3000/images/products/scraped/p18.jpg` (acelgas) y `p75.jpg` (carne molida) responden 200 y coinciden con el archivo en disco. La hoja de contacto posterior muestra acelgas, vainitas, ocumo, pak choi, pulpa, kale, parchita, perejil, carnes, pescados, arroz Mary, tomate de árbol, pimentón Palermo y pimentón Kapia en la ficha que les corresponde.

## Notas de las fotos que sí quedaron

- PRD-059 Costillas de cerdo BBQ. Antes era una caja de pasta sin gluten. Ahora es la bandeja única de Plazas «Preparados Congelados» asociada a ese nombre. La palabra costillas no se lee en el empaque.
- PRD-116 Acondicionador Drene Proh cabello rizado 370 ml. Ya mostraba el frasco Drene. La línea visible es Pro-Vitaminas; no se lee «cabello rizado».
- PRD-153 Bolsa Samanta 60 LT. Ya mostraba las bolsas Samanta. El impreso parece 50×70 cm, no 60 litros.

## Las 9 que siguen mal

No había una foto local que coincidiera con el nombre, el peso o la variante.

| Id | Producto | Por qué se dejó |
| --- | --- | --- |
| PRD-016 | Hierbabuena Culprofres 25 g | La menta suelta no es el empaque de 25 g |
| PRD-069 | Involtini de pollo Plazas | El archivo emparejado es un ícono de «sin foto», no el producto |
| PRD-084 | Pasta Primor plumitas 1 kg | La foto Primor disponible es tornillos, no plumitas |
| PRD-098 | Arroz Amanecer Premium tipo I 900 g | La bolsa disponible dice 800 g |
| PRD-127 | Solución Simplex Express 120 ml | El mililitraje no se lee y el frasco se parece al de 240 ml |
| PRD-139 | Solución Simplex Express 240 ml | Mismo caso que PRD-127 |
| PRD-128 | Tinte Mystic Fantasía Rojo Berry | La foto disponible es Mystic Natural 88 |
| PRD-168 | Limpiador de cerámica Fuller 1 L | La foto Fuller disponible es limpiador de pisos |
| PRD-175 | Limpiador antibacterial Arboleda Fuller 1 L | No hay foto confirmada |

## Ya correctas, sin copia

PRD-063 camarones limpios, PRD-077 pasta Ronco tornillo 1 kg, PRD-090 Ronco vermicelli, PRD-091 salsa Frescarini boloñesa, PRD-105 Mary vermicelli, PRD-116 Drene, PRD-117 gel BBK, PRD-140 Speed Stick Clinical, PRD-146 Ariel 4 kg, PRD-147 Maderol, PRD-153 bolsas Samanta, PRD-154 mármol y granito Fuller, PRD-160 perlas Downy Fresh 141 g, PRD-161 Pride 360 cc, PRD-167 almohadilla Limpia Sol.
