// src/app/api/post/[postId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(request: Request) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        likes: true,
        comments: {
          // THIS IS THE FIX: Include the user (author) for each comment
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 2 // Only take the 2 most recent for the feed preview
        },
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('FETCH_POSTS_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}