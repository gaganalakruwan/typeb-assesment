import type { Request, Response } from 'express'
import { HttpError } from '../middleware/errorHandler.js'
import { Todo } from '../models/Todo.js'
import type { CreateTodoBody, UpdateTodoBody } from '../validation/todo.js'

type IdParams = { id: string }

const notFound = () => new HttpError(404, 'Todo not found.')

export async function listTodos(_req: Request, res: Response) {
  const todos = await Todo.find().sort({ createdAt: -1 })
  res.json(todos)
}

export async function createTodo(req: Request<object, unknown, CreateTodoBody>, res: Response) {
  const { title, description, dueDate } = req.body
  const todo = await Todo.create({
    title,
    description: description || undefined,
    dueDate: dueDate || undefined,
  })
  res.status(201).json(todo)
}

export async function updateTodo(req: Request<IdParams, unknown, UpdateTodoBody>, res: Response) {
  const $set: Record<string, string> = {}
  const $unset: Record<string, 1> = {}
  for (const [field, value] of Object.entries(req.body)) {
    if (value === '') $unset[field] = 1
    else if (value !== undefined) $set[field] = value
  }
  const update = Object.keys($unset).length ? { $set, $unset } : { $set }

  const todo = await Todo.findByIdAndUpdate(req.params.id, update, {
    returnDocument: 'after',
    runValidators: true,
  })
  if (!todo) throw notFound()
  res.json(todo)
}

export async function toggleTodo(req: Request<IdParams>, res: Response) {
  const todo = await Todo.findByIdAndUpdate(
    req.params.id,
    [{ $set: { done: { $not: '$done' }, updatedAt: '$$NOW' } }],
    { returnDocument: 'after', updatePipeline: true, timestamps: false },
  )
  if (!todo) throw notFound()
  res.json(todo)
}

export async function deleteTodo(req: Request<IdParams>, res: Response) {
  const todo = await Todo.findByIdAndDelete(req.params.id)
  if (!todo) throw notFound()
  res.status(204).end()
}
