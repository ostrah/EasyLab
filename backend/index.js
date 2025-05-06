// backend/index.js (update this)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const deviceRoutes = require('../backend/routes/deviceRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/easylab')
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error', err));

app.use('/api', deviceRoutes);


app.listen(3001, () => console.log('✅ Backend running on port 3001'));
