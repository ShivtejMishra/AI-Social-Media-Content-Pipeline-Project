const Schedule = require('./schedule.model');
const Content = require('../content/content.model');
const AppError = require('../../shared/errors/AppError');

const createSchedule = async (userId, data) => {
  const content = await Content.findById(data.contentId);
  if (!content || content.isDeleted) {
    throw AppError.notFound('Content not found', 'CONTENT_NOT_FOUND');
  }
  if (content.userId.toString() !== userId.toString()) {
    throw AppError.forbidden('Access denied', 'SCHEDULE_ACCESS_DENIED');
  }

  const schedule = await Schedule.create({ userId, ...data });

  // Update content status to scheduled
  await Content.findByIdAndUpdate(data.contentId, { status: 'scheduled' });

  return Schedule.findById(schedule._id)
    .populate('contentId', 'title platform contentType output')
    .populate('workspaceId', 'name brandName');
};

const getSchedules = async (userId, filters = {}) => {
  const { workspaceId, platform, status, startDate, endDate } = filters;

  const query = { userId };
  if (workspaceId) query.workspaceId = workspaceId;
  if (platform) query.platform = platform;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate);
    if (endDate) query.scheduledDate.$lte = new Date(endDate);
  }

  return Schedule.find(query)
    .sort({ scheduledDate: 1 })
    .populate('contentId', 'title platform contentType output')
    .populate('workspaceId', 'name brandName');
};

const getScheduleById = async (scheduleId, userId) => {
  const schedule = await Schedule.findById(scheduleId)
    .populate('contentId')
    .populate('workspaceId', 'name brandName');

  if (!schedule) throw AppError.notFound('Schedule not found', 'SCHEDULE_NOT_FOUND');
  if (schedule.userId.toString() !== userId.toString()) {
    throw AppError.forbidden('Access denied', 'SCHEDULE_ACCESS_DENIED');
  }

  return schedule;
};

const updateSchedule = async (scheduleId, userId, updateData) => {
  await getScheduleById(scheduleId, userId);
  return Schedule.findByIdAndUpdate(scheduleId, updateData, { new: true })
    .populate('contentId', 'title platform contentType')
    .populate('workspaceId', 'name brandName');
};

const deleteSchedule = async (scheduleId, userId) => {
  await getScheduleById(scheduleId, userId);
  await Schedule.findByIdAndDelete(scheduleId);
};

module.exports = { createSchedule, getSchedules, getScheduleById, updateSchedule, deleteSchedule };
