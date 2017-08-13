import mongoose from 'mongoose'

mongoose.Promise = global.Promise

const schema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true
  },
  serviceId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  source: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  html: {
    type: String
  },
  text: {
    type: String
  },
  downloadUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

schema.set('toJSON', {virtuals: true})
schema.set('toObject', {virtuals: true})

export default mongoose.model('File', schema)
