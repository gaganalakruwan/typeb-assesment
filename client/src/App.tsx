import { memo } from 'react'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import useTodos from './hooks/useTodos'

const App = () => {
  const { todos, loading, error, dismissError, reload, createTodo, updateTodo, toggleTodo, deleteTodo } =
    useTodos()

  const doneCount = todos.filter((t) => t.done).length
  const showRetry = Boolean(error) && !loading && todos.length === 0

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Welcome to TODO App</h1>
          {!loading && todos.length > 0 && (
            <p className="mt-1 text-sm text-slate-500">
              {doneCount} of {todos.length} done
            </p>
          )}
        </header>

        <div className="grid gap-6 md:grid-cols-[2fr_3fr] md:items-start">
          <section
            aria-labelledby="add-todo-heading"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:sticky md:top-8"
          >
            <h2 id="add-todo-heading" className="mb-4 text-lg font-semibold text-slate-800">
              Add a todo
            </h2>
            <TodoForm submitLabel="Add todo" onSubmit={createTodo} />
          </section>

          <section aria-label="Todo list" className="min-w-0">
            {error && (
              <div
                role="alert"
                className="animate-fade-in mb-4 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <span>{error}</span>
                <div className="flex shrink-0 gap-3">
                  {showRetry && (
                    <button type="button" onClick={reload} className="font-medium underline">
                      Retry
                    </button>
                  )}
                  <button type="button" onClick={dismissError} aria-label="Dismiss error" className="font-medium">
                    ✕
                  </button>
                </div>
              </div>
            )}

            {!showRetry && (
              <TodoList
                todos={todos}
                loading={loading}
                onToggle={toggleTodo}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default memo(App)
