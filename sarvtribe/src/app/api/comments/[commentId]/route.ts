// src/app/api/comments/[commentId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

export async function DELETE(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { commentId } = params;

  // Find the comment to verify ownership
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!comment || comment.userId !== session.user.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  return new NextResponse('Comment deleted', { status: 200 });
}