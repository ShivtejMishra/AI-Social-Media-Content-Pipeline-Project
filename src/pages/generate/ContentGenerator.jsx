import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, RefreshCw, Copy, Image, ChevronDown, ChevronUp, Save, Zap } from 'lucide-react';
import { workspaceApi } from '../../services/workspaceApi';
import { aiApi } from '../../services/aiApi';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useContentStore } from '../../store/contentStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { PLATFORMS, TONES, GOALS, PlatformIcon } from '../../constants/platforms';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

// ─── Helpers ────────────────────────────────────────────────────────────────
const copyText = (text) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied!');
};

// ─── Output Preview ──────────────────────────────────────────────────────────
const OutputPreview = ({ content }) => {
  const out = content.output || {};
  const primary = out.primaryContent || out.caption || out.instagramCaption || out.linkedinPost || '';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Title row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{content.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge status="draft" />
            <span className="text-xs text-slate-500 capitalize">{content.platform}</span>
          </div>
        </div>
        {primary && (
          <button onClick={() => copyText(primary)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>

      {out.hook && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
          <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1.5">🎣 HOOK</p>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{out.hook}</p>
        </div>
      )}

      {primary && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-500 mb-1.5">📝 CONTENT</p>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{primary}</p>
        </div>
      )}

      {out.twitterThread?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500">🧵 THREAD</p>
          {out.twitterThread.map((t) => (
            <div key={t.tweetNumber} className="bg-sky-500/5 border-l-2 border-sky-500/40 rounded-r-xl p-3">
              <span className="text-xs text-sky-500 font-bold">{t.tweetNumber}.</span>
              <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{t.text}</p>
            </div>
          ))}
        </div>
      )}

      {out.carouselSlides?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500">🎠 CAROUSEL</p>
          {out.carouselSlides.map((s) => (
            <div key={s.slideNumber} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-purple-500 dark:text-purple-400 font-bold mb-1">Slide {s.slideNumber}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.headline}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{s.body}</p>
            </div>
          ))}
        </div>
      )}

      {out.reelScript?.hook && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-orange-500 dark:text-orange-400">🎬 REEL SCRIPT</p>
          <p className="text-sm text-slate-800 dark:text-slate-200"><span className="font-semibold">Hook: </span>{out.reelScript.hook}</p>
          {out.reelScript.voiceover && <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">Voiceover: </span>{out.reelScript.voiceover}</p>}
          {out.reelScript.cta && <p className="text-sm text-slate-800 dark:text-slate-200"><span className="font-semibold">CTA: </span>{out.reelScript.cta}</p>}
        </div>
      )}

      {out.hashtags?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">#️⃣ HASHTAGS</p>
          <div className="flex flex-wrap gap-1.5">
            {out.hashtags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-600 dark:text-indigo-400">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {out.cta && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
          <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">📣 CTA</p>
          <p className="text-sm text-slate-700 dark:text-slate-200">{out.cta}</p>
        </div>
      )}

      {out.imagePrompt && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">🖼️ IMAGE PROMPT</p>
          <p className="text-xs text-slate-500 leading-relaxed">{out.imagePrompt}</p>
        </div>
      )}
    </div>
  );
};

// ─── Platform Pill ───────────────────────────────────────────────────────────
const PlatformPill = ({ p, active, onClick }) => (
  <button
    onClick={() => onClick(p.value)}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
      active
        ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400/50 hover:text-indigo-600 dark:hover:text-indigo-400'
    }`}
  >
    <PlatformIcon platform={p.value} size={16} />
    <span className="hidden sm:inline">{p.label.split('/')[0].trim()}</span>
  </button>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ContentGenerator = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspaceStore();
  const { setGeneratedContent } = useContentStore();

  const [result, setResult] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const [form, setForm] = useState({
    workspaceId: selectedWorkspace?._id || '',
    platform: 'instagram',
    goal: 'engagement',
    tone: 'casual',
    description: '',
    cta: '',
    language: 'English',
    // contentType is inferred by AI — not shown to user
    contentType: 'auto',
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.getAll(),
    select: (res) => res.data.data.workspaces,
  });

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const generateMutation = useMutation({
    mutationFn: (data) => aiApi.generateContent(data),
    onSuccess: (res) => {
      const content = res.data.data.content;
      setResult(content);
      setGeneratedContent(content);
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content ready! ✨');
    },
    onError: (err) => {
      const code = err.response?.data?.errorCode;
      if (code === 'USAGE_LIMIT_EXCEEDED') {
        toast.error('Monthly limit reached. Please upgrade your plan.');
      } else {
        toast.error(err.response?.data?.message || 'Generation failed');
      }
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => aiApi.regenerateContent({ contentId: result._id }),
    onSuccess: (res) => { setResult(res.data.data.content); toast.success('Regenerated!'); },
    onError: () => toast.error('Regeneration failed'),
  });

  const handleGenerate = () => {
    if (!form.workspaceId) { toast.error('Please select a workspace'); return; }
    if (!form.description.trim()) { toast.error('Tell us what you want to post about'); return; }

    // Map description into campaignTheme so the prompt picks it up
    generateMutation.mutate({
      ...form,
      campaignTheme: form.description,
      // Let AI decide format — pass a generic contentType
      contentType: form.platform === 'twitter' ? 'thread' : form.platform === 'linkedin' ? 'post' : 'caption',
    });
  };

  const isPending = generateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-500" /> Generate Content
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">Describe what you want — AI writes the perfect post</p>
      </div>

      {/* ── Main Input Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">

        {/* Workspace selector bar */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Workspace</label>
          <select
            value={form.workspaceId}
            onChange={(e) => set('workspaceId', e.target.value)}
            className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none cursor-pointer"
          >
            <option value="">— choose workspace —</option>
            {workspaces.map((w) => (
              <option key={w._id} value={w._id}>{w.brandName}</option>
            ))}
          </select>
        </div>

        {/* Main textarea */}
        <div className="px-5 pt-4">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What do you want to post about? e.g. &quot;Launching our new summer collection — vibrant colors, fresh styles. Announce it with excitement and include a discount offer.&quot;"
            rows={5}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm leading-relaxed resize-none"
          />
        </div>

        {/* Platform pills */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 mr-1">Platform:</span>
            {PLATFORMS.map((p) => (
              <PlatformPill key={p.value} p={p} active={form.platform === p.value} onClick={(v) => set('platform', v)} />
            ))}
          </div>
        </div>

        {/* Goal row */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Goal:</span>
            <select
              value={form.goal}
              onChange={(e) => set('goal', e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none cursor-pointer rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700"
            >
              {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Tone:</span>
            <select
              value={form.tone}
              onChange={(e) => set('tone', e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none cursor-pointer rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700"
            >
              {TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Optional extras toggle */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-500 transition-colors"
          >
            {showOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showOptions ? 'Less' : 'More options'}
          </button>
        </div>

        {/* Optional extras */}
        {showOptions && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Call to Action</label>
              <input
                value={form.cta}
                onChange={(e) => set('cta', e.target.value)}
                placeholder="e.g. Shop now, Link in bio…"
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 text-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Language</label>
              <select
                value={form.language}
                onChange={(e) => set('language', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              >
                {['English','Hindi','Spanish','French','German','Portuguese','Arabic','Japanese'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Generate button */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Button
            size="md"
            icon={Sparkles}
            loading={isPending}
            onClick={handleGenerate}
            className="flex-1 sm:flex-none"
          >
            {isPending ? 'Generating…' : 'Generate with AI'}
          </Button>
          {result && (
            <>
              <Button variant="secondary" size="md" icon={RefreshCw} loading={regenerateMutation.isPending} onClick={() => regenerateMutation.mutate()}>
                Regenerate
              </Button>
              <Button variant="ghost" size="md" icon={Save} onClick={() => navigate('/app/content')}>
                Library
              </Button>
              <Button variant="ghost" size="md" icon={Image} onClick={() => navigate('/app/generate/image')}>
                Make Image
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Loading State ── */}
      {isPending && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-indigo-500 animate-pulse" />
          </div>
          <p className="text-slate-900 dark:text-white font-semibold">Writing your content…</p>
          <p className="text-slate-500 text-sm">Gemini AI is crafting platform-perfect copy</p>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {!isPending && result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <OutputPreview content={result} />
        </div>
      )}

      {/* ── Empty State ── */}
      {!isPending && !result && (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-900 dark:text-white font-semibold">Your content will appear here</p>
          <p className="text-slate-500 text-sm max-w-xs">Describe your post idea above, pick a platform and goal, then hit Generate</p>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
