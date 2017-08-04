require('dotenv').config()

import express from 'express'
import bodyParser from 'body-parser'
import logger from './lib/logger'

const app = express()
const PORT = process.env.PORT || 8080

// Service middleware
app.use(require('morgan')('short', {stream: logger.stream}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

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
  logger.debug(`[${process.env.NODE_ENV}] Auth-Service ready on port ${PORT}`)
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
