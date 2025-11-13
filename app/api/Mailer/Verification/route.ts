import { encrypt } from "@/app/utils/encryption";
import { connectToDatabase } from "@/lib/mongodb";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
/* eslint-disable @typescript-eslint/no-unused-vars */

dotenv.config();

async function getVerificationId(email: string): Promise<string | null> {
  const { db } = await connectToDatabase();
  const collection = db.collection("users");
  const user = await collection.findOne({ email });
  return user?.VerificationId || null;
}

async function sendEmail(to: string, id: string, userName?: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ROOT_URL } = process.env;

  if (!SMTP_USER || !SMTP_PASS || !ROOT_URL) {
    throw new Error("Email configuration missing in environment variables");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Generate a unique timestamp to prevent email threading
  const timestamp = new Date().toISOString();
  const uniqueMessageId = `<verify-${id}-${Date.now()}@agneepath.co.in>`;
  
  // Load the signup email template (which includes verification for form signups)
  const templatePath = path.join(process.cwd(), "templates", "signup.html");
  let emailTemplate = fs.readFileSync(templatePath, "utf-8");

  // Create verification link
  const verificationLink = `${ROOT_URL}Verification/verify?e=${encrypt({ email: to })}&i=${encrypt({ vid: id })}`;

  // Replace placeholders in template
  emailTemplate = emailTemplate
    .replace(/{{name}}/g, userName || "there")
    .replace(/{{email}}/g, to)
    .replace(/{{universityName}}/g, "Not provided yet")
    .replace(/{{signupMethod}}/g, "Email & Password")
    .replace(/{{dashboardUrl}}/g, `${ROOT_URL}dashboard`)
    .replace(/{{verificationLink}}/g, verificationLink)
    .replace(/{{timestamp}}/g, new Date().toLocaleString("en-US", { 
      dateStyle: "long", 
      timeStyle: "short",
      timeZone: "Asia/Kolkata" 
    }))
    .replace(/{{currentYear}}/g, new Date().getFullYear().toString());

  // Handle conditional sections - show verification (isFormSignup = true)
  emailTemplate = emailTemplate.replace(
    /{{#if isFormSignup}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g,
    "$1"
  );

  // Handle university name conditional (no university provided)
  emailTemplate = emailTemplate.replace(/{{#if universityName}}[\s\S]*?{{\/if}}/g, "");

  await transporter.sendMail({
    from: `"Agneepath" <${SMTP_USER}>`,
    to,
    //cc :['jiya.vaya_ug2024@ashoka.edu.in','vidishaa.mundhra_ug2025@ashoka.edu.in','nishka.desai_ug2024@ashoka.edu.in','nishita.agarwal_ug2024@ashoka.edu.in'],
    subject: "Verify your account - Agneepath 7.0",
    headers: {
      "X-Gm-NoSave": "1", // Custom header to prevent saving in Sent folder
      "Message-ID": uniqueMessageId, // Unique Message-ID to prevent threading
      "X-Entity-Ref-ID": uniqueMessageId, // Additional unique identifier
    },
    html: emailTemplate
  });
    
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    // Check if user is already verified
    const { db } = await connectToDatabase();
    const collection = db.collection("users");
    const user = await collection.findOne({ email });
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (user.emailVerified === true) {
      return new Response(
        JSON.stringify({ message: "Email is already verified" }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const verificationId = await getVerificationId(email);

    if (!verificationId) {
      return new Response(
        JSON.stringify({ error: "VerificationId not found" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await sendEmail(email, verificationId, user.name);
    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    // console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
