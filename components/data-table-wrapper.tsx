// app/dashboard/page.tsx
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
// import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function DataTableWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();

  // Create the Supabase client for Server Components
  //   const supabase = createServerClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  //     {
  //       cookies: {
  //         getAll() { return cookieStore.getAll() },
  //         setAll(cookiesToSet) {
  //           try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
  //           catch { /* Handle edge case if modifying cookies in server component */ }
  //         },
  //       },
  //     }
  //   );
  const supabase = createClient(cookieStore);

  // Prefetch data on the server using Supabase syntax
  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories!inner(name)", { count: "exact" });
      if (error) throw error;
      return data;
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
