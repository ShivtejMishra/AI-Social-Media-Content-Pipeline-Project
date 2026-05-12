import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Download, Trash2, RefreshCw, AlertCircle, Zap, Image as ImageIcon } from 'lucide-react';
import { aiApi } from '../../services/aiApi';
import { workspaceApi } from '../../services/workspaceApi';
import { useWorkspaceStore } from '../../store/workspaceStore';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';

// YouTube brand icon (not exported from lucide-react)
const YoutubeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const THUMBNAIL_STYLES = [
  { value: 'eye-catching, high contrast, professional YouTube thumbnail', label: '🎯 Eye-Catching (Default)' },
  { value: 'cinematic, dramatic lighting, movie-poster style', label: '🎬 Cinematic' },
  { value: 'minimalist, clean, text-focused', label: '✨ Minimalist' },
  { value: 'vibrant, colorful, energetic, pop art', label: '🎨 Vibrant & Colorful' },
  { value: 'dark, moody, mysterious, thriller style', label: '🌑 Dark & Moody' },
  { value: 'educational, infographic style, clean icons', label: '📚 Educational' },
  { value: 'gaming style, neon, futuristic, glowing', label: '🎮 Gaming' },
];

const MOOD_OPTIONS = [
  { value: 'exciting, urgent', label: '⚡ Exciting & Urgent' },
  { value: 'inspiring, motivational', label: '💪 Inspiring' },
  { value: 'shocking, surprising', label: '😱 Shocking' },
  { value: 'funny, humorous, playful', label: '😂 Funny' },
  { value: 'serious, informative', label: '📊 Serious' },
  { value: 'calm, relaxing, cozy', label: '😌 Calm & Relaxing' },
];

const getUrl = (img) =>
  img?.imageUrl
    ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${img.imageUrl}`
    : null;

const downloadImage = async (img) => {
  const url = getUrl(img);
  if (!url) { toast.error('Image not available'); return; }
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `thumbnail-${img._id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.success('Thumbnail downloaded!');
  } catch {
    toast.error('Download failed');
  }
};

/* ─── Thumbnail Card ─────────────────────────────────────────────────────── */
const ThumbnailCard = ({ image, onDelete }) => {
  const url = getUrl(image);
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:border-red-500/30 transition-all">
      {/* 16:9 thumbnail */}
      <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        {image.status === 'completed' && url
          ? <img src={url} alt={image.prompt} className="w-full h-full object-cover" />
          : image.status === 'generating'
          ? <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-red-400 animate-pulse" />
            </div>
          : image.status === 'failed'
          ? <div className="w-full h-full flex items-center justify-center p-4">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-1" />
                <p className="text-xs text-red-400">Failed</p>
              </div>
            </div>
          : <div className="w-full h-full flex items-center justify-center">
              <YoutubeIcon className="w-8 h-8 text-slate-400" />
            </div>
        }

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
          {url && (
            <button onClick={() => downloadImage(image)} title="Download"
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onDelete(image._id)} title="Delete"
            className="p-2.5 rounded-xl bg-red-500/30 hover:bg-red-500/50 text-red-200 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Model badge */}
        <div className="absolute top-2 right-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/90 text-white">
            Nano Banana
          </span>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <Badge status={image.status} />
          <span className="text-xs text-slate-500">16:9</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{image.prompt}</p>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const ThumbnailGenerator = () => {
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspaceStore();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(selectedWorkspace?._id || '');

  const [form, setForm] = useState({
    videoTitle: '',
    videoTopic: '',
    textOverlay: '',
    style: 'eye-catching, high contrast, professional YouTube thumbnail',
    mood: 'exciting, urgent',
    colorScheme: '',
    additionalInstructions: '',
  });

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.getAll(),
    select: (res) => res.data.data.workspaces,
  });

  useEffect(() => {
    if (!activeWorkspaceId && workspaces?.length > 0)
      setActiveWorkspaceId(selectedWorkspace?._id || workspaces[0]._id);
  }, [workspaces]);

  // Reuse the same images endpoint but filter by platform=youtube
  const { data: allImages, isLoading } = useQuery({
    queryKey: ['images', activeWorkspaceId],
    queryFn: () => aiApi.getImages({ workspaceId: activeWorkspaceId || undefined }),
    select: (res) => (res.data.data.images || []).filter(i => i.platform === 'youtube'),
  });

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateThumbnail({ workspaceId: activeWorkspaceId, ...form }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Thumbnail generated! 🎉');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Generation failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => aiApi.deleteImage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['images'] }),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              YouTube Thumbnail Generator
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold">
              <Zap className="w-3 h-3" /> BETA
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Powered by{' '}
            <span className="font-semibold text-amber-500">Nano Banana</span>
            {' '}— Gemini Flash + Imagen 3 for thumbnail-optimised 16:9 visuals
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <YoutubeIcon className="w-4 h-4 text-red-500" /> Thumbnail Setup
            </h3>

            <Select label="Workspace" value={activeWorkspaceId} onChange={(e) => setActiveWorkspaceId(e.target.value)}
              options={(workspaces || []).map(w => ({ value: w._id, label: w.brandName }))} placeholder="Select workspace..." />

            {/* Video Title */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input value={form.videoTitle} onChange={(e) => set('videoTitle', e.target.value)}
                placeholder="e.g. 10 AI Tools That Will Replace Your Job in 2025"
                className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm px-4 py-2.5 transition-all" />
            </div>

            {/* Video Topic */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Video Topic / Description <span className="text-red-500">*</span>
              </label>
              <textarea value={form.videoTopic} onChange={(e) => set('videoTopic', e.target.value)}
                placeholder="What is your video about? Who is the target audience? What's the key message?"
                rows={3} maxLength={500}
                className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm px-4 py-3 resize-none transition-all" />
            </div>

            {/* Text Overlay */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Text on Thumbnail</label>
              <input value={form.textOverlay} onChange={(e) => set('textOverlay', e.target.value)}
                placeholder='e.g. "MUST WATCH" or "50K in 30 Days"'
                className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm px-4 py-2.5 transition-all" />
            </div>

            <Select label="Thumbnail Style" value={form.style} onChange={(e) => set('style', e.target.value)}
              options={THUMBNAIL_STYLES} />

            <Select label="Mood / Emotion" value={form.mood} onChange={(e) => set('mood', e.target.value)}
              options={MOOD_OPTIONS} />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Color Scheme</label>
              <input value={form.colorScheme} onChange={(e) => set('colorScheme', e.target.value)}
                placeholder="e.g. red and white, neon green, dark purple"
                className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm px-4 py-2.5 transition-all" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Extra Instructions</label>
              <textarea value={form.additionalInstructions} onChange={(e) => set('additionalInstructions', e.target.value)}
                placeholder="e.g. Include a shocked person's face, no text overlays, show a laptop"
                rows={3} maxLength={500}
                className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 text-sm px-4 py-3 resize-none transition-all" />
            </div>

            <Button
              className="w-full !bg-red-600 hover:!bg-red-500"
              size="lg"
              icon={YoutubeIcon}
              loading={generateMutation.isPending}
              onClick={() => {
                if (!activeWorkspaceId) { toast.error('Select a workspace first'); return; }
                if (!form.videoTitle) { toast.error('Enter a video title'); return; }
                if (!form.videoTopic) { toast.error('Describe your video topic'); return; }
                generateMutation.mutate();
              }}
            >
              {generateMutation.isPending ? 'Generating with Nano Banana...' : 'Generate Thumbnail'}
            </Button>
          </div>

          {/* Info box */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-500 mb-2">🍌 About Nano Banana (Beta)</p>
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>1. Gemini 2.0 Flash writes an optimised thumbnail prompt</li>
              <li>2. Google Imagen 3 renders it at 16:9 ratio</li>
              <li>3. Results may vary — this model is experimental</li>
            </ol>
          </div>
        </div>

        {/* Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Thumbnail Gallery</h3>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['images'] })}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="aspect-video shimmer rounded-2xl" />)}
            </div>
          ) : allImages?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allImages.map(img => (
                <ThumbnailCard key={img._id} image={img} onDelete={(id) => deleteMutation.mutate(id)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <YoutubeIcon className="w-10 h-10 text-red-400" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">No thumbnails yet</p>
              <p className="text-slate-500 text-sm mt-1">Fill in the form to generate your first thumbnail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThumbnailGenerator;
