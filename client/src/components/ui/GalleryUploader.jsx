import { useRef, useState } from 'react';
import { PiArrowDown, PiArrowUp, PiPlus, PiSpinner, PiTrash } from 'react-icons/pi';
import { uploadImage } from '@/api/admin';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

export default function GalleryUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    try {
      const newItems = [];
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) continue;
        if (file.size > 15 * 1024 * 1024) continue;
        const res = await uploadImage(file);
        newItems.push({ image_url: res.url, caption: '' });
      }
      onChange([...images, ...newItems]);
      toast.success(`${newItems.length} photos added`);
    } catch (err) {
      toast.error('Upload failed', { subtitle: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMove = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleCaptionChange = (index, caption) => {
    const next = [...images];
    next[index] = { ...next[index], caption };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-caption font-semibold text-mithila-text">Gallery Photos</label>
          <p className="text-[12px] text-mithila-muted">Curated extra photos shown in spot details carousel</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <PiSpinner aria-hidden="true" className="mr-1 h-4 w-4 animate-spin text-mithila-primary" />
          ) : (
            <PiPlus aria-hidden="true" className="mr-1 h-4 w-4" />
          )}
          Add photos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <div className="rounded-md border border-dashed border-mithila-border bg-mithila-card/40 p-4 text-center text-caption text-mithila-muted">
          No gallery photos added yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {images.map((img, index) => (
            <li
              key={`${img.image_url}-${index}`}
              className="flex items-center gap-3 rounded-md border border-mithila-border bg-mithila-card p-2.5 shadow-sm"
            >
              <img
                src={img.image_url}
                alt=""
                className="h-16 w-20 shrink-0 rounded-xs border border-mithila-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  placeholder="Optional caption…"
                  value={img.caption || ''}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  className="h-9 w-full rounded-xs border border-mithila-border bg-mithila-bg px-2.5 text-[13px] text-mithila-text focus:outline-none focus:ring-1 focus:ring-mithila-primary"
                />
                <p className="mt-1 truncate text-[11px] text-mithila-muted">{img.image_url}</p>
              </div>

              {/* Order controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  title="Move up"
                  className="press flex h-8 w-8 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill disabled:opacity-30"
                >
                  <PiArrowUp aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === images.length - 1}
                  title="Move down"
                  className="press flex h-8 w-8 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill disabled:opacity-30"
                >
                  <PiArrowDown aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  title="Delete"
                  className="press flex h-8 w-8 items-center justify-center rounded-pill text-state-danger hover:bg-mithila-pill"
                >
                  <PiTrash aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
