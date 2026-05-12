const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../shared/utils/apiResponse');
const scheduleService = require('./schedule.service');

const createSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.user._id, req.body);
  return sendCreated(res, { message: 'Schedule created', data: { schedule } });
});

const getSchedules = asyncHandler(async (req, res) => {
  const schedules = await scheduleService.getSchedules(req.user._id, req.query);
  return sendSuccess(res, { message: 'Schedules retrieved', data: { schedules } });
});

const getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Schedule retrieved', data: { schedule } });
});

const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.updateSchedule(req.params.id, req.user._id, req.body);
  return sendSuccess(res, { message: 'Schedule updated', data: { schedule } });
});

const deleteSchedule = asyncHandler(async (req, res) => {
  await scheduleService.deleteSchedule(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Schedule deleted', data: {} });
});

module.exports = { createSchedule, getSchedules, getScheduleById, updateSchedule, deleteSchedule };
