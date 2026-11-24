import axios from "axios"

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// Single axios instance for the client. Backend authenticates via httpOnly
// cookies, so withCredentials is required and no bearer token is ever stored
// in localStorage or sent in an Authorization header.
export const axiosInstance = axios.create({
  baseURL: backendURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

type FailedRequest = {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}

// Kept out of the interceptor so static-analysis rules don't treat a
// navigation as a component render side effect. The destination is always
// passed in by the caller.
function navigateTo(path: string) {
  window.location.href = path
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

const processQueue = (error: unknown, token: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

const refreshUrl = `${backendURL}/api/auth/v1/refresh-token`

// Requests whose 401 is an expected outcome (bad credentials, expired
// signup data) must never kick off a refresh attempt — doing so would loop
// on the very endpoint meant to establish or repair the session.
const authEndpoints = [
  "/api/auth/v1/login",
  "/api/auth/v1/refresh-token",
  "/api/auth/v1/signup",
  "/api/auth/v1/logout",
]

// Anonymous visitors may sit on these routes with no session at all. A
// failed silent refresh there is normal and must not bounce them to /login.
function isProtectedPath(pathname: string) {
  return pathname !== "/" && pathname !== "/login" && !pathname.startsWith("/signup/")
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const retryRequest = originalRequest as typeof originalRequest & {
      _retry?: boolean
    }

    const status = error.response?.status
    const requestUrl = originalRequest.url ?? ""
    const isAuthEndpoint = authEndpoints.some((endpoint) => requestUrl.includes(endpoint))

    // On 401, attempt to refresh once. Auth endpoints themselves never
    // trigger a refresh loop.
    if (status === 401 && !retryRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => axiosInstance(retryRequest))
          .catch((err) => Promise.reject(err))
      }

      retryRequest._retry = true
      isRefreshing = true

      try {
        await axios.post(refreshUrl, {}, { withCredentials: true })
        processQueue(null)
        isRefreshing = false
        return axiosInstance(retryRequest)
      } catch (refreshError: unknown) {
        processQueue(refreshError, null)
        isRefreshing = false

        if (typeof window !== "undefined" && isProtectedPath(window.location.pathname)) {
          navigateTo("/login")
        }

        return Promise.reject(refreshError)
      }
    }

    // Central network / 5xx handling.
    if (!status || status >= 500) {
      console.error(
        `[API System Error] ${originalRequest.method?.toUpperCase()} ${
          originalRequest.url
        }`,
        {
          status: status || "NETWORK_ERROR",
          message: error.message || "No error message provided",
        },
      )
    }

    return Promise.reject(error)
  },
)
