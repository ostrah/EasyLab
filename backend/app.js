const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const deviceRoutes = require('./routes/deviceRoutes');
const groupRoutes = require('./routes/groupRoutes');
const connectionRoutes = require('./routes/connectionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/easylab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Маршруты
app.use('/api/devices', deviceRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/connections', connectionRoutes);

module.exports = app;
