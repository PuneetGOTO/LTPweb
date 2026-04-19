"use client"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Users, Video as VideoIcon, Eye, Clock, UserPlus, Cloud, CloudOff, Settings } from "lucide-react"
import { updateCloudinaryConfig } from "@/server/actions/settings"
import { useRouter } from "next/navigation"

export default function DashboardClient({ 
  usersCount, 
  videosCount, 
  viewsCount,
  recentUsers,
  recentOrders,
  cloudinaryConnected
}: { 
  usersCount: number, 
  videosCount: number, 
  viewsCount: number,
  recentUsers: any[],
  recentOrders: any[],
  cloudinaryConnected?: boolean
}) {
  const { t } = useLanguage()
  const router = useRouter()
  
  const [showCloudinaryModal, setShowCloudinaryModal] = useState(false)
  const [cName, setCName] = useState("")
  const [cKey, setCKey] = useState("")
  const [cSecret, setCSecret] = useState("")
  const [cLoading, setCLoading] = useState(false)
  const [cError, setCError] = useState("")

  const handleCloudinarySave = async (e: React.FormEvent) => {
    e.preventDefault()
    setCLoading(true)
    setCError("")
    const formData = new FormData()
    formData.append("cloudName", cName.trim())
    formData.append("apiKey", cKey.trim())
    formData.append("apiSecret", cSecret.trim())

    try {
      const res = await updateCloudinaryConfig(formData)
      if (res.error) setCError(res.error)
      else {
        setShowCloudinaryModal(false)
        router.refresh() // re-fetch connection status
      }
    } catch (err: any) {
      setCError(err.message)
    } finally {
      setCLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-8">
        <h1 className="text-3xl font-bold font-orbitron text-primary">
          {t('admin.nav.dashboard')}
        </h1>
        <div className="flex items-center gap-2">
          {cloudinaryConnected === true ? (
            <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full flex items-center gap-1.5 border border-green-500/30">
              <Cloud className="w-3.5 h-3.5" />
              Cloudinary: Connected
            </div>
          ) : (
            <div className="px-3 py-1 bg-destructive/20 text-destructive text-xs font-bold rounded-full flex items-center gap-1.5 border border-destructive/30">
              <CloudOff className="w-3.5 h-3.5" />
              Cloudinary: Disconnected / Error
            </div>
          )}
          <button 
            onClick={() => setShowCloudinaryModal(true)}
            className="p-1 text-muted-foreground hover:text-white transition-colors"
            title="Configure Cloudinary"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showCloudinaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h2 className="text-xl font-bold font-orbitron text-white mb-4">Cloudinary Config</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your Cloudinary API credentials. These will be saved to your server's .env file and applied immediately.</p>
            
            <form onSubmit={handleCloudinarySave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">CLOUD NAME</label>
                <input 
                  type="text" required value={cName} onChange={e => setCName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">API KEY</label>
                <input 
                  type="text" required value={cKey} onChange={e => setCKey(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">API SECRET</label>
                <input 
                  type="password" required value={cSecret} onChange={e => setCSecret(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-accent text-sm"
                />
              </div>
              
              {cError && <p className="text-xs text-destructive font-bold">{cError}</p>}
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCloudinaryModal(false)} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-white">Cancel</button>
                <button type="submit" disabled={cLoading} className="px-4 py-2 text-sm font-bold bg-accent text-white rounded hover:bg-accent/80 disabled:opacity-50">
                  {cLoading ? "Saving..." : "Save & Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-black to-slate-900 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,245,255,0.1)]">
          <div className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-primary"/> TOTAL USERS</div>
          <div className="text-4xl font-black text-primary font-orbitron">{usersCount}</div>
        </div>
        
        <div className="bg-gradient-to-br from-black to-slate-900 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,170,0.1)]">
          <div className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2"><VideoIcon className="w-4 h-4 text-accent"/> PUBLISHED VIDEOS</div>
          <div className="text-4xl font-black text-accent font-orbitron">{videosCount}</div>
        </div>
        
        <div className="bg-gradient-to-br from-black to-slate-900 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          <div className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-green-400"/> GLOBAL VIEWS</div>
          <div className="text-4xl font-black text-green-400 font-orbitron">{viewsCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-black/60 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold font-orbitron mb-4 text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> {t('admin.dashboard.recentOrders')}
          </h2>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-lg">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {order.client?.username} <span className="text-muted-foreground px-1">→</span> <span className="text-accent">{order.companion?.username}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">${order.totalPrice}</div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 mt-1 rounded ${
                    order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'ACCEPTED' ? 'bg-primary/20 text-primary' :
                    order.status === 'CANCELLED' ? 'bg-destructive/20 text-destructive' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <div className="text-sm text-muted-foreground">No recent orders.</div>}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-black/60 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold font-orbitron mb-4 text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent" /> {t('admin.dashboard.recentUsers')}
          </h2>
          <div className="space-y-4">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-lg">
                <div className="w-10 h-10 rounded border border-white/10 bg-gradient-to-br from-black to-slate-800 flex items-center justify-center text-white font-orbitron font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{user.username}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold tracking-wider 
                    ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary border border-primary/50' : 
                      user.role === 'COMPANION' ? 'bg-accent/20 text-accent border border-accent/50' :
                      'bg-white/5 border border-white/10 text-muted-foreground'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && <div className="text-sm text-muted-foreground">No recent users.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
