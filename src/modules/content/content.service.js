const Content = require('./content.model');
const AppError = require('../../shared/errors/AppError');

/**
 * Get all content for a user with filtering and pagination
 */
const getContent = async (userId, filters = {}) => {
  const { workspaceId, platform, contentType, status, search, page = 1, limit = 20 } = filters;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { userId, isDeleted: false };
  if (workspaceId) query.workspaceId = workspaceId;
  if (platform) query.platform = platform;
  if (contentType) query.contentType = contentType;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'output.primaryContent': { $regex: search, $options: 'i' } },
      { 'output.caption': { $regex: search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('workspaceId', 'name brandName'),
    Content.countDocuments(query),
  ]);

  return { items, total, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Get single content by ID with ownership check
 */
const getContentById = async (contentId, userId) => {
  const content = await Content.findById(contentId).populate('workspaceId', 'name brandName');

  if (!content || content.isDeleted) {
    throw AppError.notFound('Content not found', 'CONTENT_NOT_FOUND');
  }

  if (content.userId.toString() !== userId.toString()) {
    throw AppError.forbidden('Access denied', 'CONTENT_ACCESS_DENIED');
  }

  return content;
};

/**
 * Update content (title, editedOutput, status)
 */
const updateContent = async (contentId, userId, updateData) => {
  const content = await getContentById(contentId, userId);

  const allowedFields = ['title', 'editedOutput', 'status'];
  const filteredUpdate = {};
  allowedFields.forEach((f) => {
    if (updateData[f] !== undefined) filteredUpdate[f] = updateData[f];
  });

  const updated = await Content.findByIdAndUpdate(contentId, filteredUpdate, { new: true });
  return updated;
};

/**
 * Soft delete content
 */
const deleteContent = async (contentId, userId) => {
  await getContentById(contentId, userId);
  await Content.findByIdAndUpdate(contentId, { isDeleted: true, status: 'archived' });
};

/**
 * Duplicate content
 */
const duplicateContent = async (contentId, userId) => {
  const original = await getContentById(contentId, userId);

  const duplicate = await Content.create({
    userId: original.userId,
    workspaceId: original.workspaceId,
    platform: original.platform,
    contentType: original.contentType,
    title: `${original.title} (Copy)`,
    prompt: original.prompt,
    systemPromptVersion: original.systemPromptVersion,
    input: original.input,
    output: original.output,
    status: 'draft',
    version: 1,
    parentContentId: original._id,
  });

  return duplicate;
};

/**
 * Approve content
 */
const approveContent = async (contentId, userId) => {
  const content = await getContentById(contentId, userId);

  const updated = await Content.findByIdAndUpdate(
    contentId,
    { status: 'approved', approvedBy: userId, approvedAt: new Date() },
    { new: true }
  );

  return updated;
};

module.exports = { getContent, getContentById, updateContent, deleteContent, duplicateContent, approveContent };
