import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prismadb';

export async function PATCH(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { notificationId } = params;
    
    // Find the notification and ensure the current user is the recipient
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (notification?.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    // Update the notification to be read
    await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });

    return new NextResponse('Notification updated', { status: 200 });
  } catch (error) {
    console.error("NOTIFICATION_UPDATE_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}