import type { ErrorRequestHandler, RequestHandler } from 'express'
import mongoose from 'mongoose'

export class HttpError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

export const notFound: RequestHandler = (req) => {
  throw new HttpError(404, `Route ${req.method} ${req.originalUrl} not found.`)
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500
  let message = 'Something went wrong on the server.'
  let details: unknown

  if (err instanceof HttpError) {
    status = err.status
    message = err.message
    details = err.details
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400
    message = 'Validation failed.'
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
  } else if (err?.type === 'entity.parse.failed') {
    status = 400
    message = 'Request body is not valid JSON.'
  }

  if (status === 500) console.error(err)

  res.status(status).json({ error: { message, ...(details ? { details } : {}) } })
}
