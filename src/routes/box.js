require('dotenv').config()

import { Router } from 'express'
import amqp from 'amqplib'
import _ from 'lodash'
import logger from '../lib/logger'
import BoxSDK from 'box-node-sdk'
import Service from '../lib/service'

const router = Router()

router.post('/', (req, res) => {
  // Check if request params are set, if not error out
  let params = _.pick(req.body, 'accountId')
  if(!params.accountId) {
    logger.error('Missing Parameters')
    return res.status(400).send('Missing Parameters')
  }
  // Get Service object from account id
  Service.findOne({
    accountId: params.accountId,
    provider: 'box'
  }).exec()
  .then(function(service) {
    if(service == null) {
      logger.error('Box Service Not Found')
      return res.status(404).send('Box Service Not Found')
    } else {
      params.accessToken = service.accessToken
      params.refreshToken = service.refreshToken

      // Load Box SDK and grab file list
      let sdk = new BoxSDK({
        clientID: process.env.BOX_CLIENT_ID,
        clientSecret: process.env.BOX_CLIENT_SECRET
      })
      // Ensure accessToken is valid
      sdk.getTokensRefreshGrant(params.refreshToken, (err, tokens) => {
        console.log(tokens)
      })
      //let client = sdk.getBasicClient(params.accessToken)

      // Establish amqp connection
      amqp.connect('amqp://' + process.env.RQ_HOST)
          .then(conn => {
            return conn.createChannel()
                       .then(ch => {
                         let q = 'box_queue'
                         let ok = ch.assertQueue(q, {durable: true})
                         return ok.then(() => {
                           // Connection established, loop through file list and start sending stuff to the queue to process
                           let file = {
                             // file location, file id (of the file saved at the beginning)
                           }
                           params.file = file
                           ch.sendToQueue(q, Buffer.from(params), {deliveryMode: true})
                           return ch.close()
                         })
                       }).finally(() => {
                         conn.close()
                       })
          }).catch(logger.error)
          res.send('Done')
    }
  })
  .catch(function(err) {
    logger.error(err.stack)
    return res.status(500).send('Server Error')
  })
})

export default router
