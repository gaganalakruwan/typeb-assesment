import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { todosRouter } from './routes/todos.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: config.corsOrigin }))
  app.use(express.json({ limit: '10kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })
  app.use('/api/todos', todosRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
