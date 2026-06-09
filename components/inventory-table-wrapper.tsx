"use client";
import { Category, Product, Supplier } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import InventoryDataTable from "./inventory-data-table";

function InventoryTableWrapper({
  initialProducts,
  initialCategories,
  initialSuppliers,
}: {
  initialProducts: { data: Product[]; count: number | null };
  initialCategories: Category[];
  initialSuppliers: Supplier[];
}) {
  const supabase = createClient();

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
    refetchOnWindowFocus: false,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, id");
      // .order("name");
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
        .select("name, id");
      // .order("name");
      if (error) throw error;
      return data;
    },
    initialData: initialSuppliers,
  });

  return (
    <InventoryDataTable
      data={products.data || []}
      categories={categories}
      suppliers={suppliers}
    />
  );
}

export default InventoryTableWrapper;
