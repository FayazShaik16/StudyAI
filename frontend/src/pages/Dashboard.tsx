import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { getDashboardData } from "@/services/analytics.api"
import type { AnalyticsDashboard } from "@/services/analytics.api"
import { getMaterials } from "@/services/materials.api"
import type { Material } from "@/types/firebase"
import { Library, Clock, Brain, CheckCircle, HelpCircle, Loader2 } from "lucide-react"

// Import ChartJS and react-chartjs-2 components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function DashboardPage() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [dashRes, matRes] = await Promise.all([
      getDashboardData(),
      getMaterials(),
    ])
    if (dashRes.success && dashRes.data) setDashboard(dashRes.data)
    if (matRes.success && matRes.data) setMaterials(matRes.data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  // 1. Chart Configurations
  const trendLabels = dashboard?.chartData.map((d) => d.name) || []
  const trendScores = dashboard?.chartData.map((d) => d.score) || []

  // Line Chart for Score Trend
  const lineData = {
    labels: trendLabels.length > 0 ? trendLabels : ["Start"],
    datasets: [
      {
        label: "Quiz Accuracy (%)",
        data: trendScores.length > 0 ? trendScores : [0],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  // Bar Chart for Recent Quizzes (Last 5 quiz scores)
  const recentQuizzes = dashboard?.quizHistory?.slice(0, 5).reverse() || []
  const barLabels = recentQuizzes.map((q) => q.title.substring(0, 12) + "...")
  const barScores = recentQuizzes.map((q) => q.percentage)

  const barData = {
    labels: barLabels.length > 0 ? barLabels : ["None"],
    datasets: [
      {
        label: "Quiz Scores",
        data: barScores.length > 0 ? barScores : [0],
        backgroundColor: "rgba(168, 85, 247, 0.8)", // Purple
        borderRadius: 8,
      },
    ],
  }

  // Doughnut Chart for Performance Overview (Mastered vs. Learning cards)
  const cardMastery = dashboard?.flashcardMastery || 0
  const doughnutData = {
    labels: ["Mastered", "Needs Review"],
    datasets: [
      {
        data: [cardMastery, 100 - cardMastery],
        backgroundColor: ["#10b981", "#ef4444"], // Green vs Red
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome banner */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Performance Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back, {user?.name}. Monitor your study patterns, quiz scores, and weak topics.
        </p>
      </div>

      {/* Statistics Row with animated/clean counters */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Library className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Materials</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground">{materials.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Uploaded Study Modules</p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Study Hours</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground">{dashboard?.totalStudyHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Total Time Invested</p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
              <Brain className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quiz Accuracy</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground">{dashboard?.averageQuizScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average Correct Answers</p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tasks</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-foreground">{dashboard?.completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed Planner Tasks</p>
          </div>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Chart */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-foreground">Score Trend</h3>
          <div className="h-64 relative">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-foreground">Recent Quizzes</h3>
          <div className="h-64 relative">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-foreground">Retention Overview</h3>
          <div className="h-56 relative flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold">{cardMastery}%</span>
              <span className="text-xs text-muted-foreground">Mastered Cards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Topics and Quiz History */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weak Topics */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Weak Topics (Needs Focus)</h3>
            {!dashboard?.weakTopics || dashboard.weakTopics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center">
                <Brain className="h-10 w-10 mb-2 opacity-25" />
                No weak topics found. Take more quizzes to compile focus topics!
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.weakTopics.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span>{item.topic}</span>
                      <span className="text-red-500">{item.percentage}% Incorrect</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-red-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quiz History Table */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-foreground">Recent Activity History</h3>
          {!dashboard?.quizHistory || dashboard.quizHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center">
              <HelpCircle className="h-10 w-10 mb-2 opacity-25" />
              No quiz attempts registered. Start studying in your Materials library!
            </div>
          ) : (
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Quiz Title</th>
                    <th className="px-4 py-3 font-semibold">Accuracy</th>
                    <th className="px-4 py-3 font-semibold text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dashboard.quizHistory.map((item) => (
                    <tr key={item.attemptId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium truncate max-w-[180px]">{item.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.percentage}%</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">
                        {item.score} / {item.totalQuestions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
