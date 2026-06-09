"use client";
import GenericDataTable from "@/components/generic-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Category } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SquarePenIcon, EllipsisVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditCategoryModal from "./edit-category-modal";
import { useState } from "react";
import DeleteModal from "./generic-delete-modal";
import { useDeleteCategory } from "@/hooks/queries";

const TableEditRow = ({ category }: { category: Category }) => {
  const [isOpen, setIsOpen] = useState(false);

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

          <DropdownMenuSeparator />
          <DeleteModal
            id={category.id}
            deleteAction={useDeleteCategory}
            successMessage="Categoría eliminada exitosamente"
            errorMessage="Error al eliminar la categoría"
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCategoryModal
        category={category}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Nombre de la categoría",
    cell: ({ row }) => {
      return (
        <div className="w-32">
          <p>{row.original.name}</p>
        </div>
      );
    },
    enableHiding: true,
    enableSorting: true,
    sortingFn: "text",
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      return <div>{row.original.description}</div>;
    },
    enableSorting: true,
    sortingFn: "text",
    enableHiding: true,
  },
  {
    id: "actions",
    accessorKey: "Acciones",
    cell: ({ row }) => {
      const category = row.original;
      return <TableEditRow category={category} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];

const CategoriesDataTable = ({ data }: { data: Category[] }) => {
  return <GenericDataTable data={data} columns={columns} showFilters={true} />;
};

export default CategoriesDataTable;
