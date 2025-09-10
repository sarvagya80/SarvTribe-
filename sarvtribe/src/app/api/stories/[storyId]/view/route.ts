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
      where: { id: storyId }
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    // Check if already viewed (upsert to handle both cases)
    await prisma.storyView.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId: session.user.id,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        storyId,
        userId: session.user.id,
      },
    });

    return new NextResponse('Story view recorded', { status: 200 });
  } catch (error) {
    console.error('STORY_VIEW_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
