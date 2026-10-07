import { useState } from 'react';
import { PiPencil, PiPlus, PiTrash } from 'react-icons/pi';
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from '@/api/admin';
import { invalidateCategories } from '@/hooks/useCategories';
import { TextField } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { useToast } from '@/hooks/useToast';

const EMPTY_CAT = { name: '', slug: '', color: '#CA2019', icon: '' };

function CategoryRow({ cat, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-mithila-card px-4 py-3 shadow-sm">
      <span
        className="h-5 w-5 shrink-0 rounded-pill"
        style={{ backgroundColor: cat.color }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-mithila-text">{cat.name}</p>
        <p className="text-caption text-mithila-muted">{cat.slug}</p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(cat)}
        aria-label={`Edit ${cat.name}`}
        className="press flex h-9 w-9 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
      >
        <PiPencil aria-hidden="true" className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(cat)}
        aria-label={`Delete ${cat.name}`}
        className="press flex h-9 w-9 items-center justify-center rounded-pill text-state-danger hover:bg-mithila-pill"
      >
        <PiTrash aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

function CategoryForm({ initial, onSave, onCancel, saving }) {
  const [fields, setFields] = useState(initial);
  const set = (k) => (e) => setFields((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form id="admin-cat-form" onSubmit={(e) => { e.preventDefault(); onSave(fields); }} className="space-y-4">
      <TextField id="cat-name" label="Name" required value={fields.name} onChange={set('name')} />
      <TextField id="cat-slug" label="Slug (URL key)" required value={fields.slug} onChange={set('slug')} hint="Lowercase, hyphens only. e.g. food-joints" />
      <div>
        <label htmlFor="cat-color" className="block text-[13px] font-medium text-mithila-textSecondary">
          Pin colour
        </label>
        <input
          type="color"
          id="cat-color"
          value={fields.color}
          onChange={set('color')}
          className="mt-1 h-10 w-16 cursor-pointer rounded-xs border border-mithila-border bg-mithila-card p-0.5"
        />
      </div>
      <TextField id="cat-icon" label="Icon name (optional)" value={fields.icon} onChange={set('icon')} hint="Phosphor icon name, e.g. PiMapPin" />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button id="cat-form-save" type="submit" variant="primary" loading={saving}>Save</Button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  const toast = useToast();
  const { data: categories, loading, error, reload } = useAsync(getAdminCategories, []);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing && editing.id) {
        await updateCategory(editing.id, payload);
        toast.success('Category updated');
      } else {
        await createCategory(payload);
        toast.success('Category created');
      }
      invalidateCategories();
      setEditing(null);
      reload();
    } catch (err) {
      toast.error('Save failed', { subtitle: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      toast.success('Category deleted');
      invalidateCategories();
      reload();
    } catch (err) {
      toast.error('Delete failed', { subtitle: err.message });
    }
  };

  const formInitial = editing && editing.id ? { ...EMPTY_CAT, ...editing } : EMPTY_CAT;

  return (
    <div className="px-edge py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-handwritten text-display text-mithila-text">Categories</h1>
        <Button id="admin-cat-new" variant="primary" onClick={() => setEditing(false)}>
          <PiPlus aria-hidden="true" className="mr-1 h-4 w-4" />
          New
        </Button>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-14 w-full rounded-md" />)}
        </div>
      )}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && (!categories || categories.length === 0) && (
        <EmptyState title="No categories" description="Create the first category." />
      )}
      {!loading && categories && categories.length > 0 && (
        <div className="space-y-2">
          {categories.map((cat) => (
            <CategoryRow key={cat.id} cat={cat} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing && editing.id ? 'Edit category' : 'New category'}
      >
        {editing !== null && (
          <CategoryForm
            initial={formInitial}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        )}
      </Modal>
    </div>
  );
}
