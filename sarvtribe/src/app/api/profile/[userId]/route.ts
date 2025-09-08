import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    if (!userId || userId.length !== 24) {
      return new NextResponse('Invalid User ID format', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
        },
        storyHighlights: { // Ensure highlights are included
            orderBy: {
                // You can add ordering if needed, e.g., by creation date
            }
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const followersCount = await prisma.user.count({
      where: {
        followingIds: {
          has: userId,
        },
      },
    });

    const followingCount = user.followingIds.length;

    return NextResponse.json({ ...user, followersCount, followingCount });

  } catch (error) {
    console.error('PROFILE_FETCH_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}