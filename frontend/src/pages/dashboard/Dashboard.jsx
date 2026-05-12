import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, FolderKanban, Image, Calendar, TrendingUp, ArrowRight, Plus, Clock } from 'lucide-react';
import { analyticsApi } from '../../services/contentApi';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { StatCardSkeleton } from '../../components/loaders/Skeleton';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProductTour from '../../components/onboarding/ProductTour';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PLATFORMS } from '../../constants/platforms';

const PLATFORM_COLORS = {
  instagram: '#E1306C', linkedin: '#0A66C2', twitter: '#1DA1F2',
  facebook: '#1877F2', youtube_shorts: '#FF0000', general: '#6366f1',
};

const StatCard = ({ icon: Icon, label, value, sublabel, color = 'indigo', loading }) => {
  if (loading) return <StatCardSkeleton />;

  const colors = {
    indigo: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/20 text-indigo-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/20 text-purple-600 dark:text-purple-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-600 dark:text-blue-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/20 text-green-600 dark:text-green-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value ?? '—'}</p>
        {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const { selectedWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
    select: (res) => res.data.data,
  });

  const overview = analyticsData?.overview || {};
  const charts = analyticsData?.charts || {};
  const recentContent = analyticsData?.recentContent || [];
  const usageStats = analyticsData?.usageStats || {};

  const usagePercent = usageStats.limits?.textGenerations && usageStats.limits.textGenerations !== Infinity
    ? Math.min(100, Math.round((usageStats.usage?.textGenerations / usageStats.limits.textGenerations) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <ProductTour />
      
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div id="tour-welcome">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Here's your content pipeline overview</p>
        </div>
        <Button icon={Sparkles} onClick={() => navigate('/app/generate')}>
          Generate Content
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Workspaces" value={overview.totalWorkspaces} sublabel="Active projects" color="indigo" loading={isLoading} />
        <StatCard icon={Sparkles} label="Total Content" value={overview.totalContent} sublabel={`${overview.contentThisMonth || 0} this month`} color="purple" loading={isLoading} />
        <StatCard icon={Calendar} label="Scheduled" value={overview.totalScheduled} sublabel="Upcoming posts" color="blue" loading={isLoading} />
        <StatCard icon={Image} label="Images Generated" value={overview.totalImages} sublabel={`${overview.imagesThisMonth || 0} this month`} color="green" loading={isLoading} />
      </div>

      {/* Charts + Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Platform Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Content by Platform</h3>
          {isLoading ? (
            <div className="h-48 shimmer rounded-xl" />
          ) : charts.contentByPlatform?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.contentByPlatform}>
                <XAxis dataKey="platform" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                  cursor={{ fill: '#334155' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No content yet. Start generating!</p>
              </div>
            </div>
          )}
        </div>

        {/* Usage Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Monthly Usage</h3>
          <div className="space-y-3">
            {[
              { label: 'Text Generations', used: usageStats.usage?.textGenerations || 0, limit: usageStats.limits?.textGenerations },
              { label: 'Image Generations', used: usageStats.usage?.imageGenerations || 0, limit: usageStats.limits?.imageGenerations },
              { label: 'Exports', used: usageStats.usage?.exports || 0, limit: usageStats.limits?.exports },
            ].map((item) => {
              const percent = item.limit && item.limit !== Infinity
                ? Math.min(100, Math.round((item.used / item.limit) * 100))
                : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>{item.label}</span>
                    <span>{item.used} / {item.limit === Infinity ? '∞' : item.limit}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 capitalize">Plan: <span className="text-indigo-400 font-semibold">{usageStats.plan || 'free'}</span></p>
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Content</h3>
          <Link to="/app/content" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 shimmer rounded-xl" />)}
          </div>
        ) : recentContent.length ? (
          <div className="space-y-2">
            {recentContent.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/app/content/${item._id}`)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm flex-shrink-0">
                  {PLATFORMS.find(p => p.value === item.platform)?.icon || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.workspaceId?.brandName || 'Unknown workspace'}</p>
                </div>
                <Badge status={item.status} />
                <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No content yet</p>
            <p className="text-slate-500 text-sm mb-4">Start by creating a workspace and generating your first post</p>
            <Button icon={Plus} size="sm" onClick={() => navigate('/app/workspaces/new')}>
              Create Workspace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
