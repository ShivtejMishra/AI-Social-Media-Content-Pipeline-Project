import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { toast } from 'sonner';
import { confirmAction } from '../../utils/confirmAction';
import { Calendar, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { scheduleApi, contentApi } from '../../services/contentApi';
import { workspaceApi } from '../../services/workspaceApi';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { PLATFORMS } from '../../constants/platforms';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const TIMEZONES = [
  { value: 'UTC',                 label: 'UTC' },
  { value: 'America/New_York',    label: 'Eastern (ET)' },
  { value: 'America/Chicago',     label: 'Central (CT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'Asia/Kolkata',        label: 'India (IST)' },
  { value: 'Europe/London',       label: 'London (GMT)' },
  { value: 'Asia/Dubai',          label: 'Dubai (GST)' },
  { value: 'Asia/Singapore',      label: 'Singapore (SGT)' },
];

const inputCls = 'w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-3 py-3 transition-all';
const selectCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50';

/* ─── Schedule Modal ─────────────────────────────────────────────────────── */
const ScheduleModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    contentId: '', platform: 'instagram',
    scheduledDate: '', scheduledTime: '09:00',
    timezone: 'UTC', notes: '', workspaceId: '',
  });

  const { data: content } = useQuery({
    queryKey: ['content', { limit: 50 }],
    queryFn: () => contentApi.getAll({ limit: 50 }),
    select: (res) => res.data.data.content,
  });

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.getAll(),
    select: (res) => res.data.data.workspaces,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.contentId || !form.scheduledDate) { toast.error('Content and date are required'); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-t-3xl sm:rounded-2xl p-5 w-full sm:max-w-md animate-fadeIn max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Schedule Content</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Content *" value={form.contentId}
            onChange={(e) => setForm(p => ({ ...p, contentId: e.target.value }))}
            options={(content || []).map(c => ({ value: c._id, label: c.title }))}
            placeholder="Select content..." required />

          <Select label="Workspace" value={form.workspaceId}
            onChange={(e) => setForm(p => ({ ...p, workspaceId: e.target.value }))}
            options={(workspaces || []).map(w => ({ value: w._id, label: w.brandName }))}
            placeholder="Select workspace..." />

          <Select label="Platform" value={form.platform}
            onChange={(e) => setForm(p => ({ ...p, platform: e.target.value }))}
            options={PLATFORMS.map(p => ({ value: p.value, label: p.label }))} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date *</label>
              <input type="date" value={form.scheduledDate}
                onChange={(e) => setForm(p => ({ ...p, scheduledDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Time</label>
              <input type="time" value={form.scheduledTime}
                onChange={(e) => setForm(p => ({ ...p, scheduledTime: e.target.value }))}
                className={inputCls} />
            </div>
          </div>

          <Select label="Timezone" value={form.timezone}
            onChange={(e) => setForm(p => ({ ...p, timezone: e.target.value }))}
            options={TIMEZONES} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
            <textarea value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Any posting notes…" rows={2}
              className={`${inputCls} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" icon={Calendar}>Schedule</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── CalendarView ───────────────────────────────────────────────────────── */
const CalendarView = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal]       = useState(false);
  const [platformFilter, setPlatformFilter] = useState('');
  const [view, setView]                 = useState('month');
  const [date, setDate]                 = useState(new Date());

  const { data: schedules } = useQuery({
    queryKey: ['schedules', platformFilter],
    queryFn: () => scheduleApi.getAll({ platform: platformFilter || undefined }),
    select: (res) => res.data.data.schedules,
  });

  const createMutation = useMutation({
    mutationFn: (data) => scheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Content scheduled! 📅');
      setShowModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Schedule failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule cancelled');
    },
  });

  const events = useMemo(() => (schedules || []).map((s) => {
    const [hours, minutes] = (s.scheduledTime || '09:00').split(':');
    const d = new Date(s.scheduledDate);
    d.setHours(parseInt(hours), parseInt(minutes));
    const pInfo = PLATFORMS.find(p => p.value === s.platform);
    return {
      id: s._id,
      title: `${pInfo?.icon || ''} ${s.contentId?.title || 'Scheduled Post'}`,
      start: d,
      end: new Date(d.getTime() + 60 * 60 * 1000),
      resource: s,
    };
  }), [schedules]);

  const eventStyleGetter = (event) => {
    const cm = { instagram:'#E1306C', linkedin:'#0A66C2', twitter:'#1DA1F2', facebook:'#1877F2', youtube_shorts:'#FF0000', general:'#6366f1' };
    const c  = cm[event.resource?.platform] || '#6366f1';
    return { style: { backgroundColor:`${c}20`, border:`1px solid ${c}40`, borderRadius:'8px', color:'#f1f5f9', fontSize:'11px', padding:'2px 6px' } };
  };

  // Months for picker
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const YEARS  = Array.from({ length: 10 }, (_, i) => date.getFullYear() - 5 + i);

  const calHeight = typeof window !== 'undefined' && window.innerWidth < 640 ? 360 : 510;

  return (
    <div className="space-y-4">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Content Calendar</h2>
          <p className="text-slate-500 text-sm mt-0.5">{schedules?.length || 0} scheduled posts</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}
            className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
            <option value="">All Platforms</option>
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <Button icon={Plus} size="sm" onClick={() => setShowModal(true)} className="whitespace-nowrap">
            <span className="hidden sm:inline">Schedule Post</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* ── Platform badges ── */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map(p => {
          const count = schedules?.filter(s => s.platform === p.value).length || 0;
          if (!count) return null;
          return (
            <div key={p.value} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <span>{p.icon}</span><span>{p.label}</span><span className="text-slate-400">·{count}</span>
            </div>
          );
        })}
      </div>

      {/* ── Calendar card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 overflow-hidden">

        {/* ── Single toolbar ── */}
        <div className="flex flex-col gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          {/* Row 1: nav arrows + month/year pickers */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                onClick={() => { const d = new Date(date); view === 'month' ? d.setMonth(d.getMonth()-1) : d.setDate(d.getDate()-7); setDate(d); }}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDate(new Date())}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">
                Today
              </button>
              <button
                onClick={() => { const d = new Date(date); view === 'month' ? d.setMonth(d.getMonth()+1) : d.setDate(d.getDate()+7); setDate(d); }}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <select value={date.getMonth()}
                onChange={(e) => { const d = new Date(date); d.setMonth(+e.target.value); setDate(d); }}
                className={selectCls}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={date.getFullYear()}
                onChange={(e) => { const d = new Date(date); d.setFullYear(+e.target.value); setDate(d); }}
                className={selectCls}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: view switcher */}
          <div className="flex gap-1">
            {[{ k:'month', l:'Month' }, { k:'week', l:'Week' }, { k:'agenda', l:'List' }].map(v => (
              <button key={v.k} onClick={() => setView(v.k)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  view === v.k ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {v.l}
              </button>
            ))}
          </div>
        </div>

        {/* ── BigCalendar — toolbar=false, fully controlled ── */}
        <style>{`
          .rbc-calendar { font-family: Inter, sans-serif; }
          .rbc-header { padding: 6px 4px; font-size: 11px; font-weight: 600; }
          .rbc-date-cell { padding: 2px 4px; font-size: 11px; }
          .rbc-date-cell.rbc-now { font-weight: 700; }
          .rbc-month-row { min-height: 48px; }
          .rbc-event { font-size: 10px !important; padding: 1px 4px !important; }
          /* Light */
          .rbc-calendar { color: #0f172a; }
          .rbc-header { border-color: #e2e8f0; color: #475569; }
          .rbc-month-view, .rbc-day-bg, .rbc-time-view, .rbc-time-header { border-color: #e2e8f0; }
          .rbc-today { background: rgba(99,102,241,0.06) !important; }
          .rbc-off-range-bg { background: #f8fafc; }
          .rbc-show-more { color: #4f46e5; font-size: 11px; }
          .rbc-date-cell { color: #64748b; }
          .rbc-date-cell.rbc-now { color: #4f46e5; }
          .rbc-agenda-date-cell, .rbc-agenda-time-cell { color: #475569; white-space: nowrap; font-size:13px; }
          .rbc-agenda-event-cell { color: #0f172a; font-size:13px; }
          .rbc-time-content, .rbc-timeslot-group { border-color: #e2e8f0; }
          /* Dark */
          .dark .rbc-calendar { color: #f1f5f9; }
          .dark .rbc-header { border-color: #1e293b; color: #64748b; }
          .dark .rbc-month-view, .dark .rbc-day-bg, .dark .rbc-time-view, .dark .rbc-time-header { border-color: #1e293b; }
          .dark .rbc-today { background: rgba(99,102,241,0.07) !important; }
          .dark .rbc-off-range-bg { background: #0c1220; }
          .dark .rbc-show-more { color: #818cf8; }
          .dark .rbc-date-cell { color: #64748b; }
          .dark .rbc-date-cell.rbc-now { color: #818cf8; }
          .dark .rbc-agenda-date-cell, .dark .rbc-agenda-time-cell { color: #64748b; }
          .dark .rbc-agenda-event-cell { color: #f1f5f9; }
          .dark .rbc-time-content, .dark .rbc-timeslot-group { border-color: #1e293b; }
          .dark .rbc-agenda-view table td, .dark .rbc-agenda-view table th { border-color: #1e293b; }
        `}</style>

        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          onNavigate={setDate}
          view={view}
          onView={setView}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => {
            confirmAction(`Cancel: "${event.title}"?`, () => deleteMutation.mutate(event.id), {
              confirmLabel: 'Cancel Schedule', variant: 'warning',
            });
          }}
          views={['month', 'week', 'agenda']}
          toolbar={false}
          style={{ height: calHeight }}
          popup
        />
      </div>

      {showModal && (
        <ScheduleModal
          onClose={() => setShowModal(false)}
          onSave={(data) => createMutation.mutate(data)}
        />
      )}
    </div>
  );
};

export default CalendarView;
