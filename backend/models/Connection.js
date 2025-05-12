const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  devA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  ifaceA: {
    type: String,
    required: true
  },
  devB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  ifaceB: {
    type: String,
    required: true
  },
  cableType: {
    type: String,
    enum: ['UTP', 'CROSS', 'SERIAL'],
    default: 'UTP'
  },
  status: {
    type: String,
    enum: ['up', 'down'],
    default: 'up'
  }
}, {
  timestamps: true
});

// Индекс для быстрого поиска по группе
connectionSchema.index({ groupId: 1 });

// Индекс для проверки уникальности соединений
connectionSchema.index(
  { 
    groupId: 1, 
    devA: 1, 
    ifaceA: 1, 
    devB: 1, 
    ifaceB: 1 
  }, 
  { unique: true }
);

module.exports = mongoose.model('Connection', connectionSchema); 