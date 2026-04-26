import { Navbar } from "@/components/Navbar"
import { getServicePrice } from "@/server/actions/pricing"
import CheckoutClient from "./CheckoutClient"

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ platform?: string, serverName?: string, serviceType?: string }> }) {
  const resolvedParams = await searchParams
  const platform = resolvedParams.platform
  const serverName = resolvedParams.serverName
  const serviceType = resolvedParams.serviceType

  // Protect route
  if (!platform || !serviceType) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
         <h1 className="text-foreground text-2xl font-bold">Invalid checkout link.</h1>
      </div>
    )
  }

  const pricing = await getServicePrice(platform, serverName || "NONE", serviceType)

  return (
    <div className="min-h-screen bg-background flex flex-col relative w-full overflow-hidden">
       <Navbar />
       {/* Background */}
       <div className="absolute bottom-0 left-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] -translate-x-1/2 rounded-full pointer-events-none" />
       
       <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pt-12 text-center relative z-10 flex flex-col items-center justify-center">
         <CheckoutClient 
            platform={platform}
            serverName={serverName || "NONE"}
            serviceType={serviceType}
            hourlyRate={pricing.hourlyRate}
         />
       </div>
    </div>
  )
}
