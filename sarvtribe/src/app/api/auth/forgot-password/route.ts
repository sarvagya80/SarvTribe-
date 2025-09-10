import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return new NextResponse('If a user with that email exists, an OTP has been sent.', { status: 200 });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save hashed OTP and expiry on the user
    await prisma.user.update({
      where: { email },
      data: { passwordResetToken: hashedOtp, passwordResetExpires: otpExpires },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your SarvTribe Password Reset Code',
      html: `<p>Your password reset code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
    });

    return new NextResponse('Password reset OTP sent.', { status: 200 });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}