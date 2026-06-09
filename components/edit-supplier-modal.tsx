import { Button } from "@/components/ui/button";
import { Supplier } from "@/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupplierSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { useUpdateSupplier } from "@/hooks/queries";

type EditSupplierModalProps = {
  supplier: Supplier;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

const EditSupplierModal = ({
  supplier,
  isOpen,
  setIsOpen,
}: EditSupplierModalProps) => {
  const form = useForm({
    resolver: zodResolver(SupplierSchema.omit({ id: true })),
    defaultValues: {
      name: supplier?.name,
      description: supplier.description,
    },
  });

  const updateSupplierData = useUpdateSupplier();

  const onSubmit = async (data: Omit<Supplier, "id">) => {
    try {
      await updateSupplierData.mutateAsync({ ...data, id: supplier.id });
      toast.success("Proveedor actualizado exitosamente");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el proveedor");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id={`edit-supplier-form-${supplier.id}`}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar proveedor</DialogTitle>
            <DialogDescription>
              Edita un proveedor del inventario.
            </DialogDescription>
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
                    placeholder="Nombre del proveedor"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Descripción del proveedor"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />

            <Button
              type="submit"
              form={`edit-supplier-form-${supplier.id}`}
              disabled={form.formState.isSubmitting}
            >
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default EditSupplierModal;
