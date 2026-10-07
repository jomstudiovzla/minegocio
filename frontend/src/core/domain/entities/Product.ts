import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().min(1, "El ID es obligatorio"),
  name: z.string().min(1, "El nombre del producto no puede estar vacío"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  category: z.string().min(1, "La categoría es obligatoria"),
  subcategory: z.string().default('General'),
  image: z.string().url("Debe ser una URL válida").or(z.string().startsWith('/')),
  labels: z.array(z.string()).optional().default([]),
  unit: z.string().optional().default('Unidad'),
  stock: z.number().int().min(0, "El stock de tienda no puede ser negativo").default(0),
  warehouseStock: z.number().int().min(0, "El stock de almacén no puede ser negativo").default(0),
  description: z.string().optional().default(''),
  providerPrice: z.number().min(0).optional(),
  // Alícuota de IVA en % (16 general, 8 reducida, 0 exento). El precio YA la incluye.
  // Sin definir = la exportación para facturación marca la línea como "SIN DEFINIR".
  taxRate: z.union([z.literal(16), z.literal(8), z.literal(0)]).optional(),
  views: z.number().int().min(0).optional().default(0),
  sales: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().default(true), // Agregamos un flag seguro en lugar de eliminar
});

export type ProductEntity = z.infer<typeof ProductSchema>;
