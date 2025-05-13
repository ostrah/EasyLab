const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const deviceRoutes = require('./routes/deviceRoutes');
const groupRoutes = require('./routes/groupRoutes');
const connectionRoutes = require('./routes/connectionRoutes');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/easylab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// WebSocket обработчики
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Экспортируем io для использования в маршрутах
app.set('io', io);

// Маршруты
app.use('/api/devices', deviceRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/connections', connectionRoutes);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 