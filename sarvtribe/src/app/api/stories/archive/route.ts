// src/app/api/stories/archive/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prismadb';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Find all stories for the current user that have expired
    const archivedStories = await prisma.story.findMany({
      where: {
        userId: session.user.id,
        expiresAt: {
          lt: new Date(), // 'lt' means "less than" the current time
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(archivedStories);
  } catch (error) {
    console.error('FETCH_ARCHIVE_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}