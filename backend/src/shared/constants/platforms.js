const PLATFORMS = {
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  YOUTUBE_SHORTS: 'youtube_shorts',
  GENERAL: 'general',
};

const CONTENT_TYPES = {
  CAPTION: 'caption',
  POST: 'post',
  THREAD: 'thread',
  HASHTAGS: 'hashtags',
  CAROUSEL: 'carousel',
  SHORT_COPY: 'short_copy',
  CAMPAIGN_IDEAS: 'campaign_ideas',
  REEL_SCRIPT: 'reel_script',
};

const TONES = {
  PROFESSIONAL: 'professional',
  CASUAL: 'casual',
  WITTY: 'witty',
  INSPIRATIONAL: 'inspirational',
  EDUCATIONAL: 'educational',
  PROMOTIONAL: 'promotional',
  STORYTELLING: 'storytelling',
  HUMOROUS: 'humorous',
};

const CONTENT_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

const SCHEDULE_STATUS = {
  SCHEDULED: 'scheduled',
  MISSED: 'missed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const ASPECT_RATIOS = {
  SQUARE: '1:1',
  PORTRAIT: '4:5',
  LANDSCAPE: '16:9',
  STORY: '9:16',
};

const EXPORT_TYPES = {
  PDF: 'pdf',
  MARKDOWN: 'markdown',
  JSON: 'json',
  ZIP: 'zip',
};

module.exports = {
  PLATFORMS,
  CONTENT_TYPES,
  TONES,
  CONTENT_STATUS,
  SCHEDULE_STATUS,
  ASPECT_RATIOS,
  EXPORT_TYPES,
};
