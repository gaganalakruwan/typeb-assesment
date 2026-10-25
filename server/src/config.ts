import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/todo-app',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
