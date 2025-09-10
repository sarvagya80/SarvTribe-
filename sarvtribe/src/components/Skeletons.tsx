'use client';

export function PostSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1">
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded mt-2" />
        </div>
      </div>
      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800" />
      <div className="p-4">
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-48 bg-gray-200 dark:bg-gray-800 rounded mt-2" />
      </div>
    </div>
  );
}

export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarCardSkeleton() {
  return (
    <div className="animate-pulse p-4 rounded-2xl bg-black border border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-800" />
        <div className="flex-1">
          <div className="h-3 w-28 bg-gray-800 rounded" />
          <div className="h-3 w-16 bg-gray-800 rounded mt-2" />
        </div>
      </div>
    </div>
  );
}
