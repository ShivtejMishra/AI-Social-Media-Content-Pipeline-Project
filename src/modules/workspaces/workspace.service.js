const Workspace = require('./workspace.model');
const User = require('../users/user.model');
const AppError = require('../../shared/errors/AppError');
const { PLANS } = require('../../shared/constants/plans');

/**
 * Create a new workspace
 */
const createWorkspace = async (userId, data) => {
  // Check workspace limit for user's plan
  const user = await User.findById(userId);
  const plan = PLANS[user.plan];
  const workspaceLimit = plan?.limits?.workspaces;

  if (workspaceLimit !== Infinity) {
    const existingCount = await Workspace.countDocuments({ ownerId: userId, isActive: true });
    if (existingCount >= workspaceLimit) {
      throw AppError.badRequest(
        `Your ${user.plan} plan allows up to ${workspaceLimit} workspaces. Please upgrade to create more.`,
        'WORKSPACE_LIMIT_REACHED'
      );
    }
  }

  const workspace = await Workspace.create({ ownerId: userId, ...data });
  return workspace;
};

/**
 * Get all workspaces for a user (owned + member)
 */
const getUserWorkspaces = async (userId) => {
  const workspaces = await Workspace.find({
    $or: [{ ownerId: userId }, { 'members.userId': userId }],
    isActive: true,
  }).sort({ createdAt: -1 });

  return workspaces;
};

/**
 * Get workspace by ID with access check
 */
const getWorkspaceById = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId).populate('members.userId', 'name email avatar');

  if (!workspace || !workspace.isActive) {
    throw AppError.notFound('Workspace not found', 'WORKSPACE_NOT_FOUND');
  }

  const isOwner = workspace.ownerId.toString() === userId.toString();
  const isMember = workspace.members.some((m) => m.userId?._id?.toString() === userId.toString());

  if (!isOwner && !isMember) {
    throw AppError.forbidden('You do not have access to this workspace', 'WORKSPACE_ACCESS_DENIED');
  }

  return workspace;
};

/**
 * Update workspace
 */
const updateWorkspace = async (workspaceId, userId, updateData) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace || !workspace.isActive) {
    throw AppError.notFound('Workspace not found', 'WORKSPACE_NOT_FOUND');
  }

  if (workspace.ownerId.toString() !== userId.toString()) {
    throw AppError.forbidden('Only the workspace owner can update it', 'WORKSPACE_UPDATE_DENIED');
  }

  // Prevent overwriting ownerId
  delete updateData.ownerId;

  const updated = await Workspace.findByIdAndUpdate(workspaceId, updateData, { new: true, runValidators: true });
  return updated;
};

/**
 * Soft delete workspace
 */
const deleteWorkspace = async (workspaceId, userId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw AppError.notFound('Workspace not found', 'WORKSPACE_NOT_FOUND');
  }

  if (workspace.ownerId.toString() !== userId.toString()) {
    throw AppError.forbidden('Only the workspace owner can delete it', 'WORKSPACE_DELETE_DENIED');
  }

  await Workspace.findByIdAndUpdate(workspaceId, { isActive: false });
};

module.exports = { createWorkspace, getUserWorkspaces, getWorkspaceById, updateWorkspace, deleteWorkspace };
