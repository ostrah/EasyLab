const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: String,
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }]
});

module.exports = mongoose.model('Group', groupSchema);
