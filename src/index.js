require('dotenv').config()

import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import logger from './lib/logger'
import routes from './routes'

import session from 'express-session'
import redis from 'redis'
import connectRedis from 'connect-redis'

const app = express()
const PORT = process.env.PORT || 8080

const redisStore = connectRedis(session)
const redisClient = redis.createClient()

// Service middleware
app.use(require('morgan')('short', {stream: logger.stream}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Redis Session
let sessionOpts = {
  secret: process.env.REDIS_SECRET,
  store: new redisStore({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    client: redisClient
  }),
  saveUninitialized: true,
  resave: true,
}
app.use(session(sessionOpts))

// Mongo connection
let mongoOpts = {
  poolSize: Number(process.env.MONGO_POOLSIZE) || 4,
  useMongoClient: true
}
let mongoUri = `mongodb://${process.env.MONGO_HOST}/${process.env.MONGO_DB}`
mongoose.connect(mongoUri, mongoOpts)

mongoose.Promise = global.Promise

// Service routes
app.use('/connect', routes)

// Service status route
app.get('/status', (req, res) => {
  res.status(200).send('OK')
})

// If Route not found, 404
app.all('*', (req, res) => {
  res.status(404).send('Not Found')
})

// Run service
app.listen(PORT, () => {
  logger.debug(`[${process.env.NODE_ENV}] Connect-Service ready on port ${PORT}`)
})

export default app



/* Service calls
/connect/google/mail
/connect/goole/drive
/connect/google/contacts
/connect/google/calendar
/connect/google
/connect/box
/connect/dropbox
/connect/twitter
/connect/linkedin
/connect/evernote
/connect/microsoft/onedrive
/connect/microsoft/people
/connect/microsoft/outlook
/connect/microsoft/calendar
/connect/microsoft
*/
