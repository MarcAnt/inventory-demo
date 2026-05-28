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
  FieldContent,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProductSchema } from "@/schemas";
import type { Category, Products, Suppliers } from "@/types";
import { createProduct } from "@/hooks/queries";
import { Switch } from "@/components/ui/switch";
import { useId } from "react";

type ProductOmitId = Omit<Products, "id">;

type Props = {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  categories: Category[];
  suppliers: Suppliers[];
};

export const ProductsModal = ({
  categories,
  suppliers,
  open,
  setIsOpen,
}: Props) => {
  const defaultValue: ProductOmitId = {
    name: "",
    price: 0,
    sku: "",
    stock: 0,
    min_stock: 0,
    category_id: 0,
    supplier_id: 0,
    barcode: 0,
    status: "ACTIVE",
  };

  const formId = useId();

  const form = useForm({
    resolver: zodResolver(ProductSchema.omit({ id: true })),
    defaultValues: defaultValue,
    mode: "onChange",
  });

  const addProductMutation = createProduct();

  const onSubmit = async (data: ProductOmitId) => {
    try {
      await addProductMutation.mutateAsync(data);

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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        id={`${formId}-add-product-form`}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
            <DialogDescription>
              Agrega un producto al inventario.
            </DialogDescription>

            <FieldGroup>
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => {
                  const isChecked = field.value === "ACTIVE";
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
                  <FieldLabel htmlFor={field.name}>Código de barras</FieldLabel>
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
                        <SelectItem>Sin categoría</SelectItem>
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

            <Controller
              name="supplier_id"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="category_id">Proveedor</FieldLabel>
                    <Select
                      name={"supplier_id"}
                      onValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      value={field.value ? String(field.value) : ""}
                      items={suppliers.map((s) => ({
                        label: s.name,
                        value: String(s.id),
                      }))}
                    >
                      <SelectTrigger id="supplier_id">
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem>Sin proveedor</SelectItem>
                        {suppliers.map((supplier) => {
                          return (
                            <SelectItem
                              key={supplier.id}
                              value={String(supplier.id)}
                            >
                              {supplier.name}
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
                    min={0}
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
                    min={0}
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
              form={`${formId}-add-product-form`}
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
