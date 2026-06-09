import MainLayout from "@/layouts/main-layout";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
