import { Button } from "@/components/ui/button";
import { Category } from "@/types";
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
import { CategorySchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { useUpdateCategory } from "@/hooks/queries";

type EditCategoryModalProps = {
  category: Category;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

const EditCategoryModal = ({
  category,
  isOpen,
  setIsOpen,
}: EditCategoryModalProps) => {
  const form = useForm({
    resolver: zodResolver(CategorySchema.omit({ id: true })),
    defaultValues: {
      name: category?.name,
      description: category.description,
    },
  });

  const updateCategoryData = useUpdateCategory();

  const onSubmit = async (data: Omit<Category, "id">) => {
    try {
      await updateCategoryData.mutateAsync({ ...data, id: category.id });
      toast.success("Categoría actualizada exitosamente");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la categoría");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id={`edit-category-form-${category.id}`}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
            <DialogDescription>
              Edita una categoría del inventario.
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
                    placeholder="Nombre de la categoría"
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
                    placeholder="Descripción de la categoría"
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
              form={`edit-category-form-${category.id}`}
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

export default EditCategoryModal;
