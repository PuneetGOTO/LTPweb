"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { getServicePrice } from "./pricing"

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1495265401356030075/jOV0I0ZIufPQRCokTE-QRN04Tw5jO0vwn_9RdAlhNd0NxcfFaVZ-PMO1cmnW1eLYnSfj"

async function sendOrderToDiscord(order: {
  id: string
  gameName: string
  platform: string
  serverName: string
  serviceType: string
  durationHours: number
  totalPrice: number
  wechatId: string
  username: string
}) {
  try {
    const serverDisplay = order.serverName === "NONE" ? "N/A" : order.serverName

    const embed = {
      title: "🎮 新訂單 New Order",
      color: 0x00F5FF,
      fields: [
        { name: "📋 訂單編號 Order ID", value: `\`${order.id}\``, inline: true },
        { name: "👤 用戶名 Username", value: order.username, inline: true },
        { name: "💬 微信號 WeChat ID", value: order.wechatId, inline: true },
        { name: "🖥️ 平台 Platform", value: order.platform, inline: true },
        { name: "🌍 伺服器 Server", value: serverDisplay, inline: true },
        { name: "⚔️ 服務類型 Service", value: order.serviceType, inline: true },
        { name: "⏱️ 時長 Duration", value: `${order.durationHours} 小時 hour(s)`, inline: true },
        { name: "💰 總價 Total", value: `$${order.totalPrice}`, inline: true },
        { name: "🎯 遊戲 Game", value: order.gameName, inline: false },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: "LTP Service Platform | LTP 陪玩服務平台" }
    }

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "LTP Orders / LTP 訂單通知",
        avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
        embeds: [embed]
      })
    })
  } catch (e) {
    // Don't block order creation if webhook fails
    console.error("Discord webhook failed:", e)
  }
}

export async function createOrder(formData: FormData) {
  const session = await auth()
  if (!session || !session.user) return { error: "You must be logged in to book a companion." }

  const companionId = formData.get("companionId") as string
  const durationHours = parseInt(formData.get("durationHours") as string) || 1
  const gameName = formData.get("gameName") as string || "General"
  const wechatId = (formData.get("wechatId") as string)?.trim()
  
  if (!companionId) return { error: "Invalid companion." }
  if (!wechatId) return { error: "WeChat ID is required." }

  const companion = await prisma.user.findUnique({
    where: { id: companionId, role: "COMPANION" },
    include: { profile: true }
  })

  if (!companion) return { error: "Companion not found." }

  const rate = companion.profile?.hourlyRate || 150
  const totalPrice = rate * durationHours

  const order = await prisma.order.create({
    data: {
      clientId: session.user.id!,
      companionId,
      gameName,
      durationHours,
      totalPrice,
      wechatId,
      serviceType: "COMPANION",
      status: "PENDING"
    }
  })

  // Send to Discord
  await sendOrderToDiscord({
    id: order.id,
    gameName,
    platform: "DIRECT BOOKING",
    serverName: "N/A",
    serviceType: `COMPANION → ${companion.username}`,
    durationHours,
    totalPrice,
    wechatId,
    username: (session.user as any).username || session.user.name || "Unknown"
  })

  return { success: true }
}

export async function createBlindOrder(formData: FormData) {
  const session = await auth()
  if (!session || !session.user) return { error: "You must be logged in to book." }

  const platform = formData.get("platform") as string
  const serverName = formData.get("serverName") as string | null
  const serviceType = formData.get("serviceType") as string
  const durationHours = parseInt(formData.get("durationHours") as string) || 1
  const wechatId = (formData.get("wechatId") as string)?.trim()

  if (!platform || !serviceType) return { error: "Missing service configurations." }
  if (!wechatId) return { error: "WeChat ID is required." }

  const pricing = await getServicePrice(platform, serverName, serviceType)
  const totalPrice = pricing.hourlyRate * durationHours
  const safeServerName = serverName || "NONE"
  const gameName = `Valorant (${platform} - ${safeServerName} - ${serviceType})`

  const order = await prisma.order.create({
    data: {
      gameName,
      durationHours,
      totalPrice,
      platform,
      serverName: safeServerName,
      serviceType,
      wechatId,
      clientId: session.user.id!,
      status: "PENDING"
    }
  })

  // Send order details to Discord webhook
  await sendOrderToDiscord({
    id: order.id,
    gameName,
    platform,
    serverName: safeServerName,
    serviceType,
    durationHours,
    totalPrice,
    wechatId,
    username: (session.user as any).username || session.user.name || "Unknown"
  })

  return { success: true }
}

export async function adminAcceptOrder(id: string) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.order.update({
    where: { id },
    data: { status: "ACCEPTED" }
  })
  
  const { revalidatePath } = await import("next/cache")
  revalidatePath("/admin/orders")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function adminCompleteOrder(id: string) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.order.update({
    where: { id },
    data: { status: "COMPLETED" }
  })
  
  const { revalidatePath } = await import("next/cache")
  revalidatePath("/admin/orders")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function adminCancelOrder(id: string) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" }
  })
  
  const { revalidatePath } = await import("next/cache")
  revalidatePath("/admin/orders")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function adminDeleteOrder(id: string) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.order.delete({
    where: { id }
  })
  
  const { revalidatePath } = await import("next/cache")
  revalidatePath("/admin/orders")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function cancelMyOrder(orderId: string) {
  const session = await auth()
  if (!session || !session.user) return { error: "Not authenticated" }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return { error: "Order not found" }
  if (order.clientId !== session.user.id) return { error: "Unauthorized" }
  if (order.status !== "PENDING") return { error: "Only pending orders can be cancelled" }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" }
  })

  const { revalidatePath } = await import("next/cache")
  revalidatePath("/dashboard")
  revalidatePath("/admin/orders")
  return { success: true }
}
