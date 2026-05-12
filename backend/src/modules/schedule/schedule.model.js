const mongoose = require('mongoose');
const { SCHEDULE_STATUS } = require('../../shared/constants/platforms');

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'linkedin', 'twitter', 'facebook', 'youtube_shorts', 'general'],
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String, // HH:MM format
      required: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(SCHEDULE_STATUS),
      default: SCHEDULE_STATUS.SCHEDULED,
    },
  },
  { timestamps: true }
);

scheduleSchema.index({ userId: 1, scheduledDate: 1 });
scheduleSchema.index({ workspaceId: 1, status: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
