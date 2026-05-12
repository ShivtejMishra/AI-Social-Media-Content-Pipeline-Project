const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../shared/utils/apiResponse');
const Content = require('../content/content.model');
const Workspace = require('../workspaces/workspace.model');
const Export = require('./export.model');
const { generatePDF } = require('./pdf.service');
const { generateMarkdown } = require('./markdown.service');
const { generateZip } = require('./zip.service');
const AppError = require('../../shared/errors/AppError');
const { incrementUsage, checkUsageLimit } = require('../users/user.service');
const path = require('path');
const fs = require('fs');

/**
 * Resolve and validate content items for export
 */
const resolveContents = async (userId, contentIds, workspaceId) => {
  let query = { userId, isDeleted: false };

  if (contentIds?.length) {
    query._id = { $in: contentIds };
  } else if (workspaceId) {
    query.workspaceId = workspaceId;
  } else {
    throw AppError.badRequest('Provide contentIds or workspaceId for export', 'EXPORT_NO_TARGET');
  }

  const contents = await Content.find(query).lean();
  if (!contents.length) {
    throw AppError.notFound('No content found for export', 'EXPORT_EMPTY');
  }

  return contents;
};

/**
 * POST /api/exports/pdf
 */
const exportPDF = asyncHandler(async (req, res) => {
  const { contentIds, workspaceId } = req.body;

  const hasLimit = await checkUsageLimit(req.user._id, 'exports');
  if (!hasLimit) throw AppError.badRequest('Export limit reached', 'USAGE_LIMIT_EXCEEDED');

  const contents = await resolveContents(req.user._id, contentIds, workspaceId);
  const workspace = workspaceId ? await Workspace.findById(workspaceId) : null;

  const { filePath, fileUrl, filename } = await generatePDF(contents, workspace?.brandName);

  await Export.create({
    userId: req.user._id,
    workspaceId: workspaceId || null,
    exportType: 'pdf',
    fileUrl,
    status: 'completed',
    contentIds: contents.map((c) => c._id),
  });

  await incrementUsage(req.user._id, 'exports');

  return sendCreated(res, {
    message: 'PDF exported successfully',
    data: { fileUrl, filename },
  });
});

/**
 * POST /api/exports/markdown
 */
const exportMarkdown = asyncHandler(async (req, res) => {
  const { contentIds, workspaceId } = req.body;

  const contents = await resolveContents(req.user._id, contentIds, workspaceId);
  const workspace = workspaceId ? await Workspace.findById(workspaceId) : null;

  const markdown = generateMarkdown(contents, workspace?.brandName);

  await Export.create({
    userId: req.user._id,
    workspaceId: workspaceId || null,
    exportType: 'markdown',
    status: 'completed',
    contentIds: contents.map((c) => c._id),
  });

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="content-export-${Date.now()}.md"`);
  return res.send(markdown);
});

/**
 * POST /api/exports/json
 */
const exportJSON = asyncHandler(async (req, res) => {
  const { contentIds, workspaceId } = req.body;

  const contents = await resolveContents(req.user._id, contentIds, workspaceId);

  await Export.create({
    userId: req.user._id,
    workspaceId: workspaceId || null,
    exportType: 'json',
    status: 'completed',
    contentIds: contents.map((c) => c._id),
  });

  return sendSuccess(res, {
    message: 'JSON export ready',
    data: {
      exportedAt: new Date().toISOString(),
      totalItems: contents.length,
      contents,
    },
  });
});

/**
 * POST /api/exports/zip
 */
const exportZip = asyncHandler(async (req, res) => {
  const { contentIds, workspaceId } = req.body;

  const hasLimit = await checkUsageLimit(req.user._id, 'exports');
  if (!hasLimit) throw AppError.badRequest('Export limit reached', 'USAGE_LIMIT_EXCEEDED');

  const contents = await resolveContents(req.user._id, contentIds, workspaceId);
  const workspace = workspaceId ? await Workspace.findById(workspaceId) : null;

  const { filePath, fileUrl, filename } = await generateZip(contents, workspace?.brandName);

  await Export.create({
    userId: req.user._id,
    workspaceId: workspaceId || null,
    exportType: 'zip',
    fileUrl,
    status: 'completed',
    contentIds: contents.map((c) => c._id),
  });

  await incrementUsage(req.user._id, 'exports');

  return sendCreated(res, {
    message: 'ZIP exported successfully',
    data: { fileUrl, filename },
  });
});

/**
 * GET /api/exports/:id/download — stream file download
 */
const downloadExport = asyncHandler(async (req, res) => {
  const exportRecord = await Export.findOne({ _id: req.params.id, userId: req.user._id });
  if (!exportRecord) throw AppError.notFound('Export not found', 'EXPORT_NOT_FOUND');

  const { getUploadPath } = require('../../config/storage');
  const filename = path.basename(exportRecord.fileUrl || '');
  const exportDir = getUploadPath('exports');
  const filePath = path.join(exportDir, filename);

  if (!fs.existsSync(filePath)) {
    throw AppError.notFound('Export file not found. It may have expired.', 'EXPORT_FILE_NOT_FOUND');
  }

  res.download(filePath, filename);
});

module.exports = { exportPDF, exportMarkdown, exportJSON, exportZip, downloadExport };
