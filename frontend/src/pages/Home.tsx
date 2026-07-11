import { Link } from "react-router-dom"
import { LayoutDashboard, UploadCloud, FileText, Brain, HelpCircle, CalendarDays, ArrowRight } from "lucide-react"

export default function HomePage() {
  const cards = [
    {
      title: "Upload Study Material",
      description: "Convert your PDF, DOCX, or TXT notes into smart AI study modules.",
      icon: UploadCloud,
      path: "/app/upload",
      borderColor: "border-t-primary/30",
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      title: "AI Summary Generator",
      description: "Extract core notes, formulas, and cheat-sheets from long documents.",
      icon: FileText,
      path: "/app/summary",
      borderColor: "border-t-primary/30",
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      title: "Flashcard Generator",
      description: "Interactive 3D flipped memory cues and terminology cards.",
      icon: Brain,
      path: "/app/flashcards",
      borderColor: "border-t-primary/30",
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      title: "AI Quiz Generator",
      description: "Adaptive testing with multiple choice and scenario-based assessments.",
      icon: HelpCircle,
      path: "/app/quiz",
      borderColor: "border-t-primary/30",
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      title: "Study Scheduler",
      description: "Personalized calendars generated from your historical performance.",
      icon: CalendarDays,
      path: "/app/schedule",
      borderColor: "border-t-primary/30",
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      title: "Performance Dashboard",
      description: "Consolidated study statistics, streaks, and subject proficiency analytics.",
      icon: LayoutDashboard,
      path: "/app/dashboard",
      borderColor: "border-t-primary/30",
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
    },
  ]

  return (
    <div className="space-y-16 max-w-7xl mx-auto py-10 px-4 md:px-8">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <SparklesIcon className="h-4 w-4 animate-spin-slow" /> AI-Powered Learning
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-foreground font-heading">
          Study Smarter, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 text-transparent bg-clip-text">
            Not Harder
          </span>
        </h1>

        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Upload your study material and let AI generate summaries, flashcards, quizzes, and personalized study schedules — all in seconds.
        </p>

        <div className="pt-4">
          <Link
            to="/app/upload"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl text-md hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 shadow-md active:scale-98"
          >
            🚀 Get Started
          </Link>
        </div>

        {/* Stats strip */}
        <div className="flex justify-center items-center gap-8 md:gap-16 pt-10 text-center">
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-primary font-heading">3x</div>
            <div className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Faster Learning</div>
          </div>
          <div className="h-8 w-[1px] bg-muted"></div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-primary font-heading">24/7</div>
            <div className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">AI Tutor</div>
          </div>
          <div className="h-8 w-[1px] bg-muted"></div>
          <div>
            <div className="text-2xl md:text-4xl font-extrabold text-primary font-heading">Smart</div>
            <div className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">Analytics</div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <Link
              key={idx}
              to={card.path}
              className={`block border-2 ${card.borderColor} bg-card hover:bg-muted/10 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${card.bgColor} ${card.iconColor} rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{card.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 6Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  )
}
