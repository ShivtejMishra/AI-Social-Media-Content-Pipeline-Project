import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

/**
 * WorkspaceLogo — shows workspace logo if available, otherwise the first letter of brand name.
 */
const WorkspaceLogo = ({ workspace, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-3xl',
  };

  // Handle base64 data URIs, full http URLs, and legacy /uploads/ paths
  const logoUrl = workspace?.logoUrl && !imgError
    ? workspace.logoUrl.startsWith('data:') || workspace.logoUrl.startsWith('http')
      ? workspace.logoUrl
      : `${BASE_URL}${workspace.logoUrl}`
    : null;

  return (
    <div
      className={`rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden ${sizeMap[size]} ${className}`}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={workspace?.brandName || 'Workspace'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-bold text-indigo-400 select-none">
          {workspace?.brandName?.[0]?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
};

export default WorkspaceLogo;
