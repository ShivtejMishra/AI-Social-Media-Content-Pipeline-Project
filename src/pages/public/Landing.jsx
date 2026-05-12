import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Image as ImageIcon, Calendar, ArrowRight,
  LayoutDashboard, FolderKanban, Library, BarChart3,
  TrendingUp, FileText, Zap, CheckCircle2,
  Plus, Bell, Search,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useUIStore } from '../../store/uiStore';

/* ─── Mini brand icon SVGs ───────────────────────────────────────────────── */
const IgIcon = () => (
  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.265.069 1.645.069 4.849s-.012 3.584-.07 4.849c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.265.058-1.645.069-4.849.069s-3.584-.012-4.849-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.849c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LiIcon = () => (
  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="white">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

/* ─── Feature Card ───────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
      <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

/* ─── Mock Dashboard ─────────────────────────────────────────────────────── */
const MockDashboard = ({ dark }) => {
  const bg      = dark ? 'bg-slate-950'    : 'bg-slate-50';
  const sidebar  = dark ? 'bg-slate-900 border-slate-800'   : 'bg-white border-slate-200';
  const header   = dark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/80';
  const card     = dark ? 'bg-slate-900 border-slate-800'   : 'bg-white border-slate-200';
  const row      = dark ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200';
  const txt      = dark ? 'text-white'     : 'text-slate-900';
  const sub      = dark ? 'text-slate-500' : 'text-slate-400';
  const muted    = dark ? 'text-slate-400' : 'text-slate-500';
  const search   = dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400';
  const bell     = dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500';
  const bar      = dark ? 'bg-slate-800'   : 'bg-slate-200';
  const navItem  = dark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100';
  const aiBox    = dark ? 'bg-slate-900/80' : 'bg-indigo-50';
  const aiTxt    = dark ? 'text-slate-300'  : 'text-indigo-900';
  const aiPill   = dark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-600';

  return (
    <div className={`absolute inset-0 flex ${bg} overflow-hidden text-[10px]`}>

      {/* Sidebar */}
      <div className={`w-[13%] min-w-[80px] ${sidebar} border-r flex flex-col py-3 px-2 gap-1`}>
        <div className="flex items-center gap-1.5 px-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className={`font-bold text-[9px] hidden sm:block ${txt}`}>SocialX</span>
        </div>
        {[
          { icon: LayoutDashboard, label: 'Dashboard', active: true },
          { icon: FolderKanban,    label: 'Workspaces' },
          { icon: Sparkles,        label: 'Generate' },
          { icon: Library,         label: 'Library' },
          { icon: Calendar,        label: 'Calendar' },
          { icon: BarChart3,       label: 'Analytics' },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white' : navItem}`}>
            <Icon className="w-3 h-3 flex-shrink-0" />
            <span className="hidden sm:block truncate">{label}</span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className={`h-10 border-b ${header} flex items-center justify-between px-4 flex-shrink-0`}>
          <div className={`w-20 h-5 ${search} rounded-lg flex items-center px-2 gap-1`}>
            <Search className="w-2.5 h-2.5" />
            <div className={`w-10 h-1.5 ${bar} rounded`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-lg ${bell} flex items-center justify-center`}>
              <Bell className="w-2.5 h-2.5" />
            </div>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-3 space-y-3">

          <div className="flex items-center justify-between">
            <div>
              <div className={`${txt} font-bold text-[11px]`}>Good morning, Shivtej ☀️</div>
              <div className={`${sub} text-[9px]`}>Here's what's happening with your content</div>
            </div>
            <div className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-1 rounded-lg text-[9px] font-semibold">
              <Plus className="w-2.5 h-2.5" /> New Content
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total Content', value: '248', change: '+12%', color: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/20', icon: FileText, iconColor: 'text-indigo-400' },
              { label: 'AI Generations', value: '1.2K', change: '+34%', color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', icon: Sparkles, iconColor: 'text-purple-400' },
              { label: 'Scheduled', value: '36', change: '+8%', color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', icon: Calendar, iconColor: 'text-blue-400' },
              { label: 'Reach', value: '82K', change: '+21%', color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', icon: TrendingUp, iconColor: 'text-emerald-400' },
            ].map((s) => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-2 space-y-1`}>
                <div className="flex items-center justify-between">
                  <span className={`${muted} text-[8px]`}>{s.label}</span>
                  <s.icon className={`w-2.5 h-2.5 ${s.iconColor}`} />
                </div>
                <div className={`${txt} font-bold text-[13px]`}>{s.value}</div>
                <div className="text-emerald-500 text-[8px] font-medium">{s.change} this week</div>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-5 gap-2">

            {/* Recent Content */}
            <div className={`col-span-3 ${card} border rounded-xl p-2.5 space-y-2`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`${txt} font-semibold text-[10px]`}>Recent Content</span>
                <span className="text-indigo-500 text-[8px]">View all</span>
              </div>
              {[
                { title: 'Summer Campaign Launch 🌞', platform: 'instagram', status: 'published', color: 'bg-pink-500' },
                { title: 'Product Feature Thread', platform: 'twitter', status: 'scheduled', color: 'bg-sky-500' },
                { title: 'B2B Growth Strategies', platform: 'linkedin', status: 'draft', color: 'bg-blue-600' },
                { title: 'Weekend Motivation Post', platform: 'instagram', status: 'published', color: 'bg-pink-500' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg ${row} transition-colors`}>
                  <div className={`w-5 h-5 rounded-md ${item.color} flex items-center justify-center flex-shrink-0`}>
                    {item.platform === 'instagram' && <IgIcon />}
                    {item.platform === 'twitter'   && <XIcon />}
                    {item.platform === 'linkedin'  && <LiIcon />}
                  </div>
                  <span className={`${dark ? 'text-slate-300' : 'text-slate-700'} text-[9px] flex-1 truncate`}>{item.title}</span>
                  <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-semibold ${
                    item.status === 'published' ? 'bg-emerald-500/20 text-emerald-500' :
                    item.status === 'scheduled' ? 'bg-blue-500/20 text-blue-500' :
                    dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                  }`}>{item.status}</span>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div className="col-span-2 space-y-2">
              {/* AI Quick Generate */}
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 rounded-xl p-2.5">
                <div className="flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className={`${txt} font-semibold text-[10px]`}>AI Generate</span>
                </div>
                <div className={`${aiBox} rounded-lg p-1.5 mb-2`}>
                  <div className={`${muted} text-[8px] mb-1`}>Describe your content…</div>
                  <div className={`${aiTxt} text-[8px] leading-relaxed`}>"Write an engaging Instagram caption for our new summer collection…"</div>
                </div>
                <div className="flex gap-1">
                  {['Instagram', 'Twitter', 'LinkedIn'].map(p => (
                    <div key={p} className={`flex-1 text-center py-0.5 rounded-md ${aiPill} text-[7px] font-medium`}>{p}</div>
                  ))}
                </div>
                <div className="mt-2 w-full bg-indigo-600 rounded-lg py-1 text-center text-white text-[8px] font-semibold">✨ Generate Now</div>
              </div>

              {/* Platform breakdown */}
              <div className={`${card} border rounded-xl p-2.5`}>
                <span className={`${txt} font-semibold text-[10px] block mb-2`}>Platforms</span>
                <div className="space-y-1.5">
                  {[
                    { name: 'Instagram', pct: 78, color: 'bg-pink-500' },
                    { name: 'LinkedIn',  pct: 55, color: 'bg-blue-600' },
                    { name: 'Twitter',   pct: 42, color: 'bg-sky-500' },
                  ].map(p => (
                    <div key={p.name}>
                      <div className="flex justify-between text-[8px] mb-0.5">
                        <span className={muted}>{p.name}</span>
                        <span className={muted}>{p.pct}%</span>
                      </div>
                      <div className={`h-1 ${bar} rounded-full overflow-hidden`}>
                        <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Landing Page ───────────────────────────────────────────────────────── */
const Landing = () => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Introducing SocialX Studio 2.0</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-display tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]"
          >
            The AI Copilot for Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Social Media Pipeline
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Generate professional captions, threads, and stunning Imagen 3 visuals. Schedule and analyze everything in one beautiful workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-4 h-auto shadow-lg shadow-indigo-500/25">
                Start for free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 py-4 h-auto">
                See how it works
              </Button>
            </a>
          </motion.div>
        </div>

        {/* ── Mock Dashboard Preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-[40px] blur-2xl opacity-60 -z-10" />

          {/* Browser chrome */}
          <div className={`rounded-3xl border ${isDark ? 'border-slate-700/50 bg-slate-900' : 'border-slate-300/50 bg-slate-200'} shadow-2xl overflow-hidden`}>
            {/* Title bar */}
            <div className={`h-9 ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-slate-200 border-slate-300/50'} border-b flex items-center px-4 gap-2 flex-shrink-0`}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className={`mx-auto w-48 h-5 ${isDark ? 'bg-slate-700' : 'bg-slate-300'} rounded-full flex items-center px-3`}>
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[9px] truncate`}>app.socialxstudio.com/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard UI */}
            <div className="aspect-[16/9] relative">
              <MockDashboard dark={isDark} />
              {/* Bottom fade */}
              <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t ${isDark ? 'from-slate-900' : 'from-slate-200'} to-transparent pointer-events-none`} />
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute -left-4 top-1/3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xl hidden md:flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">+82K reach</p>
              <p className="text-[10px] text-slate-500">This week</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, duration: 0.5 }}
            className="absolute -right-4 top-1/4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xl hidden md:flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">AI Generated</p>
              <p className="text-[10px] text-slate-500">1,248 posts</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.5 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 shadow-xl hidden md:flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {['bg-pink-500','bg-indigo-500','bg-emerald-500','bg-amber-500'].map((c,i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-white dark:border-slate-800`} />
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">2,400+ creators using SocialX</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950 relative border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 dark:text-white mb-4">
              Everything you need to scale your brand
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Replace a dozen disjointed tools with one intelligent platform designed for modern creators and agencies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={Sparkles} title="AI Content Generation" description="Instantly generate platform-specific captions, threads, and campaign ideas tailored to your brand's unique tone of voice." delay={0.1} />
            <FeatureCard icon={ImageIcon} title="Google Imagen 3" description="Create stunning, photorealistic images directly inside your workspace without needing external subscriptions." delay={0.2} />
            <FeatureCard icon={Calendar} title="Smart Scheduling" description="Organize your entire pipeline with a visual calendar view. Know exactly what goes out and when." delay={0.3} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6">
            Ready to supercharge your social media?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of creators and agencies saving 10+ hours a week with SocialX Studio.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 shadow-xl px-8 py-4 h-auto text-lg">
              Get Started for Free
            </Button>
          </Link>
          <p className="mt-6 text-sm text-indigo-200">No credit card required • Free forever plan available</p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
