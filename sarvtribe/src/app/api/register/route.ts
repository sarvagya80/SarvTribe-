import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, username } = body;

    if (!email || !name || !password || !username) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { username: username }] }
    });

    if (existingUser) {
      return new NextResponse('Email or Username already in use', { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        username,
        hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}