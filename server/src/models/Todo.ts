import { model, Schema, type InferSchemaType } from 'mongoose'
import { descriptionMax, titleMax } from '../validation/todo.js'

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: titleMax },
    description: { type: String, trim: true, maxlength: descriptionMax },
    dueDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
    done: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
)

export type TodoDocument = InferSchemaType<typeof todoSchema>

export const Todo = model('Todo', todoSchema)
