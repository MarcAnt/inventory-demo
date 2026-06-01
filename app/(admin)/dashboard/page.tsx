import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Category, Products, Suppliers } from "@/types";
import { SectionCards } from "@/components/section-cards";

import DataTableWrapper from "@/components/data-table-wrapper";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <DataTableWrapper
            initialProducts={{ data: products as Products[], count: null }}
            initialCategories={categories as Category[]}
            initialSuppliers={suppliers as Suppliers[]}
          />
        </div>
      </div>
    </div>
  );
}
