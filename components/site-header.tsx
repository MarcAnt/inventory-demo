"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { ToggleTheme } from "./toggle-theme";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { useParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Coins, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useHandleCurrency } from "@/hooks/use-handle-currency";
import { useGetAuthUser } from "@/hooks/queries";
import { Separator } from "@/components/ui/separator";

const currentDate = Intl.DateTimeFormat("es-VE", {
  dateStyle: "short",
}).format(new Date());

export function SiteHeader() {
  const params = useParams<{ slug: string }>();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const { currentCurrency } = useHandleCurrency();
  const { data: user } = useGetAuthUser();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <div className="flex items-center lg:w-auto w-full justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              {params.slug && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{params.slug}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          {isMobile && (
            <Button
              className="md:hidden self-end justify-self-end"
              variant="outline"
              size="icon"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
          )}
        </div>

        {!isMobile && (
          <div className="ml-auto flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{currentDate}</p>

            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline">
                    Tipo de Cambio <Coins />
                  </Button>
                }
              />

              <PopoverContent
                className="flex flex-col gap-2 max-w-40"
                align="start"
              >
                {currentCurrency?.map((currency) => (
                  <span className="text-xs font-medium" key={currency.nombre}>
                    {currency.nombre}: Bs.{" "}
                    {currency.promedio.toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                ))}
              </PopoverContent>
            </Popover>

            <ToggleTheme />

            <NavUser
              user={{
                name: (user?.first_name + " " + user?.last_name) as string,
                email: user?.email as string,
                avatar: "",
              }}
            />
          </div>
        )}
      </div>

      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-full"
            style={{
              width: "100vw",
              height: "100vh",
            }}
          >
            <SheetHeader>
              <SheetTitle>Dashboard - Inventario Demo</SheetTitle>
            </SheetHeader>

            <Separator orientation="horizontal" />

            <div className="flex flex-col gap-2 p-2">
              <NavUser
                user={{
                  name: (user?.first_name + " " + user?.last_name) as string,
                  email: user?.email as string,
                  avatar: "",
                }}
              />
              <Separator orientation="horizontal" />

              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline">
                      Tipo de Cambio <Coins />
                    </Button>
                  }
                />

                <PopoverContent
                  className="flex flex-col gap-2 max-w-40"
                  align="start"
                >
                  {currentCurrency?.map((currency) => (
                    <span className="text-xs font-medium" key={currency.nombre}>
                      {currency.nombre}: Bs.{" "}
                      {currency.promedio.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  ))}
                </PopoverContent>
              </Popover>

              <ToggleTheme />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}
