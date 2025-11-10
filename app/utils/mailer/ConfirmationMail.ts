import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { sports } from "../forms/schema";
/* eslint-disable @typescript-eslint/no-explicit-any */

dotenv.config();

interface PlayerField {
    name: string;
    email: string;
    phone: string;
    gender: string;
    [key: string]: any; // For other dynamic fields
}

interface FormData {
  email:string,
    _id: string;
    ownerId: string;
    title: string;
    status: string;
    universityName: string,
    name: string,
    fields: {
        coachFields?: Record<string, any>;
        playerFields?: PlayerField[];
    };
}

function formatFieldName(key: string): string {
    // Handle category special cases
    if (key.startsWith('category')) {
        return 'Category ' + key.slice(-1);
    }

    // Split by camelCase, underscore, or space and capitalize each word
    return key
        .replace(/([A-Z])/g, ' $1')
        .split(/[_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
}

async function sendConfirmationEmail(formData: FormData) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_USER || !SMTP_PASS) {
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

    // Generate table rows for coach fields if they exist
    let coachTableRows = '';
    if (formData.fields.coachFields && Object.keys(formData.fields.coachFields).length > 0) {
        coachTableRows = `
      <tr>
        <td colspan="2" style="padding: 10px; background-color: #f0f0f0;"><strong>Coach Information</strong></td>
      </tr>
      ${Object.entries(formData.fields.coachFields)
                .map(([key, value]) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${formatFieldName(key)}</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${value instanceof Date ? value.toLocaleDateString() : value
                    }</td>
          </tr>
        `).join('')}
    `;
    }

    // Generate table rows for player fields
    let playerTableRows = '';
    if (formData.fields.playerFields && formData.fields.playerFields.length > 0) {
        formData.fields.playerFields.forEach((player, index) => {
            playerTableRows += `
        <tr>
          <td colspan="2" style="padding: 10px; background-color: #f0f0f0;">
            <strong>Player ${index + 1} Information</strong>
          </td>
        </tr>
        ${Object.entries(player)
                    .map(([key, value]) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>${formatFieldName(key)}</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${value instanceof Date ? value.toLocaleDateString() : value
                        }</td>
            </tr>
          `).join('')}
      `;
        });
    }

 const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="text-align: center; color: #ed810c;">Registration Confirmation - ${sports[formData.title]}</h2>
      
      <p>Dear ${formData.name},</p>
      
      <p>We are pleased to inform you that you have successfully registered for Agneepath 6.0, hosted at Ashoka University. We are excited to have you join us for the upcoming competition in ${sports[formData.title]}, representing your institution, ${formData.universityName}.</p>
      
      <p style="font-weight: bold; color: #666;">Your application is currently under review by our team. Please note that your registration will only be confirmed after the payment of registration fees. Once you complete the payment, you will receive a separate confirmation email.</p>

      <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        To complete your registration:
        <ol style="margin-top: 10px;">
          <li>Please find the attached PDF containing our bank details for payment.</li>
          <li>Visit the <a href="register.agneepath.co.in/dashboard/Payments" style="color: #ed810c; text-decoration: none;">Accommodation and Payments</a> page to submit your payment confirmation and arrange accommodation if needed.</li>
        </ol>
      </p>

      <p>Here is a copy of details that you submitted:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${coachTableRows}
        ${playerTableRows}
      </table>
      
      <p style="margin-top: 20px;">If you have any questions or need to update your information, please feel free to contact us at <a href="mailto:agneepath@ashoka.edu.in" style="color: #ed810c; text-decoration: none;">agneepath@ashoka.edu.in</a> or you can also make a support request by going to the <a href="register.agneepath.co.in" style="color: #ed810c; text-decoration: none;">dashboard</a>.</p>
      
      <p style="margin-top: 30px;">Best regards,<br>Team Agneepath 6.0<br>Ashoka University</p>
      
      <img src="cid:unique-image-cid" alt="Agneepath Logo" style="max-width: 15%; height: auto;" />
    </div>
  `;

    const attachments = [
        {
            filename: "logo.png",
            path: `${process.env.LOGO}`,
            cid: "unique-image-cid",
            encoding: "base64"
        },
        {
            filename: "BankDetails.pdf",
            path: `${process.env.BANK_DETAILS_PDF}`,
            contentType: 'application/pdf'
        }
    ];

    // Get all unique participant emails
   
    // Send email to all participants
    console.log(formData)
    await transporter.sendMail({
      from: `Registation <SMTP_USER>`,
      to: formData.email,
      //2025 OC - cc :['vibha.rawat_ug2023@ashoka.edu.in','muhammed.razinmn_ug2023@ashoka.edu.in','agneepath@ashoka.edu.in'],
      //cc :['jiya.vaya_ug2024@ashoka.edu.in','vidishaa.mundhra_ug2025@ashoka.edu.in','nishka.desai_ug2024@ashoka.edu.in','nishita.agarwal_ug2024@ashoka.edu.in'],
      subject: `Thank you for registering for Agneepath 6.0 (${formData.universityName})`,
      headers: {
          "X-Gm-NoSave": "1",
      },
      html: emailContent,
      attachments,
  });
}

export default sendConfirmationEmail;
