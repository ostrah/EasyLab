const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');

// Получить все соединения для группы
router.get('/', async (req, res) => {
  try {
    const { group } = req.query;
    if (!group) {
      return res.status(400).json({ message: 'Group ID is required' });
    }

    const connections = await Connection.find({ groupId: group })
      .populate('devA', 'name type ip')
      .populate('devB', 'name type ip');

    res.json(connections);
  } catch (err) {
    console.error('Error fetching connections:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Создать новое соединение
router.post('/', async (req, res) => {
  try {
    const { groupId, devA, ifaceA, devB, ifaceB, cableType } = req.body;

    // Проверяем, не существует ли уже такое соединение
    const existingConnection = await Connection.findOne({
      groupId,
      $or: [
        { devA, ifaceA, devB, ifaceB },
        { devA: devB, ifaceA: ifaceB, devB: devA, ifaceB: ifaceA }
      ]
    });

    if (existingConnection) {
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

    await connection.save();
    
    const populatedConnection = await connection
      .populate('devA', 'name type ip')
      .populate('devB', 'name type ip');

    res.status(201).json(populatedConnection);
  } catch (err) {
    console.error('Error creating connection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Удалить соединение
router.delete('/:id', async (req, res) => {
  try {
    const connection = await Connection.findByIdAndDelete(req.params.id);
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    res.json({ message: 'Connection deleted' });
  } catch (err) {
    console.error('Error deleting connection:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Обновить статус соединения
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['up', 'down'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await Connection.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('devA', 'name type ip')
     .populate('devB', 'name type ip');

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    res.json(connection);
  } catch (err) {
    console.error('Error updating connection status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 