import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Image, Sparkles, Download, Trash2, RefreshCw,
  AlertCircle, X, Eye, ArrowLeft, ArrowRight, Send,
} from 'lucide-react';
import { aiApi } from '../../services/aiApi';
import { workspaceApi } from '../../services/workspaceApi';
import { useWorkspaceStore } from '../../store/workspaceStore';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { PLATFORMS, ASPECT_RATIOS, IMAGE_PURPOSES } from '../../constants/platforms';

const VISUAL_STYLES = [
  { value: 'modern, clean, minimalist', label: 'Modern & Minimalist' },
  { value: 'bold, vibrant, energetic', label: 'Bold & Vibrant' },
  { value: 'elegant, luxury, premium', label: 'Elegant & Premium' },
  { value: 'playful, colorful, fun', label: 'Playful & Fun' },
  { value: 'dark, moody, dramatic', label: 'Dark & Dramatic' },
  { value: 'corporate, professional, clean', label: 'Corporate & Professional' },
  { value: 'retro, vintage, classic', label: 'Retro & Vintage' },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const getImageUrl = (image) =>
  image?.imageUrl
    ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${image.imageUrl}`
    : null;

const downloadImage = async (image) => {
  const url = getImageUrl(image);
  if (!url) { toast.error('Image not available'); return; }
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `socialx-${image._id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    toast.success('Image downloaded!');
  } catch {
    toast.error('Download failed');
  }
};

/* ─── Image View Modal ───────────────────────────────────────────────────── */
const ImageViewModal = ({ image, allImages, onClose, onDelete, workspaceId }) => {
  const queryClient = useQueryClient();
  const imageUrl = getImageUrl(image);

  // Find the previous image in the gallery (next older)
  const currentIdx = allImages.findIndex(i => i._id === image._id);
  const prevImage = allImages[currentIdx + 1] || null;
  const prevUrl = getImageUrl(prevImage);

  const [prompt, setPrompt] = useState(image.prompt || '');
  const [generating, setGenerating] = useState(false);

  const regenerateMutation = useMutation({
    mutationFn: (newPrompt) =>
      aiApi.generateImage({
        workspaceId,
        mainMessage: newPrompt,
        platform: image.platform || 'instagram',
        aspectRatio: image.aspectRatio || '1:1',
      }),
    onMutate: () => setGenerating(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('New image generated! Check the gallery.');
      setGenerating(false);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Generation failed');
      setGenerating(false);
    },
  });

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Image Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadImage(image)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={() => { onDelete(image._id); onClose(); }}
              className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-[1fr_340px] gap-6">
          {/* Left: current image */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square">
              {imageUrl
                ? <img src={imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-slate-400"><Image className="w-12 h-12" /></div>
              }
            </div>
            <div className="flex items-center gap-2">
              <Badge status={image.status} />
              <span className="text-xs text-slate-500">{image.aspectRatio}</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-500">{image.platform}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{image.prompt}</p>
          </div>

          {/* Right: previous + re-generate */}
          <div className="space-y-4">

            {/* Previous generated image */}
            {prevImage && prevUrl && (
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Previous Generation</p>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                  <img src={prevUrl} alt="Previous" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prevImage.prompt}</p>
              </div>
            )}

            {/* Re-generate panel */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Regenerate with Changes</p>
              </div>
              <p className="text-xs text-slate-500">Edit the prompt below and generate a new variation.</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                maxLength={2000}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-3 py-2.5 resize-none transition-all"
                placeholder="Describe changes you want..."
              />
              <button
                onClick={() => regenerateMutation.mutate(prompt)}
                disabled={!prompt.trim() || generating}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {generating
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                  : <><Send className="w-4 h-4" /> Generate New Version</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Image Card ─────────────────────────────────────────────────────────── */
const ImageCard = ({ image, onDelete, onView }) => {
  const imageUrl = getImageUrl(image);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all">
      <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        {image.status === 'completed' && imageUrl ? (
          <img src={imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
        ) : image.status === 'generating' ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse mx-auto mb-2" />
              <p className="text-xs text-slate-500">Generating...</p>
            </div>
          </div>
        ) : image.status === 'failed' ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-red-400">Generation failed</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-slate-400" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
          {imageUrl && (
            <>
              <button
                onClick={() => onView(image)}
                title="View"
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadImage(image)}
                title="Download"
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(image._id)}
            title="Delete"
            className="p-2.5 rounded-xl bg-red-500/30 hover:bg-red-500/50 text-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <Badge status={image.status} />
          <span className="text-xs text-slate-500">{image.aspectRatio}</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{image.prompt}</p>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const ImageGenerator = () => {
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspaceStore();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(selectedWorkspace?._id || '');
  const [viewingImage, setViewingImage] = useState(null);

  useEffect(() => {
    if (selectedWorkspace?._id && !activeWorkspaceId) setActiveWorkspaceId(selectedWorkspace._id);
  }, [selectedWorkspace]);

  const [formData, setFormData] = useState({
    platform: 'instagram',
    purpose: 'social_post',
    mainMessage: '',
    subject: '',
    mood: '',
    colorPreference: '',
    campaignTheme: '',
    aspectRatio: '1:1',
    visualStyle: 'modern, clean, minimalist',
    additionalInstructions: '',
  });

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.getAll(),
    select: (res) => res.data.data.workspaces,
  });

  useEffect(() => {
    if (!activeWorkspaceId && workspaces?.length > 0) {
      setActiveWorkspaceId(selectedWorkspace?._id || workspaces[0]._id);
    }
  }, [workspaces]);

  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ['images', activeWorkspaceId],
    queryFn: () => aiApi.getImages({ workspaceId: activeWorkspaceId || undefined }),
    select: (res) => res.data.data.images,
  });

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateImage({ workspaceId: activeWorkspaceId, ...formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Image generated! Check the gallery below.');
    },
    onError: (err) => {
      const data = err.response?.data;
      const code = data?.errorCode;
      if (code === 'VALIDATION_ERROR' && data?.errors?.length) {
        toast.error(data.errors.map(e => `${e.field}: ${e.message}`).join('\n'));
      } else {
        toast.error(data?.message || 'Image generation failed. Try again.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => aiApi.deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Image deleted');
    },
  });

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">AI Image Generator</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Generate stunning social media visuals with Google Imagen 3</p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-indigo-400" /> Image Setup
            </h3>

            <Select label="Workspace" value={activeWorkspaceId} onChange={(e) => setActiveWorkspaceId(e.target.value)}
              options={(workspaces || []).map(w => ({ value: w._id, label: w.brandName }))} placeholder="Select workspace..." />

            <Select label="Platform" value={formData.platform} onChange={(e) => handleChange('platform', e.target.value)}
              options={PLATFORMS.map(p => ({ value: p.value, label: p.label }))} />

            <Select label="Image Purpose" value={formData.purpose} onChange={(e) => handleChange('purpose', e.target.value)}
              options={IMAGE_PURPOSES} />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Main Message / Image Description <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-mono ${formData.mainMessage.length > 1800 ? 'text-red-400' : formData.mainMessage.length > 1400 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {formData.mainMessage.length}/2000
                </span>
              </div>
              <textarea
                value={formData.mainMessage}
                onChange={(e) => handleChange('mainMessage', e.target.value)}
                placeholder={`Describe your image in detail — the more specific, the better.\n\nExamples:\n• "A confident woman in a modern café, golden hour, latte, smiling"\n• "Bold product shot of skincare serum, white marble, minimalist luxury"\n• "Summer sale banner: '50% OFF' in large bold letters, coral & yellow"`}
                rows={7} maxLength={2000}
                className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-3 resize-y transition-all min-h-[140px]"
              />
              <p className="text-xs text-slate-500">💡 Include subject, mood, colors, lighting, style, and any text to appear.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject / What to Show</label>
              <input value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="e.g. A woman reading a book in a cozy café"
                className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-2.5 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mood</label>
                <input value={formData.mood} onChange={(e) => handleChange('mood', e.target.value)}
                  placeholder="e.g. calm, energetic…"
                  className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-2.5 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Color Palette</label>
                <input value={formData.colorPreference} onChange={(e) => handleChange('colorPreference', e.target.value)}
                  placeholder="e.g. pastel, dark blue…"
                  className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-2.5 transition-all" />
              </div>
            </div>

            <Select label="Visual Style" value={formData.visualStyle} onChange={(e) => handleChange('visualStyle', e.target.value)}
              options={VISUAL_STYLES} />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map(ratio => (
                  <button key={ratio.value} onClick={() => handleChange('aspectRatio', ratio.value)}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all ${formData.aspectRatio === ratio.value ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}>
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Extra Instructions</label>
                <span className={`text-xs font-mono ${formData.additionalInstructions.length > 900 ? 'text-red-400' : 'text-slate-400'}`}>
                  {formData.additionalInstructions.length}/1000
                </span>
              </div>
              <textarea
                value={formData.additionalInstructions} onChange={(e) => handleChange('additionalInstructions', e.target.value)}
                placeholder={"Additional details:\n• No text overlays\n• Professional photo style\n• Brand colors: navy and gold"}
                rows={4} maxLength={1000}
                className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-3 resize-y transition-all"
              />
            </div>

            <Button className="w-full" size="lg" icon={Image} loading={generateMutation.isPending}
              onClick={() => {
                if (!activeWorkspaceId) { toast.error('Select a workspace first'); return; }
                if (!formData.mainMessage) { toast.error('Enter a main message'); return; }
                generateMutation.mutate();
              }}>
              {generateMutation.isPending ? 'Generating with Imagen 3...' : 'Generate Image'}
            </Button>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-400 mb-2">💡 How it works</p>
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>1. Gemini crafts a detailed prompt based on your brand</li>
              <li>2. Google Imagen 3 generates the actual image</li>
              <li>3. Image is saved to your workspace gallery</li>
            </ol>
          </div>
        </div>

        {/* Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Image Gallery</h3>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['images'] })}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {imagesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="aspect-square shimmer rounded-2xl" />)}
            </div>
          ) : images?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map(img => (
                <ImageCard
                  key={img._id}
                  image={img}
                  onView={(img) => setViewingImage(img)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">No images generated yet</p>
              <p className="text-slate-500 text-sm mt-1">Fill in the form and click Generate Image</p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewingImage && (
        <ImageViewModal
          image={viewingImage}
          allImages={images || []}
          workspaceId={activeWorkspaceId}
          onClose={() => setViewingImage(null)}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}
    </div>
  );
};

export default ImageGenerator;
