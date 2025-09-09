// src/app/api/follow-requests/[requestId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const { action } = await req.json(); // 'accept' or 'decline'
  const { requestId } = params;

  const followRequest = await prisma.followRequest.findUnique({
    where: { id: requestId },
  });

  // Security check: ensure the current user is the one receiving the request
  if (!followRequest || followRequest.toUserId !== session.user.id) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (action === 'accept') {
    // Use a transaction to perform both actions at once
    await prisma.$transaction([
      // 1. Update the follower's list
      prisma.user.update({
        where: { id: followRequest.fromUserId },
        data: { followingIds: { push: followRequest.toUserId } },
      }),
      // 2. Update the request status
      prisma.followRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
    ]);
  } else { // Decline
    await prisma.followRequest.update({
      where: { id: requestId },
      data: { status: 'DECLINED' },
    });
  }

  return new NextResponse(`Request ${action}ed`, { status: 200 });
}