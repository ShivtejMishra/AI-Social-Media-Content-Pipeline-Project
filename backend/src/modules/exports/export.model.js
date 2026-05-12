const mongoose = require('mongoose');

const exportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    exportType: { type: String, enum: ['pdf', 'markdown', 'json', 'zip'], required: true },
    fileUrl: { type: String, default: null },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    contentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

const Export = mongoose.model('Export', exportSchema);
module.exports = Export;
