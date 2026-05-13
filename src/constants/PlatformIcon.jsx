// Real SVG brand icons — no emojis
const PlatformIcon = ({ platform, size = 20 }) => {
  const icons = {
    instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
      </svg>
    ),
    linkedin: (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#0A66C2" />
        <path d="M7.5 9.5H5.5V18H7.5V9.5ZM6.5 8.5C7.05 8.5 7.5 8.05 7.5 7.5C7.5 6.95 7.05 6.5 6.5 6.5C5.95 6.5 5.5 6.95 5.5 7.5C5.5 8.05 5.95 8.5 6.5 8.5Z" fill="white" />
        <path d="M18.5 18H16.5V13.5C16.5 12.4 15.6 11.5 14.5 11.5C13.4 11.5 12.5 12.4 12.5 13.5V18H10.5V9.5H12.5V10.6C13.1 9.9 14 9.5 15 9.5C16.9 9.5 18.5 11.1 18.5 13V18Z" fill="white" />
      </svg>
    ),
    twitter: (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#000" />
        <path d="M17.5 4.5H20L14.5 10.8L21 19.5H15.8L11.7 13.8L7 19.5H4.5L10.4 12.8L4.2 4.5H9.5L13.2 9.7L17.5 4.5ZM16.5 18H17.8L8.6 5.8H7.2L16.5 18Z" fill="white" />
      </svg>
    ),
    facebook: (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#1877F2" />
        <path d="M16 8H14C13.45 8 13 8.45 13 9V11H16L15.5 14H13V21H10V14H8V11H10V9C10 7.34 11.34 6 13 6H16V8Z" fill="white" />
      </svg>
    ),
    youtube_shorts: (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#FF0000" />
        <path d="M20 7.5C20 7.5 19.8 6.2 19.2 5.6C18.5 4.9 17.7 4.9 17.3 4.8C15.1 4.7 12 4.7 12 4.7C12 4.7 8.9 4.7 6.7 4.8C6.3 4.9 5.5 4.9 4.8 5.6C4.2 6.2 4 7.5 4 7.5C4 7.5 3.8 9 3.8 10.5V11.9C3.8 13.4 4 14.9 4 14.9C4 14.9 4.2 16.2 4.8 16.8C5.5 17.5 6.4 17.5 6.9 17.6C8.4 17.7 12 17.7 12 17.7C12 17.7 15.1 17.7 17.3 17.6C17.7 17.5 18.5 17.5 19.2 16.8C19.8 16.2 20 14.9 20 14.9C20 14.9 20.2 13.4 20.2 11.9V10.5C20.2 9 20 7.5 20 7.5ZM10.2 14.2V9.2L15 11.7L10.2 14.2Z" fill="white" />
      </svg>
    ),
    general: (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <rect width="24" height="24" rx="4" fill="#6366f1" />
        <path d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4ZM12 7C13.1 7 14 7.9 14 9C14 10.1 13.1 11 12 11C10.9 11 10 10.1 10 9C10 7.9 10.9 7 12 7ZM12 17.2C10 17.2 8.29 16.21 7.25 14.7C7.27 13.15 10.5 12.3 12 12.3C13.49 12.3 16.73 13.15 16.75 14.7C15.71 16.21 14 17.2 12 17.2Z" fill="white" />
      </svg>
    ),
  };
  return icons[platform] || icons.general;
};

export default PlatformIcon;
