"use client";
import GenericDataTable from "@/components/generic-data-table";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  GripVerticalIcon,
  ListFilterIcon,
  MinusIcon,
  PlusIcon,
  SquarePenIcon,
} from "lucide-react";
import { Supplier, Category, Product } from "@/types";
import { useHandleCurrency } from "@/hooks/use-handle-currency";
import {
  useDeleteProduct,
  useGetUserProfile,
  useUpdateProduct,
  useUpdateStock,
} from "@/hooks/queries";
import { Checkbox } from "@/components/ui/checkbox";
import { useSortable } from "@dnd-kit/sortable";
import { useState } from "react";
import { ProductsModal } from "./products-modal";
import CategoriesModal from "./categories-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteModal from "./generic-delete-modal";
import EditProductModal from "./edit-modal";

const TableEditRow = ({
  product,
  categories,
  suppliers,
}: {
  product: Product;
  categories: Category[];
  suppliers: Supplier[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useGetUserProfile();
  return (
    <>
      <DropdownMenu>
        <div className="flex items-center justify-center w-full">
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-open:bg-muted"
                size="icon"
              />
            }
          >
            <EllipsisVerticalIcon />
            <span className="sr-only">Abrir menú</span>
          </DropdownMenuTrigger>
        </div>

        <DropdownMenuContent align="end" className="w-32">
          {user?.role === "ADMIN" && (
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              <SquarePenIcon />
              Editar
            </DropdownMenuItem>
          )}

          <DropdownMenuItem>
            <Link href={`/dashboard/${product.name.split(" ").join("-")}`}>
              <div className="flex items-center gap-2">
                <EyeIcon /> Ver detalles
              </div>
            </Link>
          </DropdownMenuItem>

          {user?.role === "ADMIN" && (
            <>
              <DropdownMenuSeparator />
              <DeleteModal
                id={product.id}
                deleteAction={useDeleteProduct}
                successMessage="Producto eliminado exitosamente"
                errorMessage="Error al eliminar el producto"
              />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProductModal
        product={product}
        categories={categories}
        suppliers={suppliers}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<Product>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nombre del producto",
    cell: ({ row }) => {
      const productName = row.original.name;
      const urlSlug = `${productName.split(" ").join("-")}`;
      return (
        <div className="w-32">
          <Link
            href={`/dashboard/${urlSlug}`}
            className="text-blue-500 hover:text-blue-600"
          >
            {row.original.name}
          </Link>
        </div>
      );
    },
    enableHiding: true,
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "price",
    header: "Precio Unitario",
    cell: ({ row, table }) => {
      const handleCurrency = table.options.meta?.handleCurrency;
      const toggleCurrency = table.options.meta?.toggleCurrency;
      return (
        <div className="w-32">{`${toggleCurrency} ${handleCurrency?.(row.original.price)}`}</div>
      );
    },
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => <div className="w-32">{row.original.sku}</div>,
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row, table }) => {
      const stock = row.getValue<number>("stock");
      const min_stock = row.getValue<number>("min_stock");
      const handleUpdateStock = table.options.meta?.useUpdateStock();

      const addStock = async (id: string, stock: number) => {
        handleUpdateStock?.mutateAsync({ id, stock: stock + 1 });
      };

      const removeStock = async (id: string, stock: number) => {
        handleUpdateStock?.mutateAsync({ id, stock: stock - 1 });
      };

      return (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  onClick={() => removeStock(row.original.id, stock)}
                  className="h-4 w-4"
                >
                  <MinusIcon />
                </Button>
              }
            />
            <TooltipContent>Reducir Stock</TooltipContent>
          </Tooltip>
          {stock}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  onClick={() => addStock(row.original.id, stock)}
                  className="h-4 w-4"
                >
                  <PlusIcon />
                </Button>
              }
            />
            <TooltipContent>Aumentar Stock</TooltipContent>
          </Tooltip>

          {stock <= min_stock && (
            <Badge
              variant="outline"
              className="px-1 text-destructive bg-destructive/10 text-xs"
            >
              Bajo
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "min_stock",
    header: "Stock Mínimo",
    cell: ({ row }) => {
      return (
        <div className="w-32 text-center">{row.original.min_stock ?? 0}</div>
      );
    },
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "supplier",
    header: "Proveedor",
    cell: ({ row, table }) => {
      const suppliers = table.options.meta?.suppliers;

      return (
        <div className="w-32 flex items-center justify-start">
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {
              suppliers?.find(
                (supplier) =>
                  supplier.id.toString() ===
                  row.original.supplier_id?.toString(),
              )?.name
            }
          </Badge>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "text",
    enableHiding: true,
  },
  {
    accessorKey: "categories",
    header: "Categorías",
    cell: ({ row, table }) => {
      const categories = table.options.meta as { categories: Category[] };

      return (
        <div className="w-32 flex items-center justify-start">
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {
              categories?.categories?.find(
                (category) =>
                  category.id.toString() ===
                  row.original.category_id.toString(),
              )?.name
            }
          </Badge>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "text",
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <div className="flex items-center gap-2">
          {status === "ACTIVE" ? (
            <Badge variant="outline" className="px-1 text-green-500">
              Activo
            </Badge>
          ) : (
            <Badge variant="outline" className="px-1 text-red-500">
              Inactivo
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "alphanumeric",
    enableHiding: true,
    filterFn: "equalsString",
  },

  {
    id: "actions",
    accessorKey: "Acciones",
    cell: ({ row, table }) => {
      const categories = (table.options.meta?.categories as Category[]) || [];
      const suppliers = (table.options.meta?.suppliers as Supplier[]) || [];

      return (
        <TableEditRow
          product={row.original}
          categories={categories}
          suppliers={suppliers}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

const InventoryDataTable = ({
  data,
  categories,
  suppliers,
}: {
  data: Product[];
  categories: Category[];
  suppliers: Supplier[];
}) => {
  const { handleCurrency, toggleCurrency, handleToggleCalculate } =
    useHandleCurrency();
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [open, setIsOpen] = useState(false);
  const { data: user } = useGetUserProfile();

  return (
    <>
      <GenericDataTable
        data={data}
        columns={columns}
        meta={{
          categories,
          suppliers,
          useUpdateStock: useUpdateStock,
          useDeleteProduct: useDeleteProduct,
          useUpdateProduct: useUpdateProduct,
          handleCurrency: handleCurrency,
          toggleCurrency: toggleCurrency,
        }}
        showFilters={true}
        filterComponent={({ table }) => {
          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="sm" />}
                >
                  <ListFilterIcon data-icon="inline-start" />
                  Status
                  <ChevronDownIcon data-icon="inline-end" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Estado</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      onValueChange={(value) => {
                        table
                          .getColumn("status")
                          ?.setFilterValue(value === "ALL" ? undefined : value);
                      }}
                    >
                      <DropdownMenuRadioItem value="ALL">
                        Todos
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="ACTIVE">
                        Activo
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="INACTIVE">
                        Inactivo
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                className="text-xs"
                onClick={() => handleToggleCalculate()}
              >
                <p>Convertir a {`${toggleCurrency === "$" ? "Bs." : "$"}`}</p>
              </Button>

              {user?.role === "ADMIN" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                  >
                    <PlusIcon />
                    Agregar Categoría
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                  >
                    <PlusIcon />
                    Agregar Producto
                  </Button>
                </>
              )}
            </>
          );
        }}
      />

      <ProductsModal
        open={open}
        setIsOpen={setIsOpen}
        categories={categories}
        suppliers={suppliers}
      />
      <CategoriesModal
        open={openCategoryModal}
        setIsOpen={setOpenCategoryModal}
      />
    </>
  );
};

export default InventoryDataTable;
