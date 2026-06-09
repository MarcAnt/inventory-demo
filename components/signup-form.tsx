"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSchema } from "@/schemas";
import { User } from "@/types";
import { useCreateAuthUser } from "@/hooks/queries";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      repeat_password: "",
    },
  });

  const router = useRouter();
  const signupMutation = useCreateAuthUser();

  const onSubmit = async (data: Omit<User, "id">) => {
    try {
      await signupMutation.mutateAsync(data);
      form.reset();
      router.push("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Completa el formulario a continuación para crear tu cuenta
          </p>
          <Field>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Controller
              name="first_name"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="first_name"
                  type="text"
                  placeholder="Nombre"
                  required
                  className="bg-background"
                  {...field}
                />
              )}
            />
            {form.formState.errors.first_name && (
              <FieldDescription className="text-red-500">
                {form.formState.errors.first_name.message}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="name">Apellido</FieldLabel>
            <Controller
              name="last_name"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Apellido"
                  required
                  className="bg-background"
                  {...field}
                />
              )}
            />
            {form.formState.errors.last_name && (
              <FieldDescription className="text-red-500">
                {form.formState.errors.last_name.message}
              </FieldDescription>
            )}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Controller
            name="email"
            control={form.control}
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-background"
                {...field}
              />
            )}
          />
          {form.formState.errors.email && (
            <FieldDescription className="text-red-500">
              {form.formState.errors.email.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <Input
                id="password"
                type="password"
                required
                className="bg-background"
                {...field}
              />
            )}
          />
          {form.formState.errors.password && (
            <FieldDescription className="text-red-500">
              {form.formState.errors.password.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">
            Confirmar Contraseña
          </FieldLabel>
          <Controller
            name="repeat_password"
            control={form.control}
            render={({ field }) => (
              <Input
                id="confirm-password"
                type="password"
                required
                className="bg-background"
                {...field}
              />
            )}
          />
          {form.formState.errors.repeat_password && (
            <FieldDescription className="text-red-500">
              {form.formState.errors.repeat_password.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Creando..." : "Crear Cuenta"}
          </Button>
        </Field>
      </FieldGroup>
      <div className="mt-2 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-primary underline underline-offset-4 hover:opacity-75"
        >
          ¿Ya tienes una cuenta? Inicia sesión aquí
        </Link>
      </div>
    </form>
  );
}
