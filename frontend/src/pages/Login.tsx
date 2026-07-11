import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/services/api"
import { Loader2, BookOpen, GraduationCap, Sparkles, BookCheck, Users, Trophy } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [serverError, setServerError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError("")
    try {
      const res = await api.post("/auth/login", data)
      login(res.data.token, res.data.user)
      navigate("/app")
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || "An unexpected error occurred.")
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* CSS Animations block */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-4deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        .animate-float-1 { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-3 { animation: float-fast 5s ease-in-out infinite; }
        .animate-orbit-1 { animation: orbit 20s linear infinite; }
      `}</style>

      {/* Left side: Animated branding and floating assets */}
      <div className="hidden w-1/2 flex-col justify-between bg-card p-16 text-card-foreground lg:flex relative overflow-hidden border-r">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-accent/5 blur-[100px] pointer-events-none"></div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
            S
          </div>
          <span className="text-xl font-black tracking-tight font-heading">StudyAI</span>
        </div>

        {/* Animated Canvas */}
        <div className="relative flex-1 flex flex-col justify-center items-center py-20 select-none">
          {/* Main Visual: Bouncing Graduation Student Portal */}
          <div className="animate-float-1 flex flex-col items-center text-center max-w-sm relative">
            <div className="h-32 w-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20 shadow-inner relative">
              <GraduationCap className="h-16 w-16" />
              <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-zinc-950 font-bold text-xs shadow">
                AI
              </div>
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight font-heading">Interactive Study Spaces</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Upload textbook materials and watch AI instantly deploy dynamic summary guides, smart study calendars, and adaptive revision lists.
            </p>
          </div>

          {/* Floating Book 1 */}
          <div className="animate-float-2 absolute top-12 left-10 p-4 bg-card border rounded-2xl shadow-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Physics Lecture Notes</div>
              <div className="text-[10px] text-muted-foreground">Summarized • 5m ago</div>
            </div>
          </div>

          {/* Floating Student / Users metrics */}
          <div className="animate-float-3 absolute bottom-12 right-10 p-4 bg-card border rounded-2xl shadow-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Active Students</div>
              <div className="text-[10px] text-muted-foreground">1,240 Studying Now</div>
            </div>
          </div>

          {/* Floating Achievements/Trophy */}
          <div className="animate-float-1 absolute top-24 right-8 p-4 bg-card border rounded-2xl shadow-lg flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Goals Met</div>
              <div className="text-[10px] text-muted-foreground">Streak: 7 days</div>
            </div>
          </div>

          {/* Bouncing Book 2 */}
          <div className="animate-float-2 absolute bottom-20 left-12 p-3 bg-card border rounded-2xl shadow-md flex items-center gap-2">
            <BookCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold">Quiz Complete! +85XP</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground relative z-10 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Multi-format textbooks & AI summary engine
        </div>
      </div>
      
      {/* Right side: login form container */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 lg:w-1/2 bg-background">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-black mb-2 tracking-tight font-heading">Log in to your account</h2>
          <p className="text-muted-foreground mb-8 text-sm">Enter your credentials to access your workspace.</p>
          
          {serverError && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-600 font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Email Address</label>
              <input
                {...register("email")}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                placeholder="m@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/95 focus:outline-none transition-all shadow active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log in"}
              </button>
            </div>
          </form>
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
