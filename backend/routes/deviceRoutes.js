const express = require('express');
const router = express.Router();
const Device = require('../models/device');

// Получить все устройства
router.get('/devices', async (req, res) => {
    const devices = await Device.find();
    res.json(devices);
});

// Создать новое устройство
router.post('/devices', async (req, res) => {
    const device = new Device({
        name: req.body.name,
        type: req.body.type,
        ipExternal: req.body.ipExternal,
        ipInternal: req.body.ipInternal
    });
    try {
        const newDevice = await device.save();
        res.status(201).json(newDevice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 🚀 Получить связи устройства
router.get('/devices/:id/connections', async (req, res) => {
    try {
        const device = await Device.findById(req.params.id).populate('connections');
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json(device.connections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 🚀 Соединить два устройства
router.post('/devices/:id/connect', async (req, res) => {
    try {
        const { targetId } = req.body;
        const device = await Device.findById(req.params.id);
        const targetDevice = await Device.findById(targetId);

        if (!device || !targetDevice) {
            return res.status(404).json({ message: 'One or both devices not found' });
        }

        if (!device.connections.includes(targetId)) {
            device.connections.push(targetId);
            await device.save();
        }
        if (!targetDevice.connections.includes(device._id)) {
            targetDevice.connections.push(device._id);
            await targetDevice.save();
        }

        res.json({ message: 'Devices connected successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/devices/:id', async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json({ message: 'Device deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
