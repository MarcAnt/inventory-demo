import { z } from "zod";
import { ProductSchema, SupplierSchema, CategorySchema, UserSchema, LoginSchema, TransactionSchema } from "@/schemas";

type Category = z.infer<typeof CategorySchema>;

type Product = z.infer<typeof ProductSchema>;

type Supplier = z.infer<typeof SupplierSchema>;

type User = z.infer<typeof UserSchema>;

type Login = z.infer<typeof LoginSchema>;

type Transaction = z.infer<typeof TransactionSchema>;


interface Currency {
  moneda: string;
  fuente: string;
  nombre: string;
  compra: null;
  venta: null;
  promedio: number;
  fechaActualizacion: string;
}

export type { Category, Product, Supplier, User , Currency, Login, Transaction }