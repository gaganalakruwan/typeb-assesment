import { z } from 'zod'

export const titleMax = 100
export const descriptionMax = 500

const title = z
  .string({ error: 'Title must be a string.' })
  .trim()
  .min(1, 'Title is required.')
  .max(titleMax, `Title must be ${titleMax} characters or fewer.`)

const description = z
  .string({ error: 'Description must be a string.' })
  .trim()
  .max(descriptionMax, `Description must be ${descriptionMax} characters or fewer.`)

const isRealDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}
const dueDate = z
  .string({ error: 'Due date must be a string.' })
  .refine((value) => value === '' || (/^\d{4}-\d{2}-\d{2}$/.test(value) && isRealDate(value)), {
    message: 'Due date must be a valid date (YYYY-MM-DD).',
  })

export const createTodoSchema = z.object({
  title,
  description: description.optional(),
  dueDate: dueDate.optional(),
})

export const updateTodoSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    dueDate: dueDate.optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined || data.dueDate !== undefined,
    { message: 'Provide a title, description or due date to update.' },
  )

export type CreateTodoBody = z.infer<typeof createTodoSchema>
export type UpdateTodoBody = z.infer<typeof updateTodoSchema>
