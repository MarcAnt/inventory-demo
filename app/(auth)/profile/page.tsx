"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useChangeProfile,
  useSignOutAuthUser,
  useGetUserProfile,
} from "@/hooks/queries";
import { LogOutIcon, Trash2Icon, User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: userProfile } = useGetUserProfile();
  const { mutateAsync: changeProfile } = useChangeProfile();
  const { mutateAsync: logout } = useSignOutAuthUser();
  const router = useRouter();

  const handleChangeProfile = async () => {
    try {
      await changeProfile({
        id: userProfile?.id as string,
        role: userProfile?.role === "ADMIN" ? "STAFF" : "ADMIN",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 lg:px-6 py-4 md:gap-6 md:py-6">
          <h2 className="scroll-m-20  text-2xl font-extrabold tracking-tight text-balance ">
            Perfil
          </h2>
          <p className="text-muted-foreground text-balance">
            Información de la cuenta
          </p>
          <Separator orientation="horizontal" />
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-muted-foreground text-balance  ">Email</p>
              <p className="text-balance ">{userProfile?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-balance ">Nombre</p>
              <p className="text-balance ">
                {userProfile?.first_name} {userProfile?.last_name}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-balance    ">Rol</p>
                {userProfile?.role === "ADMIN" && (
                  <Button
                    onClick={handleChangeProfile}
                    className="mt-2"
                    variant="secondary"
                  >
                    Cambiar a{" "}
                    {userProfile?.role === "ADMIN"
                      ? "Usuario"
                      : "Administrador"}
                  </Button>
                )}
              </div>

              <p className="text-balance    ">
                {userProfile?.role === "ADMIN" ? "Administrador" : "Usuario"}
              </p>

              <Separator orientation="horizontal" className="my-4" />

              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                Acciones
              </h3>

              <div className="flex gap-2">
                <Button variant="outline" className="mt-2 cursor-pointer">
                  <User2Icon /> Editar Perfil
                </Button>
                <Button variant="destructive" className="mt-2 cursor-pointer">
                  <Trash2Icon /> Eliminar Cuenta
                </Button>
              </div>

              <Separator orientation="horizontal" className="my-4" />

              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 cursor-pointer"
              >
                <LogOutIcon /> Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
