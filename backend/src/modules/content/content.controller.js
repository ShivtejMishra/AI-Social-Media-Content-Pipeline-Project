const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../shared/utils/apiResponse');
const contentService = require('./content.service');

const getContent = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await contentService.getContent(req.user._id, req.query);
  return sendSuccess(res, {
    message: 'Content retrieved',
    data: { content: items },
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const getContentById = asyncHandler(async (req, res) => {
  const content = await contentService.getContentById(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Content retrieved', data: { content } });
});

const updateContent = asyncHandler(async (req, res) => {
  const content = await contentService.updateContent(req.params.id, req.user._id, req.body);
  return sendSuccess(res, { message: 'Content updated', data: { content } });
});

const deleteContent = asyncHandler(async (req, res) => {
  await contentService.deleteContent(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Content deleted', data: {} });
});

const duplicateContent = asyncHandler(async (req, res) => {
  const content = await contentService.duplicateContent(req.params.id, req.user._id);
  return sendCreated(res, { message: 'Content duplicated', data: { content } });
});

const approveContent = asyncHandler(async (req, res) => {
  const content = await contentService.approveContent(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Content approved', data: { content } });
});

module.exports = { getContent, getContentById, updateContent, deleteContent, duplicateContent, approveContent };
