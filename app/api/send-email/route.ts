import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, email, date, time, service, barberName } = await req.json();

    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.warn("No GMAIL_USER or GMAIL_APP_PASSWORD set. Please set them in .env.local");
      return NextResponse.json({ success: true, dummy: true });
    }

    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // Send the email using the transporter
    const info = await transporter.sendMail({
      from: `"Lydblade Barbershop" <${GMAIL_USER}>`,
      to: email, // This goes to the customer
      bcc: GMAIL_USER, // This sends a hidden copy to you (the admin)
      subject: 'Booking Confirmation - Lydblade Barbershop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; text-align: left;">
          <h2 style="color: #000;">Booking Received!</h2>
          <p>Hi ${name},</p>
          <p>Your appointment request has been successfully received and is securely recorded in our system. We are reviewing it now.</p>
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #0f172a;">
            <p style="margin: 5px 0;"><strong>Service:</strong> ${service}</p>
            <p style="margin: 5px 0;"><strong>Barber:</strong> ${barberName}</p>
            <p style="margin: 5px 0;"><strong>Customer Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          </div>
          <p>We'll notify you shortly if there are any issues or when it is formally confirmed.</p>
          <br>
          <p>Best Regards,<br><strong>Lydblade Barbershop Team</strong></p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Nodemailer error:", error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
