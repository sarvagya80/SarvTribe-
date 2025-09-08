// src/app/(content-pages)/layout.tsx
import LeftSidebar from '@/components/LeftSidebar';

export default function ContentPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto flex min-h-screen">
      <LeftSidebar />
      <main className="flex-grow min-w-0">
        {children}
      </main>
    </div>
  );
}