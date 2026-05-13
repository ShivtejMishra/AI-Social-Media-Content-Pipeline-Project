import PlatformIcon from './PlatformIcon.jsx';
export { PlatformIcon };

export const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', color: '#E1306C' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { value: 'twitter', label: 'Twitter / X', color: '#000000' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', color: '#FF0000' },
  { value: 'general', label: 'General Marketing', color: '#6366f1' },
];

export const CONTENT_TYPES = [
  { value: 'caption', label: 'Instagram Caption', platforms: ['instagram', 'general'] },
  { value: 'post', label: 'LinkedIn Post', platforms: ['linkedin', 'general'] },
  { value: 'thread', label: 'Twitter / X Thread', platforms: ['twitter', 'general'] },
  { value: 'hashtags', label: 'Hashtag Set', platforms: ['instagram', 'twitter', 'general'] },
  { value: 'carousel', label: 'Carousel Text', platforms: ['instagram', 'linkedin', 'general'] },
  { value: 'short_copy', label: 'Short Marketing Copy', platforms: ['instagram', 'facebook', 'general'] },
  { value: 'campaign_ideas', label: 'Campaign Ideas', platforms: ['general', 'instagram', 'linkedin', 'facebook'] },
  { value: 'reel_script', label: 'Reel / Video Script', platforms: ['instagram', 'youtube_shorts', 'general'] },
];

export const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual & Friendly' },
  { value: 'witty', label: 'Witty & Playful' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'educational', label: 'Educational' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'humorous', label: 'Humorous' },
];

export const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Japanese', label: 'Japanese' },
];

export const GOALS = [
  { value: 'engagement', label: 'Engagement & Interaction' },
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'community_building', label: 'Community Building' },
  { value: 'education', label: 'Education & Tips' },
  { value: 'inspiration', label: 'Inspiration & Motivation' },
  { value: 'entertainment', label: 'Entertainment & Fun' },
  { value: 'storytelling', label: 'Storytelling & Personal' },
  { value: 'product_launch', label: 'Product / Feature Launch' },
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'sales_conversion', label: 'Sales & Promotion' },
  { value: 'event_promotion', label: 'Event Promotion' },
  { value: 'user_generated', label: 'UGC & Social Proof' },
];

export const IMAGE_PURPOSES = [
  { value: 'social_post', label: 'Social Media Post' },
  { value: 'story', label: 'Story / Reel Cover' },
  { value: 'product_showcase', label: 'Product Showcase' },
  { value: 'infographic', label: 'Infographic / Info Visual' },
  { value: 'quote_card', label: 'Quote Card' },
  { value: 'event_flyer', label: 'Event / Announcement' },
  { value: 'blog_header', label: 'Blog / Article Header' },
  { value: 'ad_creative', label: 'Ad Creative' },
  { value: 'mood_board', label: 'Mood & Inspiration' },
  { value: 'behind_scenes', label: 'Behind the Scenes' },
];

export const CONTENT_STATUS_COLORS = {
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  published: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square 1:1 (Instagram Post)' },
  { value: '4:5', label: 'Portrait 4:5 (Instagram)' },
  { value: '16:9', label: 'Landscape 16:9 (YouTube/LinkedIn)' },
  { value: '9:16', label: 'Story 9:16 (Reels/TikTok)' },
];

export const INDUSTRIES = [
  'Technology', 'E-Commerce', 'Fashion & Beauty', 'Food & Beverage',
  'Health & Wellness', 'Finance', 'Real Estate', 'Education',
  'Travel & Hospitality', 'Entertainment', 'Sports & Fitness',
  'Non-Profit', 'Consulting', 'Marketing & Media', 'Other',
];
