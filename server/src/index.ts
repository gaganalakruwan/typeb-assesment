import mongoose from 'mongoose'
import { createApp } from './app.js'
import { config } from './config.js'

async function main() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 })
  console.log(`Connected to MongoDB at ${config.mongoUri}`)

  const server = createApp().listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`)
  })

  const shutdown = async () => {
    server.close()
    await mongoose.disconnect()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('Failed to start the API:', err.message)
  process.exit(1)
})
