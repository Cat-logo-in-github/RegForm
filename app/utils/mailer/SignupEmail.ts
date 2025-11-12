import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

interface SignupEmailData {
  name: string;
  email: string;
  universityName?: string;
  signupMethod: "google" | "form";
}

export async function sendSignupConfirmationEmail(data: SignupEmailData): Promise<void> {
  try {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ROOT_URL, LOGO } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error("Email configuration missing in environment variables");
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Read HTML template
    const templatePath = path.join(process.cwd(), "templates", "signup.html");
    let emailContent = fs.readFileSync(templatePath, "utf-8");

    // Determine if form signup (needs email verification)
    const isFormSignup = data.signupMethod === "form";

    // Replace simple placeholders
    emailContent = emailContent
      .replace(/{{name}}/g, data.name)
      .replace(/{{email}}/g, data.email)
      .replace(/{{universityName}}/g, data.universityName || "Not provided yet")
      .replace(/{{signupMethod}}/g, data.signupMethod === "google" ? "Google OAuth" : "Email & Password")
      .replace(/{{dashboardUrl}}/g, `${ROOT_URL || "https://agneepath.co.in/"}dashboard`)
      .replace(/{{timestamp}}/g, new Date().toLocaleString("en-US", { 
        dateStyle: "long", 
        timeStyle: "short",
        timeZone: "Asia/Kolkata" 
      }))
      .replace(/{{currentYear}}/g, new Date().getFullYear().toString());

    // Handle conditional sections - university name
    const universitySection = data.universityName 
      ? `<p><strong>University:</strong> ${data.universityName}</p>`
      : "";
    emailContent = emailContent.replace(/{{#if universityName}}[\s\S]*?{{\/if}}/g, universitySection);

    // Handle conditional sections - form signup vs OAuth
    if (isFormSignup) {
      // Show verification notice for form signups
      emailContent = emailContent.replace(
        /{{#if isFormSignup}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g,
        "$1"
      );
    } else {
      // Show already verified message for OAuth signups
      emailContent = emailContent.replace(
        /{{#if isFormSignup}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g,
        "$1"
      );
    }

    // Prepare attachments (logo)
    const attachments = LOGO ? [
      {
        filename: "logo2.png",
        path: LOGO,
        cid: "unique-image-cid",
        encoding: "base64" as const,
      },
    ] : [];

    // Generate unique message ID to prevent threading
    const uniqueMessageId = `<signup-${Date.now()}-${data.email}@agneepath.co.in>`;

    await transporter.sendMail({
      from: `"Agneepath" <${SMTP_USER}>`,
      to: data.email,
      // cc:
      subject: "Welcome to Agneepath! 🎉",
      html: emailContent,
      attachments,
      headers: {
        "X-Gm-NoSave": "1",
        "Message-ID": uniqueMessageId,
        "X-Entity-Ref-ID": uniqueMessageId,
      },
    });

    console.log(`✅ Signup confirmation email sent to ${data.email}`);
  } catch (error) {
    console.error("❌ Failed to send signup confirmation email:", error);
    // Don't throw - we don't want to block signup if email fails
  }
}
