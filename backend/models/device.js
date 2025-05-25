const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['pc', 'router', 'switch'],
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  position: {
    x: {
      type: Number,
      default: 100
    },
    y: {
      type: Number,
      default: 100
    }
  },
  interfaces: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['ethernet', 'serial', 'console'],
      default: 'ethernet'
    },
    status: {
      type: String,
      enum: ['up', 'down'],
      default: 'up'
    }
  }]
}, {
  timestamps: true
});

// Генерация интерфейсов при создании устройства
deviceSchema.pre('save', function(next) {
  if (this.isNew) {
    const interfaces = [];
    
    switch (this.type) {
      case 'router':
        // 4 FastEthernet и 2 Serial порта для роутера
        for (let i = 0; i < 4; i++) {
          interfaces.push({ name: `f0/${i}`, type: 'ethernet' });
        }
        for (let i = 0; i < 2; i++) {
          interfaces.push({ name: `s0/${i}`, type: 'serial' });
        }
        interfaces.push({ name: 'console', type: 'console' });
        break;
        
      case 'switch':
        // 8 FastEthernet портов для свича
        for (let i = 0; i < 8; i++) {
          interfaces.push({ name: `f0/${i}`, type: 'ethernet' });
        }
        interfaces.push({ name: 'console', type: 'console' });
        break;
        
      case 'pc':
        // Один Ethernet порт для PC
        interfaces.push({ name: 'eth0', type: 'ethernet' });
        break;
    }
    
    this.interfaces = interfaces;
  }
  next();
});

module.exports = mongoose.model('Device', deviceSchema);
