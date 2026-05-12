const STATUS_STYLES = {
  draft: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  scheduled: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  published: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  archived: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  completed: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  missed: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20',
  cancelled: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  generating: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  failed: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20',
};

const Badge = ({ children, status, variant, className = '' }) => {
  const style = status ? STATUS_STYLES[status] : (STATUS_STYLES[variant] || 'bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-600');

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${style} ${className}`}
    >
      {children || status || variant}
    </span>
  );
};

export default Badge;
