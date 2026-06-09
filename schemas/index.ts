import * as z from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string()
  .min(20, "La descripción debe tener al menos 20 caracteres")
  .max(256, "La descripción debe tener menos de 256 caracteres")
  .nullish().default(""),
 
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
  // created_by: z.string().min(1, "El creador debe tener al menos 1 caracter").optional(),
  updated_at: z.coerce.date().optional(),
  created_at: z.coerce.date().optional(),
  categories: z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  }).optional(),
  suppliers: z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  }).optional(),
  

});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres").optional(),
});

export const SupplierSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres").optional(),

});

export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.email("Por favor, ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  repeat_password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  first_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  last_name: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
}).refine((data) => data.password === data.repeat_password, {
  message: "Las contraseñas no coinciden",
  path: ["repeat_password"],
});


export const LoginSchema = z.object({
  email: z.email("Por favor, ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})
 
export const TransactionSchema = z.object({
  id: z.string(),
  product_id: z.coerce.number({ error: "Por favor, seleccione un producto" }).nonnegative().refine(value => value > 0, { message: "Por favor, seleccione un producto" }),
  type: z.enum(["IN", "OUT", "DAMAGE", "ADJUSTMENT"]),
  quantity: z.number({
    error: "La cantidad debe ser un número",
  }).nonnegative("La cantidad debe ser mayor o igual a 0"),
 
  user_id: z.string().min(1, "El usuario debe tener al menos 1 caracter").optional(),
  created_at: z.coerce.date().optional(),
})