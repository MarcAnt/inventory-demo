"use client";

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetProducts } from "@/hooks/queries";
import { useHandleCurrency } from "@/hooks/use-handle-currency";
import { useMemo } from "react";

export function SectionCards() {
  const totalProductsQuery = useGetProducts();
  const totalProducts = totalProductsQuery.data?.count;

  const totalStock = useMemo(() => {
    return totalProductsQuery.data?.data?.reduce(
      (acc, curr) => acc + curr.stock,
      0,
    );
  }, [totalProductsQuery.data]);

  const totalRevenue = useMemo(() => {
    return totalProductsQuery.data?.data?.reduce(
      (acc, curr) => acc + curr.price * curr.stock,
      0,
    );
  }, [totalProductsQuery.data]);

  const { handleToggleCalculate, toggleCurrency, handleCurrency } =
    useHandleCurrency();

  console.log(totalStock);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Productos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-xl">
            {totalProducts || 0}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Ganancias</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-xl">
            {`${toggleCurrency} ${totalRevenue ? handleCurrency(totalRevenue) : 0}`}
          </CardTitle>
          <CardAction>
            <Button className="text-xs" onClick={() => handleToggleCalculate()}>
              <p>Convertir a {`${toggleCurrency === "$" ? "Bs." : "$"}`}</p>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Stock Total</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-xl">
            {totalStock || 0}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
