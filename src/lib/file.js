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