import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Loader2 } from "lucide-react"

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type ResetFormValues = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<{ type: "error" | "success", message: string } | null>(null)
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (_data: ResetFormValues) => {
    setStatus(null)
    if (!token) {
        setStatus({ type: "error", message: "Invalid or missing reset token." })
        return
    }
    try {
      // Placeholder for reset password endpoint
      // await api.post("/auth/reset-password", { token, password: data.password })
      await new Promise(r => setTimeout(r, 1000))
      setStatus({ type: "success", message: "Password reset successfully." })
      setTimeout(() => navigate("/login"), 2000)
    } catch (err: any) {
      setStatus({ type: "error", message: err.response?.data?.error?.message || "An error occurred." })
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 items-center">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-center">Set new password</h2>
          <p className="text-muted-foreground mb-8 text-center">Your new password must be different from previously used passwords.</p>
          
          {status && (
            <div className={`mb-4 rounded p-3 text-sm ${status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset password"}
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
