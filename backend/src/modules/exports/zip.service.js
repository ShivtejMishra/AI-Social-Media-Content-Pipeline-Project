const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { getUploadPath } = require('../../config/storage');
const { generatePDF } = require('./pdf.service');
const { generateMarkdown } = require('./markdown.service');

/**
 * Generate a ZIP archive containing JSON, Markdown, and PDF exports
 */
const generateZip = async (contents, workspaceName = 'Workspace') => {
  const exportDir = getUploadPath('exports');
  const filename = `export_${Date.now()}.zip`;
  const filePath = path.join(exportDir, filename);
  const fileUrl = `/uploads/exports/${filename}`;

  // Generate sub-exports first
  const [pdfResult] = await Promise.all([generatePDF(contents, workspaceName)]);

  const markdownContent = generateMarkdown(contents, workspaceName);
  const jsonContent = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      workspace: workspaceName,
      totalItems: contents.length,
      contents: contents.map((c) => ({
        id: c._id,
        title: c.title,
        platform: c.platform,
        contentType: c.contentType,
        status: c.status,
        output: c.editedOutput || c.output,
        createdAt: c.createdAt,
      })),
    },
    null,
    2
  );

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', reject);
    output.on('close', () => resolve({ filePath, fileUrl, filename }));

    archive.pipe(output);

    // Add files to ZIP
    archive.append(jsonContent, { name: 'content.json' });
    archive.append(markdownContent, { name: 'content.md' });
    archive.file(pdfResult.filePath, { name: 'content.pdf' });

    archive.finalize();
  });
};

module.exports = { generateZip };
