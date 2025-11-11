/* eslint-disable @typescript-eslint/no-unused-vars */

import { OAuth2Client } from "google-auth-library";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { encrypt } from "@/app/utils/encryption";
import { NextRequest, NextResponse } from "next/server";
import { sendSignupConfirmationEmail } from "@/app/utils/mailer/SignupEmail";

const JWT_SECRET = process.env.JWT_SECRET || "your-256-bit-secret"; // Your JWT secret
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Google OAuth2 client initialization

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json(); // Get the token from the frontend
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Use your Google Client ID here,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload || {};

    if (!email || !name) {
      return NextResponse.json({ success: false, message: "Missing user information." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("users");

    // Check if the user exists in the database
    let existingUser = await collection.findOne({ email: email.toLowerCase() });
    let isNewUser = false;

    // If the user doesn't exist, create a new one
    if (!existingUser) {
      isNewUser = true;
      const result = await collection.insertOne({
        email: email.toLowerCase(),
        name,
        googleAuth: true,
        emailVerified: true, // Google has verified the email
        createdAt: new Date(),
        universityName: "",
        Accommodation:{needAccommodation:false}
    });

      // After inserting the user, fetch the document with the inserted _id
      existingUser = await collection.findOne({ _id: result.insertedId });

      if (!existingUser) {
        return NextResponse.json({ success: false, message: "Failed to fetch user after insert." }, { status: 500 });
      }

      // Send signup confirmation email for new users (non-blocking)
      sendSignupConfirmationEmail({
        name,
        email: email.toLowerCase(),
        signupMethod: "google",
      }).catch((err) => console.error("Email send failed:", err));
    }
    const universityNameRequired = existingUser.universityName === "";

    // Generate JWT token
    const payloadJWT = { email: existingUser.email, name: existingUser.name, googleAuth: existingUser.googleAuth, universityNameRequired:universityNameRequired};
    const tokenJWT = jwt.sign(payloadJWT, JWT_SECRET, { expiresIn: "2d" });

    // Encrypt token (optional)
    const encryptedToken = encrypt({ jwt: tokenJWT });

    // Determine if universityName is required (based on whether it's empty)

    return NextResponse.json({
      success: true,
      token: encryptedToken,
      universityNameRequired, // Send this flag in the response
    });

  } catch (error) {
    // console.error("Google authentication error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}
