import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { z } from "zod";
import { ProductSchema } from "@/schemas";
import { Category, Products,  } from "@/types";

const supabase = createClient();

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ stock })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida la cache para forzar un refetch
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}


export const updateProduct = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: z.infer<typeof ProductSchema>) => {
      const { data, error } = await supabase
        .from("products")
        .update(product)
        .eq("id", product.id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida la cache para forzar un refetch
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export const getTotalRevenue = () => {
  
  return useQuery<number>({
    queryKey: ["total-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_total_price");
      if (error) throw error;
      return data;
    },
  });
};

export const  getProducts = () => {
  
  return  useQuery<{ data:Products[], count: number | null}>({
    queryKey: ["total-products"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("products")
        .select("*, categories!inner(name)", { count: "exact" });
      if (error) throw error;
      return { data, count };
    },
  });
};

export const getCategories = () => {
  
  return  useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name, id")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
};


export const deleteProduct = () => {

  const queryClient = useQueryClient();
  
  return useMutation({  
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};