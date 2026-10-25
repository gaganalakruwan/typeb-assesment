import { Router } from 'express'
import * as todos from '../controllers/todos.js'
import { validateBody, validateId } from '../middleware/validate.js'
import { createTodoSchema, updateTodoSchema } from '../validation/todo.js'

export const todosRouter = Router()

todosRouter.get('/', todos.listTodos)
todosRouter.post('/', validateBody(createTodoSchema), todos.createTodo)
todosRouter.put('/:id', validateId, validateBody(updateTodoSchema), todos.updateTodo)
todosRouter.patch('/:id/done', validateId, todos.toggleTodo)
todosRouter.delete('/:id', validateId, todos.deleteTodo)
