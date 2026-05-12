const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { getUploadPath } = require('../../config/storage');

/**
 * Generate a PDF export for one or more content items
 */
const generatePDF = async (contents, workspaceName = 'Workspace') => {
  return new Promise((resolve, reject) => {
    const exportDir = getUploadPath('exports');
    const filename = `export_${Date.now()}.pdf`;
    const filePath = path.join(exportDir, filename);
    const fileUrl = `/uploads/exports/${filename}`;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .fillColor('#6366f1')
      .font('Helvetica-Bold')
      .text('SocialX Studio', { align: 'center' });

    doc
      .fontSize(14)
      .fillColor('#1f2937')
      .font('Helvetica')
      .text(`Content Export — ${workspaceName}`, { align: 'center' });

    doc.moveDown().fontSize(10).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.moveDown(2);

    // Content items
    contents.forEach((content, index) => {
      if (index > 0) {
        doc.addPage();
      }

      const output = content.editedOutput || content.output || {};

      // Title & metadata
      doc.rect(50, doc.y, 495, 2).fill('#6366f1');
      doc.moveDown(0.5);

      doc
        .fontSize(16)
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .text(content.title || 'Untitled Content');

      doc.moveDown(0.3);

      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text(`Platform: ${content.platform?.toUpperCase()} | Type: ${content.contentType} | Status: ${content.status}`);

      doc.moveDown(0.5);

      // Primary content
      if (output.primaryContent || output.caption || output.linkedinPost || output.instagramCaption) {
        doc.fontSize(12).fillColor('#374151').font('Helvetica-Bold').text('Content:');
        doc.moveDown(0.3);
        doc
          .fontSize(11)
          .fillColor('#1f2937')
          .font('Helvetica')
          .text(output.primaryContent || output.caption || output.linkedinPost || output.instagramCaption || '', {
            width: 495,
            align: 'left',
          });
        doc.moveDown();
      }

      // Hook
      if (output.hook) {
        doc.fontSize(12).fillColor('#374151').font('Helvetica-Bold').text('Hook:');
        doc.fontSize(11).fillColor('#1f2937').font('Helvetica').text(output.hook, { width: 495 });
        doc.moveDown();
      }

      // Hashtags
      if (output.hashtags?.length) {
        doc.fontSize(12).fillColor('#374151').font('Helvetica-Bold').text('Hashtags:');
        doc
          .fontSize(11)
          .fillColor('#6366f1')
          .font('Helvetica')
          .text(output.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '), { width: 495 });
        doc.moveDown();
      }

      // Twitter Thread
      if (output.twitterThread?.length) {
        doc.fontSize(12).fillColor('#374151').font('Helvetica-Bold').text('Twitter/X Thread:');
        output.twitterThread.forEach((tweet) => {
          doc.fontSize(11).fillColor('#1f2937').font('Helvetica').text(`${tweet.tweetNumber}. ${tweet.text}`, { width: 495 });
          doc.moveDown(0.3);
        });
        doc.moveDown();
      }

      // Carousel
      if (output.carouselSlides?.length) {
        doc.fontSize(12).fillColor('#374151').font('Helvetica-Bold').text('Carousel Slides:');
        output.carouselSlides.forEach((slide) => {
          doc.fontSize(11).fillColor('#374151').font('Helvetica-Bold').text(`Slide ${slide.slideNumber}: ${slide.headline}`);
          doc.fontSize(10).fillColor('#1f2937').font('Helvetica').text(slide.body, { width: 495 });
          doc.moveDown(0.3);
        });
        doc.moveDown();
      }

      // Image prompt
      if (output.imagePrompt) {
        doc.fontSize(12).fillColor('#374151').font('Helvetica-Bold').text('Image Prompt:');
        doc.fontSize(10).fillColor('#6b7280').font('Helvetica').text(output.imagePrompt, { width: 495 });
        doc.moveDown();
      }

      // Footer
      doc.fontSize(8).fillColor('#9ca3af').text(`Created: ${new Date(content.createdAt).toLocaleString()}`, { align: 'right' });
    });

    doc.end();

    stream.on('finish', () => resolve({ filePath, fileUrl, filename }));
    stream.on('error', reject);
  });
};

module.exports = { generatePDF };
