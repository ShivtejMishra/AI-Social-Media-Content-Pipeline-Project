import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Lock, User, Zap, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { authApi } from '../../services/authApi';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Signup = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data) => authApi.signup({ name: data.name, email: data.email, password: data.password }),
    onSuccess: (res) => {
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Account created! Welcome to SocialX Studio, ${user.name}! 🎉`);
      navigate('/app/workspaces/new');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-900 dark:text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xl font-display">SocialX <span className="text-indigo-400">Studio</span></span>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Create your account</h1>
          <p className="text-slate-600 dark:text-slate-400">Start generating AI-powered social media content</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <Input
              {...register('name')}
              label="Full name"
              placeholder="Alex Johnson"
              icon={User}
              error={errors.name?.message}
              autoComplete="name"
            />

            <Input
              {...register('email')}
              label="Email address"
              type="email"
              placeholder="you@company.com"
              icon={Mail}
              error={errors.email?.message}
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`w-full bg-white dark:bg-slate-800/60 border rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm pl-10 pr-10 py-2.5 ${errors.password ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 dark:text-red-400">⚠ {errors.password.message}</p>}
            </div>

            <Input
              {...register('confirmPassword')}
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              icon={Lock}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
              Create Free Account
            </Button>
          </form>

          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs">
          Free plan includes 50 text generations & 10 image generations per month
        </p>
      </div>
    </div>
  );
};

export default Signup;
