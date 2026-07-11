import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FileText, ArrowLeft, Download, Trash2, Brain, Sparkles, HelpCircle, Loader2, RefreshCw, Copy, Check } from "lucide-react"
import { getMaterial, deleteMaterial } from "@/services/materials.api"
import { getSummary, generateSummary, type Summary } from "@/services/ai.api"
import type { Material } from "@/types/firebase"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [material, setMaterial] = useState<Material | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (id) {
      fetchMaterial(id)
      fetchSummary(id)
    }
  }, [id])

  const fetchMaterial = async (matId: string) => {
    const res = await getMaterial(matId)
    if (res.success && res.data) {
      setMaterial(res.data)
    } else {
      setError(res.error?.message || "Failed to load material")
    }
    setLoading(false)
  }

  const fetchSummary = async (matId: string) => {
    const res = await getSummary(matId)
    if (res.success && res.data) {
      setSummary(res.data)
    }
  }

  const handleGenerateSummary = async (force: boolean = false) => {
    if (!id) return
    setSummaryLoading(true)
    const res = await generateSummary(id, force)
    if (res.success && res.data) {
      setSummary(res.data)
    } else {
      alert(res.error?.message || "Failed to generate summary.")
    }
    setSummaryLoading(false)
  }

  const handleDelete = async () => {
    if (!material || !window.confirm("Are you sure you want to delete this material?")) return
    const res = await deleteMaterial(material.materialId)
    if (res.success) {
      navigate('/app/materials')
    }
  }

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (error || !material) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error || "Material not found"}</p>
        <Link to="/app/materials" className="text-primary hover:underline flex items-center gap-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Link to="/app/materials" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Materials
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-muted/50 rounded-xl border flex-shrink-0">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 break-all">{material.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="uppercase font-medium text-foreground bg-muted px-2 py-0.5 rounded">{material.fileType}</span>
              <span>{(((material as any).fileSize || 0) / (1024 * 1024)).toFixed(2)} MB</span>
              <span>Uploaded on {new Date(material.createdAt || 0).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <a 
            href={`http://localhost:5000${(material as any).downloadUrl}`} 
            download
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Download className="h-4 w-4" /> Download
          </a>
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 pt-4">
        {/* Left Column: AI Summary Rendering */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-xl bg-card overflow-hidden flex flex-col min-h-[600px] shadow-sm">
            <div className="border-b px-6 py-4 bg-muted/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI Summary</h3>
              </div>
              
              {summary && !summaryLoading && (
                <div className="flex items-center gap-2">
                   <button 
                    onClick={handleCopy}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    title="Copy Summary"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => handleGenerateSummary(true)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
                    title="Regenerate"
                  >
                    <RefreshCw className="h-4 w-4" /> Regenerate
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 lg:p-8 bg-background overflow-auto prose prose-sm md:prose-base dark:prose-invert max-w-none">
              {summaryLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="animate-pulse">Analyzing document and generating summary...</p>
                </div>
              ) : summary ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary.content}
                </ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 text-muted-foreground space-y-4">
                  <Sparkles className="h-12 w-12 opacity-30" />
                  <div className="max-w-md">
                    <h4 className="font-medium text-lg text-foreground mb-2">No Summary Generated</h4>
                    <p className="mb-6">Click below to extract text from this document and generate a structured AI summary.</p>
                    <button 
                      onClick={() => handleGenerateSummary(false)}
                      className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 mx-auto"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate Summary
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {summary && (
              <div className="border-t px-6 py-3 bg-muted/20 text-xs text-muted-foreground flex justify-between">
                <span>Model: {summary.modelUsed}</span>
                <span>Generated: {new Date(summary.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Other AI Features */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg mb-4">Study Tools</h3>
          
          <Link to={`/app/materials/${material.materialId}/flashcards`} className="block border rounded-xl p-5 bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Brain className="h-5 w-5" />
              </div>
              <h4 className="font-medium group-hover:text-primary transition-colors">Flashcards</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Interactive AI-generated flashcards for spaced repetition.</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1 w-max">
              Launch Player
            </span>
          </Link>

          <Link to={`/app/materials/${material.materialId}/quiz`} className="block border rounded-xl p-5 bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h4 className="font-medium group-hover:text-primary transition-colors">Practice Quiz</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Test your knowledge with an adaptive AI quiz.</p>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1 w-max">
              Take Quiz
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
