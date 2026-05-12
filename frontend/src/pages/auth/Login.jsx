import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const [fieldError, setFieldError] = useState({ email: '', password: '' });

  const mutation = useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(from, { replace: true });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      const code = err.response?.data?.errorCode || '';

      // Highlight the specific field that failed
      if (code === 'USER_NOT_FOUND') {
        setFieldError({ email: msg, password: '' });
      } else if (code === 'WRONG_PASSWORD') {
        setFieldError({ email: '', password: msg });
      } else {
        setFieldError({ email: '', password: '' });
      }

      toast.error(msg);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Left Panel — Branding (always dark gradient) */}
      <div className="auth-panel-left hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-12 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-xl font-display">SocialX</span>
            <span className="text-indigo-400 font-bold text-xl"> Studio</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white font-display leading-tight">
              Your AI-Powered<br />
              <span className="gradient-text">Social Media Engine</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Generate platform-perfect content, stunning visuals, and complete campaigns in seconds — powered by Google Gemini AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Content Types', value: '8+' },
              { label: 'Platforms', value: '6' },
              { label: 'AI Models', value: 'Gemini' },
              { label: 'Export Formats', value: 'PDF' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-400 text-sm">© 2026 SocialX Studio. All rights reserved.</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg font-display">SocialX <span className="text-indigo-400">Studio</span></span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Welcome back</h1>
            <p className="text-slate-600 dark:text-slate-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <Input
              {...register('email')}
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={Mail}
              error={errors.email?.message || fieldError.email}
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full bg-white dark:bg-slate-800/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-sm pl-10 pr-10 py-2.5 ${(errors.password || fieldError.password) ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {(errors.password || fieldError.password) && (
                <p className="text-xs text-red-500 dark:text-red-400">⚠ {errors.password?.message || fieldError.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={mutation.isPending}
              onClick={() => setLoginError('')}
            >
              Sign in to SocialX Studio
            </Button>
          </form>

          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
