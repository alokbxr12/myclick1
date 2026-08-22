import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/upload";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(1).max(50).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const raw = {
    username: formData.get("username"),
    email: formData.get("email"),
    name: formData.get("name") || undefined,
    password: formData.get("password"),
  };
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { username, email, name, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A user with that email or username already exists" },
      { status: 409 }
    );
  }

  const avatar = formData.get("avatar");
  let avatarUrl: string | null = null;
  if (avatar instanceof File && avatar.size > 0) {
    try {
      avatarUrl = await saveUploadedImage(avatar);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to upload profile photo" },
        { status: 400 }
      );
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { username, email, name, passwordHash, avatarUrl },
    select: { id: true, username: true, email: true, name: true, avatarUrl: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
