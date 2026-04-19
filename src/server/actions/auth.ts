"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function registerUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;
  
  if (!username || !password) return { error: "Username and password are required" };
  if (password.length < 6) return { error: "Password must be at least 6 characters" };
  
  const validIdRegex = /^[A-Za-z0-9_]+$/;
  if (!validIdRegex.test(username)) {
    return { error: "Username can only contain English letters, numbers, and underscores" };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return { error: "Username already exists" };

    const passwordHash = await bcrypt.hash(password, 10);
    
    const count = await prisma.user.count();
    
    await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: count === 0 ? "ADMIN" : "USER",
        profile: {
          create: {
            displayName: displayName || username
          }
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create user." };
  }
}

export async function loginUser(formData: FormData) {
  // Extract manually as signIn expects an object or FormData.
  // Passing plain object is safer for custom NextAuth configurations.
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: true,
      redirectTo: "/video-hub", // Always redirect to hub after login
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    // NEXT_REDIRECT error will be thrown here, so we must re-throw it!
    throw error;
  }
}
