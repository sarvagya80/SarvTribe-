import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

// Function to LIKE a comment and create a notification
export async function POST(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Create the like first
    await prisma.commentLike.create({
      data: {
        commentId: params.commentId,
        userId: session.user.id,
      },
    });

    // Now, create the notification
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: params.commentId },
      });

      // Don't notify if you like your own comment
      if (comment && comment.userId !== session.user.id) {
        await prisma.notification.create({
          data: {
            body: 'liked your comment.',
            type: 'LIKE',
            userId: comment.userId, // The recipient is the comment's author
            senderId: session.user.id,
            senderName: session.user.name || 'A user',
            senderImage: session.user.image,
            postId: comment.postId, 
          },
        });
      }
    } catch (error) {
      console.error("NOTIFICATION_ON_COMMENT_LIKE_ERROR", error);
    }

    return new NextResponse('Comment liked', { status: 200 });
  } catch (error) {
    // This will catch errors if the like already exists (violates unique constraint)
    console.error("LIKE_COMMENT_ERROR", error);
    return new NextResponse('Could not like comment', { status: 400 });
  }
}

// Function to UNLIKE a comment
export async function DELETE(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.commentLike.deleteMany({
      where: {
        commentId: params.commentId,
        userId: session.user.id,
      },
    });
    return new NextResponse('Comment unliked', { status: 200 });
  } catch (error) {
    console.error("UNLIKE_COMMENT_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}