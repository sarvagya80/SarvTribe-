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

    const { EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM } = process.env as Record<string, string | undefined>;
    if (!EMAIL_SERVER_USER || !EMAIL_SERVER_PASSWORD || !EMAIL_FROM) {
      console.error('EMAIL ENV MISSING', { EMAIL_SERVER_USER: !!EMAIL_SERVER_USER, EMAIL_FROM: !!EMAIL_FROM });
      return new NextResponse('Email is not configured', { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_SERVER_USER,
        pass: EMAIL_SERVER_PASSWORD,
      },
    });

    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: 'Your SarvTribe Login Verification Code',
        text: `Your OTP is: ${otp}`,
      });
    } catch (e) {
      console.error('SENDMAIL_ERROR', e);
      return new NextResponse('Failed to send OTP email', { status: 500 });
    }

    return new NextResponse('OTP sent successfully', { status: 200 });

  } catch (error) {
    console.error('REQUEST_OTP_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}