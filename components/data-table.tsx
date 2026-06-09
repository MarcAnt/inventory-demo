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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  MinusIcon,
} from "lucide-react";
import { ProductsModal } from "./products-modal";
import CategoriesModal from "./categories-modal";
import { Category, Product, Supplier } from "@/types";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { UseMutationResult, useQueryClient } from "@tanstack/react-query";
import {
  useDeleteProduct,
  useGetUserProfile,
  useUpdateProduct,
  useUpdateStock,
} from "@/hooks/queries";
import Link from "next/link";
import DataTableSearch from "./search-input";
import EditProductModal from "./edit-modal";
import { useHandleCurrency } from "@/hooks/use-handle-currency";
import CategoriesDataTable from "./categories-data-table";
import DeleteModal from "./generic-delete-modal";
import SuppliersDataTable from "./suppliers-data-table";
import { Separator } from "@/components/ui/separator";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    categories: Category[];
    suppliers: Supplier[];
    useUpdateStock: () => UseMutationResult<
      Product[],
      Error,
      {
        id: string;
        stock: number;
      },
      unknown
    >;
    // setData: React.Dispatch<React.SetStateAction<TData[]>>;
    useDeleteProduct: () => UseMutationResult<null, Error, string, unknown>;
    useUpdateProduct: () => UseMutationResult<
      Product[],
      Error,
      Product,
      unknown
    >;
    handleCurrency: (price: number) => number | string;
    toggleCurrency: string;
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

const TableEditRow = ({
  product,
  categories,
  suppliers,
}: {
  product: Product;
  categories: Category[];
  suppliers: Supplier[];
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: userProfile } = useGetUserProfile();
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
          {userProfile?.role === "ADMIN" && (
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

          <DropdownMenuSeparator />

          {userProfile?.role === "ADMIN" && (
            <DeleteModal
              id={product.id}
              deleteAction={useDeleteProduct}
              successMessage="Producto eliminado exitosamente"
              errorMessage="Error al eliminar el producto"
            />
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
    enableSorting: false,
    enableHiding: true,
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

function DraggableRow({ row }: { row: Row<Product> }) {
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
  data: Product[];
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [openCategoryModal, setOpenCategoryModal] = React.useState(false);
  const [open, setIsOpen] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState<
    "products" | "categories" | "suppliers"
  >("products");

  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = React.useState("");
  const deferredSearchValue = React.useDeferredValue(searchValue);
  const { data: userProfile } = useGetUserProfile();

  const { handleToggleCalculate, toggleCurrency, handleCurrency } =
    useHandleCurrency();

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
      useUpdateStock: useUpdateStock,
      useDeleteProduct: useDeleteProduct,
      useUpdateProduct: useUpdateProduct,
      handleCurrency: handleCurrency,
      toggleCurrency: toggleCurrency,
    },
    initialState: {
      sorting: [
        // {
        //   id: "name",
        //   desc: false,
        // },
      ],
    },
    getRowId: (row) => row.id,
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
    autoResetAll: false,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      // setData((data) => {
      //   const oldIndex = dataIds.indexOf(active.id);
      //   const newIndex = dataIds.indexOf(over.id);
      //   return arrayMove(data, oldIndex, newIndex);
      // });

      queryClient.setQueryData(["products"], (oldData: { data: Product[] }) => {
        if (!oldData) return oldData;

        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return {
          ...oldData,
          data: arrayMove(oldData.data, oldIndex, newIndex),
        };
      });
    }
  }

  return (
    <>
      <Tabs
        defaultValue="products"
        className="w-full flex-col justify-start gap-6"
        onValueChange={setCurrentTab}
        value={currentTab}
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          </TabsList>
          <div className="flex items-center flex-wrap gap-2">
            <Label htmlFor="view-selector" className="sr-only">
              Vista
            </Label>
            <Select
              defaultValue="products"
              items={[
                { label: "Productos", value: "products" },
                { label: "Categorías", value: "categories" },
                { label: "Proveedores", value: "suppliers" },
              ]}
            >
              <SelectTrigger
                className="flex w-fit @4xl/main:hidden"
                size="sm"
                id="view-selector"
              >
                <SelectValue placeholder="Seleccionar vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="products">Productos</SelectItem>
                  <SelectItem value="categories">Categorías</SelectItem>
                  <SelectItem value="suppliers">Proveedores</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TabsContent
          value="products"
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          {currentTab === "products" && (
            <div className="flex items-center flex-wrap gap-2">
              <Button
                className="text-xs"
                onClick={() => handleToggleCalculate()}
              >
                <p>Convertir a {`${toggleCurrency === "$" ? "Bs." : "$"}`}</p>
              </Button>
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

                {userProfile?.role === "ADMIN" && (
                  <>
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
                  </>
                )}
              </DropdownMenu>
            </div>
          )}

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
                        className="h-24 text-center "
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          No se encontraron productos. Puedes:
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              onClick={() => setIsOpen(true)}
                              size="sm"
                              variant="outline"
                            >
                              <PlusIcon data-icon="inline-start" />
                              Agregá un producto
                            </Button>
                            <Separator orientation="vertical" />
                            <Link href="/inventory">
                              Ver todos los productos
                            </Link>
                          </div>
                        </div>
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
              {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Filas por página
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
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Ir a la primera página</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Ir a la última página</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesDataTable data={categories} />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersDataTable data={suppliers} />
        </TabsContent>
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
