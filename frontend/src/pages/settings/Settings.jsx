import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, Lock, Sparkles, Sun, Moon, Camera, Save, Eye, EyeOff, Globe, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import Button from '../../components/ui/Button';
import axios from '../../services/apiClient';
import UserAvatar from '../../components/ui/UserAvatar';

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

/* ─── Shared input class ──────────────────────────────────────────────────── */
const inputCls = 'w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-3 transition-all';

const Settings = () => {
  const { user, setUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const avatarInputRef = useRef();
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    website: user?.website || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [activeSection, setActiveSection] = useState('profile');

  /* ─── Mutations ─────────────────────────────────────────────────────────── */
  const profileMutation = useMutation({
    mutationFn: (data) => axios.patch('/users/profile', data),
    onSuccess: (res) => { setUser(res.data.data.user); toast.success('Profile updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return axios.patch('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => { setUser(res.data.data.user); toast.success('Avatar updated! 🎉'); },
    onError: () => toast.error('Avatar upload failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => axios.patch('/users/password', data),
    onSuccess: () => {
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Password change failed'),
  });

  const handlePasswordSubmit = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    if (passwordForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    passwordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
  };

  // Delete account
  const deleteMutation = useMutation({
    mutationFn: () => axios.delete('/users/account'),
    onSuccess: () => {
      toast.success('Account deleted. Goodbye! 👋');
      queryClient.clear();
      logout();
      navigate('/login');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleDeleteAccount = () => {
    if (deleteConfirm !== user?.email) {
      toast.error('Email does not match — account not deleted');
      return;
    }
    deleteMutation.mutate();
  };

  const sections = [
    { id: 'profile',    label: 'Profile',    icon: User },
    { id: 'security',   label: 'Security',   icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'plan',       label: 'Plan',       icon: Sparkles },
  ];

  /* ─── Tab button ─────────────────────────────────────────────────────────── */
  const Tab = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all
        ${activeSection === id
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </button>
  );

  /* ─── Field wrapper ──────────────────────────────────────────────────────── */
  const Field = ({ label, children, hint }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* ── Mobile: horizontal scrollable tabs ── Desktop: vertical side nav ── */}
      <div className="flex flex-col md:flex-row gap-5">

        {/* Tab nav */}
        <div className="
          flex flex-row md:flex-col
          overflow-x-auto md:overflow-x-visible
          gap-1 pb-1 md:pb-0
          md:w-44 md:flex-shrink-0
          scrollbar-hide
        ">
          {sections.map(s => <Tab key={s.id} {...s} />)}
        </div>

        {/* Content panel — full width on mobile */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ─── Profile ─── */}
          {activeSection === 'profile' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                Profile Information
              </h3>

              {/* Avatar row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative self-start">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden">
                    <UserAvatar user={user} size="xl" className="rounded-2xl w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-lg transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files[0] && avatarMutation.mutate(e.target.files[0])} />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{user?.name}</p>
                  <p className="text-slate-500 text-sm">{user?.email}</p>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-xs text-indigo-500 hover:text-indigo-400 mt-1 transition-colors"
                  >
                    {avatarMutation.isPending ? 'Uploading…' : 'Change photo'}
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <Field label="Display Name">
                  <input value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className={inputCls} />
                </Field>

                <Field label="Email" hint="Email cannot be changed">
                  <input value={user?.email || ''} disabled
                    className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm px-4 py-3 cursor-not-allowed" />
                </Field>

                <Field label="Bio">
                  <textarea value={profileForm.bio}
                    onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell us a bit about yourself…" rows={3} maxLength={500}
                    className={`${inputCls} resize-none`} />
                  <p className="text-xs text-slate-400 text-right">{profileForm.bio.length}/500</p>
                </Field>

                <Field label="Website">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={profileForm.website}
                      onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                      className={`${inputCls} pl-10`} />
                  </div>
                </Field>
              </div>

              <Button icon={Save} loading={profileMutation.isPending}
                onClick={() => profileMutation.mutate(profileForm)} className="w-full sm:w-auto">
                Save Profile
              </Button>
            </div>
          )}

          {/* ─── Security ─── */}
          {activeSection === 'security' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                Change Password
              </h3>

              {[
                { key: 'currentPassword', label: 'Current Password', showKey: 'current' },
                { key: 'newPassword',     label: 'New Password',     showKey: 'new' },
                { key: 'confirmPassword', label: 'Confirm Password', showKey: 'confirm' },
              ].map(({ key, label, showKey }) => (
                <Field key={key} label={label}>
                  <div className="relative">
                    <input
                      type={showPasswords[showKey] ? 'text' : 'password'}
                      value={passwordForm[key]}
                      onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                      className={`${inputCls} pr-10`}
                    />
                    <button type="button"
                      onClick={() => setShowPasswords(p => ({ ...p, [showKey]: !p[showKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      {showPasswords[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
              ))}

              <Button icon={Lock} loading={passwordMutation.isPending}
                onClick={handlePasswordSubmit} className="w-full sm:w-auto">
                Change Password
              </Button>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 font-semibold mb-3 uppercase tracking-wide">Danger Zone</p>
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-3">
                  <p className="text-sm font-medium text-red-500 dark:text-red-400">Delete Account</p>
                  <p className="text-xs text-slate-500">
                    This will permanently delete your account, all workspaces, and generated content. This cannot be undone.
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Type your email <span className="text-red-400 font-semibold">{user?.email}</span> to confirm:
                  </p>
                  <input
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder={user?.email}
                    className="w-full bg-white dark:bg-slate-800 border border-red-500/30 rounded-xl text-slate-900 dark:text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    loading={deleteMutation.isPending}
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== user?.email}
                  >
                    Permanently Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Appearance ─── */}
          {activeSection === 'appearance' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                Appearance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Dark Mode',  value: 'dark',  icon: Moon, desc: 'Easy on the eyes' },
                  { label: 'Light Mode', value: 'light', icon: Sun,  desc: 'Bright and clean' },
                ].map(option => (
                  <button key={option.value}
                    onClick={() => theme !== option.value && toggleTheme()}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      theme === option.value
                        ? 'border-indigo-500/60 bg-indigo-500/10 ring-1 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <option.icon className={`w-4 h-4 ${theme === option.value ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className={`text-sm font-medium ${theme === option.value ? 'text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {option.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{option.desc}</p>
                    {theme === option.value && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Active
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Plan ─── */}
          {activeSection === 'plan' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                Plan & Usage
              </h3>

              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-base font-bold text-slate-900 dark:text-white capitalize">
                      {user?.plan || 'Free'} Plan
                    </p>
                    <p className="text-xs text-slate-500">Current subscription</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
                    {user?.plan || 'FREE'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    ['Text Generations', user?.plan === 'free' ? '50/mo'  : user?.plan === 'pro' ? '1,000/mo' : '10,000/mo'],
                    ['Image Generations', user?.plan === 'free' ? '10/mo' : user?.plan === 'pro' ? '100/mo'   : '1,000/mo'],
                    ['Workspaces',        user?.plan === 'free' ? '3'     : user?.plan === 'pro' ? '20'        : 'Unlimited'],
                    ['Exports',           user?.plan === 'free' ? '5/mo'  : 'Unlimited'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-slate-600 dark:text-slate-400">{label}</span>
                      <span className="text-slate-900 dark:text-white font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {user?.plan !== 'agency' && (
                <div className="text-center p-5 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-slate-900 dark:text-white font-semibold mb-1">
                    Upgrade to {user?.plan === 'free' ? 'Pro' : 'Agency'}
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Get {user?.plan === 'free' ? '20x more' : '10x more'} generations and unlimited features
                  </p>
                  <Button icon={Sparkles} className="w-full sm:w-auto">Upgrade Plan</Button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
