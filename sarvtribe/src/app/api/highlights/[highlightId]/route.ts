// src/app/api/highlights/[highlightId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function DELETE(
  req: Request,
  { params }: { params: { highlightId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { highlightId } = params;

    // Find the highlight to verify ownership
    const highlight = await prisma.storyHighlight.findUnique({
      where: { id: highlightId },
    });

    // Security Check: Ensure the user owns the highlight
    if (!highlight || highlight.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Delete the highlight
    await prisma.storyHighlight.delete({
      where: { id: highlightId },
    });

    return new NextResponse('Highlight deleted', { status: 200 });
  } catch (error) {
    console.error('HIGHLIGHT_DELETE_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}