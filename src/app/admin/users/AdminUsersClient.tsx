"use client"

import { useState } from "react"
import { adminCreateUser, adminUpdateUser, adminDeleteUser } from "@/server/actions/admin"
import { Shield, User, X, Trash2, Edit } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AdminUsersClient({ users }: { users: any[] }) {
  const { t } = useLanguage()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const res = await adminCreateUser(new FormData(e.currentTarget))
      if (res?.error) setError(res.error)
      else setIsCreateOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const res = await adminUpdateUser(new FormData(e.currentTarget))
      if (res?.error) setError(res.error)
      else setEditingUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this user? This cannot be undone.")) {
      await adminDeleteUser(id)
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-4 gap-4">
        <h1 className="text-3xl font-bold font-orbitron text-primary">{t('admin.user.title')}</h1>
        <div className="flex w-full md:w-auto items-center gap-4">
           <input
             type="text"
             placeholder={t('admin.search.user')}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="px-4 py-2 bg-white/5 border border-white/10 rounded text-sm outline-none focus:border-primary text-white w-full md:w-64"
           />
           <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 bg-primary text-black font-bold tracking-widest rounded text-sm hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,245,255,0.4)] whitespace-nowrap">
             {t('admin.user.add')}
           </button>
        </div>
      </div>

      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
         <table className="w-full text-left table-auto">
           <thead className="bg-white/5 border-b border-white/10 text-xs text-muted-foreground font-orbitron tracking-widest">
             <tr>
               <th className="p-4">{t('admin.table.username')}</th>
               <th className="p-4">{t('admin.table.role')}</th>
               <th className="p-4">{t('admin.table.date')}</th>
               <th className="p-4 text-center">{t('admin.table.actions')}</th>
             </tr>
           </thead>
           <tbody>
             {filteredUsers.map(user => (
               <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                 <td className="p-4 text-sm font-semibold text-white">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded border border-white/10 bg-gradient-to-br from-black to-slate-800 flex flex-shrink-0 items-center justify-center text-white font-orbitron shadow-inner shrink-0 overflow-hidden">
                        {user.profile?.avatarUrl ? (
                          <img src={user.profile.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          user.username.charAt(0).toUpperCase()
                        )}
                     </div>
                     <span className="truncate max-w-[150px]">{user.username}</span>
                   </div>
                 </td>
                 <td className="p-4">
                   <span className={`text-xs px-2 py-1 rounded font-bold tracking-wider 
                      ${user.role === 'ADMIN' ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(0,245,255,0.2)]' : 
                        user.role === 'COMPANION' ? 'bg-accent/20 text-accent border border-accent/50 shadow-[0_0_10px_rgba(255,0,170,0.2)]' :
                        'bg-white/5 border border-white/10 text-muted-foreground'}`}>
                     {user.role}
                   </span>
                 </td>
                 <td className="p-4 text-sm text-muted-foreground tracking-wide whitespace-nowrap">
                   {new Date(user.createdAt).toLocaleDateString()}
                 </td>
                 <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button onClick={() => setEditingUser(user)} className="p-2 text-white/50 hover:text-white transition-colors"><Edit className="w-4 h-4"/></button>
                       <button onClick={() => handleDelete(user.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                 </td>
               </tr>
             ))}
             {filteredUsers.length === 0 && (
               <tr>
                 <td colSpan={4} className="p-8 text-center text-muted-foreground">No users found.</td>
               </tr>
             )}
           </tbody>
         </table>
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-background border border-white/10 rounded-xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,245,255,0.2)]">
             <button onClick={() => setIsCreateOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
             <h2 className="text-2xl font-bold font-orbitron text-white mb-6">{t('admin.user.new')}</h2>
             <form onSubmit={handleCreate} className="space-y-4">
               {error && <div className="p-2 bg-destructive/20 text-destructive text-sm rounded">{error}</div>}
               <div>
                  <label className="text-xs text-muted-foreground">{t('admin.table.username')}</label>
                  <input name="username" required className="w-full mt-1 bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-primary" />
               </div>
               <div>
                  <label className="text-xs text-muted-foreground">{t('admin.user.password')}</label>
                  <input name="password" type="password" required className="w-full mt-1 bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-primary" />
               </div>
               <div>
                  <label className="text-xs text-muted-foreground">{t('admin.table.role')}</label>
                  <select name="role" className="w-full mt-1 bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-primary">
                    <option value="USER" className="text-black">USER</option>
                    <option value="COMPANION" className="text-black">COMPANION</option>
                    <option value="ADMIN" className="text-black">ADMIN</option>
                  </select>
               </div>
               <button type="submit" disabled={loading} className="w-full mt-4 bg-primary text-black font-bold py-2 rounded tracking-widest">{loading ? "SAVING..." : "CREATE"}</button>
             </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-background border border-white/10 rounded-xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(255,0,170,0.2)]">
             <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
             <h2 className="text-2xl font-bold font-orbitron text-white mb-6">{t('admin.user.edit')}: {editingUser.username}</h2>
             <form onSubmit={handleUpdate} className="space-y-4">
               <input type="hidden" name="id" value={editingUser.id} />
               {error && <div className="p-2 bg-destructive/20 text-destructive text-sm rounded">{error}</div>}
               <div>
                  <label className="text-xs text-muted-foreground">NEW {t('admin.user.password')} (OPTIONAL)</label>
                  <input name="password" type="password" placeholder="Leave empty to keep current" className="w-full mt-1 bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-accent" />
               </div>
               <div>
                  <label className="text-xs text-muted-foreground">UPDATE {t('admin.table.role')}</label>
                  <select name="role" defaultValue={editingUser.role} className="w-full mt-1 bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-accent">
                    <option value="USER" className="text-black">USER</option>
                    <option value="COMPANION" className="text-black">COMPANION</option>
                    <option value="ADMIN" className="text-black">ADMIN</option>
                  </select>
               </div>
               <div className="border-t border-white/10 pt-4 mt-4">
                  <label className="text-xs text-accent font-bold">{t('admin.user.rate')}</label>
                  <p className="text-[10px] text-muted-foreground mb-1">Set rate. Requires COMPANION role to apply front-end effect.</p>
                  <input name="hourlyRate" type="number" defaultValue={editingUser.profile?.hourlyRate || 150} className="w-full mt-1 bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-accent" />
               </div>
               
               <button type="submit" disabled={loading} className="w-full mt-4 bg-accent text-white font-bold py-2 rounded tracking-widest shadow-[0_0_15px_rgba(255,0,170,0.4)]">{loading ? "SAVING..." : t('admin.user.update')}</button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
