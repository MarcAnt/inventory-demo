"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema } from "@/schemas";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import z from "zod";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

type Props = {
  open: boolean;
  setIsOpen: (open: boolean) => void;
};

type CategoryOmitId = Omit<z.infer<typeof CategorySchema>, "id">;

const CategoriesModal = ({ open, setIsOpen }: Props) => {
  const defaultValue: CategoryOmitId = {
    name: "",
    description: "",
  };
  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(CategorySchema.omit({ id: true })),
    defaultValues: defaultValue,
    mode: "onChange",
  });

  const onSubmit = async (data: CategoryOmitId) => {
    try {
      const parsed = await CategorySchema.omit({ id: true }).parseAsync(data);

      const { error } = await supabase.from("categories").insert([parsed]);

      if (error) throw error;

      toast.success("Categoría agregada exitosamente");
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar la categoría");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="category-form">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
            <DialogDescription>
              Crea una nueva categoría para tus productos.
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
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
                  <Input
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
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              form="category-form"
              disabled={form.formState.isSubmitting}
            >
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default CategoriesModal;
