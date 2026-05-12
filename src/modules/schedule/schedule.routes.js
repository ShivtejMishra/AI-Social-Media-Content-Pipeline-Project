const express = require('express');
const router = express.Router();
const scheduleController = require('./schedule.controller');
const { protect } = require('../auth/auth.middleware');

router.use(protect);

router.post('/', scheduleController.createSchedule);
router.get('/', scheduleController.getSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.patch('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
