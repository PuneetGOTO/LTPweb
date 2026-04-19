"use client"

import { useState } from "react"
import { createVideo, deleteVideo, updateVideo } from "@/server/actions/video"
import { useLanguage } from "@/contexts/LanguageContext"
import { Upload, Trash2, Eye, Edit, X } from "lucide-react"

export default function VideoManagerClient({ initialVideos }: { initialVideos: any[] }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingVideo, setEditingVideo] = useState<any>(null)

  const filteredVideos = initialVideos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await createVideo(formData)
      if (res?.error) setError(res.error)
      else {
        (e.target as HTMLFormElement).reset()
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await updateVideo(formData)
      if (res?.error) setError(res.error)
      else setEditingVideo(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this video?")) {
      await deleteVideo(id)
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-4 gap-4">
        <h1 className="text-3xl font-bold font-orbitron text-primary">{t('admin.video.title')}</h1>
        <div className="w-full md:w-64">
           <input
             type="text"
             placeholder={t('admin.search.video')}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-sm outline-none focus:border-primary text-white"
           />
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
         <h2 className="text-xl font-bold font-orbitron mb-4">{t('admin.video.upload')}</h2>
         <form onSubmit={handleUpload} className="space-y-4">
           {error && !editingVideo && <div className="text-destructive bg-destructive/20 p-3 rounded text-sm font-semibold border border-destructive/50">{error}</div>}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold text-muted-foreground ml-1">TITLE</label>
               <input name="title" required className="w-full bg-input/40 border border-white/10 focus:border-primary outline-none transition-all rounded-lg py-2 px-4 mt-1 text-white" />
             </div>
             <div>
               <label className="text-xs font-bold text-muted-foreground ml-1">EXTERNAL HLS URL (OR UPLOAD)</label>
               <input name="externalUrl" type="url" placeholder="https://..." className="w-full bg-input/40 border border-white/10 focus:border-primary outline-none transition-all rounded-lg py-2 px-4 mt-1 text-sm text-white" />
             </div>
             <div className="md:col-span-2">
               <label className="text-xs font-bold text-muted-foreground ml-1">DESCRIPTION</label>
               <textarea name="description" className="w-full bg-input/40 border border-white/10 focus:border-primary outline-none rounded-lg py-2 px-4 mt-1 h-20 text-white"></textarea>
             </div>
             <div className="md:col-span-2">
               <label className="text-xs font-bold text-muted-foreground ml-1 flex items-center gap-2">
                 UPLOAD VIDEO FILE 
                 <span className="text-accent text-[10px] bg-accent/10 px-2 py-0.5 rounded">Requires Cloudinary Keys</span>
               </label>
               <input name="file" type="file" accept="video/*" className="w-full bg-input/40 border border-white/10 focus:border-primary outline-none rounded-lg py-2 px-4 mt-1 text-sm text-muted-foreground file:bg-primary file:text-black file:border-0 file:cursor-pointer file:rounded file:px-4 file:py-1 file:mr-4 file:font-semibold" />
             </div>
           </div>
           <button disabled={loading} type="submit" className="flex items-center gap-2 bg-primary text-black font-bold py-2 px-6 rounded-lg hover:bg-primary/90 disabled:opacity-50 mt-4 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,245,255,0.4)]">
             <Upload className="w-4 h-4"/> {loading && !editingVideo ? t('btn.uploading') : t('btn.upload')}
           </button>
         </form>
      </div>

      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
         <table className="w-full text-left">
           <thead className="bg-white/5 border-b border-white/10 text-xs text-muted-foreground font-orbitron tracking-widest">
             <tr>
               <th className="p-4">{t('admin.video.list')}</th>
               <th className="p-4">UPLOADER</th>
               <th className="p-4">VIEWS</th>
               <th className="p-4 text-center">ACTIONS</th>
             </tr>
           </thead>
           <tbody>
             {filteredVideos.map(video => (
               <tr key={video.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                 <td className="p-4 text-sm font-semibold max-w-[200px] truncate text-white">{video.title}</td>
                 <td className="p-4 text-sm text-muted-foreground">{video.uploader?.username}</td>
                 <td className="p-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Eye className="w-3 h-3 text-primary"/> {video.viewsCount}</span></td>
                 <td className="p-4 text-center">
                   <div className="flex items-center justify-center gap-2">
                     <button onClick={() => setEditingVideo(video)} className="p-2 text-white/50 hover:text-white transition-colors" title={t('admin.video.edit')}>
                       <Edit className="w-4 h-4 mx-auto" />
                     </button>
                     <button onClick={() => handleDelete(video.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors" title="Delete Video">
                       <Trash2 className="w-4 h-4 mx-auto" />
                     </button>
                   </div>
                 </td>
               </tr>
             ))}
             {filteredVideos.length === 0 && (
               <tr>
                 <td colSpan={4} className="p-8 text-center text-muted-foreground font-semibold">No videos found. Upload one above!</td>
               </tr>
             )}
           </tbody>
         </table>
      </div>

      {/* EDIT MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-background border border-white/10 rounded-xl p-8 max-w-lg w-full relative shadow-[0_0_50px_rgba(255,0,170,0.2)]">
             <button onClick={() => setEditingVideo(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
             <h2 className="text-2xl font-bold font-orbitron text-white mb-6">{t('admin.video.edit')}: {editingVideo.title}</h2>
             <form onSubmit={handleUpdate} className="space-y-4">
               <input type="hidden" name="id" value={editingVideo.id} />
               {error && editingVideo && <div className="p-2 bg-destructive/20 text-destructive text-sm rounded">{error}</div>}
               <div>
                 <label className="text-xs font-bold text-muted-foreground">TITLE</label>
                 <input name="title" defaultValue={editingVideo.title} required className="w-full bg-input/40 border border-white/10 focus:border-accent outline-none rounded-lg py-2 px-4 mt-1 text-white" />
               </div>
               <div>
                 <label className="text-xs font-bold text-muted-foreground">EXTERNAL URL</label>
                 <input name="externalUrl" type="url" defaultValue={editingVideo.url} required className="w-full bg-input/40 border border-white/10 focus:border-accent outline-none rounded-lg py-2 px-4 mt-1 text-sm text-white" />
               </div>
               <div>
                 <label className="text-xs font-bold text-muted-foreground">DESCRIPTION</label>
                 <textarea name="description" defaultValue={editingVideo.description || ""} className="w-full bg-input/40 border border-white/10 focus:border-accent outline-none rounded-lg py-2 px-4 mt-1 h-20 text-white"></textarea>
               </div>
               
               <button type="submit" disabled={loading} className="w-full mt-4 bg-accent text-white font-bold py-2 rounded tracking-widest shadow-[0_0_15px_rgba(255,0,170,0.4)]">
                 {loading ? "SAVING..." : t('admin.video.update')}
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
