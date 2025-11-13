import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { sports } from "../forms/schema";
import fs from "fs";
import path from "path";
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
        <td colspan="2" style="padding: 10px; background-color: #dbeafe; font-weight: 600;"><strong>Coach Information</strong></td>
      </tr>
      ${Object.entries(formData.fields.coachFields)
                .map(([key, value]) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb;"><strong>${formatFieldName(key)}</strong></td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${value instanceof Date ? value.toLocaleDateString() : value
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
          <td colspan="2" style="padding: 10px; background-color: #dbeafe; font-weight: 600;">
            <strong>Player ${index + 1} Information</strong>
          </td>
        </tr>
        ${Object.entries(player)
                    .map(([key, value]) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb;"><strong>${formatFieldName(key)}</strong></td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${value instanceof Date ? value.toLocaleDateString() : value
                        }</td>
            </tr>
          `).join('')}
      `;
        });
    }

    // Read the email template
    const templatePath = path.join(process.cwd(), 'templates', 'registration.html');
    let emailContent = fs.readFileSync(templatePath, 'utf-8');

    // Replace placeholders
    emailContent = emailContent
        .replace(/{{name}}/g, formData.name)
        .replace(/{{sport}}/g, sports[formData.title])
        .replace(/{{universityName}}/g, formData.universityName)
        .replace(/{{playerAndCoachDetails}}/g, coachTableRows + playerTableRows);

    const attachments = [
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
      // OLD EMAILS -cc :['vibha.rawat_ug2023@ashoka.edu.in','muhammed.razinmn_ug2023@ashoka.edu.in','agneepath@ashoka.edu.in'],
      //cc :['jiya.vaya_ug2024@ashoka.edu.in','vidishaa.mundhra_ug2025@ashoka.edu.in','nishka.desai_ug2024@ashoka.edu.in','nishita.agarwal_ug2024@ashoka.edu.in'],
      subject: `Thank you for registering for Agneepath 7.0 (${formData.universityName})`,
      headers: {
          "X-Gm-NoSave": "1",
      },
      html: emailContent,
      attachments,
  });
}

export default sendConfirmationEmail;
