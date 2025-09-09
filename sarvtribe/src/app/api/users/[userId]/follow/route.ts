import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

// Function to FOLLOW a user or SEND a follow request
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (!currentUser) return new NextResponse('User not found', { status: 404 });

  const targetUserId = params.userId;
  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }});

  if (!targetUser) {
    return new NextResponse('Target user not found', { status: 404 });
  }

  // LOGIC FOR PRIVATE ACCOUNTS
  if (targetUser.isPrivate) {
    const existingRequest = await prisma.followRequest.findFirst({
        where: { fromUserId: currentUser.id, toUserId: targetUserId }
    });

    if (existingRequest && existingRequest.status === 'PENDING') {
        return new NextResponse('Follow request already sent', { status: 400 });
    }

    await prisma.followRequest.create({
      data: {
        fromUserId: currentUser.id,
        toUserId: targetUserId,
      },
    });

    // Create a notification for the private user
    await prisma.notification.create({
        data: {
            body: 'requested to follow you.',
            type: 'FOLLOW',
            userId: targetUser.id, // The recipient is the private user
            senderId: currentUser.id,
            senderName: currentUser.name || 'A user',
            senderImage: currentUser.image,
        }
    });
    
    return new NextResponse('Follow request sent', { status: 200 });

  } 
  // LOGIC FOR PUBLIC ACCOUNTS
  else {
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { followingIds: { push: targetUserId } },
    });

     // Create a notification for the public user
    await prisma.notification.create({
        data: {
            body: 'started following you.',
            type: 'FOLLOW',
            userId: targetUser.id, // The recipient is the user who was followed
            senderId: currentUser.id,
            senderName: currentUser.name || 'Someone',
            senderImage: currentUser.image,
        }
    });

    return new NextResponse('Followed successfully', { status: 200 });
  }
}

// Function to UNFOLLOW a user
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  if (!currentUser) return new NextResponse('User not found', { status: 404 });

  const updatedFollowingIds = currentUser.followingIds.filter(
    (id) => id !== params.userId
  );

  await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      followingIds: updatedFollowingIds,
    },
  });

  return new NextResponse('Unfollowed successfully', { status: 200 });
}