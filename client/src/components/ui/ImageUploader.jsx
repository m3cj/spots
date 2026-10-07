import { useRef, useState } from 'react';
import { PiArrowUp, PiImage, PiSpinner, PiTrash, PiUploadSimple } from 'react-icons/pi';
import { uploadImage } from '@/api/admin';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

export default function ImageUploader({ label = 'Hero Image', value, onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Unsupported image', { subtitle: 'Please choose a JPEG, PNG, or WebP photo.' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File too large', { subtitle: 'Maximum photo size is 15 MB.' });
      return;
    }

    setUploading(true);
    try {
      const res = await uploadImage(file);
      onChange(res.url);
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error('Upload failed', { subtitle: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
    setShowUrlField(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-caption font-semibold text-mithila-text">{label}</label>
        {!value && (
          <button
            type="button"
            onClick={() => setShowUrlField((v) => !v)}
            className="text-[12px] text-mithila-primary hover:underline"
          >
            {showUrlField ? 'Upload file instead' : 'Or paste image URL'}
          </button>
        )}
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-md border border-mithila-border bg-mithila-card shadow-sm">
          <img
            src={value}
            alt=""
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-3">
            <span className="truncate text-caption text-white/90 max-w-[70%]">{value}</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onChange(null)}
                aria-label="Remove image"
              >
                <PiTrash aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : showUrlField ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/photo.webp"
            className="h-10 flex-1 rounded-xs border border-mithila-border bg-mithila-card px-3 text-[14px] text-mithila-text focus:outline-none focus:ring-2 focus:ring-mithila-primary"
          />
          <Button type="button" variant="primary" size="sm" onClick={handleApplyUrl}>
            Apply
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="press-card flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-mithila-border bg-mithila-card/60 p-6 text-center hover:border-mithila-primary hover:bg-mithila-pill/20"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <PiSpinner aria-hidden="true" className="h-8 w-8 animate-spin text-mithila-primary" />
              <p className="mt-2 text-caption text-mithila-muted">Uploading and compressing…</p>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-mithila-pill text-mithila-textSecondary">
                <PiUploadSimple aria-hidden="true" className="h-6 w-6" />
              </div>
              <p className="mt-2 text-body font-semibold text-mithila-text">
                Tap to select a photo
              </p>
              <p className="text-caption text-mithila-muted">
                JPEG, PNG, or WebP up to 15 MB. Re-encoded to high-performance WebP.
              </p>
            </>
          )}
        </div>
      )}

      {hint && <p className="text-[12px] text-mithila-muted">{hint}</p>}
    </div>
  );
}
