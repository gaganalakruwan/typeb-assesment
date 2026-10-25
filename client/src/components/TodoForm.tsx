import { type FormEvent, memo, useId, useState } from 'react'
import { today } from '../lib/date'
import type { CreateTodoInput } from '../types/todo'

export const titleMax = 100
export const descriptionMax = 500

interface TodoFormProps {
  initial?: CreateTodoInput
  submitLabel: string
  onSubmit: (input: CreateTodoInput) => Promise<boolean>
  onCancel?: () => void
  autoFocus?: boolean
}

const validate = (title: string, description: string): string | null => {
  if (!title.trim()) return 'Title is required.'
  if (title.trim().length > titleMax) return `Title must be ${titleMax} characters or fewer.`
  if (description.trim().length > descriptionMax)
    return `Description must be ${descriptionMax} characters or fewer.`
  return null
}

const TodoForm = ({ initial, submitLabel, onSubmit, onCancel, autoFocus }: TodoFormProps) => {
  const dateInputId = useId()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dueDate, setDueDate] = useState(initial ? (initial.dueDate ?? '') : today())
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const validationError = validate(title, description)
  const showError = submitted && validationError

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (validationError) return

    setSaving(true)
    const ok = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
    })
    setSaving(false)

    if (ok && !initial) {
      setTitle('')
      setDescription('')
      setSubmitted(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="Title"
          aria-invalid={Boolean(showError)}
          autoFocus={autoFocus}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-800 outline-none transition focus:ring-2 ${
            showError
              ? 'border-red-400 focus:ring-red-200'
              : 'border-slate-300 focus:border-indigo-400 focus:ring-indigo-100'
          }`}
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor={dateInputId} className="text-sm text-slate-500">
          Due date
        </label>
        <input
          id={dateInputId}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        {dueDate && (
          <button
            type="button"
            onClick={() => setDueDate('')}
            className="text-xs text-slate-400 transition hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          aria-label="Description"
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {description.trim().length}/{descriptionMax}
        </p>
      </div>

      {showError && (
        <p role="alert" className="text-sm text-red-600">
          {validationError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default memo(TodoForm)
