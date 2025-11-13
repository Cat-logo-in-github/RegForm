import { hashPassword } from "@/app/utils/hashing";
import { connectToDatabase } from "@/lib/mongodb";
import crypto from "crypto";
import { createErrorResponse } from "@/app/utils/interfaces";
import { sendSignupConfirmationEmail } from "@/app/utils/mailer/SignupEmail";
function generateVerificationId() {
  return crypto.randomBytes(32).toString("hex"); // Generates a 64-character token
}
/* eslint-disable @typescript-eslint/no-unused-vars */

// Handle POST requests for user registration
export async function POST(req: Request) {
  const { name, universityName, email,password,phone } = await req.json();

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("users");

    // Check if the email already exists
    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return createErrorResponse(
        409,
        "Email is already registered.",
        "Please use a different email address."
      );
    }

    // Hash the password and store user
    const hashedPassword = await hashPassword(password);
    const vid = generateVerificationId();
    const currentTime = new Date(); // Get current date and time
    const expirationTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
    await collection.insertOne({
      name,
      universityName,
      email:email.toLowerCase(),
      password: hashedPassword,
      emailVerified: false,
      phone:phone,
      VerificationId: vid,
      vTimeLimit: expirationTime,
      Accommodation:{needAccommodation:false}
    });

    // Send signup confirmation email (non-blocking)
    sendSignupConfirmationEmail({
      name,
      email: email.toLowerCase(),
      universityName,
      signupMethod: "form",
      verificationToken: vid,
    }).catch((err) => console.error("Sending signup email failed:", err));

    return new Response(
      JSON.stringify({ message: "User created successfully." }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    // console.error("Error creating user:", error);
    return createErrorResponse(
      500,
      "Internal server error.",
      "An unexpected error occurred. Please try again later."
    );
  }
}
