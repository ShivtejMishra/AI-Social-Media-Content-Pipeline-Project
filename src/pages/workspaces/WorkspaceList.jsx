import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Users, FileText, Trash2, ExternalLink, Settings, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { workspaceApi } from '../../services/workspaceApi';
import { useWorkspaceStore } from '../../store/workspaceStore';
import Button from '../../components/ui/Button';
import { CardSkeleton } from '../../components/loaders/Skeleton';
import WorkspaceLogo from '../../components/ui/WorkspaceLogo';
import { confirmAction } from '../../utils/confirmAction';

const WorkspaceCard = ({ workspace, onSelect, onDelete, isSelected }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`group bg-white dark:bg-slate-900 border rounded-2xl p-5 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer ${
        isSelected ? 'border-indigo-500/60 ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'
      }`}
      onClick={() => onSelect(workspace)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <WorkspaceLogo workspace={workspace} size="sm" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{workspace.brandName}</h3>
            <p className="text-xs text-slate-500">{workspace.name}</p>
          </div>
        </div>
        {isSelected && (
          <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{workspace.description || 'No description added yet'}</p>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{workspace.memberCount || 1} member{workspace.memberCount !== 1 ? 's' : ''}</span>
        <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{workspace.industry || 'General'}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="xs"
          variant="secondary"
          icon={Sparkles}
          onClick={(e) => { e.stopPropagation(); onSelect(workspace); navigate('/app/generate'); }}
        >
          Generate
        </Button>
        <Button
          size="xs"
          variant="ghost"
          icon={Settings}
          onClick={(e) => { e.stopPropagation(); navigate(`/app/workspaces/${workspace._id}`); }}
        >
          Edit
        </Button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(workspace._id); }}
          className="ml-auto p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const WorkspaceList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspaceStore();

  const { data, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.getAll(),
    select: (res) => res.data.data.workspaces,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => workspaceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace deleted');
    },
    onError: () => toast.error('Failed to delete workspace'),
  });

  const handleSelect = (workspace) => {
    setSelectedWorkspace(workspace);
    toast.success(`Active workspace: ${workspace.brandName}`);
  };

  const handleDelete = (id) => {
    confirmAction('Delete this workspace? This cannot be undone.', () => {
      deleteMutation.mutate(id);
      if (selectedWorkspace?._id === id) setSelectedWorkspace(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Your Workspaces</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Select a workspace to set it as active for content generation</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/app/workspaces/new')}>New Workspace</Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : data?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((workspace) => (
            <WorkspaceCard
              key={workspace._id}
              workspace={workspace}
              onSelect={handleSelect}
              onDelete={handleDelete}
              isSelected={selectedWorkspace?._id === workspace._id}
            />
          ))}
          {/* Create new card */}
          <button
            onClick={() => navigate('/app/workspaces/new')}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 transition-all duration-200 min-h-[200px] group"
          >
            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:border-solid transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Create New Workspace</span>
          </button>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No workspaces yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">Create your first brand workspace to start generating AI-powered content</p>
          <Button icon={Plus} onClick={() => navigate('/app/workspaces/new')}>Create Your First Workspace</Button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;
