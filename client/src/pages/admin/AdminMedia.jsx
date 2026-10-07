import { useState } from 'react';
import { PiTrash, PiUpload } from 'react-icons/pi';
import { deleteMedia, getMedia, uploadImage } from '@/api/admin';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useAsync } from '@/hooks/useAsync';
import { useToast } from '@/hooks/useToast';

export default function AdminMedia() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(
    (signal) => getMedia({}, { signal }),
    [],
  );
  const files = data?.items ?? [];
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadImage(file);
      toast.success('Image uploaded');
      reload();
    } catch (err) {
      toast.error('Upload failed', { subtitle: err.message });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (path) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) return;
    setDeleting(path);
    try {
      await deleteMedia(path);
      toast.success('Image deleted');
      reload();
    } catch (err) {
      toast.error('Delete failed', { subtitle: err.message });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="px-edge py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-handwritten text-display text-mithila-text">Media Library</h1>
        <label
          htmlFor="admin-media-upload"
          className={`press inline-flex cursor-pointer items-center gap-2 rounded-xs bg-mithila-primary px-4 py-2.5 text-button text-white transition-opacity ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <PiUpload aria-hidden="true" className="h-4 w-4" />
          {uploading ? 'Uploading…' : 'Upload'}
          <input
            id="admin-media-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="aspect-square rounded-md" />)}
        </div>
      )}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && files.length === 0 && (
        <EmptyState title="No images yet" description="Upload an image to get started." />
      )}
      {!loading && files.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {files.map((file) => (
            <li key={file.path} className="group relative overflow-hidden rounded-md bg-mithila-pill">
              <img
                src={file.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-square h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDelete(file.path)}
                  disabled={deleting === file.path}
                  aria-label="Delete image"
                  className="press ml-auto flex h-8 w-8 items-center justify-center rounded-pill bg-state-danger text-white"
                >
                  <PiTrash aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              <p className="truncate px-2 py-1 text-[11px] text-mithila-muted">{file.path.split('/').pop()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
