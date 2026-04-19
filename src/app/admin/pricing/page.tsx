import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllServicePricing } from "@/server/actions/pricing"
import AdminPricingClient from "./AdminPricingClient"

export const dynamic = "force-dynamic"

export default async function AdminPricingPage() {
  const session = await auth()
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    redirect("/login")
  }

  const pricings = await getAllServicePricing()

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPricingClient pricings={pricings} />
    </div>
  )
}
