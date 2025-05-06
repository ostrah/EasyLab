const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: String,
    type: String,
    ipExternal: String,
    ipInternal: String,
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }]
});

module.exports = mongoose.model('Device', deviceSchema);
