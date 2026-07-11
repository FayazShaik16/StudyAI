import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/services/api"
import { Loader2 } from "lucide-react"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [serverError, setServerError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setServerError("")
    try {
      const res = await api.post("/auth/signup", data)
      login(res.data.token, res.data.user)
      navigate("/app")
    } catch (err: any) {
      setServerError(err.response?.data?.error?.message || "An unexpected error occurred.")
    }
  }

  return (
    <div className="flex min-h-screen bg-background flex-row-reverse">
      {/* Right side: branding */}
      <div className="hidden w-1/2 flex-col justify-center bg-accent p-12 text-accent-foreground lg:flex">
        <h1 className="text-5xl font-bold mb-4">Start your journey</h1>
        <p className="text-xl opacity-90 max-w-lg">
          Join StudyAI today and get personalized, adaptive study schedules tailored to your weaknesses.
        </p>
      </div>
      
      {/* Left side: form */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2">Create an account</h2>
          <p className="text-muted-foreground mb-8">Enter your details to get started with StudyAI.</p>
          
          {serverError && (
            <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-800">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                {...register("name")}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Jane Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register("email")}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="m@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign up"}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
