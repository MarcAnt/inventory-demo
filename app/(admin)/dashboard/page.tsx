import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Category, Product, Supplier } from "@/types";
import { SectionCards } from "@/components/section-cards";

import DataTableWrapper from "@/components/data-table-wrapper";
import { Separator } from "@/components/ui/separator";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("status", "INACTIVE")
    .lte("stock", 1);

  const { data: categories } = await supabase
    .from("categories")
    .select("name, id")
    .order("name");

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("name, id")
    .order("name");

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />

          <Separator orientation="horizontal" className="my-4" />
          <h1 className="scroll-m-20  text-2xl font-extrabold tracking-tight text-balance px-4 lg:px-6">
            Productos inactivos y con bajo stock
          </h1>
          <DataTableWrapper
            initialProducts={{ data: products as Product[], count: null }}
            initialCategories={categories as Category[]}
            initialSuppliers={suppliers as Supplier[]}
          />
        </div>
      </div>
    </div>
  );
}
