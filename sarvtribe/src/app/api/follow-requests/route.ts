// src/app/api/follow-requests/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const requests = await prisma.followRequest.findMany({
    where: {
      toUserId: session.user.id,
      status: 'PENDING',
    },
    include: {
      fromUser: true, // Get the details of who sent the request
    },
  });

  return NextResponse.json(requests);
}