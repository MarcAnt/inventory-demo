"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { LoginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";

import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Login } from "@/types";
import { useSignInAuthUser } from "@/hooks/queries";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useSignInAuthUser();

  const handleLogin = async (data: Login) => {
    try {
      await loginMutation.mutateAsync(data);
      router.push("/inventory");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <form
          onSubmit={form.handleSubmit(handleLogin)}
          className="max-w-sm mx-auto mt-20 space-y-4"
        >
          <h1 className="text-2xl font-bold text-center">Inventario Demo</h1>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>

            <Controller
              name="email"
              control={form.control}
              render={({ field }) => (
                <Input type="email" placeholder="email" {...field} required />
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
                  type="password"
                  placeholder="contraseña"
                  {...field}
                  required
                />
              )}
            />
            {form.formState.errors.password && (
              <FieldDescription className="text-red-500">
                {form.formState.errors.password.message}
              </FieldDescription>
            )}
          </Field>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? (
              <Spinner className="size-4" />
            ) : (
              "Entrar"
            )}
          </Button>

          <div className="mt-4 text-center">
            <Link
              href="/signup"
              className="text-sm font-medium text-primary underline underline-offset-4 hover:opacity-75"
            >
              ¿No tienes una cuenta? Regístrate aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
