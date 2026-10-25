import { memo, useId, useState } from 'react'
import { formatDate } from '../lib/date'
import type { CreateTodoInput, Todo } from '../types/todo'
import ConfirmDialog from './ConfirmDialog'
import TodoForm from './TodoForm'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onUpdate: (id: string, input: CreateTodoInput) => Promise<boolean>
  onDelete: (id: string) => void
}

const TodoItem = ({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) => {
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const [confirming, setConfirming] = useState<'done' | 'delete' | null>(null)

  const handleCheckboxChange = () => {
    if (todo.done) onToggle(todo._id)
    else setConfirming('done')
  }

  if (editing) {
    return (
      <li className="animate-fade-in rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
        <TodoForm
          initial={{ title: todo.title, description: todo.description, dueDate: todo.dueDate }}
          submitLabel="Save"
          autoFocus
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            const ok = await onUpdate(todo._id, input)
            if (ok) setEditing(false)
            return ok
          }}
        />
      </li>
    )
  }

  return (
    <li className="group animate-fade-in rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow">
      <div className="flex items-center gap-3 p-4">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={handleCheckboxChange}
          aria-label={todo.done ? `Mark "${todo.title}" as not done` : `Mark "${todo.title}" as done`}
          className="size-5 shrink-0 cursor-pointer accent-indigo-600"
        />

        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          className={`flex min-w-0 flex-1 items-center gap-2 text-left transition-opacity ${todo.done ? 'opacity-50' : ''}`}
        >
          <span className={`min-w-0 flex-1 break-words font-medium text-slate-800 ${todo.done ? 'line-through' : ''}`}>
            {todo.title}
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <path fillRule="evenodd" d="M5.2 7.2a.75.75 0 0 1 1.06 0L10 10.94l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.26a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex shrink-0 gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirming('delete')}
            className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div
        id={detailsId}
        aria-hidden={!expanded}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-slate-100 py-3 pr-4 pl-12 text-sm">
            {todo.description ? (
              <p className="whitespace-pre-line break-words text-slate-600">{todo.description}</p>
            ) : (
              <p className="italic text-slate-400">No description</p>
            )}
            <p className="flex items-center gap-1.5 text-slate-500">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-4 text-slate-400">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
              </svg>
              {todo.dueDate ? `Due ${formatDate(todo.dueDate)}` : 'No due date'}
            </p>
          </div>
        </div>
      </div>

      {confirming === 'done' && (
        <ConfirmDialog
          tone="success"
          title="Mark as done?"
          message={`"${todo.title}" will be marked as completed.`}
          confirmLabel="Mark done"
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            setConfirming(null)
            onToggle(todo._id)
          }}
        />
      )}

      {confirming === 'delete' && (
        <ConfirmDialog
          title="Delete this todo?"
          message={`"${todo.title}" will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirming(null)}
          onConfirm={() => onDelete(todo._id)}
        />
      )}
    </li>
  )
}

export default memo(TodoItem)
