import axios from 'axios'

const unreachable = "Can't reach the server. Check your connection and try again."

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`,
  timeout: 10_000,
})

apiClient.interceptors.response.use(undefined, (error) => {
  if (!axios.isAxiosError(error) || !error.response) {
    return Promise.reject(new Error(unreachable))
  }

  const { status, data } = error.response
  if (data?.error?.message) return Promise.reject(new Error(data.error.message))
  if ([502, 503, 504].includes(status)) return Promise.reject(new Error(unreachable))
  return Promise.reject(new Error(`Something went wrong (error ${status}). Please try again.`))
})
