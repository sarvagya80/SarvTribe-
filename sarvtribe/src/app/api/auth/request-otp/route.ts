import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim();
    const password = (body.password || '').trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.hashedPassword) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isCorrectPassword) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { email },
      data: { otp: hashedOtp, otpExpires },
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
      subject: 'Your SarvTribe Login Verification Code',
      text: `Your OTP is: ${otp}`,
    });

    return new NextResponse('OTP sent successfully', { status: 200 });

  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}