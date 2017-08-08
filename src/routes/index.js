import express from 'express'
import box from './box'
import dropbox from './dropbox'
import evernote from './evernote'
import google from './google'
import linkedin from './linkedin'
import microsoft from './microsoft'
import twitter from './twitter'

const router = express.Router()

// Middleware ensure session state
router.use((req, res, next) => {
  if(req.session.passport) {
    next()
  } else {
    return res.status(401).send('Unauthorized')
  }
})

// Route Authorize Box Service
router.use('/box', box)

// Route Authorize Dropbox Service
router.use('/dropbox', dropbox)

// Route Authorize Evernote Service
router.use('/evernote', evernote)

// Route Authorize Google Service
router.use('/google', google)

// Route Authorize LinkedIn Service
router.use('/linkedin', linkedin)

// Route Authorize Microsoft Service
router.use('/microsoft', microsoft)

// Route Authorize Twitter Service
router.use('/twitter', twitter)

export default router
