import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Loader2, Sparkles, HelpCircle, Play, RefreshCw, X, FileText, CheckCircle, XCircle, Clock, Target, BarChart2, Trash2 } from "lucide-react"
import { getQuiz, generateQuiz, submitQuizAttempt, getQuizAttempts, deleteQuiz } from "@/services/ai.api"
import { getMaterial, getMaterials } from "@/services/materials.api"
import type { Material, Quiz, QuizAttempt } from "@/types/firebase"

export default function QuizPage() {
  const { id } = useParams<{ id: string }>()
  
  const [material, setMaterial] = useState<Material | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  // General routes fallback state
  const [materialsList, setMaterialsList] = useState<Material[]>([])
  const [selectedMatId, setSelectedMatId] = useState<string>("")

  // Active Quiz State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [startTime, setStartTime] = useState<number>(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null)
  const [reviewMode, setReviewMode] = useState(false)

  useEffect(() => {
    if (id) {
      fetchData(id)
    } else {
      fetchMaterialsList()
    }
  }, [id])

  // Timer logic
  useEffect(() => {
    let interval: any
    if (isPlaying && !submitting && !reviewMode) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, submitting, reviewMode, startTime])

  // Restore session from localStorage
  useEffect(() => {
    if (quiz) {
      const saved = localStorage.getItem(`quiz_session_${quiz.quizId}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setAnswers(parsed.answers || {})
          setTimeElapsed(parsed.timeElapsed || 0)
          setCurrentIndex(parsed.currentIndex || 0)
          setStartTime(Date.now() - (parsed.timeElapsed || 0) * 1000)
          setIsPlaying(true)
        } catch (e) {
          console.error("Failed to restore quiz session", e)
        }
      }
    }
  }, [quiz])

  // Auto-save session to localStorage
  useEffect(() => {
    if (isPlaying && quiz && !reviewMode) {
      localStorage.setItem(`quiz_session_${quiz.quizId}`, JSON.stringify({
        answers,
        timeElapsed,
        currentIndex
      }))
    }
  }, [answers, timeElapsed, currentIndex, isPlaying, quiz, reviewMode])

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
    const [matRes, quizRes] = await Promise.all([
      getMaterial(matId),
      getQuiz(matId)
    ])
    
    if (matRes.success && matRes.data) {
      setMaterial(matRes.data)
      setError("")
    } else {
      setError("Material not found")
    }

    if (quizRes.success && quizRes.data) {
      setQuiz(quizRes.data)
      fetchAttempts(quizRes.data.quizId)
    } else {
      setQuiz(null)
      setAttempts([])
    }
    setLoading(false)
  }

  const fetchAttempts = async (quizId: string) => {
    const res = await getQuizAttempts(quizId)
    if (res.success && res.data) {
      setAttempts(res.data)
    }
  }

  const handleGenerate = async (force = false) => {
    const activeId = id || selectedMatId
    if (!activeId) return
    setGenerating(true)
    const res = await generateQuiz(activeId, force)
    if (res.success && res.data) {
      setQuiz(res.data)
      setAnswers({})
      setActiveAttempt(null)
      setReviewMode(false)
      fetchAttempts(res.data.quizId)
    } else {
      alert(res.error?.message || "Failed to generate quiz.")
    }
    setGenerating(false)
  }

  const startQuiz = () => {
    setAnswers({})
    setCurrentIndex(0)
    setStartTime(Date.now())
    setTimeElapsed(0)
    setIsPlaying(true)
    setActiveAttempt(null)
    setReviewMode(false)
  }

  const handleSubmit = async () => {
    if (!quiz || !window.confirm("Are you sure you want to submit your quiz?")) return
    setSubmitting(true)
    
    const res = await submitQuizAttempt(quiz.quizId, answers, timeElapsed)
    if (res.success && res.data) {
      setActiveAttempt(res.data)
      setReviewMode(true)
      fetchAttempts(quiz.quizId)
      
      // Clean up localstorage session
      localStorage.removeItem(`quiz_session_${quiz.quizId}`)
    } else {
      alert("Failed to submit quiz.")
    }
    setSubmitting(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // --- EXPORTS ---
  const handleExportCSV = () => {
    if (!activeAttempt || !quiz) return
    const headers = ["Question", "Your Answer", "Correct Answer", "Result", "Explanation"]
    const rows = quiz.questions.map(q => {
      const userAns = answers[q.id] || "No Answer"
      const res = activeAttempt.results.find(r => r.questionId === q.id)
      return [
        `"${q.question.replace(/"/g, '""')}"`,
        `"${userAns.replace(/"/g, '""')}"`,
        `"${q.correctAnswer.replace(/"/g, '""')}"`,
        res?.isCorrect ? "Correct" : "Incorrect",
        `"${q.explanation.replace(/"/g, '""')}"`
      ]
    })
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${material?.title || 'quiz'}_results.csv`
    link.click()
  }

  const handleExportMarkdown = () => {
    if (!activeAttempt || !quiz) return
    let md = `# Quiz Results: ${material?.title}\n`
    md += `**Score:** ${activeAttempt.score} / ${activeAttempt.totalQuestions} (${activeAttempt.percentage}%)\n`
    md += `**Time taken:** ${formatTime(activeAttempt.timeTaken)}\n\n`
    
    quiz.questions.forEach((q, idx) => {
      const userAns = answers[q.id] || "No Answer"
      const res = activeAttempt.results.find(r => r.questionId === q.id)
      md += `### Q${idx + 1}: ${q.question}\n`
      md += `- **Your Answer**: ${userAns} ${res?.isCorrect ? '✅' : '❌'}\n`
      md += `- **Correct Answer**: ${q.correctAnswer}\n`
      md += `- **Explanation**: ${q.explanation}\n\n`
    })

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${material?.title || 'quiz'}_results.md`
    link.click()
  }

  const handleExportJSON = () => {
    if (!activeAttempt) return
    const blob = new Blob([JSON.stringify(activeAttempt, null, 2)], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${material?.title || 'quiz'}_attempt.json`
    link.click()
  }

  const handleExportPDF = () => {
    if (!activeAttempt || !quiz) return
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
            <title>Quiz Results: ${material?.title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1f2937; }
              h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; font-size: 24px; }
              .stats { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 30px; font-size: 16px; }
              .question { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
              .q-text { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
              .ans { font-size: 15px; margin-bottom: 8px; }
              .correct { color: #10b981; font-weight: bold; }
              .wrong { color: #ef4444; font-weight: bold; }
              .expl { font-size: 14px; color: #4b5563; background: #f9fafb; padding: 10px; border-radius: 6px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <h1>Quiz Results: ${material?.title}</h1>
            <div class="stats">
              <strong>Score:</strong> ${activeAttempt.score} / ${activeAttempt.totalQuestions} (${activeAttempt.percentage}%)<br/>
              <strong>Time Taken:</strong> ${formatTime(activeAttempt.timeTaken)}
            </div>
            ${quiz.questions.map((q, i) => {
              const userAns = answers[q.id] || "No Answer"
              const res = activeAttempt.results.find(r => r.questionId === q.id)
              return `
                <div class="question">
                  <div class="q-text">Q${i+1}: ${q.question}</div>
                  <div class="ans">Your Answer: <span class="${res?.isCorrect ? 'correct' : 'wrong'}">${userAns}</span></div>
                  <div class="ans">Correct Answer: <span class="correct">${q.correctAnswer}</span></div>
                  <div class="expl"><strong>Explanation:</strong> ${q.explanation}</div>
                </div>
              `
            }).join('')}
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
        <HelpCircle className="h-16 w-16 text-primary mb-6 opacity-40" />
        <h3 className="text-2xl font-bold mb-3">No Materials Available</h3>
        <p className="text-muted-foreground mb-8">Please upload a document first before taking interactive quizzes.</p>
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

  // --- FULL SCREEN QUIZ PLAYER / REVIEW VIEW ---
  if (isPlaying && quiz && quiz.questions.length > 0) {
    const currentQ = quiz.questions[currentIndex]
    const qResult = activeAttempt?.results.find(r => r.questionId === currentQ.id)

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col md:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (reviewMode || window.confirm("Are you sure you want to exit? Your progress will be saved automatically.")) {
                    setIsPlaying(false)
                  }
                }} 
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="font-medium truncate max-w-[200px] md:max-w-md">{reviewMode ? "Quiz Review" : material.title}</div>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              {!reviewMode && (
                <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full animate-pulse">
                  <Clock className="h-4 w-4" />
                  {formatTime(timeElapsed)}
                </div>
              )}
            </div>
          </div>

          {/* Question Canvas */}
          <div className="flex-1 overflow-auto p-6 md:p-12 bg-muted/20">
            <div className="max-w-3xl mx-auto space-y-8">
              
              {reviewMode && qResult && (
                <div className={`p-4 rounded-xl border ${qResult.isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-700' : 'bg-red-500/10 border-red-500/30 text-red-700'} flex items-start gap-3`}>
                  {qResult.isCorrect ? <CheckCircle className="h-6 w-6 shrink-0 text-green-600" /> : <XCircle className="h-6 w-6 shrink-0 text-red-600" />}
                  <div>
                    <h4 className="font-bold">{qResult.isCorrect ? "Correct!" : "Incorrect"}</h4>
                    <p className="mt-1 opacity-90 text-sm leading-relaxed">{currentQ.explanation}</p>
                  </div>
                </div>
              )}

              <div className="bg-card border rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Question {currentIndex + 1} of {quiz.questions.length}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {currentQ.type}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold mb-8">{currentQ.question}</h2>

                {/* Options / Input */}
                {currentQ.options && currentQ.options.length > 0 ? (
                  <div className="space-y-3">
                    {currentQ.options.map((opt, i) => {
                      const isSelected = answers[currentQ.id] === opt
                      let optionClass = "border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary/50 text-left w-full "
                      
                      if (reviewMode) {
                        const isCorrectOpt = opt === currentQ.correctAnswer
                        if (isCorrectOpt) {
                          optionClass += "border-green-500 bg-green-500/10"
                        } else if (isSelected && !isCorrectOpt) {
                          optionClass += "border-red-500 bg-red-500/10"
                        } else {
                          optionClass += "border-muted opacity-50 cursor-default"
                        }
                      } else {
                        if (isSelected) {
                          optionClass += "border-primary bg-primary/5 font-semibold text-primary"
                        } else {
                          optionClass += "border-muted"
                        }
                      }

                      return (
                        <button 
                          key={i}
                          disabled={reviewMode}
                          onClick={() => setAnswers(prev => ({...prev, [currentQ.id]: opt}))}
                          className={optionClass}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected && !reviewMode ? 'border-primary' : (reviewMode && opt === currentQ.correctAnswer ? 'border-green-500' : 'border-muted-foreground/30')}`}>
                              {isSelected && !reviewMode && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                              {reviewMode && opt === currentQ.correctAnswer && <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />}
                            </div>
                            <span className="font-semibold text-sm md:text-base">{opt}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div>
                    <input 
                      type="text"
                      disabled={reviewMode}
                      placeholder="Type your answer here..."
                      value={answers[currentQ.id] || ""}
                      onChange={e => setAnswers(prev => ({...prev, [currentQ.id]: e.target.value}))}
                      className="w-full border-2 border-muted rounded-xl p-4 text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {reviewMode && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-xl border">
                        <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1">Correct Answer</span>
                        <span className="font-bold text-lg text-primary">{currentQ.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="h-20 border-t bg-card flex items-center justify-between px-6 shrink-0">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-2 bg-muted text-foreground hover:bg-accent rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
            >
              Previous
            </button>

            {!reviewMode && currentIndex === quiz.questions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors font-bold shadow-sm flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Quiz
              </button>
            ) : (
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                disabled={currentIndex === quiz.questions.length - 1}
                className="px-8 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-colors font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar - Palette */}
        <div className="w-full md:w-80 border-l bg-card flex flex-col h-64 md:h-full overflow-hidden shrink-0">
          <div className="p-4 border-b font-semibold bg-muted/30 text-sm">
            Question Palette
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const isAnswered = !!answers[q.id]
                const isActive = currentIndex === idx
                let btnClass = "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors border "
                
                if (reviewMode) {
                   const res = activeAttempt?.results.find(r => r.questionId === q.id)
                   if (res?.isCorrect) btnClass += "bg-green-100 text-green-700 border-green-200 "
                   else btnClass += "bg-red-100 text-red-700 border-red-200 "
                   if (isActive) btnClass += "ring-2 ring-offset-2 ring-primary border-primary"
                } else {
                  if (isActive) btnClass += "bg-primary text-primary-foreground border-primary"
                  else if (isAnswered) btnClass += "bg-primary/20 text-primary border-primary/30"
                  else btnClass += "bg-muted text-muted-foreground border-muted-foreground/20 hover:border-primary/50"
                }

                return (
                  <button key={q.id} onClick={() => setCurrentIndex(idx)} className={btnClass}>
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
          
          {reviewMode && activeAttempt && (
            <div className="p-6 bg-primary/5 border-t space-y-4">
              <h3 className="font-bold text-lg">Score: {activeAttempt.score} / {activeAttempt.totalQuestions}</h3>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div className="bg-primary h-3 rounded-full transition-all" style={{width: `${activeAttempt.percentage}%`}}></div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">{activeAttempt.percentage}% Accuracy</p>
              
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs text-muted-foreground font-bold uppercase">Export Attempt:</span>
                <div className="flex bg-card border rounded-md shadow-sm overflow-hidden w-full text-center">
                  <button onClick={handleExportPDF} className="flex-1 py-1.5 hover:bg-accent text-xs font-semibold border-r">PDF</button>
                  <button onClick={handleExportMarkdown} className="flex-1 py-1.5 hover:bg-accent text-xs font-semibold border-r">MD</button>
                  <button onClick={handleExportCSV} className="flex-1 py-1.5 hover:bg-accent text-xs font-semibold border-r">CSV</button>
                  <button onClick={handleExportJSON} className="flex-1 py-1.5 hover:bg-accent text-xs font-semibold">JSON</button>
                </div>
              </div>
            </div>
          )}
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
            <HelpCircle className="h-8 w-8 text-primary" /> Practice Quiz
          </h1>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" /> {material.title}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {quiz && quiz.questions.length > 0 && (
            <>
              <button 
                onClick={() => handleGenerate(true)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors border rounded-md bg-background" 
                title="Regenerate Quiz"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button 
                onClick={async () => {
                  const activeId = id || selectedMatId
                  if (!activeId || !window.confirm("Are you sure you want to clear this quiz and all attempts? This cannot be undone.")) return
                  await deleteQuiz(activeId)
                  setQuiz(null)
                  setAttempts([])
                  setActiveAttempt(null)
                  setReviewMode(false)
                  setIsPlaying(false)
                }}
                className="p-2 text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/30 rounded-md bg-background" 
                title="Clear Quiz & Attempts"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {generating ? (
        <div className="flex flex-col items-center justify-center p-24 border rounded-xl bg-card shadow-sm text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
          <h3 className="text-xl font-bold mb-2">Generating Adaptive Quiz...</h3>
          <p className="text-muted-foreground">Extracting material and structuring questions to test your knowledge.</p>
        </div>
      ) : !quiz || quiz.questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 border rounded-xl bg-card shadow-sm text-center">
          <Target className="h-16 w-16 text-primary mb-6 opacity-80" />
          <h3 className="text-2xl font-bold mb-3">Test Your Knowledge</h3>
          <p className="text-muted-foreground max-w-md mb-8">Generate an intelligent, mixed-mode quiz tailored specifically to this document.</p>
          <button 
            onClick={() => handleGenerate(false)}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full text-base font-medium hover:bg-primary/90 transition-colors shadow-md"
          >
            <Sparkles className="h-5 w-5" /> Generate Quiz
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 bg-gradient-to-r from-primary/10 to-transparent border-b">
                <div className="inline-flex text-xs font-bold uppercase tracking-wider text-primary bg-primary/20 px-3 py-1 rounded-full mb-4">
                  Mixed Mode • {quiz.questions.length} Questions
                </div>
                <h3 className="text-2xl font-bold mb-2">Ready to test your knowledge?</h3>
                <p className="text-muted-foreground mb-6">This quiz contains a mix of multiple choice, true/false, and short answer questions covering the core concepts of this document.</p>
                
                {localStorage.getItem(`quiz_session_${quiz.quizId}`) ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={startQuiz}
                      className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:bg-secondary/80 transition-all"
                    >
                      Start Fresh
                    </button>
                    <button 
                      onClick={() => {
                        const saved = localStorage.getItem(`quiz_session_${quiz.quizId}`)
                        if (saved) {
                          const parsed = JSON.parse(saved)
                          setAnswers(parsed.answers || {})
                          setTimeElapsed(parsed.timeElapsed || 0)
                          setCurrentIndex(parsed.currentIndex || 0)
                          setStartTime(Date.now() - (parsed.timeElapsed || 0) * 1000)
                          setIsPlaying(true)
                        }
                      }}
                      className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-full text-base font-bold hover:bg-primary/95 transition-all shadow-md"
                    >
                      <Play className="h-5 w-5" fill="currentColor" /> Resume Quiz
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={startQuiz}
                    className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground rounded-full text-base font-bold hover:bg-primary/95 transition-all shadow-md"
                  >
                    <Play className="h-5 w-5" fill="currentColor" /> Start Quiz Now
                  </button>
                )}
              </div>
              <div className="px-6 py-4 bg-muted/20 text-sm text-muted-foreground flex justify-between">
                <span>Model: {quiz.modelUsed}</span>
                <span>Generated: {new Date(quiz.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {attempts.length > 0 && (
              <div className="border rounded-xl p-6 bg-card shadow-sm">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><BarChart2 className="h-5 w-5 text-primary" /> Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Total Attempts</div>
                    <div className="text-2xl font-bold">{attempts.length}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Best Score</div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.max(...attempts.map(a => a.percentage))}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: History */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Attempt History</h3>
            
            {attempts.length === 0 ? (
              <div className="p-6 border rounded-xl bg-card text-center text-muted-foreground text-sm">
                No attempts yet. Take the quiz to see your history!
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(attempt => (
                  <div key={attempt.attemptId} className="p-4 border rounded-xl bg-card hover:border-primary/30 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{attempt.score} / {attempt.totalQuestions}</div>
                      <div className="text-xs text-muted-foreground">{new Date(attempt.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${attempt.percentage >= 80 ? 'text-green-600' : attempt.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {attempt.percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                        <Clock className="h-3 w-3" /> {formatTime(attempt.timeTaken)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
