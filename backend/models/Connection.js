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

// Middleware для логирования операций
connectionSchema.pre('save', function(next) {
  console.log('💾 Saving connection:', {
    groupId: this.groupId,
    devA: this.devA,
    ifaceA: this.ifaceA,
    devB: this.devB,
    ifaceB: this.ifaceB,
    cableType: this.cableType,
    status: this.status
  });
  next();
});

connectionSchema.pre('findOneAndUpdate', function(next) {
  console.log('🔄 Updating connection:', {
    id: this._conditions._id,
    update: this._update
  });
  next();
});

connectionSchema.pre('findOneAndDelete', function(next) {
  console.log('🗑️ Deleting connection:', this._conditions._id);
  next();
});

// Метод для проверки валидности соединения
connectionSchema.methods.validateConnection = async function() {
  console.log('🔍 Validating connection:', {
    groupId: this.groupId,
    devA: this.devA,
    ifaceA: this.ifaceA,
    devB: this.devB,
    ifaceB: this.ifaceB
  });

  // Проверяем, что устройства существуют
  const Device = mongoose.model('Device');
  const [deviceA, deviceB] = await Promise.all([
    Device.findById(this.devA),
    Device.findById(this.devB)
  ]);

  if (!deviceA || !deviceB) {
    console.log('❌ One or both devices not found');
    return false;
  }

  // Проверяем, что интерфейсы существуют
  const hasInterfaceA = deviceA.interfaces.some(iface => iface.name === this.ifaceA);
  const hasInterfaceB = deviceB.interfaces.some(iface => iface.name === this.ifaceB);

  if (!hasInterfaceA || !hasInterfaceB) {
    console.log('❌ One or both interfaces not found');
    return false;
  }

  console.log('✅ Connection validation successful');
  return true;
};

module.exports = mongoose.model('Connection', connectionSchema); 