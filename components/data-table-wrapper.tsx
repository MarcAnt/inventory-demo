"use client";

import { DataTable } from "./data-table";
import { Category, Products, Suppliers } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";

function DataTableWrapper({
  initialProducts,
  initialCategories,
  initialSuppliers,
}: {
  initialProducts: { data: Products[]; count: number | null };
  initialCategories: Category[];
  initialSuppliers: Suppliers[];
}) {
  const supabase = createClient();

  // React Query usará los datos del servidor de inmediato mientras se configura
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("products")
        .select("*, categories!inner(name)", { count: "exact" });
      if (error) throw error;
      return { data, count };
    },
    initialData: initialProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, id")
        .order("name");
      if (error) throw error;
      return data;
    },
    initialData: initialCategories,
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("name, id")
        .order("name");
      if (error) throw error;
      return data;
    },
    initialData: initialSuppliers,
  });

  return (
    <DataTable
      data={products?.data ?? []}
      suppliers={suppliers ?? []}
      categories={categories ?? []}
    />
  );
}

export default DataTableWrapper;
