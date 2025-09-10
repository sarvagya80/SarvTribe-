import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

export async function GET(
  req: Request,
  context: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await context.params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Check if story exists and user owns it
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true }
    });

    if (!story) {
      return new NextResponse('Story not found', { status: 404 });
    }

    if (story.userId !== session.user.id) {
      return new NextResponse('Unauthorized to view story analytics', { status: 403 });
    }

    // Get story views with user information
    const views = await prisma.storyView.findMany({
      where: { storyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      },
      orderBy: { viewedAt: 'desc' }
    });

    return NextResponse.json(views);
  } catch (error) {
    console.error('FETCH_STORY_VIEWS_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
