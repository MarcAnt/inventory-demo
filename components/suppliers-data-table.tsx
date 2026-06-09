"use client";
import GenericDataTable from "@/components/generic-data-table";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon, SquarePenIcon } from "lucide-react";
import { Supplier } from "@/types";
import { useDeleteSupplier } from "@/hooks/queries";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import DeleteModal from "./generic-delete-modal";
import EditSupplierModal from "./edit-supplier-modal";

const TableEditRow = ({ supplier }: { supplier: Supplier }) => {
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
            id={supplier.id}
            deleteAction={useDeleteSupplier}
            successMessage="Proveedor eliminado exitosamente"
            errorMessage="Error al eliminar el proveedor"
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <EditSupplierModal
        supplier={supplier}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "name",
    header: "Nombre del proveedor",
    cell: ({ row }) => {
      return <div className="w-32">{row.original.name}</div>;
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
      return <TableEditRow supplier={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];

const SuppliersDataTable = ({ data }: { data: Supplier[] }) => {
  return <GenericDataTable data={data} columns={columns} showFilters={true} />;
};

export default SuppliersDataTable;
