import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, FileText, Grid, List as ListIcon, Loader2, RotateCcw, Trash, ShieldAlert } from "lucide-react"
import { getMaterials, deleteMaterial, restoreMaterial, purgeMaterial } from "@/services/materials.api"
import type { Material } from "@/types/firebase"

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [formatFilter, setFormatFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'library' | 'trash'>('library')

  useEffect(() => {
    fetchMaterials()
  }, [activeTab])

  const fetchMaterials = async () => {
    setLoading(true)
    const res = await getMaterials(activeTab === 'trash')
    if (res.success) {
      setMaterials(res.data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to move this study module to Trash?")) return
    const res = await deleteMaterial(id)
    if (res.success) {
      setMaterials(prev => prev.filter(m => m.materialId !== id))
    }
  }

  const handleRestore = async (id: string) => {
    const res = await restoreMaterial(id)
    if (res.success) {
      alert("Material restored successfully!")
      setMaterials(prev => prev.filter(m => m.materialId !== id))
    }
  }

  const handlePurge = async (id: string) => {
    if (!window.confirm("WARNING: This will permanently delete the file and all generated AI datasets (Summaries, Flashcards, Quizzes). This action CANNOT be undone. Proceed?")) return
    const res = await purgeMaterial(id)
    if (res.success) {
      setMaterials(prev => prev.filter(m => m.materialId !== id))
    }
  }

  const filteredMaterials = materials
    .filter(m => {
      // General text filter
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (m as any).subject?.toLowerCase().includes(searchQuery.toLowerCase())
      
      // File format filter
      const matchesFormat = formatFilter === 'all' || m.fileType === formatFilter
      
      return matchesSearch && matchesFormat
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      if (sortBy === 'size') return ((b as any).fileSize || 0) - ((a as any).fileSize || 0)
      return 0
    })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">Materials Library</h1>
          <p className="text-muted-foreground text-sm">Manage, filter, sort, and process your academic study assets.</p>
        </div>
        <Link to="/app/upload" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:bg-primary/95 whitespace-nowrap self-start sm:self-auto transition-all shadow-sm">
          Upload New Material
        </Link>
      </div>

      {/* Navigation Tab (Library vs Trash) */}
      <div className="flex border-b border-muted">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Library
        </button>
        <button
          onClick={() => setActiveTab('trash')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'trash' ? 'border-red-500 text-red-500' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trash className="h-4 w-4" />
          Trash (Soft Deleted)
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search titles, tags, topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Format Filter */}
          <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1.5 text-sm font-medium">
            <span className="text-xs text-muted-foreground font-semibold">Format:</span>
            <select
              value={formatFilter}
              onChange={e => setFormatFilter(e.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word (DOCX)</option>
              <option value="txt">Text (TXT)</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1.5 text-sm font-medium">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">Size (Largest)</option>
            </select>
          </div>
          
          {/* Layout switches */}
          <div className="flex items-center border rounded-md bg-background overflow-hidden">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-secondary text-secondary-foreground font-bold' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List Content Layout */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed rounded-2xl bg-card text-center shadow-sm">
          {activeTab === 'trash' ? (
            <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
          ) : (
            <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
          )}
          <h3 className="text-xl font-bold mb-1">No items match your criteria</h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            {activeTab === 'trash' ? "Your trash folder is empty." : "Try adjusting your query or upload your first textbook."}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMaterials.map(mat => (
            <div key={mat.materialId} className="group flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <Link to={activeTab === 'trash' ? '#' : `/app/materials/${mat.materialId}`} className="h-40 bg-muted/30 flex flex-col items-center justify-center border-b p-4 text-muted-foreground group-hover:bg-muted/50 transition-colors relative">
                 <FileText className="h-12 w-12 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                 <span className="uppercase text-xs font-bold bg-background px-2.5 py-1 rounded absolute bottom-4 left-4 border shadow-sm">
                   {mat.fileType}
                 </span>
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <Link to={activeTab === 'trash' ? '#' : `/app/materials/${mat.materialId}`} className={`font-bold hover:text-primary line-clamp-1 flex-1 pr-2 ${activeTab === 'trash' ? 'pointer-events-none cursor-default' : ''}`} title={mat.title}>
                    {mat.title}
                  </Link>
                </div>
                
                {activeTab === 'trash' ? (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button 
                      onClick={() => handleRestore(mat.materialId)}
                      className="flex-1 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Restore
                    </button>
                    <button 
                      onClick={() => handlePurge(mat.materialId)}
                      className="flex-1 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash className="h-3.5 w-3.5" /> Purge
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mt-auto flex justify-between items-center pt-4 border-t">
                    <span>{new Date(mat.createdAt || 0).toLocaleDateString()}</span>
                    <button onClick={() => handleDelete(mat.materialId)} className="text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Size</th>
                  <th className="px-6 py-4 font-semibold">Upload Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMaterials.map(mat => (
                  <tr key={mat.materialId} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      {activeTab === 'trash' ? (
                        <div className="font-semibold flex items-center gap-3 text-muted-foreground">
                          <FileText className="h-5 w-5" />
                          {mat.title}
                        </div>
                      ) : (
                        <Link to={`/app/materials/${mat.materialId}`} className="font-semibold flex items-center gap-3 hover:text-primary">
                          <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          {mat.title}
                        </Link>
                      )}
                    </td>
                    <td className="px-6 py-4 uppercase text-xs text-muted-foreground font-semibold">{mat.fileType}</td>
                    <td className="px-6 py-4 text-muted-foreground">{(((mat as any).fileSize || 0) / (1024 * 1024)).toFixed(2)} MB</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(mat.createdAt || 0).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {activeTab === 'trash' ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleRestore(mat.materialId)} className="text-sm text-green-500 font-bold hover:underline">Restore</button>
                          <button onClick={() => handlePurge(mat.materialId)} className="text-sm text-red-500 font-bold hover:underline">Purge</button>
                        </div>
                      ) : (
                        <button onClick={() => handleDelete(mat.materialId)} className="text-sm text-red-500 font-bold hover:underline">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
