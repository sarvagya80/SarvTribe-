// src/app/api/posts/[postId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  // 1. Check for an active session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const postId = params.postId;
    if (!postId || typeof postId !== 'string') {
      return new NextResponse('Invalid Post ID', { status: 400 });
    }

    // 2. Find the post to ensure it exists and to check ownership
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    // 3. Verify that the current user is the owner of the post
    if (post.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 4. If all checks pass, delete the post
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return new NextResponse('Post deleted successfully', { status: 200 });

  } catch (error) {
    console.error('POST_DELETE_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}