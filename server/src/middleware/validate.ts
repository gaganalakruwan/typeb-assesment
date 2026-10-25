import type { RequestHandler } from 'express'
import type { ZodType } from 'zod'
import { HttpError } from './errorHandler.js'

export const validateBody =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {})
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || undefined,
        message: issue.message,
      }))
      throw new HttpError(400, details[0]?.message ?? 'Validation failed.', details)
    }
    req.body = result.data
    next()
  }

const validateIdObj = /^[a-f\d]{24}$/i

export const validateId: RequestHandler = (req, _res, next) => {
  if (!validateIdObj.test(String(req.params.id))) {
    throw new HttpError(400, 'Invalid todo id.')
  }
  next()
}
