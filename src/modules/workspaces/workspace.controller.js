const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../../shared/utils/apiResponse');
const workspaceService = require('./workspace.service');
const AppError = require('../../shared/errors/AppError');
const Workspace = require('./workspace.model');

const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.user._id, req.body);
  return sendCreated(res, { message: 'Workspace created successfully', data: { workspace } });
});

const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getUserWorkspaces(req.user._id);
  return sendSuccess(res, { message: 'Workspaces retrieved', data: { workspaces } });
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Workspace retrieved', data: { workspace } });
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateWorkspace(req.params.id, req.user._id, req.body);
  return sendSuccess(res, { message: 'Workspace updated', data: { workspace } });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  await workspaceService.deleteWorkspace(req.params.id, req.user._id);
  return sendSuccess(res, { message: 'Workspace deleted', data: {} });
});

const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No logo file provided');

  // Convert buffer to base64 data URI — stored directly in MongoDB
  const base64 = req.file.buffer.toString('base64');
  const logoUrl = `data:${req.file.mimetype};base64,${base64}`;

  const workspace = await Workspace.findByIdAndUpdate(
    req.params.id,
    { $set: { logoUrl } },
    { new: true }
  );
  return sendSuccess(res, { message: 'Logo updated', data: { workspace, logoUrl } });
});

module.exports = { createWorkspace, getWorkspaces, getWorkspaceById, updateWorkspace, deleteWorkspace, uploadLogo };
