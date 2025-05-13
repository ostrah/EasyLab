const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');

// Получить все соединения для группы
router.get('/', async (req, res) => {
  try {
    const { group } = req.query;
    console.log('🔍 Fetching connections for group:', group);
    
    if (!group) {
      console.log('❌ Group ID is required');
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const connections = await Connection.find({ groupId: group })
      .populate('devA', 'name type ip')
      .populate('devB', 'name type ip');

    console.log('✅ Found connections:', connections);
    res.json(connections);
  } catch (err) {
    console.error('❌ Error fetching connections:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Создать новое соединение
router.post('/', async (req, res) => {
  try {
    const { groupId, devA, ifaceA, devB, ifaceB, cableType } = req.body;
    console.log('🔌 Creating new connection:', {
      groupId,
      devA,
      ifaceA,
      devB,
      ifaceB,
      cableType
    });

    // Проверяем, не существует ли уже такое соединение
    const existingConnection = await Connection.findOne({
      groupId,
      $or: [
        { devA, ifaceA, devB, ifaceB },
        { devA: devB, ifaceA: ifaceB, devB: devA, ifaceB: ifaceA }
      ]
    });

    if (existingConnection) {
      console.log('❌ Connection already exists:', existingConnection);
      return res.status(400).json({ 
        message: 'Connection already exists between these interfaces' 
      });
    }

    // Проверяем, не заняты ли порты
    const portInUse = await Connection.findOne({
      groupId,
      $or: [
        { devA, ifaceA },
        { devB, ifaceB },
        { devA: devB, ifaceA: ifaceB },
        { devB: devA, ifaceB: ifaceA }
      ]
    });

    if (portInUse) {
      console.log('❌ Port already in use:', portInUse);
      return res.status(400).json({ 
        message: 'One or both interfaces are already in use' 
      });
    }

    const connection = new Connection({
      groupId,
      devA,
      ifaceA,
      devB,
      ifaceB,
      cableType: cableType || 'UTP'
    });

    console.log('💾 Saving new connection:', connection);
    await connection.save();
    
    const populatedConnection = await connection
      .populate('devA', 'name type ip')
      .populate('devB', 'name type ip');

    console.log('✅ Connection created successfully:', populatedConnection);
    res.status(201).json(populatedConnection);
  } catch (err) {
    console.error('❌ Error creating connection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Удалить соединение
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting connection:', req.params.id);
    const connection = await Connection.findByIdAndDelete(req.params.id);
    if (!connection) {
      console.log('❌ Connection not found');
      return res.status(404).json({ message: 'Connection not found' });
    }
    console.log('✅ Connection deleted successfully');
    res.json({ message: 'Connection deleted' });
  } catch (err) {
    console.error('❌ Error deleting connection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Обновить статус соединения
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    console.log('🔄 Updating connection status:', { id: req.params.id, status });

    if (!['up', 'down'].includes(status)) {
      console.log('❌ Invalid status:', status);
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await Connection.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('devA', 'name type ip')
     .populate('devB', 'name type ip');

    if (!connection) {
      console.log('❌ Connection not found');
      return res.status(404).json({ message: 'Connection not found' });
    }

    console.log('✅ Connection status updated:', connection);
    res.json(connection);
  } catch (err) {
    console.error('❌ Error updating connection status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 