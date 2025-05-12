// backend/routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const Group = require('../models/group');
const Device = require('../models/device');

// const _g = new Group({ name: Date.now(), devices: ['681ce93bc1eda85a4829078b'] })
// _g.save();
///////////////
// Group
//   .findOne({ _id: '6820e07c7b980a8885a1afaa' })
//   .populate('devices')
//   .then(_group => {
//     _group.devices.push('6820e1adb44380883374cea5')
//     _group.save();
//   });


// Создать новую группу
router.post('/', async (req, res) => {
    const group = new Group({ name: req.body.name });
    try {
      const saved = await group.save();
      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// Получить все группы
router.get('/', async (req, res) => {
    const groups = await Group.find().populate('devices');
    res.json(groups);
  });
// Добавить устройство в группу
router.post('/:groupId/add-device', async (req, res) => {
    const { groupId } = req.params;
    const { deviceId } = req.body;
  
    try {
      const group = await Group.findById(groupId);
      if (!group.devices.includes(deviceId)) {
        group.devices.push(deviceId);
        await group.save();
      }
      res.json({ message: 'Device added to group' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

router.delete('/:id', async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  await Group.deleteOne({ _id: req.params.id });
  
  res.json({ message: 'Device removed from group' });
});

// Удалить устройство из группы
router.post('/:id/remove', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.devices = group.devices.filter(id => id.toString() !== req.body.deviceId);
    await group.save();

    res.json({ message: 'Device removed from group' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
