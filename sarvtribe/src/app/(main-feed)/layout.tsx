import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import MobileNav from '@/components/MobileNav';

export default function MainFeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto flex min-h-screen">
      <LeftSidebar />
      <main className="flex-grow min-w-0 border-x border-gray-200 dark:border-gray-700 pb-16 lg:pb-0">
        {children}
      </main>
      <RightSidebar />
      <MobileNav />
    </div>
  );
}