import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Category } from "@/types";
import { SectionCards } from "@/components/section-cards";
import { useQueryClient } from "@tanstack/react-query";
import DataTableWrapper from "@/components/data-table-wrapper";
// import { getProducts, getCategories, getTotalRevenue } from "@/app/queries";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // const totalRevenue = getTotalRevenue();
  // const { data: products, count: totalProducts } = getProducts();
  // const categories = getCategories();

  // const { data: totalRevenue } = await supabase.rpc("get_total_price");

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

              <DataTable
                data={products ?? []}
                suppliers={suppliers ?? []}
                categories={categories ?? []}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
