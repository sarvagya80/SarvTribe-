// src/app/api/users/[userId]/likes/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    if (!userId || userId.length !== 24) {
      return new NextResponse('Invalid User ID', { status: 400 });
    }

    // 1. Find all the 'like' records created by this user to get the post IDs
    const userLikes = await prisma.like.findMany({
      where: {
        userId: userId,
      },
      select: {
        postId: true, // We only need the ID of the post they liked
      },
    });

    const likedPostIds = userLikes.map(like => like.postId);

    // 2. Find all posts whose IDs are in the list we just created
    const likedPosts = await prisma.post.findMany({
      where: {
        id: {
          in: likedPostIds,
        },
      },
      // Include the author and like data for each post, just like in our main feed
      include: {
        user: true,
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(likedPosts);

  } catch (error) {
    console.error('FETCH_LIKED_POSTS_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}