"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GripVerticalIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ChevronUpIcon,
  PlusIcon,
  EyeIcon,
  SquarePenIcon,
  TrashIcon,
  MinusIcon,
} from "lucide-react";
import { ProductsModal } from "./products-modal";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ProductSchema } from "@/schemas";
import CategoriesModal from "./categories-modal";
import { Category, Products, Suppliers } from "@/types";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { UseMutationResult, useQueryClient } from "@tanstack/react-query";
import {
  deleteProduct,
  getProducts,
  updateProduct,
  useUpdateStock,
} from "@/hooks/queries";
import Link from "next/link";
import DataTableSearch from "./search-input";
import { Switch } from "@/components/ui/switch";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    updateStock: () => UseMutationResult<
      any[],
      Error,
      {
        id: string;
        stock: number;
      },
      unknown
    >;
    // setData: React.Dispatch<React.SetStateAction<TData[]>>;
    categories: Category[];
    suppliers: Suppliers[];
    deleteProduct: () => UseMutationResult<null, Error, string, unknown>;
    updateProduct: () => UseMutationResult<any[], Error, Products, unknown>;
  }
}

// Create a separate component for the drag handle
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

const DeleteProduct = ({
  id,
  // setData,
}: {
  id: string;
  // setData?: React.Dispatch<React.SetStateAction<Products[]>>;
}) => {
  const [open, setOpen] = React.useState(false);
  const deleteProductMutation = deleteProduct();

  const handleDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(id);
      // if (setData) {
      //   setData((prev: Products[]) =>
      //     prev.filter((product) => product.id !== id),
      //   );
      // }
      toast.success("Producto eliminado exitosamente");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el producto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="flex w-full items-center justify-start"
          />
        }
      >
        <TrashIcon className="mr-2 h-4 w-4" />
        Eliminar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente tu
            cuenta y tu información de nuestro servidor.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button onClick={handleDelete} variant="destructive">
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TableEditRow = ({
  product,
  categories,
  // deleteProduct,
  // updateProduct,
  // setData,
  suppliers,
}: {
  product: Products;
  categories: Category[];
  // deleteProduct: (id: string) => void;
  // updateProduct: (product: Products) => void;
  // setData?: React.Dispatch<React.SetStateAction<Products[]>>;
  suppliers: Suppliers[];
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const updateProductData = updateProduct();
  const form = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      ...product,
      category_id: String(product.category_id),
      supplier_id: String(product.supplier_id),
    },
    mode: "onChange",
  });

  const onSubmit = async (data: Products) => {
    try {
      await updateProductData.mutateAsync({ ...data, id: product.id });
      toast.success("Producto actualizado exitosamente");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el producto");
    }
  };

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
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <SquarePenIcon />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href={`/dashboard/${product.id}-${product.name.split(" ").join("-")}`}
            >
              <div className="flex items-center gap-2">
                <EyeIcon /> Ver detalles
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DeleteProduct id={product.id} />
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id={`edit-product-form-${product.id}`}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {product?.id ? "Editar" : "Agregar"} Producto
              </DialogTitle>
              <DialogDescription>
                {product?.id ? "Edita" : "Agrega"} un producto al inventario.
              </DialogDescription>

              <FieldGroup>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field, fieldState }) => {
                    const isChecked = field.value === "ACTIVE";
                    console.log({ field, isChecked });
                    const toggleChecked = () => {
                      field.onChange(isChecked ? "INACTIVE" : "ACTIVE");
                    };
                    return (
                      <Field
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldContent className="flex flex-row items-center justify-end">
                          <FieldLabel>
                            Estado del producto. Si el producto esta inactivo no
                            se podra vender pero aparecera en la lista de
                            productos.
                          </FieldLabel>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isChecked}
                              onCheckedChange={toggleChecked}
                            />
                            {isChecked ? "Activo" : "Inactivo"}
                          </div>
                        </FieldContent>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </DialogHeader>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Nombre del producto"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="sku"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>SKU</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="SKU"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="barcode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Código de barras
                    </FieldLabel>
                    <Input
                      {...field}
                      value={String(field.value ?? "")}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Código de barras"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="category_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="category_id">Categoría</FieldLabel>
                    <Select
                      name="category_id"
                      aria-invalid={fieldState.invalid}
                      onValueChange={field.onChange}
                      value={field.value}
                      items={categories.map((c) => ({
                        label: c.name,
                        value: String(c.id),
                      }))}
                    >
                      <SelectTrigger id="category_id">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="supplier_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="supplier_id">Proveedor</FieldLabel>
                    <Select
                      name="supplier_id"
                      aria-invalid={fieldState.invalid}
                      onValueChange={field.onChange}
                      value={field.value}
                      items={suppliers.map((s) => ({
                        label: s.name,
                        value: String(s.id),
                      }))}
                    >
                      <SelectTrigger id="supplier_id">
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.id}
                            value={String(supplier.id)}
                          >
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup className="grid grid-cols-3 gap-2">
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Precio</FieldLabel>
                    <Input
                      {...field}
                      step="0.01"
                      inputMode="decimal"
                      type="number"
                      value={field.value ?? 0}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Precio"
                      autoComplete="off"
                      min={0}
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="stock"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Stock</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? 0}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Stock Actual"
                      autoComplete="off"
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="min_stock"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Stock Mínimo</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? 0}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Stock Mínimo"
                      autoComplete="off"
                      onChange={(e) => {
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter>
              <DialogClose
                render={<Button variant="outline">Cancelar</Button>}
              />

              <Button
                type="submit"
                form={`edit-product-form-${product.id}`}
                disabled={form.formState.isSubmitting}
              >
                Actualizar
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
};

const columns: ColumnDef<Products>[] = [
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
      const productId = row.original.id;
      const productName = row.original.name;
      const urlSlug = `${productId}-${productName.split(" ").join("-")}`;
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
    cell: ({ row }) => <div className="w-32">${row.original.price}</div>,
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
      const handleUpdateStock = table.options.meta?.updateStock();
      // const setData = table.options.meta?.setData;

      const addStock = async (id: string, stock: number) => {
        // if (setData) {
        //   setData((prev: Products[]) => {
        //     return prev.map((item) =>
        //       item.id === id ? { ...item, stock: stock + 1 } : item,
        //     );
        //   });
        // }
        handleUpdateStock?.mutateAsync({ id, stock: stock + 1 });
      };

      const removeStock = async (id: string, stock: number) => {
        // updateStock().mutate({ id, stock: stock - 1 });
        // if (setData) {
        //   setData((prev: Products[]) =>
        //     prev.map((item) =>
        //       item.id === id ? { ...item, stock: stock - 1 } : item,
        //     ),
        //   );
        // }
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
      return <div className="w-32">{row.original.min_stock ?? 0}</div>;
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
        <div className="w-32">
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
        <div className="w-32">
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
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: "actions",
    accessorKey: "Acciones",
    cell: ({ row, table }) => {
      const categories = (table.options.meta?.categories as Category[]) || [];
      const suppliers = (table.options.meta?.suppliers as Suppliers[]) || [];

      return (
        <TableEditRow
          product={row.original}
          categories={categories}
          // deleteProduct={deleteProduct}
          // updateProduct={updateProduct}
          // setData={setData}
          suppliers={suppliers}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

function DraggableRow({ row }: { row: Row<Products> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data,
  categories,
  suppliers,
}: {
  data: Products[];
  categories: Category[];
  suppliers: Suppliers[];
}) {
  const [openCategoryModal, setOpenCategoryModal] = React.useState(false);
  const [open, setIsOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const [searchValue, setSearchValue] = React.useState("");

  const deferredSearchValue = React.useDeferredValue(searchValue);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter: deferredSearchValue,
    },
    meta: {
      // setData,
      categories: categories,
      suppliers: suppliers,
      updateStock: useUpdateStock,
      deleteProduct: deleteProduct,
      updateProduct: updateProduct,
    },
    initialState: {
      sorting: [
        {
          id: "name",
          desc: true,
        },
      ],
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setSearchValue,
    globalFilterFn: "includesString",
  });
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      // setData((data) => {
      //   const oldIndex = dataIds.indexOf(active.id);
      //   const newIndex = dataIds.indexOf(over.id);
      //   return arrayMove(data, oldIndex, newIndex);
      // });

      queryClient.setQueryData(
        ["products"],
        (oldData: { data: Products[] }) => {
          if (!oldData) return oldData;

          const oldIndex = dataIds.indexOf(active.id);
          const newIndex = dataIds.indexOf(over.id);
          return {
            ...oldData,
            data: arrayMove(oldData.data, oldIndex, newIndex),
          };
        },
      );
    }
  }

  return (
    <>
      <Tabs
        defaultValue="products"
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          {/* <Label htmlFor="view-selector" className="sr-only">
            View
          </Label>
          <Select
            defaultValue="products"
            items={[
              { label: "Productos", value: "products" },
              { label: "Categorías", value: "categories" },
            ]}
          >
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="products">Productos</SelectItem>
                <SelectItem value="categories">Categorías</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select> */}
          <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <DataTableSearch value={searchValue} onChange={setSearchValue} />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
              >
                <Columns3Icon data-icon="inline-start" />
                Columnas
                <ChevronDownIcon data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide(),
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>

              <Button
                onClick={() => setOpenCategoryModal(true)}
                size="sm"
                variant="outline"
              >
                <PlusIcon data-icon="inline-start" />
                Agregar Categoría
              </Button>

              <Button
                onClick={() => setIsOpen(true)}
                size="sm"
                variant="outline"
              >
                <PlusIcon data-icon="inline-start" />
                Agregar Producto
              </Button>
            </DropdownMenu>
          </div>
        </div>
        <TabsContent
          value="products"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}

                            {header.column.getCanSort() && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  header.column.toggleSorting(
                                    header.column.getIsSorted() === "asc",
                                  )
                                }
                                aria-label={
                                  header.column.getIsSorted() === "asc"
                                    ? "Ordenar Descendente"
                                    : "Ordenar Ascendente"
                                }
                                className="p-0 text-center"
                              >
                                {header.column.getIsSorted() === "asc" ? (
                                  <ChevronUpIcon />
                                ) : (
                                  <ChevronDownIcon />
                                )}
                              </Button>
                            )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                  items={[10, 20, 30, 40, 50].map((pageSize) => ({
                    label: `${pageSize}`,
                    value: `${pageSize}`,
                  }))}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectGroup>
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="categories" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
        </TabsContent>
        {/* <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent> */}
        {/* <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent> */}
      </Tabs>
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
}

// const chartData = [
//   {
//     month: "January",
//     desktop: 186,
//     mobile: 80,
//   },
//   {
//     month: "February",
//     desktop: 305,
//     mobile: 200,
//   },
//   {
//     month: "March",
//     desktop: 237,
//     mobile: 120,
//   },
//   {
//     month: "April",
//     desktop: 73,
//     mobile: 190,
//   },
//   {
//     month: "May",
//     desktop: 209,
//     mobile: 130,
//   },
//   {
//     month: "June",
//     desktop: 214,
//     mobile: 140,
//   },
// ];

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "var(--primary)",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "var(--primary)",
//   },
// } satisfies ChartConfig;

// function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
//   const isMobile = useIsMobile();
//   return (
//     <Drawer direction={isMobile ? "bottom" : "right"}>
//       <DrawerTrigger
//         render={
//           <Button
//             variant="link"
//             className="w-fit px-0 text-left text-foreground"
//           />
//         }
//       >
//         {item.name}
//       </DrawerTrigger>
//       <DrawerContent>
//         <DrawerHeader className="gap-1">
//           <DrawerTitle>{item.name}</DrawerTitle>
//           <DrawerDescription>
//             Showing total visitors for the last 6 months
//           </DrawerDescription>
//         </DrawerHeader>
//         <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
//           {!isMobile && (
//             <>
//               <ChartContainer config={chartConfig}>
//                 <AreaChart
//                   accessibilityLayer
//                   data={chartData}
//                   margin={{
//                     left: 0,
//                     right: 10,
//                   }}
//                 >
//                   <CartesianGrid vertical={false} />
//                   <XAxis
//                     dataKey="month"
//                     tickLine={false}
//                     axisLine={false}
//                     tickMargin={8}
//                     tickFormatter={(value) => value.slice(0, 3)}
//                     hide
//                   />
//                   <ChartTooltip
//                     cursor={false}
//                     content={<ChartTooltipContent indicator="dot" />}
//                   />
//                   <Area
//                     dataKey="mobile"
//                     type="natural"
//                     fill="var(--color-mobile)"
//                     fillOpacity={0.6}
//                     stroke="var(--color-mobile)"
//                     stackId="a"
//                   />
//                   <Area
//                     dataKey="desktop"
//                     type="natural"
//                     fill="var(--color-desktop)"
//                     fillOpacity={0.4}
//                     stroke="var(--color-desktop)"
//                     stackId="a"
//                   />
//                 </AreaChart>
//               </ChartContainer>
//               <Separator />
//               <div className="grid gap-2">
//                 <div className="flex gap-2 leading-none font-medium">
//                   Trending up by 5.2% this month{" "}
//                   <TrendingUpIcon className="size-4" />
//                 </div>
//                 <div className="text-muted-foreground">
//                   Showing total visitors for the last 6 months. This is just
//                   some random text to test the layout. It spans multiple lines
//                   and should wrap around.
//                 </div>
//               </div>
//               <Separator />
//             </>
//           )}
//           <form className="flex flex-col gap-4">
//             <div className="flex flex-col gap-3">
//               <Label htmlFor="header">Header</Label>
//               <Input id="header" defaultValue={item.header} />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="type">Type</Label>
//                 <Select
//                   defaultValue={item.type}
//                   items={[
//                     { label: "Table of Contents", value: "Table of Contents" },
//                     { label: "Executive Summary", value: "Executive Summary" },
//                     {
//                       label: "Technical Approach",
//                       value: "Technical Approach",
//                     },
//                     { label: "Design", value: "Design" },
//                     { label: "Capabilities", value: "Capabilities" },
//                     { label: "Focus Documents", value: "Focus Documents" },
//                     { label: "Narrative", value: "Narrative" },
//                     { label: "Cover Page", value: "Cover Page" },
//                   ]}
//                 >
//                   <SelectTrigger id="type" className="w-full">
//                     <SelectValue placeholder="Select a type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       <SelectItem value="Table of Contents">
//                         Table of Contents
//                       </SelectItem>
//                       <SelectItem value="Executive Summary">
//                         Executive Summary
//                       </SelectItem>
//                       <SelectItem value="Technical Approach">
//                         Technical Approach
//                       </SelectItem>
//                       <SelectItem value="Design">Design</SelectItem>
//                       <SelectItem value="Capabilities">Capabilities</SelectItem>
//                       <SelectItem value="Focus Documents">
//                         Focus Documents
//                       </SelectItem>
//                       <SelectItem value="Narrative">Narrative</SelectItem>
//                       <SelectItem value="Cover Page">Cover Page</SelectItem>
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="status">Status</Label>
//                 <Select
//                   defaultValue={item.status}
//                   items={[
//                     { label: "Done", value: "Done" },
//                     { label: "In Progress", value: "In Progress" },
//                     { label: "Not Started", value: "Not Started" },
//                   ]}
//                 >
//                   <SelectTrigger id="status" className="w-full">
//                     <SelectValue placeholder="Select a status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectGroup>
//                       <SelectItem value="Done">Done</SelectItem>
//                       <SelectItem value="In Progress">In Progress</SelectItem>
//                       <SelectItem value="Not Started">Not Started</SelectItem>
//                     </SelectGroup>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="target">Target</Label>
//                 <Input id="target" defaultValue={item.target} />
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="limit">Limit</Label>
//                 <Input id="limit" defaultValue={item.limit} />
//               </div>
//             </div>
//             <div className="flex flex-col gap-3">
//               <Label htmlFor="reviewer">Reviewer</Label>
//               <Select
//                 defaultValue={item.reviewer}
//                 items={[
//                   { label: "Eddie Lake", value: "Eddie Lake" },
//                   { label: "Jamik Tashpulatov", value: "Jamik Tashpulatov" },
//                   { label: "Emily Whalen", value: "Emily Whalen" },
//                 ]}
//               >
//                 <SelectTrigger id="reviewer" className="w-full">
//                   <SelectValue placeholder="Select a reviewer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectGroup>
//                     <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
//                     <SelectItem value="Jamik Tashpulatov">
//                       Jamik Tashpulatov
//                     </SelectItem>
//                     <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
//                   </SelectGroup>
//                 </SelectContent>
//               </Select>
//             </div>
//           </form>
//         </div>
//         <DrawerFooter>
//           <Button>Submit</Button>
//           <DrawerClose render={<Button variant="outline" />}></DrawerClose>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }
