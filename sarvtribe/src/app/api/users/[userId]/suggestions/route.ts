// src/app/api/users/suggestions/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }});
    if (!currentUser) return new NextResponse('User not found', { status: 404 });

    // Find 5 users that the current user is not already following and is not themselves
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...currentUser.followingIds, currentUser.id],
        },
      },
      take: 5,
    });

    return NextResponse.json(suggestedUsers);
  } catch (error) {
    console.error("SUGGESTIONS_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}