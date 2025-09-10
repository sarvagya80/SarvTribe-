import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, otp, password } = await request.json();
    if (!email || !otp || !password) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Find user by email and ensure OTP hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user || !user.passwordResetToken) {
      return new NextResponse('Invalid OTP or email, or OTP has expired.', { status: 400 });
    }

    // Verify OTP against hashed value
    const isCorrectOtp = await bcrypt.compare(otp, user.passwordResetToken);

    if (!isCorrectOtp) {
      return new NextResponse('Invalid OTP.', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear OTP fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return new NextResponse('Password has been successfully reset.', { status: 200 });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}