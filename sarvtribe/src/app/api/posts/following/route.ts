// src/app/api/posts/following/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Find all posts where the author's ID is in the current user's 'followingIds' list
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: currentUser.followingIds,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
        likes: true,
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('FETCH_FOLLOWING_POSTS_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}