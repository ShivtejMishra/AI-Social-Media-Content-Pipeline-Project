/**
 * Generate a clean Markdown export for content items
 */
const generateMarkdown = (contents, workspaceName = 'Workspace') => {
  const lines = [];

  lines.push(`# SocialX Studio — Content Export`);
  lines.push(`**Workspace:** ${workspaceName}`);
  lines.push(`**Generated:** ${new Date().toLocaleString()}`);
  lines.push(`**Total Items:** ${contents.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  contents.forEach((content, index) => {
    const output = content.editedOutput || content.output || {};

    lines.push(`## ${index + 1}. ${content.title || 'Untitled Content'}`);
    lines.push('');
    lines.push(`- **Platform:** ${content.platform}`);
    lines.push(`- **Type:** ${content.contentType}`);
    lines.push(`- **Status:** ${content.status}`);
    lines.push(`- **Created:** ${new Date(content.createdAt).toLocaleString()}`);
    lines.push('');

    if (output.hook) {
      lines.push('### 🎣 Hook');
      lines.push(output.hook);
      lines.push('');
    }

    if (output.primaryContent || output.caption || output.instagramCaption || output.linkedinPost) {
      lines.push('### 📝 Content');
      lines.push(output.primaryContent || output.caption || output.instagramCaption || output.linkedinPost || '');
      lines.push('');
    }

    if (output.hashtags?.length) {
      lines.push('### #️⃣ Hashtags');
      lines.push(output.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '));
      lines.push('');
    }

    if (output.twitterThread?.length) {
      lines.push('### 🧵 Twitter Thread');
      output.twitterThread.forEach((t) => {
        lines.push(`**${t.tweetNumber}.** ${t.text}`);
        lines.push('');
      });
    }

    if (output.carouselSlides?.length) {
      lines.push('### 🎠 Carousel Slides');
      output.carouselSlides.forEach((slide) => {
        lines.push(`#### Slide ${slide.slideNumber}: ${slide.headline}`);
        lines.push(slide.body || '');
        lines.push('');
      });
    }

    if (output.reelScript?.hook) {
      lines.push('### 🎬 Reel Script');
      lines.push(`**Hook:** ${output.reelScript.hook}`);
      lines.push(`**CTA:** ${output.reelScript.cta}`);
      lines.push('');
    }

    if (output.imagePrompt) {
      lines.push('### 🖼️ Image Prompt');
      lines.push(`> ${output.imagePrompt}`);
      lines.push('');
    }

    if (output.cta) {
      lines.push('### 📣 CTA');
      lines.push(output.cta);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  return lines.join('\n');
};

module.exports = { generateMarkdown };
