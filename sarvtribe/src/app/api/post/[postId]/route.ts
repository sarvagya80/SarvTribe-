// src/app/api/post/[postId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(req: Request, context: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await context.params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { 
        user: true, 
        likes: true,
        comments: {
          // THIS IS THE FIX: Include all comment details
          orderBy: { createdAt: 'asc' },
          include: {
            user: true,
            likes: true,
            replies: {
              include: {
                user: true,
                likes: true,
              }
            }
          }
        }
      },
    });

    if (!post) return new NextResponse('Post not found', { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}