import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '../api/todos'
import type { CreateTodoInput, Todo, UpdateTodoInput } from '../types/todo'

const messageOf = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.'

const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadCount, setLoadCount] = useState(0)

  const todosRef = useRef(todos)
  useEffect(() => {
    todosRef.current = todos
  }, [todos])

  useEffect(() => {
    let cancelled = false
    api
      .getTodos()
      .then((data) => !cancelled && setTodos(data))
      .catch((err) => !cancelled && setError(messageOf(err)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [loadCount])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setLoadCount((n) => n + 1)
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  const replace = useCallback(
    (todo: Todo) => setTodos((current) => current.map((t) => (t._id === todo._id ? todo : t))),
    [],
  )

  const createTodo = useCallback(async (input: CreateTodoInput): Promise<boolean> => {
    setError(null)
    try {
      const created = await api.createTodo(input)
      setTodos((current) => [created, ...current])
      return true
    } catch (err) {
      setError(messageOf(err))
      return false
    }
  }, [])

  const updateTodo = useCallback(
    async (id: string, input: UpdateTodoInput): Promise<boolean> => {
      const original = todosRef.current.find((t) => t._id === id)
      if (!original) return false

      setError(null)
      replace({ ...original, ...input })
      try {
        replace(await api.updateTodo(id, input))
        return true
      } catch (err) {
        replace(original)
        setError(messageOf(err))
        return false
      }
    },
    [replace],
  )

  const toggleTodo = useCallback(
    async (id: string) => {
      const original = todosRef.current.find((t) => t._id === id)
      if (!original) return

      setError(null)
      replace({ ...original, done: !original.done })
      try {
        replace(await api.toggleTodo(id))
      } catch (err) {
        replace(original)
        setError(messageOf(err))
      }
    },
    [replace],
  )

  const deleteTodo = useCallback(async (id: string) => {
    const index = todosRef.current.findIndex((t) => t._id === id)
    if (index === -1) return
    const original = todosRef.current[index]

    setError(null)
    setTodos((current) => current.filter((t) => t._id !== id))
    try {
      await api.deleteTodo(id)
    } catch (err) {
      setTodos((current) => {
        const next = [...current]
        next.splice(Math.min(index, next.length), 0, original)
        return next
      })
      setError(messageOf(err))
    }
  }, [])

  return {
    todos,
    loading,
    error,
    dismissError,
    reload,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  }
}

export default useTodos
