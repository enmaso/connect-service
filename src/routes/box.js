require('dotenv').config()

import { Router } from 'express'
import amqp from 'amqplib'
import _ from 'lodash'
import logger from '../lib/logger'
import BoxSDK from 'box-node-sdk'
import Service from '../lib/service'
import request from 'request'
import File from '../lib/file'

const router = Router()
const BOX_FOLDERS_URL = 'https://api.box.com/2.0/folders/0/items'
const BOX_FILES_URL = 'https://api.box.com/2.0/files/'

router.post('/', (req, res) => {
  let params = {}
  params.accountId = req.session.passport.user

  Service.findOne({
    provider: 'box',
    accountId: params.accountId
  }).exec()
  .then(service => {
    if(_.isNull(service)) {
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
        if(err) {
          logger.error(err)
          res.status(500).send(err)
        } else {
          service.accessToken = tokens.accessToken
          service.refreshToken = tokens.refreshToken
          service.save(err => {
            if(err) {
              logger.warn(err)
            }
          })
          request({
            url: BOX_FOLDERS_URL,
            qs: {
              limit: 1000,
              offset: 0
            },
            headers: {
              'Authorization': 'Bearer ' + service.accessToken
            }
          }, function(err, response, list) {
            if(err) {
              logger.error(err.stack)
              res.status(500).send()
            } else if(response.statusCode !== 200) {
              logger.warn(new Error(response.statusCode))
              res.status(response.statusCode).send()
            } else {
              let dataset = JSON.parse(list)
              let files = []
              for(let i = 0; i < dataset.entries.length; i++) {
                files.push({
                  accountId: params.accountId,
                  serviceId: service._id,
                  name: dataset.entries[i].name,
                  source: dataset.entries[i],
                  downloadUrl: BOX_FILES_URL + dataset.entries[i].id + '/content'
                })
              }
              File.collection.insert(files, (err, docs) => {
                if(err) {
                  logger.error(err)
                  res.status(500).send(new Error())
                } else {
                  // Establish amqp connection
                  amqp.connect('amqp://' + process.env.RQ_HOST).then(function(conn) {
                    return conn.createChannel().then(function(ch) {
                      var q = 'box_queue';
                      var ok = ch.assertQueue(q, {durable: true});

                      return ok.then(function() {
                        for(let i = 0; i < docs.ops.length; i++) {
                          let fileId = docs.ops[i]._id.toString()
                          ch.sendToQueue(q, Buffer.from(fileId), { deliveryMode: true })
                        }
                        return ch.close();
                      });
                    }).finally(function() { conn.close(); });
                  }).catch(logger.error);

                  res.status(200).send(docs)
                }
              })
            }
          })
        }
      })
    }
  })
  .catch(err => {
    logger.error(err.stack)
    return res.status(500).send('Internal Server Error')
  })
})

export default router
