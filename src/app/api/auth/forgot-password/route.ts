import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  // Always respond the same way so we don't reveal whether an email is registered.
  const genericResponse = NextResponse.json({
    message: "If an account with that email exists, a reset link has been sent.",
  });

  if (!email) return genericResponse;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return genericResponse;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const origin = new URL(request.url).origin;
  const resetUrl = `${origin}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (err) {
    console.error("Failed to send password reset email", err);
  }

  return genericResponse;
}
