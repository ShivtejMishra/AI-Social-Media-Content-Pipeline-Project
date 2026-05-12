import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save, Sparkles, Globe, Building2, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import { workspaceApi } from '../../services/workspaceApi';
import { useWorkspaceStore } from '../../store/workspaceStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { INDUSTRIES, TONES } from '../../constants/platforms';

const WorkspaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setSelectedWorkspace, selectedWorkspace } = useWorkspaceStore();
  const [formData, setFormData] = useState({});

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceApi.getById(id),
    select: (res) => res.data.data.workspace,
  });

  useEffect(() => {
    if (workspace) setFormData(workspace);
  }, [workspace]);

  const mutation = useMutation({
    mutationFn: (data) => workspaceApi.update(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', id] });
      setSelectedWorkspace(res.data.data.workspace);
      toast.success('Workspace updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
    </div>
  );

  if (!workspace) return <div className="text-slate-600 dark:text-slate-400">Workspace not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app/workspaces')} className="p-2 rounded-xl hover:bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">{workspace.brandName}</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{workspace.name}</p>
        </div>
        <Button icon={Sparkles} size="sm" onClick={() => { setSelectedWorkspace(workspace); navigate('/app/generate'); }}>
          Generate Content
        </Button>
      </div>

      <div className="space-y-4">
        {[
          {
            title: 'Basic Info', icon: Building2,
            fields: [
              { name: 'name', label: 'Workspace Name' },
              { name: 'brandName', label: 'Brand Name' },
              { name: 'industry', label: 'Industry', select: true, options: INDUSTRIES.map(i => ({ value: i, label: i })) },
            ]
          },
          {
            title: 'Brand Identity', icon: Target,
            fields: [
              { name: 'description', label: 'Description', textarea: true },
              { name: 'targetAudience', label: 'Target Audience', textarea: true },
              { name: 'usp', label: 'USP', textarea: true },
              { name: 'brandTone', label: 'Brand Tone', select: true, options: TONES },
            ]
          },
          {
            title: 'Online Presence', icon: Globe,
            fields: [
              { name: 'website', label: 'Website' },
              { name: 'guidelines', label: 'Brand Guidelines', textarea: true },
            ]
          },
        ].map(section => (
          <div key={section.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <section.icon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{section.title}</h3>
            </div>
            {section.fields.map(field => (
              field.textarea ? (
                <div key={field.name} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm px-4 py-2.5 resize-none"
                  />
                </div>
              ) : field.select ? (
                <Select
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  options={field.options}
                />
              ) : (
                <Input
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                />
              )
            ))}
          </div>
        ))}

        <div className="flex justify-end">
          <Button icon={Save} loading={mutation.isPending} onClick={() => mutation.mutate(formData)}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetail;
