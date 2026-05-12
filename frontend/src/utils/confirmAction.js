/**
 * confirmAction — shows a Sonner toast with Confirm/Cancel buttons.
 * Replaces window.confirm() which can be blocked by browsers.
 *
 * Usage:
 *   confirmAction('Delete this workspace?', () => deleteMutation.mutate(id));
 */
import { toast } from 'sonner';

export const confirmAction = (message, onConfirm, options = {}) => {
  const {
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'danger', // 'danger' | 'warning'
  } = options;

  toast(message, {
    duration: 8000,
    action: {
      label: confirmLabel,
      onClick: onConfirm,
    },
    cancel: {
      label: cancelLabel,
      onClick: () => {},
    },
    // Style the toast based on variant
    style:
      variant === 'danger'
        ? { borderLeft: '4px solid #ef4444' }
        : { borderLeft: '4px solid #f59e0b' },
  });
};
