import { z } from "zod";
import { ProductSchema, SupplierSchema, CategorySchema } from "@/schemas";

type Category = z.infer<typeof CategorySchema>;

type Products = z.infer<typeof ProductSchema>;

type Suppliers = z.infer<typeof SupplierSchema>;


interface Currency {
  moneda: string;
  fuente: string;
  nombre: string;
  compra: null;
  venta: null;
  promedio: number;
  fechaActualizacion: string;
}

export type { Category, Products, Suppliers , Currency }