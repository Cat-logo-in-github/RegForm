import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { decrypt } from "@/app/utils/encryption";
/* eslint-disable @typescript-eslint/no-unused-vars */

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Extract and decrypt the token
    const { tokene } = await req.json();
    const decryptedToken = decrypt(tokene).jwt;

    // Ensure JWT secret is available
    if (!JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: "Server misconfiguration: JWT_SECRET not set" },
        { status: 500 }
      );
    }

    // Verify the JWT (JWT_SECRET is guaranteed to be a string here)
    const verifiedToken = jwt.verify(decryptedToken, JWT_SECRET as jwt.Secret);

    // If verification succeeds, send status 200 with the verified payload
    return NextResponse.json(
      { success: true, message: "Token verified successfully", verified: verifiedToken },
      { status: 200 }
    );
  } catch (error) {
    // console.error("JWT Verification error:", error);
    // Return status 401 if token is invalid
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
