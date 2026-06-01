"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { ModeToggle } from "./mode-toggle";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
// import { getCurrentCurrency } from "@/hooks/queries";
import { useHandleCurrency } from "@/hooks/use-handle-currency";

const data = {
  user: {
    name: "Marcos",
    avatar: "https://github.com/shadcn.png",
  },
};

export function SiteHeader() {
  const params = useParams<{ slug: string }>();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // const { data: currentCurrency } = getCurrentCurrency();
  const { currentCurrency } = useHandleCurrency();

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
                {/* <span className="text-sm font-medium">Dolar BCV: $36.00</span>
                <span className="text-sm font-medium">
                  Dolar Paralelo: $39.00
                </span> */}

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

            <ModeToggle />
            <NavUser user={data.user} />
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
              <SheetTitle>Profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}
