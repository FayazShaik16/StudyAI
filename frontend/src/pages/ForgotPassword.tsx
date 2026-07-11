import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<{ type: "error" | "success", message: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (_data: ForgotFormValues) => {
    setStatus(null)
    try {
      // Placeholder for forgot password endpoint
      // await api.post("/auth/forgot-password", data)
      await new Promise(r => setTimeout(r, 1000))
      setStatus({ type: "success", message: "If an account exists, a password reset link has been sent." })
    } catch (err: any) {
      setStatus({ type: "error", message: err.response?.data?.error?.message || "An error occurred." })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 items-center">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-center">Reset your password</h2>
          <p className="text-muted-foreground mb-8 text-center">Enter your email address and we will send you a link to reset your password.</p>
          
          {status && (
            <div className={`mb-4 rounded p-3 text-sm ${status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...register("email")}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="m@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send reset link"}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
