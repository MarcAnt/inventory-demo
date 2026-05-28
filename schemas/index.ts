import * as z from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  price: z
    .number({
      error: "El precio debe ser un número",
    })
    .nonnegative("El precio debe ser mayor o igual a 0")
    .refine(value => value > 0, { message: "El precio debe ser mayor a 0" }),
  sku: z.string().min(3, "El SKU debe tener al menos 3 caracteres"),
  barcode: z.coerce.number({ error: "Por favor, ingrese un código de barras válido" }).nonnegative().refine(value => value > 0, { message: "Ingresa un código de barras válido" }),
  stock: z
    .number({
      error: "El stock debe ser un número",
    })
    .nonnegative("El stock debe ser mayor o igual a 0"),
  min_stock: z
    .number({
      error: "El stock mínimo debe ser un número",
    })
    .nonnegative("El stock mínimo debe ser mayor o igual a 0"),
  supplier_id: z.coerce.number({ error: "Por favor, seleccione un proveedor" }).nonnegative().refine(value => value > 0, { message: "Por favor, seleccione un proveedor" }),
  category_id: z.coerce.number({ error: "Por favor, seleccione una categoría" }).nonnegative().refine(value => value > 0, { message: "Por favor, seleccione una categoría" }),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});


export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres").optional(),
});

export const SupplierSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres")
});
