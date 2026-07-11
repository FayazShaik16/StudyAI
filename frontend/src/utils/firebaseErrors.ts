import type { APIError } from "@/types/firebase"

export function handleFirebaseError(error: any): APIError {
  console.error("Firebase Error: ", error)
  let code = "UNKNOWN_ERROR"
  let message = "An unexpected error occurred. Please try again."

  if (error && typeof error === "object" && error.code) {
    code = error.code
    switch (error.code) {
      case "permission-denied":
      case "storage/unauthorized":
        message = "You do not have permission to perform this action."
        break
      case "unavailable":
        message = "Service is currently unavailable. You might be offline."
        break
      case "deadline-exceeded":
      case "storage/retry-limit-exceeded":
        message = "The operation timed out. Please check your connection."
        break
      case "storage/quota-exceeded":
      case "resource-exhausted":
        message = "Quota exceeded. Please contact support."
        break
      case "storage/object-not-found":
      case "not-found":
        message = "The requested resource was not found."
        break
      default:
        message = error.message || message
    }
  } else if (error instanceof Error) {
    message = error.message
  }

  return { code, message, details: error }
}
