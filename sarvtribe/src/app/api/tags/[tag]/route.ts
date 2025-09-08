// src/app/api/tags/[tag]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const tag = decodeURIComponent(params.tag).toLowerCase();

    const posts = await prisma.post.findMany({
      where: {
        hashtags: {
          has: tag,
        },
      },
      include: {
        user: true,
        likes: true,
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('FETCH_TAG_POSTS_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}