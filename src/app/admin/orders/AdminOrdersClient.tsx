"use client"
import { Shield, Sparkles, CheckCircle, XCircle, Trash2, CheckSquare } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { adminAcceptOrder, adminCompleteOrder, adminCancelOrder, adminDeleteOrder } from "@/server/actions/order"
import { useState } from "react"

export default function AdminOrdersClient({ orders }: { orders: any[] }) {
  const { t } = useLanguage()
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState("ALL")

  const filteredOrders = orders.filter(o => filter === "ALL" || o.status === filter)

  const handleAction = async (id: string, actionName: string, actionFn: (id: string) => Promise<any>, requireConfirm = false) => {
    if (requireConfirm) {
      if (!confirm(`Are you sure you want to ${actionName} this order?`)) return;
    }
    setProcessing(id)
    await actionFn(id)
    setProcessing(null)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-4 gap-4">
        <h1 className="text-3xl font-bold font-orbitron text-primary">{t('admin.orders.title')}</h1>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded text-xs font-bold tracking-widest transition-all ${
                filter === status 
                  ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,245,255,0.4)]' 
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
         <table className="w-full text-left table-auto">
           <thead className="bg-white/5 border-b border-white/10 text-xs text-muted-foreground font-orbitron tracking-widest">
             <tr>
               <th className="p-4">ID</th>
               <th className="p-4">{t('admin.order.client')}</th>
               <th className="p-4">{t('admin.order.comp')}</th>
               <th className="p-4">{t('admin.order.amt')}</th>
               <th className="p-4">{t('admin.order.status')}</th>
               <th className="p-4 text-center">{t('admin.table.actions')}</th>
             </tr>
           </thead>
           <tbody>
             {filteredOrders.map(order => (
               <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                 <td className="p-4 text-xs font-mono text-muted-foreground">{order.id.slice(-6).toUpperCase()}</td>
                 <td className="p-4 text-sm font-semibold text-white">
                   <span className="truncate max-w-[120px]">{order.client.username}</span>
                 </td>
                 <td className="p-4 text-sm font-bold text-accent">
                   <span className="truncate max-w-[120px]">{order.companion?.username || "BLIND / TBD"}</span>
                   {!order.companion && <div className="text-[10px] text-muted-foreground font-normal mt-1">{order.gameName}</div>}
                 </td>
                 <td className="p-4 text-sm text-primary font-bold">
                   ${order.totalPrice} <span className="text-xs text-muted-foreground font-normal">/ {order.durationHours}hr</span>
                 </td>
                 <td className="p-4">
                   <span className={`text-[10px] px-2 py-1 rounded font-bold tracking-wider 
                      ${order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 
                        order.status === 'ACCEPTED' ? 'bg-primary/20 text-primary border border-primary/50' : 
                        order.status === 'CANCELLED' ? 'bg-destructive/20 text-destructive border border-destructive/50' :
                        'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'}`}>
                     {order.status}
                   </span>
                 </td>
                 <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => handleAction(order.id, 'ACCEPT', adminAcceptOrder)}
                          disabled={processing === order.id}
                          className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-black rounded transition-all"
                          title={t('admin.order.action')}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {order.status === 'ACCEPTED' && (
                        <button 
                          onClick={() => handleAction(order.id, 'COMPLETE', adminCompleteOrder, true)}
                          disabled={processing === order.id}
                          className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black rounded transition-all"
                          title={t('admin.order.complete')}
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      )}

                      {(order.status === 'PENDING' || order.status === 'ACCEPTED') && (
                        <button 
                          onClick={() => handleAction(order.id, 'CANCEL', adminCancelOrder, true)}
                          disabled={processing === order.id}
                          className="p-1.5 bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black rounded transition-all"
                          title={t('admin.order.cancel')}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleAction(order.id, 'DELETE', adminDeleteOrder, true)}
                        disabled={processing === order.id}
                        className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-black rounded transition-all ml-2"
                        title={t('admin.order.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 </td>
               </tr>
             ))}
             {filteredOrders.length === 0 && (
               <tr>
                 <td colSpan={6} className="p-8 text-center text-muted-foreground">No orders found.</td>
               </tr>
             )}
           </tbody>
         </table>
      </div>
    </div>
  )
}
