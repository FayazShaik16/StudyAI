import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Plus, Sparkles, Loader2, Target, CalendarDays, Trash2, X } from "lucide-react"
import { getTasks, updateTaskStatus, generateStudyPlan, getAppointments, createAppointment, deleteAppointment, updateTask, createTask, clearAllTasks, clearAllAppointments } from "@/services/planner.api"
import { getMaterials } from "@/services/materials.api"
import type { StudyTask, Appointment, Material } from "@/types/firebase"

export default function SchedulePage() {
  const [tasks, setTasks] = useState<StudyTask[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  
  // Date State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  // Form State
  const [showApptForm, setShowApptForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  
  const [selectedGenMatId, setSelectedGenMatId] = useState<string>("")
  
  const [newAppt, setNewAppt] = useState({ title: "", date: "", time: "", location: "", description: "" })
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    materialId: "",
    type: "Read",
    priority: "Medium",
    dueDate: "",
    estimatedMinutes: 30
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [tasksRes, appsRes, matsRes] = await Promise.all([
      getTasks(),
      getAppointments(),
      getMaterials()
    ])
    if (tasksRes.success && tasksRes.data) setTasks(tasksRes.data)
    if (appsRes.success && appsRes.data) setAppointments(appsRes.data)
    if (matsRes.success && matsRes.data) {
      setMaterials(matsRes.data)
      const dataArray = matsRes.data
      if (dataArray && dataArray.length > 0) {
        setNewTask(prev => ({ ...prev, materialId: dataArray[0].materialId }))
        setSelectedGenMatId(dataArray[0].materialId)
      }
    }
    setLoading(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const res = await generateStudyPlan(selectedGenMatId || undefined)
    if (res.success) {
      await fetchData()
    } else {
      alert("Failed to generate plan")
    }
    setGenerating(false)
  }

  const toggleTaskStatus = async (task: StudyTask) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed"
    setTasks(prev => prev.map(t => t.taskId === task.taskId ? { ...t, status: newStatus } : t))
    await updateTaskStatus(task.taskId, newStatus)
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAppt.title || !newAppt.date) return
    const dateTime = new Date(`${newAppt.date}T${newAppt.time || "12:00"}`).toISOString()
    const res = await createAppointment({
      title: newAppt.title,
      description: newAppt.description,
      location: newAppt.location,
      date: dateTime
    })
    if (res.success && res.data) {
      setAppointments([...appointments, res.data])
      setShowApptForm(false)
      setNewAppt({ title: "", date: "", time: "", location: "", description: "" })
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title || !newTask.dueDate) return
    const res = await createTask({
      title: newTask.title,
      description: newTask.description,
      materialId: newTask.materialId,
      type: newTask.type,
      priority: newTask.priority,
      dueDate: new Date(newTask.dueDate).toISOString(),
      estimatedMinutes: newTask.estimatedMinutes
    } as any)
    if (res.success && res.data) {
      setTasks([...tasks, res.data])
      setShowTaskForm(false)
      setNewTask({
        title: "",
        description: "",
        materialId: materials[0]?.materialId || "",
        type: "Read",
        priority: "Medium",
        dueDate: "",
        estimatedMinutes: 30
      })
    }
  }

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm("Delete this appointment?")) return
    await deleteAppointment(id)
    setAppointments(prev => prev.filter(a => a.appointmentId !== id))
  }

  // Native HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Required to allow drop
  }

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    if (!taskId) return

    const newDateStr = targetDate.toISOString()

    // Optimistic UI update
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, dueDate: newDateStr } : t))

    const res = await updateTask(taskId, { dueDate: newDateStr })
    if (!res.success) {
      alert("Failed to reschedule task. Reverting changes.")
      fetchData()
    }
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  }

  const weeklyDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const getMonthlyDays = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: Date[] = []
    const startOffset = firstDay.getDay()
    for (let i = startOffset; i > 0; i--) {
      days.push(new Date(year, month, 1 - i))
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const monthlyDates = getMonthlyDays()

  const getTasksForDate = (date: Date) => tasks.filter(t => isSameDay(new Date(t.dueDate), date))
  const getApptsForDate = (date: Date) => appointments.filter(a => isSameDay(new Date(a.date), date))

  const selectedTasks = getTasksForDate(selectedDate)

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Schedule & Planner</h1>
          <p className="text-muted-foreground text-sm">Reschedule tasks via drag-and-drop or generate AI-powered study plans for your materials.</p>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col gap-4">
          {/* Top row: View mode toggle + action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex bg-muted p-1 rounded-lg text-xs font-semibold">
              <button 
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-md ${viewMode === 'daily' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Daily
              </button>
              <button 
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-md ${viewMode === 'weekly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Weekly
              </button>
              <button 
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1.5 rounded-md ${viewMode === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Monthly
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => { setShowTaskForm(true); setShowApptForm(false) }}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-md font-semibold transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Task
              </button>

              <button 
                onClick={() => { setShowApptForm(true); setShowTaskForm(false) }}
                className="px-4 py-2 bg-muted text-foreground hover:bg-accent rounded-md font-semibold transition-colors flex items-center gap-2 text-sm border"
              >
                <Plus className="h-4 w-4" /> Add Event
              </button>

              <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

              <button
                onClick={async () => {
                  if (!window.confirm("Are you sure you want to clear ALL tasks? This cannot be undone.")) return;
                  await clearAllTasks();
                  fetchData();
                }}
                className="px-3 py-2 text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/30 rounded-md bg-background flex items-center gap-2 text-sm font-semibold"
                title="Clear All Tasks"
              >
                <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Clear Tasks</span>
              </button>

              <button
                onClick={async () => {
                  if (!window.confirm("Are you sure you want to clear ALL events? This cannot be undone.")) return;
                  await clearAllAppointments();
                  fetchData();
                }}
                className="px-3 py-2 text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/30 rounded-md bg-background flex items-center gap-2 text-sm font-semibold"
                title="Clear All Events"
              >
                <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Clear Events</span>
              </button>
            </div>
          </div>

          {/* Bottom row: Material selector + Generate button */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-card border rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Plan Generator</span>
            <div className="h-5 w-px bg-muted hidden sm:block"></div>
            <select
              value={selectedGenMatId}
              onChange={(e) => setSelectedGenMatId(e.target.value)}
              className="flex-1 min-w-[180px] max-w-xs px-3 py-2 bg-muted text-foreground border rounded-md text-sm"
            >
              <option value="">All Materials</option>
              {materials.map(m => (
                <option key={m.materialId} value={m.materialId}>
                  {m.title}
                </option>
              ))}
            </select>
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-md font-semibold transition-colors flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Plan
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Calendar visualizers */}
          <div className="lg:col-span-2 space-y-6">
            
            {viewMode === 'weekly' && (
              <div className="bg-card border rounded-2xl p-4 shadow-sm overflow-x-auto">
                <div className="flex gap-3 min-w-max">
                  {weeklyDates.map((d, i) => {
                    const isSelected = isSameDay(d, selectedDate)
                    const dayTasksCount = getTasksForDate(d).length
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, d)}
                        className={`flex flex-col items-center justify-center p-4 w-20 rounded-2xl transition-all border ${
                          isSelected ? 'bg-primary border-primary text-primary-foreground shadow-md scale-105' : 'hover:bg-muted text-muted-foreground border-transparent'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-85">
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-2xl font-extrabold mb-1">
                          {d.getDate()}
                        </span>
                        {dayTasksCount > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-background text-primary' : 'bg-primary/10 text-primary'}`}>
                            {dayTasksCount}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {viewMode === 'monthly' && (
              <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground mb-3">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {monthlyDates.map((d, i) => {
                    const isToday = isSameDay(d, new Date())
                    const isSelected = isSameDay(d, selectedDate)
                    const dayTasks = getTasksForDate(d)
                    const dayAppts = getApptsForDate(d)
                    
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, d)}
                        className={`min-h-16 border rounded-xl p-1.5 text-left cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-muted hover:border-primary/50 bg-background'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                            isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                          }`}>
                            {d.getDate()}
                          </span>
                        </div>
                        <div className="space-y-1 mt-1">
                          {dayTasks.slice(0,2).map(t => (
                            <div key={t.taskId} className="text-[9px] font-semibold truncate bg-muted text-foreground px-1.5 py-0.5 rounded">
                              {t.title}
                            </div>
                          ))}
                          {dayAppts.slice(0,1).map(a => (
                            <div key={a.appointmentId} className="text-[9px] font-semibold truncate bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">
                              {a.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Daily View */}
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b bg-muted/20 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> 
                  Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded">
                  {selectedTasks.filter(t => t.status === "Completed").length} / {selectedTasks.length} Completed
                </span>
              </div>
              
              <div className="p-6">
                {selectedTasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No study tasks scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTasks.sort((a) => a.status === "Completed" ? 1 : -1).map(task => (
                      <div 
                        key={task.taskId} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.taskId)}
                        className={`flex items-start gap-4 p-4 border rounded-xl transition-all cursor-grab active:cursor-grabbing ${
                          task.status === "Completed" ? 'bg-muted/50 border-muted opacity-60' : 'bg-background hover:border-primary/50'
                        }`}
                      >
                        <button 
                          onClick={() => toggleTaskStatus(task)}
                          className="mt-0.5 text-primary shrink-0 transition-transform active:scale-95"
                        >
                          {task.status === "Completed" ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`font-bold text-sm md:text-base ${task.status === "Completed" ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded">
                              {task.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 truncate" title={task.description}>{task.description}</p>
                          <div className="flex gap-3 text-xs font-medium">
                            <span className="flex items-center gap-1 text-muted-foreground bg-background border px-2 py-0.5 rounded">
                              <Clock className="h-3 w-3" /> {task.estimatedMinutes} min
                            </span>
                            <span className={`px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                              {task.priority} Priority
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Appointments & Event Forms */}
          <div className="space-y-6">
            
            {showTaskForm && (
              <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Add Study Task</h3>
                  <button onClick={() => setShowTaskForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Task Title</label>
                    <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent" placeholder="e.g. Read Physics Summary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Select Material</label>
                    <select 
                      value={newTask.materialId} 
                      onChange={e => setNewTask({...newTask, materialId: e.target.value})}
                      className="w-full border rounded-md px-3 py-2 text-sm bg-transparent"
                    >
                      {materials.map(m => (
                        <option key={m.materialId} value={m.materialId}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Task Type</label>
                      <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent">
                        <option value="Read">Read Summary</option>
                        <option value="Flashcards">Study Flashcards</option>
                        <option value="Quiz">Take Quiz</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Estimated Min</label>
                      <input type="number" value={newTask.estimatedMinutes} onChange={e => setNewTask({...newTask, estimatedMinutes: parseInt(e.target.value)})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Priority</label>
                      <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Due Date</label>
                      <input required type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm hover:bg-primary/95 transition-all">Schedule Task</button>
                </form>
              </div>
            )}

            {showApptForm && (
              <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Add Event</h3>
                  <button onClick={() => setShowApptForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleCreateAppointment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Title</label>
                    <input required type="text" value={newAppt.title} onChange={e => setNewAppt({...newAppt, title: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent" placeholder="e.g. Study Group Session" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Date</label>
                      <input required type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Time</label>
                      <input type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Location</label>
                    <input type="text" value={newAppt.location} onChange={e => setNewAppt({...newAppt, location: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm bg-transparent" placeholder="e.g. Library Desk or Online" />
                  </div>
                  <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm hover:bg-primary/95 transition-all">Save Event</button>
                </form>
              </div>
            )}

            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
              <div className="p-4 border-b bg-muted/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" /> Events & Appointments
                </h3>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <p className="text-sm">No upcoming appointments.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(app => {
                      const isPast = new Date(app.date).getTime() < Date.now()
                      return (
                        <div key={app.appointmentId} className={`p-4 border rounded-xl ${isPast ? 'bg-muted/50 opacity-60' : 'bg-background hover:border-primary/30'} transition-colors relative group`}>
                          <button onClick={() => handleDeleteAppointment(app.appointmentId)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          
                          <h4 className="font-bold mb-1 pr-6 text-sm md:text-base">{app.title}</h4>
                          <div className="text-xs text-primary font-semibold mb-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 
                            {new Date(app.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </div>
                          {app.location && (
                            <div className="text-[10px] text-muted-foreground bg-muted inline-block px-2 py-0.5 rounded font-semibold uppercase">
                              {app.location}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
