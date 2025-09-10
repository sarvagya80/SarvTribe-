// src/app/(content-pages)/layout.tsx
import LeftSidebar from '@/components/LeftSidebar';
import MobileNav from '@/components/MobileNav';

export default function ContentPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto flex min-h-screen">
      <LeftSidebar compact />
      <main className="flex-grow min-w-0 pb-16 lg:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}