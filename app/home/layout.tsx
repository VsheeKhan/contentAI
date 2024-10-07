import { Toaster } from "@/components/ui/toaster";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full">
      {children}
      <Toaster />
    </div>
  );
}
