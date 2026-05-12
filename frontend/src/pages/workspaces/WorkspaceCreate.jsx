import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Building2, Globe, Users, Target, Palette } from 'lucide-react';
import { workspaceApi } from '../../services/workspaceApi';
import { useWorkspaceStore } from '../../store/workspaceStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { INDUSTRIES, TONES } from '../../constants/platforms';

const schema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  industry: z.string().optional(),
  description: z.string().max(1000).optional(),
  targetAudience: z.string().max(500).optional(),
  usp: z.string().max(500).optional(),
  brandTone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  guidelines: z.string().max(2000).optional(),
});

const WorkspaceCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedWorkspace } = useWorkspaceStore();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { brandTone: 'professional' },
  });

  const mutation = useMutation({
    mutationFn: (data) => workspaceApi.create(data),
    onSuccess: (res) => {
      const workspace = res.data.data.workspace;
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSelectedWorkspace(workspace);
      toast.success(`Workspace "${workspace.brandName}" created! 🎉`);
      navigate('/app/workspaces');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create workspace'),
  });

  const fields = [
    {
      section: 'Basic Info',
      icon: Building2,
      items: [
        { name: 'name', label: 'Workspace Name', placeholder: 'e.g. Nike Campaign Q1', required: true },
        { name: 'brandName', label: 'Brand Name', placeholder: 'e.g. Nike', required: true },
      ],
    },
    {
      section: 'Brand Identity',
      icon: Target,
      items: [
        { name: 'description', label: 'Brand Description', placeholder: 'What does your brand do? What makes it special?', textarea: true, rows: 3 },
        { name: 'targetAudience', label: 'Target Audience', placeholder: 'e.g. Young professionals aged 25-35 interested in fitness' },
        { name: 'usp', label: 'Unique Selling Proposition', placeholder: 'What sets your brand apart from competitors?' },
      ],
    },
    {
      section: 'Online Presence',
      icon: Globe,
      items: [
        { name: 'website', label: 'Website URL', placeholder: 'https://yourbrand.com' },
        { name: 'guidelines', label: 'Brand Guidelines / Notes', placeholder: 'Any specific dos and donts for your brand content...', textarea: true, rows: 3 },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/workspaces')} className="p-2 rounded-xl hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Create Workspace</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Set up your brand identity for AI-powered content generation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
        {fields.map((section) => (
          <div key={section.section} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <section.icon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{section.section}</h3>
            </div>

            {section.items.map((field) =>
              field.textarea ? (
                <div key={field.name} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
                  <textarea
                    {...register(field.name)}
                    placeholder={field.placeholder}
                    rows={field.rows || 3}
                    className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm px-4 py-2.5 resize-none"
                  />
                  {errors[field.name] && <p className="text-xs text-red-500 dark:text-red-400">⚠ {errors[field.name].message}</p>}
                </div>
              ) : (
                <Input
                  key={field.name}
                  {...register(field.name)}
                  label={field.label}
                  placeholder={field.placeholder}
                  required={field.required}
                  error={errors[field.name]?.message}
                />
              )
            )}

            {section.section === 'Brand Identity' && (
              <Select
                {...register('brandTone')}
                label="Brand Tone"
                options={TONES}
                placeholder="Select tone..."
              />
            )}

            {section.section === 'Basic Info' && (
              <Select
                {...register('industry')}
                label="Industry"
                options={INDUSTRIES.map(i => ({ value: i, label: i }))}
                placeholder="Select industry..."
              />
            )}
          </div>
        ))}

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => navigate('/app/workspaces')} type="button">Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Create Workspace</Button>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceCreate;
