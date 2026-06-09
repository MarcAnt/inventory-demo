import MainLayout from "@/layouts/main-layout";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
