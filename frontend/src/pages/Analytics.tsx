import { useState, useEffect } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { Loader2, TrendingUp, Clock, CheckCircle2, Target, Sparkles, Brain, Plus, X, Award, Zap } from "lucide-react"
import { getDashboardData, getGoals, createGoal, type AnalyticsDashboard, type Goal } from "@/services/analytics.api"

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: "", target: 100, type: "Hours" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [dashRes, goalsRes] = await Promise.all([
      getDashboardData(),
      getGoals()
    ])
    if (dashRes.success && dashRes.data) setDashboard(dashRes.data)
    if (goalsRes.success && goalsRes.data) setGoals(goalsRes.data)
    setLoading(false)
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await createGoal(newGoal)
    if (res.success && res.data) {
      setGoals([...goals, res.data])
      setShowGoalForm(false)
      setNewGoal({ title: "", target: 100, type: "Hours" })
    }
  }

  // --- EXPORTS ---
  const handleExportCSV = () => {
    if (!dashboard) return
    const csvContent = [
      ["Metric", "Value"],
      ["Total Study Hours", dashboard.totalStudyHours],
      ["Average Quiz Score", `${dashboard.averageQuizScore}%`],
      ["Flashcard Mastery", `${dashboard.flashcardMastery}%`],
      ["Completed Tasks", dashboard.completedTasks],
      ["AI Insight", dashboard.aiInsight]
    ].map(e => e.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `study_analytics_report.csv`
    link.click()
  }

  const handleExportMarkdown = () => {
    if (!dashboard) return
    const md = `# StudyAI Performance Analytics Report
Generated on: ${new Date().toLocaleDateString()}

## Core Metrics
- **Total Study Time:** ${dashboard.totalStudyHours} hours
- **Quiz Performance:** ${dashboard.averageQuizScore}% average
- **Retention / Mastery:** ${dashboard.flashcardMastery}% flashcards mastered
- **Task Consistency:** ${dashboard.completedTasks} completed items

## AI Assessment & Recommendation
> ${dashboard.aiInsight}

## Subject Areas Strength Profile
- Mathematics: 85%
- Science: 92%
- Literature: 68%
- History: 78%
- Engineering: 90%
`
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `study_analytics_report.md`
    link.click()
  }

  const handleExportJSON = () => {
    if (!dashboard) return
    const blob = new Blob([JSON.stringify({ dashboard, goals }, null, 2)], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `study_analytics_report.json`
    link.click()
  }

  const handleExportPDF = () => {
    if (!dashboard) return
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
            <title>StudyAI Performance Analytics Report</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1f2937; }
              h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; font-size: 24px; }
              .stat-box { display: inline-block; width: 45%; margin-right: 4%; margin-bottom: 20px; background: #f3f4f6; padding: 15px; border-radius: 8px; }
              .stat-val { font-size: 24px; font-weight: bold; color: #3b82f6; margin-top: 5px; }
              .insight { border-left: 4px solid #3b82f6; background: #f0f9ff; padding: 15px; border-radius: 4px; margin-top: 20px; font-style: italic; }
            </style>
          </head>
          <body>
            <h1>Performance Analytics Report</h1>
            <div style="margin-top: 20px;">
              <div class="stat-box">
                <div>Total Study Time</div>
                <div class="stat-val">${dashboard.totalStudyHours} Hours</div>
              </div>
              <div class="stat-box">
                <div>Quiz Accuracy</div>
                <div class="stat-val">${dashboard.averageQuizScore}%</div>
              </div>
              <div class="stat-box">
                <div>Retention Mastery</div>
                <div class="stat-val">${dashboard.flashcardMastery}%</div>
              </div>
              <div class="stat-box">
                <div>Consistency Completed Tasks</div>
                <div class="stat-val">${dashboard.completedTasks} Tasks</div>
              </div>
            </div>
            <h2>AI Learning Insight</h2>
            <div class="insight">"${dashboard.aiInsight}"</div>
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

  if (loading) {
    return <div className="flex h-[calc(100vh-100px)] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
  }

  if (!dashboard) {
    return <div className="p-8 text-center text-red-500">Failed to load analytics data.</div>
  }

  const chartData = dashboard.chartData.length > 0 ? dashboard.chartData : [
    { name: "Start", score: 0 }
  ]

  // Subject areas strengths radar metrics
  const radarData = [
    { subject: 'Mathematics', score: 85, fullMark: 100 },
    { subject: 'Science', score: 92, fullMark: 100 },
    { subject: 'Literature', score: 68, fullMark: 100 },
    { subject: 'History', score: 78, fullMark: 100 },
    { subject: 'Engineering', score: 90, fullMark: 100 },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Learning Analytics</h1>
          <p className="text-muted-foreground text-sm">Visualize strengths, track milestone trends, and download performance evaluations.</p>
        </div>
        
        <div className="flex bg-card border rounded-md shadow-sm overflow-hidden shrink-0">
          <span className="px-3 py-2 bg-muted text-muted-foreground text-xs font-semibold uppercase flex items-center border-r">Export:</span>
          <button onClick={handleExportPDF} className="px-3 py-2 hover:bg-accent text-xs font-semibold border-r">PDF</button>
          <button onClick={handleExportMarkdown} className="px-3 py-2 hover:bg-accent text-xs font-semibold border-r">Markdown</button>
          <button onClick={handleExportCSV} className="px-3 py-2 hover:bg-accent text-xs font-semibold border-r">CSV</button>
          <button onClick={handleExportJSON} className="px-3 py-2 hover:bg-accent text-xs font-semibold">JSON</button>
        </div>
      </div>

      {/* Enhancements: Streaks & Velocity cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-orange-100 text-orange-700 rounded-2xl"><Zap className="h-6 w-6 animate-pulse" /></div>
          <div>
            <div className="text-2xl font-black">5 Days Streak</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Daily consistency streak</div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-green-100 text-green-700 rounded-2xl"><TrendingUp className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">2.4x Velocity</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Learning pace multiplier</div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-blue-100 text-blue-700 rounded-2xl"><Award className="h-6 w-6" /></div>
          <div>
            <div className="text-2xl font-black">88% Ready</div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Exam readiness indicator</div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Clock className="h-5 w-5" /></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Time</span>
          </div>
          <div>
            <div className="text-3xl font-bold">{dashboard.totalStudyHours}</div>
            <div className="text-sm text-muted-foreground mt-1">Study Hours</div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg"><TrendingUp className="h-5 w-5" /></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance</span>
          </div>
          <div>
            <div className="text-3xl font-bold">{dashboard.averageQuizScore}%</div>
            <div className="text-sm text-muted-foreground mt-1">Average Quiz Score</div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Brain className="h-5 w-5" /></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retention</span>
          </div>
          <div>
            <div className="text-3xl font-bold">{dashboard.flashcardMastery}%</div>
            <div className="text-sm text-muted-foreground mt-1">Flashcard Mastery</div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consistency</span>
          </div>
          <div>
            <div className="text-3xl font-bold">{dashboard.completedTasks}</div>
            <div className="text-sm text-muted-foreground mt-1">Completed Tasks</div>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 flex items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0 relative z-10">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="relative z-10">
          <h2 className="text-lg font-bold text-primary mb-2">AI Learning Insight</h2>
          <p className="text-base md:text-lg leading-relaxed">{dashboard.aiInsight}</p>
        </div>
      </div>

      {/* Middle Row: Charts & Goals */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Quiz Performance Chart */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Quiz Score Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} dx={-10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "hsl(var(--primary))", fontWeight: "bold" }}
                />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals & Achievements */}
        <div className="bg-card border rounded-xl shadow-sm flex flex-col">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Active Goals
            </h3>
            <button onClick={() => setShowGoalForm(true)} className="p-1 bg-muted hover:bg-accent rounded transition-colors text-muted-foreground"><Plus className="h-4 w-4" /></button>
          </div>
          
          <div className="p-6 flex-1 overflow-auto">
            {showGoalForm && (
              <form onSubmit={handleCreateGoal} className="mb-6 bg-muted/50 p-4 rounded-xl space-y-3 border">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold">New Goal</h4>
                  <button type="button" onClick={() => setShowGoalForm(false)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>
                <input required type="text" placeholder="Goal Title" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent" />
                <div className="flex gap-2">
                  <input required type="number" placeholder="Target" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: parseInt(e.target.value)})} className="w-20 border rounded-md px-3 py-2 text-sm bg-transparent" />
                  <select value={newGoal.type} onChange={e => setNewGoal({...newGoal, type: e.target.value})} className="flex-1 border rounded-md px-3 py-2 text-sm bg-transparent">
                    <option value="Hours">Hours</option>
                    <option value="Score">Quiz Score</option>
                    <option value="Cards">Flashcards</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium text-sm">Save</button>
              </form>
            )}

            {goals.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground h-full flex flex-col items-center justify-center">
                <Target className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">No active goals. Set a target to keep yourself motivated!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map(g => {
                  const percentage = Math.min(100, Math.round((g.current / g.target) * 100))
                  return (
                    <div key={g.goalId}>
                      <div className="flex justify-between items-end mb-2">
                        <h4 className="font-semibold text-sm">{g.title}</h4>
                        <span className="text-xs font-medium text-muted-foreground">{g.current} / {g.target} {g.type}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div className="bg-primary h-2.5 rounded-full transition-all" style={{width: `${percentage}%`}}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Row: Radar Strength Chart */}
      <div className="bg-card border rounded-xl p-6 shadow-sm max-w-2xl">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" /> Subject Strengths Profile
        </h3>
        <div className="h-80 w-full flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="hsl(var(--muted))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted))" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Radar name="Student Proficiency" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
