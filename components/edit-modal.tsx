import { Category, Products, Suppliers } from "@/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema } from "@/schemas";
import { updateProduct } from "@/hooks/queries";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfoIcon } from "lucide-react";

const EditProductModal = ({
  product,
  categories,
  suppliers,
  isOpen,
  setIsOpen,
}: {
  product: Products;
  categories: Category[];
  suppliers: Suppliers[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const updateProductData = updateProduct();

  const form = useForm({
    resolver: zodResolver(
      ProductSchema.omit({
        updated_at: true,
        created_at: true,
        categories: true,
        suppliers: true,
      }),
    ),
    defaultValues: {
      ...product,
      category_id: String(product.category_id),
      supplier_id: String(product.supplier_id),
    },
    mode: "onChange",
  });

  const onSubmit = async (
    data: Omit<
      Products,
      "updated_at" | "created_at" | "categories" | "suppliers"
    >,
  ) => {
    try {
      //   console.log(data);
      await updateProductData.mutateAsync({ ...data, id: product.id });
      toast.success("Producto actualizado exitosamente");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el producto");
    }
  };

  return (
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
                  const toggleChecked = () => {
                    field.onChange(isChecked ? "INACTIVE" : "ACTIVE");
                  };
                  return (
                    <Field
                      orientation="horizontal"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldContent className="flex flex-row items-center justify-end gap-2">
                        <FieldLabel>
                          <Popover>
                            <PopoverTrigger
                              render={
                                <Button variant="outline">
                                  <InfoIcon />{" "}
                                </Button>
                              }
                            ></PopoverTrigger>
                            <PopoverContent>
                              <p className="text-sm text-muted-foreground">
                                Al cambiar el estado del producto, se mostrará
                                como inactivo en el inventario pero seguira
                                existiendo en la base de datos
                              </p>
                            </PopoverContent>
                          </Popover>
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
                    placeholder="Descripción del producto"
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
          </FieldGroup>

          <FieldGroup className="grid grid-cols-2 gap-2">
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
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />

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
  );
};

export default EditProductModal;
