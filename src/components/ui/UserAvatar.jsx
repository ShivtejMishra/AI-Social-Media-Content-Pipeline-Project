import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  // Handle base64 data URIs, full http URLs, and legacy /uploads/ paths
  const avatarUrl = user?.avatar && !imgError
    ? user.avatar.startsWith('data:') || user.avatar.startsWith('http')
      ? user.avatar
      : `${BASE_URL}${user.avatar}`
    : null;

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-indigo-500/20 ${sizeMap[size]} ${className}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.name || 'User'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-bold text-white select-none">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
