const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/apiResponse');
const Content = require('../content/content.model');
const Workspace = require('../workspaces/workspace.model');
const Schedule = require('../schedule/schedule.model');
const ImageAsset = require('../ai/imageAsset.model');
const { getUsageStats } = require('../users/user.service');

/**
 * GET /api/analytics/overview
 */
const getOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalWorkspaces,
    totalContent,
    totalImages,
    totalScheduled,
    contentThisMonth,
    imagesThisMonth,
    contentByPlatform,
    contentByStatus,
    contentByType,
    recentContent,
    usageStats,
  ] = await Promise.all([
    Workspace.countDocuments({ ownerId: userId, isActive: true }),
    Content.countDocuments({ userId, isDeleted: false }),
    ImageAsset.countDocuments({ userId }),
    Schedule.countDocuments({ userId, status: 'scheduled' }),
    Content.countDocuments({ userId, isDeleted: false, createdAt: { $gte: startOfMonth } }),
    ImageAsset.countDocuments({ userId, createdAt: { $gte: startOfMonth } }),
    Content.aggregate([
      { $match: { userId, isDeleted: false } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]),
    Content.aggregate([
      { $match: { userId, isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Content.aggregate([
      { $match: { userId, isDeleted: false } },
      { $group: { _id: '$contentType', count: { $sum: 1 } } },
    ]),
    Content.find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('workspaceId', 'name brandName')
      .select('title platform contentType status createdAt workspaceId'),
    getUsageStats(userId),
  ]);

  return sendSuccess(res, {
    message: 'Analytics overview retrieved',
    data: {
      overview: {
        totalWorkspaces,
        totalContent,
        totalImages,
        totalScheduled,
        contentThisMonth,
        imagesThisMonth,
      },
      charts: {
        contentByPlatform: contentByPlatform.map((d) => ({ platform: d._id, count: d.count })),
        contentByStatus: contentByStatus.map((d) => ({ status: d._id, count: d.count })),
        contentByType: contentByType.map((d) => ({ type: d._id, count: d.count })),
      },
      recentContent,
      usageStats,
    },
  });
});

/**
 * GET /api/analytics/workspace/:id
 */
const getWorkspaceAnalytics = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;
  const userId = req.user._id;

  const [totalContent, contentByPlatform, contentByStatus, totalImages, totalScheduled] = await Promise.all([
    Content.countDocuments({ userId, workspaceId, isDeleted: false }),
    Content.aggregate([
      { $match: { userId, workspaceId: require('mongoose').Types.ObjectId.createFromHexString(workspaceId), isDeleted: false } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
    ]),
    Content.aggregate([
      { $match: { userId, workspaceId: require('mongoose').Types.ObjectId.createFromHexString(workspaceId), isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    ImageAsset.countDocuments({ userId, workspaceId }),
    Schedule.countDocuments({ userId, workspaceId, status: 'scheduled' }),
  ]);

  return sendSuccess(res, {
    message: 'Workspace analytics retrieved',
    data: {
      workspaceId,
      totalContent,
      totalImages,
      totalScheduled,
      contentByPlatform: contentByPlatform.map((d) => ({ platform: d._id, count: d.count })),
      contentByStatus: contentByStatus.map((d) => ({ status: d._id, count: d.count })),
    },
  });
});

/**
 * GET /api/analytics/usage
 */
const getUsage = asyncHandler(async (req, res) => {
  const usageStats = await getUsageStats(req.user._id);
  return sendSuccess(res, { message: 'Usage stats retrieved', data: { usageStats } });
});

module.exports = { getOverview, getWorkspaceAnalytics, getUsage };
