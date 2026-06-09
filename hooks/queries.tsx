import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

import {
  Category,
  Currency,
  Product,
  Supplier,
  Transaction,
  User,
} from "@/types";

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
    onSuccess: (updatedProduct: Product[]) => {
      // queryClient.invalidateQueries({ queryKey: ["products"] });

      queryClient.setQueryData(["products"], (oldData: { data: Product[] }) => {
        if (!oldData) return { data: [] };

        // 💡 Strictly map over items to maintain identical positions
        return {
          ...oldData,
          data: oldData.data.map((product: Product) =>
            product.id === updatedProduct[0].id ? updatedProduct[0] : product,
          ),
        };
      });
    },
  });
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Category) => {
      const { data, error } = await supabase
        .from("categories")
        .update(category)
        .eq("id", category.id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateProductStatus = () => {
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

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
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

export const useGetTotalRevenue = () => {
  return useQuery<number>({
    queryKey: ["total-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_total_revenues");
      if (error) throw error;
      return data;
    },
  });
};

export const useGetProducts = () => {
  return useQuery<{ data: Product[]; count: number | null }>({
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

export const useGetProductBySlug = (slug: string) => {
  return useQuery<Product>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories!inner(name), suppliers!inner(name)")
        .eq("name", slug.replaceAll("-", " "))
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useGetCategories = () => {
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

export const useDeleteProduct = () => {
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

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, "id">) => {
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

export const useCreateCategory = () => {
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

export const useGetSuppliers = () => {
  return useQuery<Supplier[]>({
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

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, "id">) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert(supplier)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: Supplier) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(supplier)
        .eq("id", supplier.id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useGetTotalStock = () => {
  return useQuery<number>({
    queryKey: ["products"],
    queryFn: async () => {
      //   const { data, error } = await supabase.rpc("get_total_stock");

      //   if (error) throw error;
      //   return data as number;

      const { data, error } = await supabase.from("products").select("stock");
      if (error) throw error;
      return data?.reduce((acc, curr) => acc + curr.stock, 0) ?? 0;
    },
  });
};

export const useGetCurrentCurrency = () => {
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

export const useCreateAuthUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Partial<User>) => {
      const { data, error } = await supabase.auth.signUp({
        email: user.email!,
        password: user.password!,
        options: {
          data: {
            first_name: user.first_name!,
            last_name: user.last_name!,
          },
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useSignInAuthUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Partial<User>) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: user.password!,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useSignOutAuthUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useGetAuthUser = () => {
  return useQuery<{
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    // avatar?: string;
  }>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      return {
        id: data.user.id!,
        first_name: data.user.user_metadata.first_name!,
        last_name: data.user.user_metadata.last_name!,
        email: data.user.email!,
        // avatar: data.user.user_metadata.avatar!,
      };
    },
  });
};

export const useGetUserProfile = () => {
  return useQuery<{
    id: string;
    first_name: string;
    last_name: string;
    role?: string;
    email: string;
  }>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.user?.id)
        .single();
      if (error) throw error;

      return {
        id: data?.id || "",
        first_name: data?.first_name || "",
        last_name: data?.last_name || "",
        role: data?.role || "",
        email: user?.user?.email || "",
      };
    },
  });
};

export const useChangeProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: { id: string; role: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          role: profile.role,
        })
        .eq("id", profile.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id">) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert(transaction)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
