// src/app/api/notifications/count/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(0); // Return 0 if not logged in
  }
  
  try {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json(unreadCount);
  } catch (error) {
    return NextResponse.json(0);
  }
}