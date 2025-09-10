import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';
import { socket } from '@/lib/prismadb';

// Function to LIKE a post and create a notification
export async function POST(
  req: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (!currentUser) return new NextResponse('User not found', { status: 404 });

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: currentUser.id,
        postId,
      },
    },
  });

  if (existingLike) {
    return new NextResponse('Post already liked', { status: 409 });
  }

  await prisma.like.create({
    data: {
      postId,
      userId: currentUser.id,
    },
  });

  // --- Notification Logic ---
  try {
    const post = await prisma.post.findUnique({ where: { id: postId }});
    if (post && post.userId !== currentUser.id) {
        await prisma.notification.create({
            data: {
                body: 'liked your post.',
                type: 'LIKE',
                postId: post.id, // This line is now included
                userId: post.userId,
                senderId: currentUser.id,
                senderName: currentUser.name || 'Someone',
                senderImage: currentUser.image,
            }
        });
    }
  } catch (error) {
    console.error("NOTIFICATION_CREATION_ERROR", error);
  }
  // --- END ---

  socket.emit("new_like", { postId });
  return new NextResponse('Post liked', { status: 200 });
}

// Function to UNLIKE a post (no notification needed here)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ postId: string }> }
) {
  const { postId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.like.delete({
      where: {
        userId_postId: {
          postId,
          userId: session.user.id,
        },
      },
    });
    
    socket.emit("new_like", { postId });
    return new NextResponse('Post unliked', { status: 200 });
  } catch (error) {
      // It's possible the like doesn't exist, so we can handle that error gracefully
      console.log("UNLIKE_ERROR", error);
      return new NextResponse('Could not unlike post', { status: 400 });
  }
}