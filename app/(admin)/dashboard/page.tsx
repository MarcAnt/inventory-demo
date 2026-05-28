import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Category, Products, Suppliers } from "@/types";
import { SectionCards } from "@/components/section-cards";

import DataTableWrapper from "@/components/data-table-wrapper";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // queryClient.prefetchQuery({
  //   queryKey: ["products"],
  //   queryFn: async () => {
  //     const { data, error, count } = await supabase
  //       .from("products")
  //       .select("*, categories!inner(name)", { count: "exact" });
  //     if (error) throw error;
  //     return { data, count };
  //   },
  // });
  // queryClient.prefetchQuery({
  //   queryKey: ["categories"],
  //   queryFn: getCategories,
  // });
  // queryClient.prefetchQuery({
  //   queryKey: ["suppliers"],
  //   queryFn: getSuppliers,
  // });
  // await Promise.all([
  // ]);

  // const cookieStore = await cookies();
  // const supabase = createClient(cookieStore);

  // const totalRevenue = getTotalRevenue();
  // const products = getProducts().data;
  // const categories = getCategories().data;
  // const suppliers = getSuppliers().data;

  const { data: products } = await supabase
    .from("products")
    .select("*, categories!inner(name)", { count: "exact" });

  const { data: categories } = await supabase
    .from("categories")
    .select("name, id")
    .order("name");

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("name, id")
    .order("name");

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              {/* <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div> */}
              {/* <HydrationBoundary state={dehydrate(queryClient)}>
              </HydrationBoundary> */}
              <DataTableWrapper
                initialProducts={{ data: products as Products[], count: null }}
                initialCategories={categories as Category[]}
                initialSuppliers={suppliers as Suppliers[]}
              />

              {/* <DataTable
                data={products?.data ?? []}
                suppliers={suppliers ?? []}
                categories={categories ?? []}
              /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
