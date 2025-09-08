// src/components/AuthProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

type Props = { children?: React.ReactNode };

export default function AuthProvider({ children }: Props):JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
