import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import http from 'http'
import runCron from './utils/cron/runCron.js'
import rateLimitOptions from './utils/rateLimit/rateLimitOptions.js'
import filesAPI from './routes/filesAPI.js'
import nodesRouter from './routes/nodesRouter.js'

const port = process.env.PORT
const app = express()

// CONFIG
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.use(cors())
app.use(rateLimit(rateLimitOptions))

// UTILS
// runCron()

// ROUTES
app.use(filesAPI)
app.use(nodesRouter)

// STARTS SERVER ITSELF
const server = http.createServer(app)
server.listen(port, () => console.log(`TDJ Server listening on http://localhost:${port}`))


// SYSTEM BŁĘDÓW
// Więc system błędów bazuje na zasadzie rozdzielno liczbowej gdzie pierwsza liczba symbolizuje z jakim systemem jest coś nie tak, 
// druga symbolizuje status jak success lub error a trzecia konkretny kod błędu dla tego modółu
// res.status(400).json({"status":"error","message":"Something went wrong in file system","code":100, "context": error})