"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getCategories,
  getProductBySlug,
  getSuppliers,
  updateProductStatus,
} from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BarcodeIcon,
  BookA,
  Calendar,
  FilePen,
  HashIcon,
  HistoryIcon,
  InfoIcon,
  Store,
  User,
  UserPen,
} from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EditProductModal from "@/components/edit-modal";
import { useHandleCurrency } from "@/hooks/use-handle-currency";
import { Skeleton } from "@/components/ui/skeleton";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type FormValues = z.infer<typeof statusSchema>;

const DetailsProduct = () => {
  const [open, setOpen] = useState(false);

  const params = useParams<{ slug: string }>();
  const { data: product, isLoading } = getProductBySlug(params.slug);

  const form = useForm<FormValues>({
    resolver: zodResolver(statusSchema),
    values: {
      status: product?.status ?? "ACTIVE",
    },
  });
  const updateProductStatusMutation = updateProductStatus();
  const { data: categories } = getCategories();
  const { data: suppliers } = getSuppliers();

  const { handleCurrency, handleToggleCalculate, toggleCurrency } =
    useHandleCurrency();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 px-4 lg:gap-2 lg:px-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div className="flex flex-col gap-1 px-4 lg:gap-2 lg:px-6">
      <div className="flex items-center justify-between gap-1">
        <h2 className="text-xl lg:text-2xl font-bold">
          Detalles del producto: {product.name}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline">
                    <InfoIcon />{" "}
                  </Button>
                }
              ></PopoverTrigger>
              <PopoverContent>
                <p className="text-sm text-muted-foreground">
                  Al cambiar el estado del producto, se mostrará como inactivo
                  en el inventario pero seguira existiendo en la base de datos
                </p>
              </PopoverContent>
            </Popover>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => {
                const isChecked = field.value === "ACTIVE";
                const toggleChecked = () => {
                  field.onChange(isChecked ? "INACTIVE" : "ACTIVE");
                  updateProductStatusMutation.mutate({
                    id: product.id,
                    status: isChecked ? "INACTIVE" : "ACTIVE",
                  });
                };

                return (
                  <Switch checked={isChecked} onCheckedChange={toggleChecked} />
                );
              }}
            />

            <Badge
              className={cn(
                "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                {
                  "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300":
                    product.status === "INACTIVE",
                },
              )}
            >
              {product.status === "ACTIVE" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <Button onClick={() => setOpen(true)}>
            <FilePen />
            <p>Editar</p>
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="p-4 bg-card rounded">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-muted-foreground">
            Descripción:
          </p>
          <p className="text-justify ">
            {product.description || "Sin descripción"}
          </p>
        </div>
      </div>

      <div className="grid  grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="flex flex-col items-start gap-2 w-full  pt-4 lg:p-0">
          <div className="flex items-center justify-between w-full gap-2">
            {product.price && (
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">Precio: </p>
                <p className="text-lg font-medium">
                  {`${toggleCurrency} ${handleCurrency(product.price)}`}
                </p>
              </div>
            )}
          </div>

          <Separator orientation="horizontal" className="my-1" />

          <div className="flex items-center justify-between w-full gap-2">
            {product.price && (
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">Inversión Total: </p>
                <p className="text-lg font-medium">
                  {`${toggleCurrency} ${handleCurrency(product.price * product.stock)}`}
                </p>
              </div>
            )}
            <Button onClick={() => handleToggleCalculate()}>
              <p>Convertir a {`${toggleCurrency === "$" ? "Bs." : "$"}`}</p>
            </Button>
          </div>

          <div className="flex gap-2 w-full justify-center items-center">
            <Card size="default" className="w-full ">
              <CardHeader>
                <CardDescription className="text-xl font-semibold">
                  Stock Actual
                </CardDescription>
                <CardTitle className="text-4xl font-semibold">
                  {product.stock}
                </CardTitle>
                <CardAction>
                  <Badge
                    className={cn(
                      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                      {
                        "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300":
                          product.stock <= product.min_stock,
                      },

                      {
                        "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300":
                          product.stock <= Math.floor(product.stock / 2),
                      },
                    )}
                  >
                    Stock:
                    {product.stock === 0
                      ? "Sin stock"
                      : product.stock <= product.min_stock
                        ? "Bajo"
                        : "Normal"}
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>

            <Card size="default" className="w-full">
              <CardHeader>
                <CardDescription className="text-xl font-semibold">
                  Stock Minimo
                </CardDescription>
                <CardTitle className="text-4xl font-semibold">
                  {product.min_stock || 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 bg-card p-4 rounded">
          <div className="flex items-center justify-between w-full gap-2">
            <p className="text-md font-semibold">Informacion general</p>
            <Button
              className="cursor-pointer"
              variant="secondary"
              onClick={() => setOpen(true)}
            >
              <HistoryIcon />
              <p className="hidden lg:block">Ver Historial de Movimientos</p>
            </Button>
          </div>

          {product.barcode && (
            <div className="flex items-center gap-2">
              <BarcodeIcon className="h-6 w-6" />
              <p className="text-muted-foreground font-semibold text-sm">
                Código de barras:
              </p>
              <p className="font-medium text-sm">{product.barcode}</p>
            </div>
          )}

          {product.sku && (
            <div className="flex items-center gap-2">
              <HashIcon />
              <p className="text-muted-foreground font-semibold text-sm">
                Código de producto (SKU):
              </p>
              <p className="font-medium text-sm">{product.sku}</p>
            </div>
          )}
          <Separator orientation="horizontal" className="my-1" />

          <div className="flex items-center gap-2">
            <BookA />
            <p className="text-muted-foreground font-semibold text-sm">
              Categoría:
            </p>
            <p className="font-medium text-sm">
              {product?.categories?.name ?? "Sin categoría"}
            </p>
          </div>

          <Separator orientation="horizontal" className="my-1" />
          <div className="flex items-center gap-2">
            <Store />
            <p className="text-muted-foreground font-semibold text-sm">
              Proveedor:
            </p>
            <p className="font-medium text-sm">
              {product?.suppliers?.name ?? "Sin proveedor"}
            </p>
          </div>
          <Separator orientation="horizontal" className="my-1" />
          <div className="flex items-center gap-2">
            <User />
            <p className="text-muted-foreground font-semibold text-sm">
              Creado por:
            </p>
            <p className="font-medium text-sm">Usuario Admin</p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <UserPen />
            <p className="text-muted-foreground font-semibold text-sm">
              Última edición:
            </p>
            <p className="font-medium text-sm">
              {Intl.DateTimeFormat("es-VE", {
                dateStyle: "full",
              }).format(new Date())}
            </p>
            <p className="text-muted-foreground font-semibold text-sm">Por: </p>
            <p className="font-medium text-sm">Usuario Admin</p>
          </div>

          <div className="flex items-center gap-2">
            <Calendar />
            <p className="text-muted-foreground font-semibold text-sm">
              Fecha de creacion:
            </p>
            <p className="font-medium text-sm">
              {Intl.DateTimeFormat("es-VE", {
                dateStyle: "full",
              }).format(new Date())}
            </p>
          </div>
        </div>
      </div>

      <EditProductModal
        product={product}
        categories={categories ?? []}
        suppliers={suppliers ?? []}
        isOpen={open}
        setIsOpen={setOpen}
      />
    </div>
  );
};

export default DetailsProduct;
