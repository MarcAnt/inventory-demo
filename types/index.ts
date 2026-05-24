import { z } from "zod";
import { ProductSchema, SupplierSchema, CategorySchema } from "@/schemas";

type Category = z.infer<typeof CategorySchema>;

type Products = z.infer<typeof ProductSchema>;

type Suppliers = z.infer<typeof SupplierSchema>;

export type { Category, Products, Suppliers }