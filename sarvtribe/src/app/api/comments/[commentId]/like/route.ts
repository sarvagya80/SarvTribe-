// @ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prismadb';

// Interface for route parameters
interface CommentRouteParams {
  params: {
    commentId: string;
  };
}

// LIKE a comment
export async function POST(req: Request, context: CommentRouteParams) {
  const { commentId } = context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Create the like
    await prisma.commentLike.create({
      data: {
        commentId,
        userId: session.user.id,
      },
    });

    // Create a notification if liking someone else's comment
    try {
      const comment = await prisma.comment.findUnique({ where: { id: commentId } });

      if (comment && comment.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            body: 'liked your comment.',
            type: 'LIKE',
            userId: comment.userId, // recipient
            senderId: session.user.id,
            senderName: session.user.name || 'A user',
            senderImage: session.user.image,
            postId: comment.postId,
          },
        });
      }
    } catch (error) {
      console.error('NOTIFICATION_ON_COMMENT_LIKE_ERROR', error);
    }

    return new NextResponse('Comment liked', { status: 200 });
  } catch (error) {
    console.error('LIKE_COMMENT_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// UNLIKE a comment
export async function DELETE(req: Request, context: CommentRouteParams) {
  const { commentId } = context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.commentLike.deleteMany({
      where: {
        commentId,
        userId: session.user.id,
      },
    });

    return new NextResponse('Comment unliked', { status: 200 });
  } catch (error) {
    console.error('UNLIKE_COMMENT_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
