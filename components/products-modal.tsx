"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ProductSchema } from "@/schemas";
import type { Category } from "@/types";

type ProductOmitId = Omit<z.infer<typeof ProductSchema>, "id">;

type Props = {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  categories: Category[];
};

export const ProductsModal = ({ categories, open, setIsOpen }: Props) => {
  const supabase = createClient();

  const defaultValue: ProductOmitId = {
    name: "",
    price: 0,
    sku: "",
    stock: 0,
    min_stock: 0,
    category_id: 0,
    supplier_id: 0,
    barcode: 0,
    status: "ACTIVO",
  };

  const form = useForm({
    resolver: zodResolver(ProductSchema.omit({ id: true })),
    defaultValues: defaultValue,
    mode: "onChange",
  });

  const onSubmit = async (data: ProductOmitId) => {
    try {
      const parsed = await ProductSchema.omit({ id: true }).parseAsync(data);

      await supabase.from("products").insert([parsed]);
      toast.success("Producto agregado exitosamente");
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar el producto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="add-product-form">
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
            <DialogDescription>
              Agrega un producto al inventario.
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
                  <FieldLabel htmlFor={field.name}>Código de barras</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
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
              render={({ field, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="category_id">Categoría</FieldLabel>
                    <Select
                      name={"category_id"}
                      onValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      value={field.value ? String(field.value) : ""}
                      items={categories.map((c) => ({
                        label: c.name,
                        value: String(c.id),
                      }))}
                    >
                      <SelectTrigger id="category_id">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => {
                          return (
                            <SelectItem
                              key={category.id}
                              value={String(category.id)}
                            >
                              {category.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
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
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button
              type="submit"
              form="add-product-form"
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
