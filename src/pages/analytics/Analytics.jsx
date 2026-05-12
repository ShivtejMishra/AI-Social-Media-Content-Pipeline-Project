import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/contentApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, Sparkles, Image, Calendar, FolderKanban } from 'lucide-react';
import { StatCardSkeleton } from '../../components/loaders/Skeleton';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#1DA1F2', '#E1306C'];

const Analytics = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
    select: (res) => res.data.data,
  });

  const overview = analyticsData?.overview || {};
  const charts = analyticsData?.charts || {};
  const usageStats = analyticsData?.usageStats || {};

  const StatCard = ({ icon: Icon, label, value, sublabel, color = 'indigo' }) => {
    if (isLoading) return <StatCardSkeleton />;
    const colors = {
      indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-400',
      blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
      green: 'from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-600 dark:text-green-400',
      purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
    };
    return (
      <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 space-y-2`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <Icon className={`w-4 h-4 ${colors[color].split(' ')[3]}`} />
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value ?? '—'}</p>
        {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs">
          <p className="text-slate-600 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-slate-900 dark:text-white font-bold">{payload[0].value} items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Analytics Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Your content performance and usage overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total Workspaces" value={overview.totalWorkspaces} sublabel="Active" color="indigo" />
        <StatCard icon={Sparkles} label="Total Content" value={overview.totalContent} sublabel={`${overview.contentThisMonth || 0} this month`} color="purple" />
        <StatCard icon={Image} label="Images Generated" value={overview.totalImages} sublabel={`${overview.imagesThisMonth || 0} this month`} color="blue" />
        <StatCard icon={Calendar} label="Scheduled Posts" value={overview.totalScheduled} sublabel="Upcoming" color="green" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Content by Platform Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Content by Platform</h3>
          {isLoading ? (
            <div className="h-56 shimmer rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.contentByPlatform} barSize={32}>
                <XAxis dataKey="platform" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {charts.contentByPlatform?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Content by Status Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Content by Status</h3>
          {isLoading ? (
            <div className="h-56 shimmer rounded-xl" />
          ) : charts.contentByStatus?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={charts.contentByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, count }) => `${status}: ${count}`}
                  labelLine={false}
                >
                  {charts.contentByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-slate-500 text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Content by Type + Usage */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Content by Type */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Top Content Types</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 shimmer rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(charts.contentByType || []).sort((a, b) => b.count - a.count).slice(0, 6).map((item, i) => {
                const maxCount = Math.max(...(charts.contentByType || []).map(d => d.count));
                const percent = maxCount ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.type} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-28 capitalize truncate">{item.type?.replace('_', ' ')}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${percent}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-8 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Usage Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Monthly Usage</h3>
          <div className="space-y-4">
            {[
              { label: 'Text Generations', key: 'textGenerations', icon: Sparkles, color: '#6366f1' },
              { label: 'Image Generations', key: 'imageGenerations', icon: Image, color: '#8b5cf6' },
              { label: 'Exports', key: 'exports', icon: TrendingUp, color: '#a78bfa' },
            ].map((item) => {
              const used = usageStats.usage?.[item.key] || 0;
              const limit = usageStats.limits?.[item.key];
              const percent = limit && limit !== Infinity ? Math.min(100, (used / limit) * 100) : 0;
              return (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      {item.label}
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">{used} / {limit === Infinity ? '∞' : limit || '—'}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${percent}%`, background: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Current plan: <span className="text-indigo-400 font-semibold capitalize">{usageStats.plan || 'Free'}</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">Usage resets monthly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
