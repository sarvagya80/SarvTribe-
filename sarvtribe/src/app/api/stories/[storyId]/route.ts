// src/app/api/stories/[storyId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function DELETE(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { storyId } = params;
    const story = await prisma.story.findUnique({ where: { id: storyId } });

    // Security check: ensure user owns the story
    if (!story || story.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.story.delete({ where: { id: storyId } });

    return new NextResponse('Story deleted', { status: 200 });
  } catch (error) {
    console.error("STORY_DELETE_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}