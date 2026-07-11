import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Loader2, Sparkles, Brain, Play, RefreshCw, X, FileText, Filter, Search, RotateCcw, Shuffle, Trash2 } from "lucide-react"
import { getFlashcards, generateFlashcards, updateFlashcardProgress, deleteFlashcards } from "@/services/ai.api"
import { getMaterial, getMaterials } from "@/services/materials.api"
import type { Material, FlashcardDeck } from "@/types/firebase"

export default function FlashcardsPage() {
  const { id } = useParams<{ id: string }>()
  
  const [material, setMaterial] = useState<Material | null>(null)
  const [deck, setDeck] = useState<FlashcardDeck | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  // General routes fallback state
  const [materialsList, setMaterialsList] = useState<Material[]>([])
  const [selectedMatId, setSelectedMatId] = useState<string>("")

  // Selector Count
  const [selectedCount, setSelectedCount] = useState<number>(10)

  // Player State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  
  // Custom Shuffle deck state
  const [playerDeck, setPlayerDeck] = useState<any[]>([])

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
    const [matRes, deckRes] = await Promise.all([
      getMaterial(matId),
      getFlashcards(matId)
    ])
    
    if (matRes.success && matRes.data) {
      setMaterial(matRes.data)
      setError("")
    } else {
      setError("Material not found")
    }

    if (deckRes.success && deckRes.data) {
      setDeck(deckRes.data)
      setPlayerDeck(deckRes.data.cards || [])
    } else {
      setDeck(null)
      setPlayerDeck([])
    }
    
    setLoading(false)
  }

  const handleGenerate = async (force = false) => {
    const activeId = id || selectedMatId
    if (!activeId) return
    setGenerating(true)
    const res = await generateFlashcards(activeId, force, selectedCount)
    if (res.success && res.data) {
      setDeck(res.data)
      setPlayerDeck(res.data.cards || [])
      setIsPlaying(false)
      setCurrentIndex(0)
    } else {
      alert(res.error?.message || "Failed to generate flashcards.")
    }
    setGenerating(false)
  }

  const filteredCards = (isPlaying ? playerDeck : (deck?.cards || [])).filter(c => {
    if (!isPlaying && filterStatus !== "All" && c.status !== filterStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q) || c.keywords.some((k: string) => k.toLowerCase().includes(q))
    }
    return true
  })

  const currentCard = filteredCards[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredCards.length)
    }, 150)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + filteredCards.length) % filteredCards.length)
    }, 150)
  }

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isPlaying || filteredCards.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (e.code === "Space" || key === " ") {
        e.preventDefault()
        setIsFlipped(prev => !prev)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        handlePrev()
      } else if (key === "1" || key === "h") {
        e.preventDefault()
        handleUpdateProgress("Needs Revision")
      } else if (key === "2" || key === "e" || key === "g") {
        e.preventDefault()
        handleUpdateProgress("Known")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, currentIndex, filteredCards, isFlipped])

  const handleShuffle = () => {
    const shuffled = [...playerDeck].sort(() => Math.random() - 0.5)
    setPlayerDeck(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleRestart = () => {
    if (deck) {
      setPlayerDeck(deck.cards || [])
    }
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleUpdateProgress = async (status: string) => {
    if (!deck || !currentCard) return
    
    // Optimistic update for both main deck and player deck
    const updatedCards = deck.cards.map(c => c.id === currentCard.id ? { ...c, status } : c)
    setDeck({ ...deck, cards: updatedCards })
    setPlayerDeck(prev => prev.map(c => c.id === currentCard.id ? { ...c, status } : c))
    
    await updateFlashcardProgress(deck.deckId, currentCard.id, status)
    
    if (currentIndex === filteredCards.length - 1) {
      alert("Deck session complete! You've reviewed all cards.")
      setIsPlaying(false)
    } else {
      handleNext()
    }
  }

  const handleExportCSV = () => {
    if (!deck) return
    const headers = ["Question", "Answer", "Explanation", "Difficulty", "Topic"]
    const rows = deck.cards.map(c => [
      `"${c.question.replace(/"/g, '""')}"`,
      `"${c.answer.replace(/"/g, '""')}"`,
      `"${c.explanation.replace(/"/g, '""')}"`,
      c.difficulty,
      c.topic
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${material?.title}_flashcards.csv`
    a.click()
  }

  const handleExportMarkdown = () => {
    if (!deck) return
    let text = `# Flashcards for ${material?.title}\n\n`
    deck.cards.forEach((c, idx) => {
      text += `### Card ${idx + 1}: ${c.question}\n- **Answer**: ${c.answer}\n- **Explanation**: ${c.explanation}\n- **Topic**: ${c.topic}\n\n`
    })
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${material?.title}_flashcards.md`
    a.click()
  }

  const handleExportJSON = () => {
    if (!deck) return
    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${material?.title}_flashcards.json`
    a.click()
  }

  const handleExportPDF = () => {
    if (!deck) return
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)
    
    const doc = iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(`
        <html>
          <head>
            <title>Flashcards: ${material?.title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1f2937; }
              h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; font-size: 24px; }
              .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
              .q { font-weight: bold; font-size: 18px; margin-bottom: 10px; color: #1e3a8a; }
              .a { margin-bottom: 8px; font-size: 16px; }
              .meta { font-size: 12px; color: #6b7280; margin-top: 10px; border-top: 1px dashed #e5e7eb; padding-top: 8px; }
            </style>
          </head>
          <body>
            <h1>Flashcards: ${material?.title}</h1>
            ${deck.cards.map((c, i) => `
              <div class="card">
                <div class="q">Q${i+1}: ${c.question}</div>
                <div class="a"><strong>Answer:</strong> ${c.answer}</div>
                <div class="a"><strong>Explanation:</strong> ${c.explanation}</div>
                <div class="meta">Topic: ${c.topic} | Difficulty: ${c.difficulty}</div>
              </div>
            `).join('')}
          </body>
        </html>
      `)
      doc.close()
      
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        document.body.removeChild(iframe)
      }, 500)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
  
  if (!id && materialsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 border border-dashed rounded-2xl bg-card text-center shadow-sm max-w-xl mx-auto my-12">
        <Brain className="h-16 w-16 text-primary mb-6 opacity-40" />
        <h3 className="text-2xl font-bold mb-3">No Materials Available</h3>
        <p className="text-muted-foreground mb-8">Please upload a document first before generating interactive flashcards.</p>
        <Link to="/app/upload" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/95 transition-all shadow-sm">
          Upload Material
        </Link>
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error || "Material not found"}</p>
        <Link to="/app/materials" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Library
        </Link>
      </div>
    )
  }

  // --- FULL SCREEN PLAYER VIEW ---
  if (isPlaying && deck && filteredCards.length > 0) {
    const progressPercent = Math.round(((currentIndex + 1) / filteredCards.length) * 100)

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Player Header */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsPlaying(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="font-medium truncate max-w-[200px] md:max-w-md">{material.title}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleShuffle} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md hover:bg-secondary/80 transition-colors">
              <Shuffle className="h-3.5 w-3.5" /> Shuffle
            </button>
            <button onClick={handleRestart} className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md hover:bg-secondary/80 transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="bg-muted px-3 py-1 rounded-full text-muted-foreground">
              {currentIndex + 1} / {filteredCards.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted h-1 shrink-0">
          <div className="bg-primary h-1 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
        </div>

        {/* Player Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/20 relative overflow-hidden">
          
          <div 
            className="w-full max-w-3xl aspect-video md:aspect-[3/2] cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div 
              className="relative w-full h-full transition-transform duration-500 rounded-3xl"
              style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }}
            >
              {/* Front side (Question) */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden bg-card border-2 shadow-xl flex flex-col justify-center items-center p-8 md:p-12 text-center rounded-3xl"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute top-6 left-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full flex gap-2 items-center">
                  <Brain className="h-4 w-4"/> {currentCard.topic}
                </div>
                <div className="absolute top-6 right-6 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {currentCard.cardType}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold leading-tight mt-6">{currentCard.question}</h2>
                <div className="absolute bottom-6 text-sm text-muted-foreground opacity-50 flex items-center gap-2">
                  <RotateCcw className="h-4 w-4"/> Click to flip
                </div>
              </div>

              {/* Back side (Answer) */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden bg-primary text-primary-foreground border-2 border-primary shadow-xl flex flex-col p-8 md:p-12 text-center overflow-auto rounded-3xl"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
              >
                <h3 className="text-xl md:text-3xl font-bold mb-6 mt-8">{currentCard.answer}</h3>
                <div className="bg-primary-foreground/10 p-6 rounded-xl text-left mt-auto">
                  <p className="text-sm md:text-base leading-relaxed opacity-90">{currentCard.explanation}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentCard.keywords.map((k: string, i: number) => (
                      <span key={i} className="text-xs bg-primary-foreground/25 px-2 py-1 rounded">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Controls (Bottom Bar) */}
        <div className="h-24 border-t bg-card flex items-center justify-center gap-4 px-6 shrink-0">
          <button onClick={handlePrev} className="p-3 bg-muted hover:bg-accent rounded-full transition-colors mr-auto">
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleUpdateProgress("Needs Revision") }} 
            className="px-6 py-3 bg-red-100 text-red-700 hover:bg-red-200 font-semibold rounded-full transition-colors"
          >
            Hard (Review) [1]
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleUpdateProgress("Known") }} 
            className="px-6 py-3 bg-green-100 text-green-700 hover:bg-green-200 font-semibold rounded-full transition-colors"
          >
            Easy (Got it) [2]
          </button>

          <button onClick={handleNext} className="p-3 bg-muted hover:bg-accent rounded-full transition-colors ml-auto transform rotate-180">
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      </div>
    )
  }

  // --- DASHBOARD VIEW (List / Manage) ---
  return (
    <div className="max-w-7xl mx-auto space-y-6">
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

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" /> Flashcards
          </h1>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" /> {material.title}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {deck && deck.cards.length > 0 && (
            <div className="flex bg-card border rounded-md shadow-sm overflow-hidden">
              <span className="px-3 py-2 bg-muted text-muted-foreground text-xs font-semibold uppercase flex items-center border-r">Export:</span>
              <button 
                onClick={handleExportPDF}
                className="px-3 py-2 hover:bg-accent text-xs font-semibold transition-colors border-r"
              >
                PDF
              </button>
              <button 
                onClick={handleExportMarkdown}
                className="px-3 py-2 hover:bg-accent text-xs font-semibold transition-colors border-r"
              >
                Markdown
              </button>
              <button 
                onClick={handleExportCSV}
                className="px-3 py-2 hover:bg-accent text-xs font-semibold transition-colors border-r"
              >
                CSV
              </button>
              <button 
                onClick={handleExportJSON}
                className="px-3 py-2 hover:bg-accent text-xs font-semibold transition-colors"
              >
                JSON
              </button>
            </div>
          )}

          {deck && deck.cards.length > 0 && (
            <button 
              onClick={() => setIsPlaying(true)}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Start Review
            </button>
          )}
        </div>
      </div>

      {generating ? (
        <div className="flex flex-col items-center justify-center p-24 border rounded-xl bg-card shadow-sm text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
          <h3 className="text-xl font-bold mb-2">Analyzing material...</h3>
          <p className="text-muted-foreground">Extracting key concepts, formulas, and definitions to generate your flashcards. This may take up to a minute.</p>
        </div>
      ) : !deck || deck.cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 border rounded-xl bg-card shadow-sm text-center">
          <Sparkles className="h-16 w-16 text-primary mb-6 opacity-80" />
          <h3 className="text-2xl font-bold mb-3">No Flashcards Yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">Generate intelligent flashcards instantly. Select your preferred card count first.</p>
          
          <div className="flex items-center gap-3 justify-center mb-8">
            <span className="text-sm font-semibold text-muted-foreground">Card Count:</span>
            <select 
              value={selectedCount}
              onChange={e => setSelectedCount(parseInt(e.target.value))}
              className="bg-card border rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={5}>5 Cards</option>
              <option value={10}>10 Cards</option>
              <option value={15}>15 Cards</option>
              <option value={20}>20 Cards</option>
            </select>
          </div>

          <button 
            onClick={() => handleGenerate(false)}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full text-base font-semibold hover:bg-primary/90 transition-colors shadow-md"
          >
            <Sparkles className="h-5 w-5" /> Generate Now
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between bg-card p-4 rounded-xl border shadow-sm">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search questions or answers..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none"
                  >
                    <option value="All">All Cards ({deck.cards.length})</option>
                    <option value="Not Reviewed">Not Reviewed</option>
                    <option value="Known">Got it</option>
                    <option value="Needs Revision">Hard</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-background">
                  <span className="text-xs font-semibold text-muted-foreground">Count:</span>
                  <select 
                    value={selectedCount}
                    onChange={e => setSelectedCount(parseInt(e.target.value))}
                    className="bg-transparent text-xs focus:outline-none font-semibold"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>

                <button onClick={() => handleGenerate(true)} className="p-2 text-muted-foreground hover:text-primary transition-colors border rounded-md bg-background" title="Regenerate All">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button 
                  onClick={async () => {
                    const activeId = id || selectedMatId
                    if (!activeId || !window.confirm("Are you sure you want to clear all flashcards? This cannot be undone.")) return
                    await deleteFlashcards(activeId)
                    setDeck(null)
                  }}
                  className="p-2 text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/30 rounded-md bg-background" title="Clear All Flashcards"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCards.map((card) => (
              <div key={card.id} className="border rounded-xl bg-card p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4 gap-2">
                   <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-2 py-1 rounded">
                     {card.cardType}
                   </span>
                   {card.status !== "Not Reviewed" && (
                     <span className={`text-xs font-semibold px-2 py-1 rounded ${card.status === 'Known' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {card.status === 'Known' ? 'Easy' : 'Hard'}
                     </span>
                   )}
                </div>
                <h4 className="font-bold text-lg mb-2">{card.question}</h4>
                <p className="text-muted-foreground mb-4 line-clamp-3">{card.answer}</p>
                <div className="mt-auto pt-4 border-t flex flex-wrap gap-2 text-xs text-muted-foreground">
                   {card.keywords.slice(0,3).map((k: string) => (
                     <span key={k} className="bg-muted px-2 py-1 rounded-sm">{k}</span>
                   ))}
                </div>
              </div>
            ))}
            {filteredCards.length === 0 && (
              <div className="col-span-full p-12 text-center text-muted-foreground">
                No flashcards match your current filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
