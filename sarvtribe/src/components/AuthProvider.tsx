'use client';

import { SessionProvider } from 'next-auth/react';

type Props = {
  children?: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  return <SessionProvider refetchOnWindowFocus refetchWhenOffline refetchInterval={0}>{children}</SessionProvider>;
}