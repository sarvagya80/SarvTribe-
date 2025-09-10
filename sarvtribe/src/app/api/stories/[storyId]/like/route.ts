import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

export async function POST(
  req: Request,
  context: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await context.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: { user: true }
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.storyLike.findUnique({
      where: {
        storyId_userId: {
          storyId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      return new NextResponse('Story already liked', { status: 200 });
    }

    // Create like
    await prisma.storyLike.create({
      data: {
        storyId,
        userId: session.user.id,
      },
    });

    // Create notification for story owner (if not the same user)
    if (story.userId !== session.user.id) {
      try {
        await prisma.notification.create({
          data: {
            body: 'liked your story.',
            type: 'LIKE',
            userId: story.userId,
            senderId: session.user.id,
            senderName: session.user.name || 'Someone',
            senderImage: session.user.image,
          }
        });
      } catch (error) {
        console.error("NOTIFICATION_CREATION_ERROR", error);
      }
    }

    return new NextResponse('Story liked', { status: 200 });
  } catch (error) {
    console.error('STORY_LIKE_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await context.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.storyLike.delete({
      where: {
        storyId_userId: {
          storyId,
          userId: session.user.id,
        },
      },
    });
    
    return new NextResponse('Story unliked', { status: 200 });
  } catch (error) {
    console.error('STORY_UNLIKE_ERROR', error);
    return new NextResponse('Could not unlike story', { status: 400 });
  }
}
