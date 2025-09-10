'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, MagnifyingGlassIcon, BellIcon, ChatBubbleOvalLeftEllipsisIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  if (!session?.user) return null;

  const links = [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/explore', icon: MagnifyingGlassIcon, label: 'Explore' },
    { href: '/notifications', icon: BellIcon, label: 'Alerts' },
    { href: '/messages', icon: ChatBubbleOvalLeftEllipsisIcon, label: 'DMs' },
    { href: `/profile/${session.user.id}`, icon: UserCircleIcon, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60 lg:hidden">
      <ul className="grid grid-cols-5">
        {links.map(l => {
          const isActive = pathname === l.href;
          const Icon = l.icon;
          return (
            <li key={l.href}>
              <Link href={l.href} className="flex flex-col items-center justify-center py-2 text-xs">
                <Icon className={`w-6 h-6 ${isActive ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className={`mt-0.5 ${isActive ? 'text-indigo-600' : 'text-gray-600 dark:text-gray-300'}`}>{l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
