'use client';

import { Fragment, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import useSWR from 'swr';
import { io } from 'socket.io-client';
import { socket } from '@/lib/prismadb';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftStartOnRectangleIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((res) => res.json());


export default function LeftSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  // Fetch unread counts
  const { data: unreadNotifs = 0, mutate: mutateNotifs } = useSWR('/api/notifications/count', fetcher);
  const { data: unreadDMs = 0, mutate: mutateDMs } = useSWR('/api/conversations/unread-count', fetcher);

  useEffect(() => {
    socket.on('receive_notification', () => mutateNotifs());
    socket.on('message_received', () => mutateDMs());

    return () => {
      socket.off('receive_notification');
      socket.off('message_received');
    };
  }, [mutateNotifs, mutateDMs]);

  if (!session?.user) return null;

  const navLinks = [
    { name: 'Home', href: '/', icon: HomeIcon, hasUnread: false },
    { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, hasUnread: false },
    { name: 'Notifications', href: '/notifications', icon: BellIcon, hasUnread: unreadNotifs > 0 },
    { name: 'Messages', href: '/messages', icon: ChatBubbleOvalLeftEllipsisIcon, hasUnread: unreadDMs > 0 },
    { name: 'Profile', href: `/profile/${session.user.id}`, icon: UserCircleIcon, hasUnread: false },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 p-4 border-r border-gray-200 dark:border-gray-700">
      <div>
        <Link
          href="/"
          className="text-3xl font-bold text-gray-900 dark:text-white mb-8 block"
        >
          SarvTribe
        </Link>
        <nav className="space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex items-center space-x-3 p-3 rounded-lg transition-colors text-lg',
                pathname === link.href
                  ? 'bg-gray-200 dark:bg-gray-700 font-bold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <div className="relative">
                <link.icon className="w-7 h-7 flex-shrink-0" />
                {link.hasUnread && (
                  <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
                )}
              </div>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <Menu as="div" className="relative">
        <MenuButton className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Image
            src={session.user.image || '/default-avatar.png'}
            alt={session.user.name || 'User Avatar'}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex-grow text-left">
            <p className="font-semibold text-sm">{session.user.name}</p>
          </div>
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems className="absolute bottom-full left-0 mb-2 w-full origin-bottom-left divide-y divide-gray-200 dark:divide-gray-600 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="px-1 py-1">
              <MenuItem>
                {({ active }) => (
                  <Link
                    href="/settings"
                    className={clsx(
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-300',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                    )}
                  >
                    <Cog6ToothIcon className="mr-2 h-5 w-5" /> Settings
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ active }) => (
                  <Link
                    href="/archive/stories"
                    className={clsx(
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-300',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                    )}
                  >
                    <ArchiveBoxIcon className="mr-2 h-5 w-5" /> Archive
                  </Link>
                )}
              </MenuItem>
            </div>
            <div className="px-1 py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={clsx(
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-300',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                    )}
                  >
                    {theme === 'dark' ? (
                      <SunIcon className="mr-2 h-5 w-5" />
                    ) : (
                      <MoonIcon className="mr-2 h-5 w-5" />
                    )}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                )}
              </MenuItem>
            </div>
            <div className="px-1 py-1">
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={() => signOut()}
                    className={clsx(
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-300',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                    )}
                  >
                    <ArrowLeftStartOnRectangleIcon className="mr-2 h-5 w-5" /> Sign Out
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    </aside>
  );
}
