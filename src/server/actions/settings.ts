"use server"

import fs from "fs"
import path from "path"
import { auth } from "@/auth"
import cloudinary from "@/lib/cloudinary"

export async function updateCloudinaryConfig(formData: FormData) {
  const session = await auth()
  if (!session || !session.user || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    return { error: "Unauthorized" }
  }

  const cloudName = formData.get("cloudName") as string
  const apiKey = formData.get("apiKey") as string
  const apiSecret = formData.get("apiSecret") as string

  if (!cloudName || !apiKey || !apiSecret) {
    return { error: "All Cloudinary fields are required" }
  }

  try {
    const envPath = path.join(process.cwd(), ".env")
    let envContent = ""
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8")
    }

    // Replace or format env vars
    const updateEnvVar = (content: string, key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, "m")
      if (regex.test(content)) {
        return content.replace(regex, `${key}="${value}"`)
      } else {
        return content + `\n${key}="${value}"`
      }
    }

    envContent = updateEnvVar(envContent, "CLOUDINARY_CLOUD_NAME", cloudName)
    envContent = updateEnvVar(envContent, "CLOUDINARY_API_KEY", apiKey)
    envContent = updateEnvVar(envContent, "CLOUDINARY_API_SECRET", apiSecret)

    fs.writeFileSync(envPath, envContent, "utf-8")

    // Update in-memory for immediate effect without restart
    process.env.CLOUDINARY_CLOUD_NAME = cloudName
    process.env.CLOUDINARY_API_KEY = apiKey
    process.env.CLOUDINARY_API_SECRET = apiSecret

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    })

    return { success: true }
  } catch (e: any) {
    console.error("Failed to update env:", e)
    return { error: e.message || "Failed to save configuration" }
  }
}
