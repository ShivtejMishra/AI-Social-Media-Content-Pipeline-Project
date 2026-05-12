import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save, CheckCircle, RefreshCw, Copy, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { contentApi } from '../../services/contentApi';
import { exportApi } from '../../services/exportApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PLATFORMS } from '../../constants/platforms';

const ContentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editedText, setEditedText] = useState('');

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.getById(id),
    select: (res) => res.data.data.content,
  });

  useEffect(() => {
    if (content) {
      const outputText = content.editedOutput?.primaryContent
        || content.output?.primaryContent
        || content.output?.caption
        || content.output?.instagramCaption
        || content.output?.linkedinPost
        || '';
      setEditedText(outputText);
    }
  }, [content]);

  const updateMutation = useMutation({
    mutationFn: (data) => contentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content saved!');
    },
    onError: () => toast.error('Save failed'),
  });

  const approveMutation = useMutation({
    mutationFn: () => contentApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      toast.success('Content approved ✓');
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => exportApi.exportPDF({ contentIds: [id] }),
    onSuccess: (res) => {
      const url = res.data.data.fileUrl;
      if (url) window.open(`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${url}`, '_blank');
      toast.success('PDF exported!');
    },
    onError: () => toast.error('Export failed'),
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
    </div>
  );

  if (!content) return <div className="text-slate-600 dark:text-slate-400">Content not found</div>;

  const platformInfo = PLATFORMS.find(p => p.value === content.platform);
  const output = content.output || {};

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/content')} className="p-2 rounded-xl hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">{content.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge status={content.status} />
            <span className="text-xs text-slate-500">{platformInfo?.icon} {platformInfo?.label}</span>
            <span className="text-xs text-slate-500">• v{content.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            loading={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
          >
            PDF
          </Button>
          {content.status === 'draft' && (
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCircle}
              loading={approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
            >
              Approve
            </Button>
          )}
          <Button
            size="sm"
            icon={Save}
            loading={updateMutation.isPending}
            onClick={() => updateMutation.mutate({
              title: content.title,
              editedOutput: { ...output, primaryContent: editedText }
            })}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Editable Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Main Content</h3>
          <button
            onClick={() => { navigator.clipboard.writeText(editedText); toast.success('Copied!'); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={10}
          className="w-full bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-3 resize-y transition-all font-mono leading-relaxed"
          placeholder="Edit your content here..."
        />
        <p className="text-xs text-slate-500 text-right">{editedText.length} characters</p>
      </div>

      {/* Read-only sections */}
      {output.hook && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-indigo-400 mb-2">🎣 Hook</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{output.hook}</p>
        </div>
      )}

      {output.hashtags?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">#️⃣ Hashtags</p>
          <div className="flex flex-wrap gap-1.5">
            {output.hashtags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {output.twitterThread?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">🧵 Twitter Thread</p>
          <div className="space-y-2">
            {output.twitterThread.map((tweet) => (
              <div key={tweet.tweetNumber} className="bg-slate-800/50 rounded-xl p-3 border-l-2 border-blue-500/40">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">{tweet.tweetNumber}.</p>
                <p className="text-sm text-slate-200">{tweet.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {output.imagePrompt && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">🖼️ Image Prompt</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{output.imagePrompt}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">📊 Metadata</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-slate-500">Platform:</span> <span className="text-slate-700 dark:text-slate-300 capitalize">{content.platform}</span></div>
          <div><span className="text-slate-500">Content Type:</span> <span className="text-slate-700 dark:text-slate-300 capitalize">{content.contentType?.replace('_', ' ')}</span></div>
          <div><span className="text-slate-500">Version:</span> <span className="text-slate-700 dark:text-slate-300">{content.version}</span></div>
          <div><span className="text-slate-500">Created:</span> <span className="text-slate-700 dark:text-slate-300">{new Date(content.createdAt).toLocaleString()}</span></div>
          {output.metadata?.bestPostingTime && (
            <div><span className="text-slate-500">Best Time:</span> <span className="text-slate-700 dark:text-slate-300">{output.metadata.bestPostingTime}</span></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
