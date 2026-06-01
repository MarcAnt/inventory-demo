import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Category, Currency, Products, Suppliers } from "@/types";

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
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export const updateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ status })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const updateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Products) => {
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
};

export const getTotalRevenue = () => {
  return useQuery<number>({
    queryKey: ["total-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_total_revenues");
      if (error) throw error;
      return data;
    },
  });
};

export const getProducts = () => {
  return useQuery<{ data: Products[]; count: number | null }>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("products")
        .select("*, categories!inner(name)", { count: "exact" });
      if (error) throw error;
      return { data, count };
    },
  });
};

export const getProductBySlug = (slug: string) => {
  return useQuery<Products>({
    queryKey: ["products", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories!inner(name), suppliers!inner(name)")
        .eq("name", slug.replaceAll("-", " "))
        .single();

      if (error) throw error;
      return data;
    },
    // refetchInterval: 10000,
  });
};

export const getCategories = () => {
  return useQuery<Category[]>({
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
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const createProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Products, "id">) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const createCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Omit<Category, "id">) => {
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const getCategoryByProductId = () => {
  return (productId: number) => {
    return useQuery<Category>({
      queryKey: ["categories", productId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories!inner(name)")
          .eq("id", productId)
          .single();
        if (error) throw error;
        return data as Category;
      },
    });
  };
};

export const getSuppliers = () => {
  return useQuery<Suppliers[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("name, id")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
};

export const getTotalStock = () => {
  return useQuery<number>({
    queryKey: ["total-stock"],
    queryFn: async () => {
      // const { data, error } = await supabase
      //   .from("products")
      //   .select("stock")
      //   .eq("status", "ACTIVE");
      // if (error) throw error;
      // return data?.reduce((acc, product) => acc + product.stock, 0) || 0;

      const { data, error } = await supabase.rpc("get_total_stock");
      if (error) throw error;
      return data as number;
    },
  });
};

export const getCurrentCurrency = () => {
  return useQuery<Currency[]>({
    queryKey: ["current-currency"],
    queryFn: async () => {
      const response = await fetch("https://ve.dolarapi.com/v1/dolares");
      const data: Currency[] = await response.json();
      return data;
    },
    refetchInterval: 24 * 60 * 60,
  });
};
