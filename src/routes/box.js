require('dotenv').config()

import { Router } from 'express'

const router = Router()

router.post('/', (req, res) => {
  res.send('OK')
})

export default router
