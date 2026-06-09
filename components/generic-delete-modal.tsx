"use client";
import { useState } from "react";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { UseMutationResult } from "@tanstack/react-query";

type DeleteModalProps<T> = {
  id: T;
  deleteAction: () => UseMutationResult<null, Error, T, unknown>;
  successMessage: string;
  errorMessage: string;
};

const DeleteModal = <T,>({
  id,
  deleteAction,
  successMessage,
  errorMessage,
}: DeleteModalProps<T>) => {
  const [open, setOpen] = useState(false);
  const deleteMutation = deleteAction();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(successMessage ?? "Eliminado exitosamente");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(errorMessage ?? "Error al eliminar");
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
export default DeleteModal;
