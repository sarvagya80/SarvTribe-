// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prismadb';

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    // Destructure the new fields
    const { name, image, bio, coverPhoto, location } = body;

    const dataToUpdate: { [key: string]: string } = {};
    if (name) dataToUpdate.name = name;
    if (image) dataToUpdate.image = image;
    if (bio) dataToUpdate.bio = bio;
    if (coverPhoto) dataToUpdate.coverPhoto = coverPhoto;
    if (location) dataToUpdate.location = location;

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('PROFILE_UPDATE_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}