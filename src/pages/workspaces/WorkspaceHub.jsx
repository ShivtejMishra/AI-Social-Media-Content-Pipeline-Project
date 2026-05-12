import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  ArrowLeft, Sparkles, FolderOpen, Image, Calendar, BarChart2,
  Globe, Upload, Plus, Grid, List, ChevronRight, FileText,
  Settings, Clock
} from 'lucide-react';
import { workspaceApi } from '../../services/workspaceApi';
import { contentApi } from '../../services/contentApi';
import { useWorkspaceStore } from '../../store/workspaceStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import WorkspaceLogo from '../../components/ui/WorkspaceLogo';

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', icon: '📸', color: '#E1306C', bg: 'from-pink-500/10 to-rose-500/10 border-pink-500/20' },
  linkedin: { label: 'LinkedIn', icon: '💼', color: '#0A66C2', bg: 'from-blue-600/10 to-blue-500/10 border-blue-600/20' },
  twitter: { label: 'Twitter / X', icon: '🐦', color: '#1DA1F2', bg: 'from-sky-500/10 to-cyan-500/10 border-sky-500/20' },
  facebook: { label: 'Facebook', icon: '📘', color: '#1877F2', bg: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20' },
  youtube_shorts: { label: 'YouTube Shorts', icon: '🎬', color: '#FF0000', bg: 'from-red-500/10 to-orange-500/10 border-red-500/20' },
  general: { label: 'General', icon: '🌐', color: '#6366f1', bg: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20' },
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const PlatformFolder = ({ platform, content, onNavigate }) => {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.general;
  const items = content.filter(c => c.platform === platform);
  if (!items.length) return null;

  return (
    <div
      onClick={() => onNavigate(platform)}
      className={`bg-gradient-to-br ${config.bg} border rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-200 group`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{config.label}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{items.length} piece{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:text-white group-hover:translate-x-1 transition-all" />
      </div>

      {/* Preview of latest 2 */}
      <div className="space-y-1.5">
        {items.slice(0, 2).map(item => (
          <div key={item._id} className="flex items-center gap-2 bg-black/10 rounded-lg px-2 py-1.5">
            <FileText className="w-3 h-3 text-slate-600 dark:text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{item.title}</span>
            <Badge status={item.status} className="ml-auto" />
          </div>
        ))}
        {items.length > 2 && (
          <p className="text-xs text-slate-500 text-center pt-1">+{items.length - 2} more</p>
        )}
      </div>
    </div>
  );
};

const WorkspaceHub = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedWorkspace } = useWorkspaceStore();
  const logoInputRef = useRef();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const { data: workspace, isLoading: wsLoading } = useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceApi.getById(id),
    select: res => res.data.data.workspace,
    onSuccess: (ws) => setSelectedWorkspace(ws),
  });

  const { data: allContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ['content', { workspaceId: id, limit: 200 }],
    queryFn: () => contentApi.getAll({ workspaceId: id, limit: 200 }),
    select: res => res.data.data?.content || [],
  });

  const logoMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('logo', file);
      return workspaceApi.uploadLogo(id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', id] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Brand logo updated!');
    },
    onError: () => toast.error('Logo upload failed'),
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) logoMutation.mutate(file);
  };

  const platformsWithContent = Object.keys(PLATFORM_CONFIG).filter(p =>
    allContent.some(c => c.platform === p)
  );

  const filteredContent = selectedPlatform
    ? allContent.filter(c => c.platform === selectedPlatform)
    : allContent;

  const stats = {
    total: allContent.length,
    draft: allContent.filter(c => c.status === 'draft').length,
    approved: allContent.filter(c => c.status === 'approved').length,
    scheduled: allContent.filter(c => c.status === 'scheduled').length,
  };

  if (wsLoading) return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {[1, 2, 3].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
    </div>
  );

  if (!workspace) return <div className="text-slate-600 dark:text-slate-400">Workspace not found</div>;

  const logoUrl = workspace.logoUrl ? `${BASE_URL}${workspace.logoUrl}` : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Header ───────────────────────── */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/workspaces')} className="p-2 rounded-xl hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1" />
        <Button variant="secondary" size="sm" icon={Settings} onClick={() => navigate(`/app/workspaces/${id}/edit`)}>
          Edit Settings
        </Button>
        <Button size="sm" icon={Sparkles} onClick={() => { setSelectedWorkspace(workspace); navigate('/app/generate'); }}>
          Generate Content
        </Button>
      </div>

      {/* ─── Workspace Identity Card ──────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30" />

        <div className="px-6 pb-6">
          {/* Logo + Name */}
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 border-slate-900 overflow-hidden">
                <WorkspaceLogo workspace={workspace} size="xl" />
              </div>
              <button
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors"
                title="Upload logo"
              >
                <Upload className="w-3 h-3 text-white" />
              </button>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>

            <div className="pb-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">{workspace.brandName}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{workspace.name}</p>
            </div>

            {workspace.website && (
              <a href={workspace.website} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300">
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            )}
          </div>

          {workspace.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{workspace.description}</p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-900 dark:text-white' },
              { label: 'Draft', value: stats.draft, color: 'text-yellow-600 dark:text-yellow-600 dark:text-yellow-400' },
              { label: 'Approved', value: stats.approved, color: 'text-green-600 dark:text-green-600 dark:text-green-400' },
              { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-600 dark:text-blue-600 dark:text-blue-400' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-200 dark:border-slate-700">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Platform Folders ─────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Content by Platform
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedPlatform(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!selectedPlatform ? 'bg-indigo-600 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'}`}
            >
              All
            </button>
            {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
              allContent.some(c => c.platform === key) ? (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(key === selectedPlatform ? null : key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedPlatform === key ? 'bg-indigo-600 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800'}`}
                >
                  {cfg.icon}
                </button>
              ) : null
            ))}
          </div>
        </div>

        {!selectedPlatform ? (
          contentLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-44 shimmer rounded-2xl" />)}
            </div>
          ) : platformsWithContent.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(PLATFORM_CONFIG).map(platform => (
                <PlatformFolder
                  key={platform}
                  platform={platform}
                  content={allContent}
                  onNavigate={(p) => setSelectedPlatform(p)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FolderOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No content yet</p>
              <p className="text-slate-500 text-sm mb-4">Start generating content for this workspace</p>
              <Button icon={Sparkles} size="sm" onClick={() => { setSelectedWorkspace(workspace); navigate('/app/generate'); }}>
                Generate First Content
              </Button>
            </div>
          )
        ) : (
          /* ─── Platform Drill-down view ─── */
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setSelectedPlatform(null)} className="text-xs text-indigo-400 hover:text-indigo-300">
                All Platforms
              </button>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-xs text-slate-900 dark:text-white font-semibold">
                {PLATFORM_CONFIG[selectedPlatform]?.icon} {PLATFORM_CONFIG[selectedPlatform]?.label}
              </span>
              <span className="ml-auto text-xs text-slate-500">{filteredContent.length} items</span>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 mb-3">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:bg-slate-800'}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-100 dark:bg-slate-800'}`}><List className="w-4 h-4" /></button>
            </div>

            {filteredContent.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No content for this platform yet</div>
            ) : viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredContent.map(item => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/app/content/${item._id}`)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 rounded-xl p-4 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-300 truncate flex-1 transition-colors">{item.title}</p>
                      <Badge status={item.status} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {item.output?.primaryContent || item.output?.caption || ''}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                      <span className="ml-auto capitalize">{item.contentType?.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredContent.map(item => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/app/content/${item._id}`)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-300">{item.title}</p>
                    </div>
                    <Badge status={item.status} />
                    <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Quick Actions ─────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Generate Content', icon: Sparkles, action: () => { setSelectedWorkspace(workspace); navigate('/app/generate'); }, color: 'indigo' },
          { label: 'Generate Image', icon: Image, action: () => { setSelectedWorkspace(workspace); navigate('/app/generate/image'); }, color: 'purple' },
          { label: 'Schedule Posts', icon: Calendar, action: () => navigate('/app/calendar'), color: 'blue' },
          { label: 'Analytics', icon: BarChart2, action: () => navigate('/app/analytics'), color: 'green' },
        ].map(action => (
          <button
            key={action.label}
            onClick={action.action}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${action.color}-500/10 group-hover:bg-${action.color}-500/20 transition-colors`}>
              <action.icon className={`w-5 h-5 text-${action.color}-400`} />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceHub;
