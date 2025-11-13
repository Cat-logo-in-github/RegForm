import nodemailer from "nodemailer";
import { sports } from "../forms/schema";
import fs from "fs";
import path from "path";

interface SportPlayers {
    sport: string;
    players: number;  // Number of players
}

interface PaymentFormData {
    name?:string,
    email?:string,
    paymentTypes: string[];  // Will contain max 2 strings
    paymentMode: string;
    sportsPlayers?: SportPlayers[];
    amountInNumbers: number;
    amountInWords: string;
    payeeName: string;
    transactionId: string;
    accommodationPeople?:number,
    accommodationPrice?:number,
    paymentDate: Date;
    paymentProof?: File;
    remarks?: string;
}

export async function sendPaymentConfirmationEmail(
    formData: PaymentFormData,
): Promise<void> {
    try {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

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

        // Load the HTML template
        const templatePath = path.join(process.cwd(), "templates", "payment-unconfirmed.html");
        let htmlTemplate = fs.readFileSync(templatePath, "utf8");

        // Prepare attachments if payment proof exists
        const attachments = [];
        if (formData.paymentProof) {
            const paymentProofBuffer = Buffer.from(await formData.paymentProof.arrayBuffer());
            attachments.push({
                filename: 'payment-proof' + formData.paymentProof.name.substring(formData.paymentProof.name.lastIndexOf('.')),
                content: paymentProofBuffer,
            });
        }

        // Generate sports table rows
        const sportsTable = formData.sportsPlayers && formData.sportsPlayers.length > 0 ? 
            formData.sportsPlayers.map(sportGroup => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${sports[sportGroup.sport]}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${sportGroup.players} Player${sportGroup.players > 1 ? 's' : ''}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">₹${(sportGroup.players * 800).toLocaleString('en-IN')}</td>
                </tr>
            `).join('') + `
                <tr class="total-row">
                    <td colspan="2" style="padding: 12px; text-align: right; background-color: #f9fafb; font-weight: 700; color: #111827;">Total Registration Fee:</td>
                    <td style="padding: 12px; background-color: #f9fafb; font-weight: 700; color: #111827;">₹${formData.sportsPlayers.reduce((total, sport) => total + (sport.players * 800), 0).toLocaleString('en-IN')}</td>
                </tr>
            ` : '';

        // Generate accommodation table rows
        const accommodationTable = formData.accommodationPeople && formData.accommodationPrice ? `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${formData.accommodationPeople}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">₹${formData.accommodationPrice.toLocaleString('en-IN')}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">₹${(formData.accommodationPeople * formData.accommodationPrice).toLocaleString('en-IN')}</td>
            </tr>
        ` : '';

        // Replace placeholders in the template
        htmlTemplate = htmlTemplate
            .replace(/{{name}}/g, formData.name || '')
            .replace(/{{payeeName}}/g, formData.payeeName)
            .replace(/{{paymentTypes}}/g, formData.paymentTypes.join(', '))
            .replace(/{{paymentMode}}/g, formData.paymentMode)
            .replace(/{{amountInNumbers}}/g, formData.amountInNumbers.toLocaleString('en-IN'))
            .replace(/{{amountInWords}}/g, formData.amountInWords.toUpperCase())
            .replace(/{{transactionId}}/g, formData.transactionId)
            .replace(/{{paymentDate}}/g, new Date(formData.paymentDate).toLocaleDateString('en-IN'))
            .replace(/{{sportsTable}}/g, sportsTable)
            .replace(/{{accommodationTable}}/g, accommodationTable);

        // Handle conditional sections
        if (formData.remarks) {
            htmlTemplate = htmlTemplate.replace(/{{#if remarks}}[\s\S]*?{{\/if}}/g, 
                `<tr>
                    <td class="label-cell">Remarks</td>
                    <td>${formData.remarks}</td>
                </tr>`
            );
        } else {
            htmlTemplate = htmlTemplate.replace(/{{#if remarks}}[\s\S]*?{{\/if}}/g, '');
        }

        if (!sportsTable) {
            htmlTemplate = htmlTemplate.replace(/{{#if sportsTable}}[\s\S]*?{{\/if}}/g, '');
        } else {
            htmlTemplate = htmlTemplate.replace(/{{#if sportsTable}}/g, '').replace(/{{\/if}}/g, '');
        }

        // Check if accommodation data exists (both people and price must be present)
        const hasAccommodation = formData.accommodationPeople && formData.accommodationPrice;
        
        if (!hasAccommodation || !accommodationTable) {
            // Remove the entire accommodation section if no accommodation was chosen
            htmlTemplate = htmlTemplate.replace(/{{#if accommodationTable}}[\s\S]*?{{\/if}}/g, '');
        } else {
            // Keep the section but remove the conditional markers
            htmlTemplate = htmlTemplate.replace(/{{#if accommodationTable}}/g, '').replace(/{{\/if}}/g, '');
        }

        // Send email
        await transporter.sendMail({
            from: `"Agneepath Payments" <${SMTP_USER}>`,
            to: formData.email,
            // OLD EMAILS - cc: ['vibha.rawat_ug2023@ashoka.edu.in','muhammed.razinmn_ug2023@ashoka.edu.in','dhruv.goyal_ug25@ashoka.edu.in','agneepath@ashoka.edu.in'],
            //cc :['jiya.vaya_ug2024@ashoka.edu.in','vidishaa.mundhra_ug2025@ashoka.edu.in','nishka.desai_ug2024@ashoka.edu.in','nishita.agarwal_ug2024@ashoka.edu.in'],
            subject: `Payment Confirmation - Transaction ID: ${formData.transactionId}`,
            html: htmlTemplate,
            attachments: attachments
        });

    } catch (error) {
        console.error("Error sending payment confirmation email:", error);
        throw error;
    }
}
