import { useState, useCallback, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Loader2, Type, FileText, Trash2 } from "lucide-react"
import { uploadMaterial, getMaterials, deleteMaterial } from "@/services/materials.api"
import type { Material } from "@/types/firebase"

interface QueueItem {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string | null
  textPreview?: string // for pasted text
  wordCount?: number  // for pasted text
}

export default function UploadPage() {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loadingMaterials, setLoadingMaterials] = useState(true)
  
  // Text Paste Mode state
  const [pasteTitle, setPasteTitle] = useState("")
  const [pasteContent, setPasteContent] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const fetchMaterials = async () => {
    setLoadingMaterials(true)
    const res = await getMaterials()
    if (res.success && res.data) {
      setMaterials(res.data)
    }
    setLoadingMaterials(false)
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx') && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      return "Unsupported file type. Please use PDF, DOCX, or TXT."
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File too large. Maximum size is 10MB."
    }
    return null
  }

  const addFilesToQueue = (files: FileList | File[]) => {
    const newItems: QueueItem[] = Array.from(files).map(file => {
      const error = validateFile(file)
      return {
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error
      }
    })
    setQueue(prev => [...prev, ...newItems])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files)
    }
  }

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pasteTitle.trim() || !pasteContent.trim()) return

    const blob = new Blob([pasteContent], { type: 'text/plain' })
    const sanitizedTitle = pasteTitle.trim().endsWith('.txt') ? pasteTitle.trim() : `${pasteTitle.trim()}.txt`
    const pastedFile = new File([blob], sanitizedTitle, { type: 'text/plain' })
    const words = pasteContent.trim().split(/\s+/).filter(Boolean).length

    const newItem: QueueItem = {
      id: Math.random().toString(36).substring(7),
      file: pastedFile,
      progress: 0,
      status: 'pending',
      textPreview: pasteContent.substring(0, 300),
      wordCount: words
    }

    setQueue(prev => [...prev, newItem])
    setPasteTitle("")
    setPasteContent("")
  }

  const removeFile = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }

  const handleUpload = async () => {
    const pendingItems = queue.filter(item => item.status === 'pending')
    
    for (const item of pendingItems) {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q))
      
      const res = await uploadMaterial(item.file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: percentCompleted } : q))
      })

      if (res.success) {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'success', progress: 100 } : q))
        fetchMaterials()
      } else {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', error: res.error?.message || 'Upload failed' } : q))
      }
    }
  }

  const allDone = queue.length > 0 && queue.every(q => q.status === 'success' || q.status === 'error')
  const hasPending = queue.some(q => q.status === 'pending')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Upload Study Material</h1>
        <p className="text-muted-foreground text-lg">
          Add your study notes, textbook chapters, or paste lectures directly to build smart study tools.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-muted p-1 rounded-xl w-fit">
        <button
          onClick={() => setUploadMode('file')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            uploadMode === 'file' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          File Upload
        </button>
        <button
          onClick={() => setUploadMode('text')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            uploadMode === 'text' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Type className="h-4 w-4" />
          Paste Text Notes
        </button>
      </div>

      {uploadMode === 'file' ? (
        <div 
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 bg-card hover:bg-muted/10 hover:border-primary/50"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-16 w-16 mx-auto text-muted-foreground mb-6 opacity-80" />
          <h3 className="text-xl font-medium mb-2">Drag & drop files here</h3>
          <p className="text-muted-foreground mb-6">Supports PDF, DOCX, TXT up to 10MB</p>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            multiple
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileSelect}
          />
          <button 
            type="button"
            className="px-6 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-colors"
          >
            Browse Files
          </button>
        </div>
      ) : (
        <form onSubmit={handlePasteSubmit} className="bg-card border rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="block text-sm font-semibold mb-1">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Biology Lesson 3 Lecture Notes"
              value={pasteTitle}
              onChange={e => setPasteTitle(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Direct Notes Content</label>
            <textarea
              required
              rows={8}
              placeholder="Paste or write your notes here..."
              value={pasteContent}
              onChange={e => setPasteContent(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/95 transition-all text-sm"
          >
            Add to Upload Queue
          </button>
        </form>
      )}

      {queue.length > 0 && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Upload Queue</h3>
            {hasPending && (
              <button 
                onClick={handleUpload}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:bg-primary/90 flex items-center gap-2 transition-colors"
              >
                <UploadCloud className="h-4 w-4" />
                Start Upload
              </button>
            )}
            {allDone && (
              <button 
                onClick={() => navigate('/app/materials')}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                Go to Library
              </button>
            )}
          </div>

          <div className="space-y-4">
            {queue.map(item => (
              <div key={item.id} className="border rounded-xl bg-background overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <FileIcon className="h-8 w-8 text-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate text-sm">{item.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.wordCount ? `${item.wordCount} words` : `${(item.file.size / (1024 * 1024)).toFixed(2)} MB`}
                      </span>
                    </div>
                    
                    {item.status === 'uploading' && (
                      <div className="w-full bg-secondary rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    )}
                    {item.status === 'error' && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{item.error}</p>}
                    {item.status === 'success' && <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3"/>Upload complete</p>}
                    {item.status === 'pending' && <p className="text-xs text-muted-foreground mt-1">Pending upload</p>}
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === 'uploading' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                    {item.status !== 'uploading' && item.status !== 'success' && (
                      <button aria-label="Remove file" onClick={() => removeFile(item.id)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Success Preview State */}
                {item.status === 'success' && (
                  <div className="bg-muted/30 border-t p-4 text-xs text-muted-foreground space-y-2">
                    <div className="font-semibold text-foreground">Content Preview & Metadata:</div>
                    <div className="bg-card p-3 rounded-lg border leading-relaxed max-h-24 overflow-y-auto">
                      {item.textPreview ? item.textPreview : `Binary Document uploaded. File size: ${(item.file.size / 1024).toFixed(1)} KB. Parsing triggers automatically upon dashboard access.`}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Materials List */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Your Uploaded Files</h2>
        {loadingMaterials ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-xl text-muted-foreground bg-card/50">
            No files uploaded yet. Upload a file above to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map(material => (
              <div key={material.materialId} className="flex flex-col p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      {material.type === 'text/plain' ? (
                        <Type className="h-6 w-6 text-primary" />
                      ) : (
                        <FileIcon className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate" title={material.title}>{material.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(material.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (!window.confirm("Delete this file? This will not delete generated summaries or quizzes.")) return;
                      await deleteMaterial(material.materialId)
                      fetchMaterials()
                    }}
                    className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                    title="Delete File"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded truncate mt-auto">
                  {material.originalFileName || 'Pasted Text'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
