import { getAllServicePricing } from "@/server/actions/pricing"
import ServiceSelectorClient from "./ServiceSelectorClient"

export const dynamic = "force-dynamic"

export default async function SelectServicePage() {
  const pricings = await getAllServicePricing()

  // Build a map of service availability: { "MOBILE_NONE_COMPANION": true, "PC_HK_BOOSTING": false, ... }
  const serviceAvailability: Record<string, boolean> = {}
  for (const p of pricings) {
    const key = `${p.platform}_${p.server || "NONE"}_${p.serviceType}`
    serviceAvailability[key] = p.isActive
  }

  return <ServiceSelectorClient serviceAvailability={serviceAvailability} />
}
