import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, Copy, Trash2, CheckCircle, Edit, MoreHorizontal, Plus, Library,
  Download, Image, FileText, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { contentApi, scheduleApi } from '../../services/contentApi';
import { aiApi } from '../../services/aiApi';
import { exportApi } from '../../services/exportApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PLATFORMS, CONTENT_TYPES } from '../../constants/platforms';
import { workspaceApi } from '../../services/workspaceApi';
import { confirmAction } from '../../utils/confirmAction';

// ─── Image Card ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

const ImageCard = ({ image, onDelete }) => {
  const imageUrl = image.imageUrl ? `${BASE_URL}${image.imageUrl}` : null;

  const handleDownload = () => {
    if (!imageUrl) { toast.error('Image not available'); return; }
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `socialx-image-${image._id}.png`;
    a.click();
    toast.success('Downloading...');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all">
      <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        {image.status === 'completed' && imageUrl ? (
          <img src={imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
        ) : image.status === 'generating' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
        ) : image.status === 'failed' ? (
          <div className="w-full h-full flex items-center justify-center p-4 text-center">
            <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 mx-auto mb-1" />
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">Failed</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-slate-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
          {imageUrl && (
            <button onClick={handleDownload} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" title="Download">
              <Download className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete(image._id)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <Badge status={image.status} />
          <span className="text-xs text-slate-500">{image.aspectRatio} · {image.platform}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{image.prompt}</p>
      </div>
    </div>
  );
};

// ─── Content Text Card ───────────────────────────────────────────────────────
const ContentCard = ({ content, onDelete, onDuplicate, onApprove, onExport }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const platformEmoji = PLATFORMS.find(p => p.value === content.platform)?.icon || '📄';
  const outputText = content.output?.primaryContent || content.output?.caption || content.output?.instagramCaption || content.output?.linkedinPost || '';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-slate-200 dark:border-slate-700 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{platformEmoji}</span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{content.title}</h4>
            <p className="text-xs text-slate-500">{content.workspaceId?.brandName || 'Unknown'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <Badge status={content.status} />
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-10 w-44 py-1 animate-fadeIn"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {[
                  { label: 'Edit', icon: Edit, action: () => navigate(`/app/content/${content._id}`) },
                  { label: 'Duplicate', icon: Copy, action: () => onDuplicate(content._id) },
                  { label: 'Approve', icon: CheckCircle, action: () => onApprove(content._id), show: content.status === 'draft' },
                  { label: 'Export PDF', icon: Download, action: () => onExport([content._id]) },
                  { label: 'Delete', icon: Trash2, action: () => onDelete(content._id), danger: true },
                ].filter(item => item.show !== false).map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${item.danger ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{outputText || 'No content preview'}</p>

      {content.output?.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {content.output.hashtags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
          {content.output?.hashtags?.length > 3 && (
            <span className="text-[10px] text-slate-500">+{content.output.hashtags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="capitalize">{content.contentType?.replace('_', ' ')}</span>
        <span>•</span>
        <span>{new Date(content.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

// ─── Main: Content Library ───────────────────────────────────────────────────
const ContentLibrary = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('text');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ platform: '', status: '', contentType: '' });
  const [page, setPage] = useState(1);

  // ─ Text content queries
  const { data, isLoading } = useQuery({
    queryKey: ['content', { search, ...filters, page }],
    queryFn: () => contentApi.getAll({ search, ...filters, page, limit: 12 }),
    select: (res) => res.data,
  });

  // ─ Images query
  const { data: images, isLoading: imagesLoading, refetch: refetchImages } = useQuery({
    queryKey: ['images'],
    queryFn: () => aiApi.getImages({}),
    select: (res) => res.data.data.images,
    enabled: activeTab === 'images',
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content'] }); toast.success('Content deleted'); },
    onError: () => toast.error('Delete failed'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => contentApi.duplicate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content'] }); toast.success('Content duplicated'); },
    onError: () => toast.error('Duplicate failed'),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => contentApi.approve(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['content'] }); toast.success('Content approved ✓'); },
    onError: () => toast.error('Approval failed'),
  });

  const exportMutation = useMutation({
    mutationFn: (ids) => exportApi.exportPDF({ contentIds: ids }),
    onSuccess: (res) => {
      const url = res.data.data.fileUrl;
      if (url) window.open(`${BASE_URL}${url}`, '_blank');
      toast.success('PDF exported!');
    },
    onError: () => toast.error('Export failed'),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id) => aiApi.deleteImage(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['images'] }); toast.success('Image deleted'); },
  });

  const items = data?.data?.content || [];
  const meta = data?.meta || {};

  const tabs = [
    { id: 'text', label: 'Text Content', icon: FileText, count: meta.total },
    { id: 'images', label: 'Generated Images', icon: Image, count: images?.length },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Content Library</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">All your generated content in one place</p>
        </div>
        <div className="flex gap-2">
          <Button icon={Sparkles} size="sm" onClick={() => navigate('/app/generate')}>Generate Text</Button>
          <Button icon={Image} size="sm" variant="secondary" onClick={() => navigate('/app/generate/image')}>Generate Image</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count != null && (
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Text Content Tab ─── */}
      {activeTab === 'text' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search content..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm pl-9 pr-4 py-2.5"
              />
            </div>
            <select
              value={filters.platform}
              onChange={(e) => { setFilters(prev => ({ ...prev, platform: e.target.value })); setPage(1); }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-3 py-2.5"
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
            </select>
            <select
              value={filters.status}
              onChange={(e) => { setFilters(prev => ({ ...prev, status: e.target.value })); setPage(1); }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-3 py-2.5"
            >
              <option value="">All Status</option>
              {['draft', 'approved', 'scheduled', 'published', 'archived'].map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 shimmer rounded-2xl" />
              ))}
            </div>
          ) : items.length ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => (
                  <ContentCard
                    key={item._id}
                    content={item}
                    onDelete={(id) => confirmAction('Delete this content?', () => deleteMutation.mutate(id))}
                    onDuplicate={(id) => duplicateMutation.mutate(id)}
                    onApprove={(id) => approveMutation.mutate(id)}
                    onExport={(ids) => exportMutation.mutate(ids)}
                  />
                ))}
              </div>
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Page {page} of {meta.totalPages}</span>
                  <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages}>Next</Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Library className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No content found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {search || filters.platform || filters.status ? 'Try adjusting your filters' : 'Start generating content with AI'}
              </p>
              <Button icon={Plus} onClick={() => navigate('/app/generate')}>Generate Content</Button>
            </div>
          )}
        </>
      )}

      {/* ─── Images Tab ─── */}
      {activeTab === 'images' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">{images?.length || 0} images generated</p>
            <button
              onClick={() => refetchImages()}
              className="p-2 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {imagesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-square shimmer rounded-2xl" />)}
            </div>
          ) : images?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(img => (
                <ImageCard
                  key={img._id}
                  image={img}
                  onDelete={(id) => confirmAction('Delete this image?', () => deleteImageMutation.mutate(id))}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No images yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Generate your first AI image</p>
              <Button icon={Image} onClick={() => navigate('/app/generate/image')}>Generate Image</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContentLibrary;
