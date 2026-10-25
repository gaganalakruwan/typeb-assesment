import mongoose from 'mongoose'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app.js'
import { Todo } from '../src/models/Todo.js'

const TEST_URI = process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/todo-app-test'

const app = createApp()
const MISSING_ID = new mongoose.Types.ObjectId().toString()

beforeAll(async () => {
  await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 5000 })
})

beforeEach(async () => {
  await Todo.deleteMany({})
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

const createTodo = (body: object) => request(app).post('/api/todos').send(body)

describe('GET /api/todos', () => {
  it('returns an empty list when there are no todos', async () => {
    const res = await request(app).get('/api/todos')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns todos newest first', async () => {
    await createTodo({ title: 'First' })
    await createTodo({ title: 'Second' })

    const res = await request(app).get('/api/todos')
    expect(res.body.map((t: { title: string }) => t.title)).toEqual(['Second', 'First'])
  })
})

describe('POST /api/todos', () => {
  it('creates a todo with trimmed fields and done=false', async () => {
    const res = await createTodo({ title: '  Buy milk  ', description: ' 2 litres ' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ title: 'Buy milk', description: '2 litres', done: false })
    expect(res.body._id).toBeDefined()
    expect(res.body.createdAt).toBeDefined()
    expect(res.body.updatedAt).toBeDefined()
  })

  it('ignores fields the client may not set, like done', async () => {
    const res = await createTodo({ title: 'Sneaky', done: true })
    expect(res.status).toBe(201)
    expect(res.body.done).toBe(false)
  })

  it('rejects a missing or blank title', async () => {
    for (const body of [{}, { title: '   ' }]) {
      const res = await createTodo(body)
      expect(res.status).toBe(400)
      expect(res.body.error.message).toBeTypeOf('string')
    }
    expect(await Todo.countDocuments()).toBe(0)
  })

  it('rejects a title over 100 characters', async () => {
    const res = await createTodo({ title: 'a'.repeat(101) })
    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/100 characters/)
  })

  it('saves a due date, and treats an empty one as no date', async () => {
    const withDate = await createTodo({ title: 'Dated', dueDate: '2026-10-25' })
    expect(withDate.status).toBe(201)
    expect(withDate.body.dueDate).toBe('2026-10-25')

    const withoutDate = await createTodo({ title: 'Undated', dueDate: '' })
    expect(withoutDate.status).toBe(201)
    expect(withoutDate.body.dueDate).toBeUndefined()
  })

  it('rejects invalid due dates', async () => {
    for (const dueDate of ['25/10/2026', '2026-02-30', '2026-13-01', 'tomorrow']) {
      const res = await createTodo({ title: 'Task', dueDate })
      expect(res.status, dueDate).toBe(400)
      expect(res.body.error.message).toMatch(/valid date/)
    }
  })

  it('rejects malformed JSON', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Content-Type', 'application/json')
      .send('{bad json')
    expect(res.status).toBe(400)
    expect(res.body.error.message).toMatch(/not valid JSON/)
  })
})

describe('PUT /api/todos/:id', () => {
  it('updates the title and keeps the description', async () => {
    const { body: todo } = await createTodo({ title: 'Old', description: 'Keep me' })

    const res = await request(app).put(`/api/todos/${todo._id}`).send({ title: 'New' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ title: 'New', description: 'Keep me' })
  })

  it('removes the description when it is sent as an empty string', async () => {
    const { body: todo } = await createTodo({ title: 'Task', description: 'Remove me' })

    const res = await request(app).put(`/api/todos/${todo._id}`).send({ description: '' })
    expect(res.status).toBe(200)
    expect(res.body.description).toBeUndefined()
  })

  it('changes and clears the due date', async () => {
    const { body: todo } = await createTodo({ title: 'Task', dueDate: '2026-10-25' })

    const changed = await request(app).put(`/api/todos/${todo._id}`).send({ dueDate: '2026-11-01' })
    expect(changed.body).toMatchObject({ title: 'Task', dueDate: '2026-11-01' })

    const cleared = await request(app).put(`/api/todos/${todo._id}`).send({ dueDate: '' })
    expect(cleared.body.dueDate).toBeUndefined()
  })

  it('does not change the done status', async () => {
    const { body: todo } = await createTodo({ title: 'Task' })

    const res = await request(app).put(`/api/todos/${todo._id}`).send({ title: 'Task', done: true })
    expect(res.body.done).toBe(false)
  })

  it('rejects an empty update', async () => {
    const { body: todo } = await createTodo({ title: 'Task' })
    const res = await request(app).put(`/api/todos/${todo._id}`).send({})
    expect(res.status).toBe(400)
  })

  it('returns 404 for a todo that does not exist', async () => {
    const res = await request(app).put(`/api/todos/${MISSING_ID}`).send({ title: 'x' })
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/todos/:id/done', () => {
  it('toggles done on and off', async () => {
    const { body: todo } = await createTodo({ title: 'Task' })

    const first = await request(app).patch(`/api/todos/${todo._id}/done`)
    expect(first.status).toBe(200)
    expect(first.body.done).toBe(true)

    const second = await request(app).patch(`/api/todos/${todo._id}/done`)
    expect(second.body.done).toBe(false)
  })

  it('handles concurrent toggles without losing one', async () => {
    const { body: todo } = await createTodo({ title: 'Task' })

    await Promise.all(Array.from({ length: 5 }, () => request(app).patch(`/api/todos/${todo._id}/done`)))

    // Five flips from false must end at true.
    const saved = await Todo.findById(todo._id)
    expect(saved?.done).toBe(true)
  })

  it('updates updatedAt', async () => {
    const { body: todo } = await createTodo({ title: 'Task' })
    const res = await request(app).patch(`/api/todos/${todo._id}/done`)
    expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThan(new Date(todo.updatedAt).getTime())
  })
})

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo and returns 204', async () => {
    const { body: todo } = await createTodo({ title: 'Task' })

    const res = await request(app).delete(`/api/todos/${todo._id}`)
    expect(res.status).toBe(204)
    expect(await Todo.findById(todo._id)).toBeNull()
  })

  it('returns 404 when the todo is already gone', async () => {
    const res = await request(app).delete(`/api/todos/${MISSING_ID}`)
    expect(res.status).toBe(404)
    expect(res.body.error.message).toBe('Todo not found.')
  })
})

describe('error handling', () => {
  it('rejects malformed ids with 400', async () => {
    const res = await request(app).patch('/api/todos/not-an-id/done')
    expect(res.status).toBe(400)
    expect(res.body.error.message).toBe('Invalid todo id.')
  })

  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.error.message).toMatch(/not found/)
  })
})
