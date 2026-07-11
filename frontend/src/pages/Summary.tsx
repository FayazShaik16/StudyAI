import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Sparkles, Loader2, Copy, Check, RefreshCw, FileText, Download, Trash2 } from "lucide-react"
import { getSummary, generateSummary, deleteSummary, type Summary } from "@/services/ai.api"
import { getMaterial, getMaterials } from "@/services/materials.api"
import type { Material } from "@/types/firebase"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function SummaryPage() {
  const { id } = useParams<{ id: string }>()
  
  const [material, setMaterial] = useState<Material | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  // General routes fallback state
  const [materialsList, setMaterialsList] = useState<Material[]>([])
  const [selectedMatId, setSelectedMatId] = useState<string>("")

  // Version Select State
  const [selectedVersionIdx, setSelectedVersionIdx] = useState<number | null>(null)

  useEffect(() => {
    if (id) {
      fetchData(id)
    } else {
      fetchMaterialsList()
    }
  }, [id])

  const fetchMaterialsList = async () => {
    setLoading(true)
    const res = await getMaterials()
    if (res.success && res.data) {
      setMaterialsList(res.data)
      if (res.data.length > 0) {
        setSelectedMatId(res.data[0].materialId)
        fetchData(res.data[0].materialId)
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }

  const handleMaterialChange = (newId: string) => {
    setSelectedMatId(newId)
    fetchData(newId)
  }

  const fetchData = async (matId: string) => {
    setLoading(true)
    const [matRes, sumRes] = await Promise.all([
      getMaterial(matId),
      getSummary(matId)
    ])
    
    if (matRes.success && matRes.data) {
      setMaterial(matRes.data)
      setError("")
    } else {
      setError("Material not found")
    }

    if (sumRes.success && sumRes.data) {
      setSummary(sumRes.data)
      setSelectedVersionIdx(null) // reset to current/active
    } else {
      setSummary(null)
    }
    
    setLoading(false)
  }

  const handleGenerate = async (force: boolean = false) => {
    const activeId = id || selectedMatId
    if (!activeId) return
    setGenerating(true)
    const res = await generateSummary(activeId, force)
    if (res.success && res.data) {
      setSummary(res.data)
      setSelectedVersionIdx(null) // reset version view on new generation
    } else {
      alert(res.error?.message || "Failed to generate summary.")
    }
    setGenerating(false)
  }

  const handleCopy = () => {
    const textToCopy = getActiveContent()
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getActiveContent = () => {
    if (!summary) return ""
    if (selectedVersionIdx !== null && summary.versions && summary.versions[selectedVersionIdx]) {
      return summary.versions[selectedVersionIdx].content
    }
    return summary.content
  }

  const getActiveMetadata = () => {
    if (!summary) return null
    if (selectedVersionIdx !== null && summary.versions && summary.versions[selectedVersionIdx]) {
      return {
        modelUsed: summary.versions[selectedVersionIdx].modelUsed,
        updatedAt: summary.versions[selectedVersionIdx].updatedAt
      }
    }
    return {
      modelUsed: summary.modelUsed,
      updatedAt: summary.updatedAt
    }
  }

  const handleDownloadMarkdown = () => {
    const text = getActiveContent()
    if (!text) return
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${material?.title || 'summary'}_summary.md`
    link.click()
  }

  const handleDownloadJSON = () => {
    if (!summary) return
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${material?.title || 'summary'}_summary_metadata.json`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!id && materialsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 border border-dashed rounded-2xl bg-card text-center shadow-sm max-w-xl mx-auto my-12">
        <FileText className="h-16 w-16 text-primary mb-6 opacity-40" />
        <h3 className="text-2xl font-bold mb-3">No Materials Available</h3>
        <p className="text-muted-foreground mb-8">Please upload a document (PDF, DOCX, TXT) first before generating AI summaries.</p>
        <Link to="/app/upload" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/95 transition-all shadow-sm">
          Upload Material
        </Link>
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error || "Material not found"}</p>
        <Link to="/app/materials" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Materials
        </Link>
      </div>
    )
  }

  const currentContent = getActiveContent()
  const currentMeta = getActiveMetadata()

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {id ? (
        <Link to={`/app/materials/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Material
        </Link>
      ) : (
        <div className="bg-card border p-4 rounded-xl shadow-sm flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">Study Material:</span>
          <select
            value={selectedMatId}
            onChange={e => handleMaterialChange(e.target.value)}
            className="bg-transparent border-0 font-semibold text-sm focus:outline-none focus:ring-0 flex-1 cursor-pointer"
          >
            {materialsList.map(m => (
              <option key={m.materialId} value={m.materialId}>{m.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" /> Document Summary
          </h1>
          <p className="text-muted-foreground text-lg flex items-center gap-2 mt-1">
            <FileText className="h-5 w-5" /> {material.title}
          </p>
        </div>

        {summary && !generating && (
          <div className="flex flex-wrap gap-2">
            {/* Version dropdown */}
            {summary.versions && summary.versions.length > 0 && (
              <div className="flex items-center bg-card border rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm">
                <span className="text-xs text-muted-foreground mr-2 font-bold uppercase">Version:</span>
                <select
                  value={selectedVersionIdx === null ? "current" : selectedVersionIdx}
                  onChange={e => {
                    const val = e.target.value
                    setSelectedVersionIdx(val === "current" ? null : parseInt(val))
                  }}
                  className="bg-transparent focus:outline-none"
                >
                  <option value="current">Current Summary</option>
                  {summary.versions.map((ver, idx) => (
                    <option key={idx} value={idx}>
                      Version {idx + 1} ({new Date(ver.updatedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold hover:bg-secondary/80 transition-all active:scale-95 shadow-sm"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>

            <button 
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold hover:bg-secondary/80 transition-all active:scale-95 shadow-sm"
              title="Download Markdown"
            >
              <Download className="h-4 w-4" /> Markdown
            </button>

            <button 
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold hover:bg-secondary/80 transition-all active:scale-95 shadow-sm"
              title="Download JSON Metadata"
            >
              <Download className="h-4 w-4" /> JSON
            </button>

            <button 
              onClick={() => handleGenerate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/95 transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw className="h-4 w-4" /> Regenerate
            </button>

            <button 
              onClick={async () => {
                const activeId = id || selectedMatId
                if (!activeId || !window.confirm("Are you sure you want to clear this summary? This cannot be undone.")) return
                await deleteSummary(activeId)
                setSummary(null)
                setSelectedVersionIdx(null)
              }}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-md text-xs font-semibold hover:bg-red-500/20 transition-all active:scale-95"
            >
              <Trash2 className="h-4 w-4" /> Clear
            </button>
          </div>
        )}
      </div>

      {generating ? (
        <div className="flex flex-col items-center justify-center p-24 border rounded-2xl bg-card shadow-sm text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
          <h3 className="text-xl font-bold mb-2">Analyzing material...</h3>
          <p className="text-muted-foreground">Extracting concepts, formatting headers, definitions, lists, and inline code details. Please hold on.</p>
        </div>
      ) : !summary ? (
        <div className="flex flex-col items-center justify-center p-24 border rounded-2xl bg-card shadow-sm text-center">
          <Sparkles className="h-16 w-16 text-primary mb-6 opacity-80" />
          <h3 className="text-2xl font-extrabold mb-3">No AI Summary Generated</h3>
          <p className="text-muted-foreground max-w-md mb-8">Generate a structured summary containing clear sections, bold definitions, bullet points, and inline code formatting.</p>
          <button 
            onClick={() => handleGenerate(false)}
            className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-full text-base font-semibold hover:bg-primary/90 transition-colors shadow-md"
          >
            <Sparkles className="h-5 w-5" /> Generate Summary
          </button>
        </div>
      ) : (
        <div className="border rounded-2xl bg-card overflow-hidden shadow-md">
          <div className="p-6 md:p-10 bg-background overflow-auto prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentContent}
            </ReactMarkdown>
          </div>
          {currentMeta && (
            <div className="border-t px-6 py-4 bg-muted/20 text-xs text-muted-foreground flex justify-between">
              <span>Model: {currentMeta.modelUsed}</span>
              <span>Generated: {new Date(currentMeta.updatedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
