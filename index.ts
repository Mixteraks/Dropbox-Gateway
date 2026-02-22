import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import http from 'http'
import corsOptions from './utils/cors/corsOptions.js'
import runCron from './utils/cron/runCron.js'
import rateLimitOptions from './utils/rateLimit/rateLimitOptions.js'
import filesAPI from './routes/filesAPI.js'

const port = process.env.PORT
const app = express()

// CONFIG
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.use(cors(corsOptions()))
app.use(rateLimit(rateLimitOptions))

// UTILS
// runCron()

// ROUTES
app.use(filesAPI)

// STARTS SERVER ITSELF
const server = http.createServer(app)
server.listen(port, () => console.log(`TDJ Server listening on http://localhost:${port}`))
