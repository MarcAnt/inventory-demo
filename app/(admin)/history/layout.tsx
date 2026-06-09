import MainLayout from "@/layouts/main-layout";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
