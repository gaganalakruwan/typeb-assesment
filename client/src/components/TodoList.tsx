import { memo, useId, useState } from 'react'
import { formatDate, today } from '../lib/date'
import type { CreateTodoInput, Todo } from '../types/todo'
import Pagination from './Pagination'
import TodoItem from './TodoItem'

const pageSize = 5

interface TodoListProps {
  todos: Todo[]
  loading: boolean
  onToggle: (id: string) => void
  onUpdate: (id: string, input: CreateTodoInput) => Promise<boolean>
  onDelete: (id: string) => void
}

const chip = (active: boolean) =>
  `rounded-full px-3 py-1 text-sm font-medium transition ${
    active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
  }`

const TodoList = ({ todos, loading, onToggle, onUpdate, onDelete }: TodoListProps) => {
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [page, setPage] = useState(1)
  const filterId = useId()

  const updateSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const updateFilterDate = (value: string) => {
    setFilterDate(value)
    setPage(1)
  }

  const query = search.trim().toLowerCase()
  const matches = todos.filter(
    (todo) =>
      (!filterDate || todo.dueDate === filterDate) &&
      (!query ||
        todo.title.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query)),
  )

  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const visible = matches.slice(start, start + pageSize)
  const filtered = Boolean(query || filterDate)

  return (
    <div>
      <div className="relative mb-3">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        >
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.08 3.08a.75.75 0 1 1-1.06 1.06l-3.08-3.08A7 7 0 0 1 2 9Z" clipRule="evenodd" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          placeholder="Search todos…"
          aria-label="Search todos"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-9 pl-9 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            type="button"
            onClick={() => updateSearch('')}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-1.5 text-slate-400 transition hover:text-slate-700"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => updateFilterDate('')} className={chip(filterDate === '')}>
          All
        </button>
        <button
          type="button"
          onClick={() => updateFilterDate(today())}
          className={chip(filterDate === today())}
        >
          Today
        </button>
        <label htmlFor={filterId} className="sr-only">
          Filter by due date
        </label>
        <input
          id={filterId}
          type="date"
          value={filterDate}
          onChange={(e) => updateFilterDate(e.target.value)}
          className={`rounded-full border px-3 py-1 text-sm outline-none transition focus:ring-2 focus:ring-indigo-100 ${
            filterDate && filterDate !== today()
              ? 'border-indigo-400 text-indigo-700'
              : 'border-slate-300 text-slate-600'
          }`}
        />
        {!loading && matches.length > 0 && (
          <span className="ml-auto text-sm text-slate-500" aria-live="polite">
            {start + 1}–{start + visible.length} of {matches.length}
            {filtered && ` (filtered from ${todos.length})`}
          </span>
        )}
      </div>

      {loading ? (
        <ul className="space-y-3" aria-busy="true" aria-label="Loading todos">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-14 animate-pulse rounded-xl bg-slate-200/70" />
          ))}
        </ul>
      ) : todos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No todos yet. Add your first one with the form.
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          <p>
            No todos
            {query && <> matching “{search.trim()}”</>}
            {filterDate && <> due on {formatDate(filterDate)}</>}.
          </p>
          <button
            type="button"
            onClick={() => {
              updateSearch('')
              updateFilterDate('')
            }}
            className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {visible.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </ul>
          <div className="mt-6">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  )
}

export default memo(TodoList)
