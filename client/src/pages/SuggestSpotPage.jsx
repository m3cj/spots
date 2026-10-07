import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiArrowLeft, PiCheckCircle, PiImage, PiX } from 'react-icons/pi';
import { createSubmission } from '@/api/public';
import LocationPicker from '@/components/map/LocationPicker';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSeo } from '@/hooks/useSeo';
import { useToast } from '@/hooks/useToast';

const BEST_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'day', label: 'Daytime' },
  { value: 'night', label: 'Night' },
  { value: 'anytime', label: 'Anytime' },
];

function validate(fields, location) {
  const errs = {};
  if (!fields.name.trim()) {
    errs.name = 'Spot name is required.';
  } else if (fields.name.trim().length > 120) {
    errs.name = 'Spot name must be 120 characters or fewer.';
  }

  if (!fields.category_slug) {
    errs.category_slug = 'Please select a category.';
  }

  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    errs.location = 'Please pick a spot location on the map (drag pin to adjust).';
  }

  if (!fields.description.trim()) {
    errs.description = 'Description is required.';
  } else if (fields.description.trim().length < 10) {
    errs.description = 'Please provide at least 10 characters describing this spot.';
  } else if (fields.description.trim().length > 2000) {
    errs.description = 'Description must be 2000 characters or fewer.';
  }

  if (!fields.best_time_to_visit) {
    errs.best_time_to_visit = 'Please select the best time to visit.';
  }

  return errs;
}

function ImagePicker({ file, onChange }) {
  const inputRef = useRef(null);

  return (
    <div>
      <p className="mb-1 text-[13px] font-medium text-mithila-textSecondary">Photo (optional)</p>
      {file ? (
        <div className="relative h-36 overflow-hidden rounded-md bg-mithila-pill">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove photo"
            className="press absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-pill bg-mithila-scrim text-white"
          >
            <PiX aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="press flex h-24 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-mithila-border bg-mithila-card text-mithila-muted hover:border-mithila-primary hover:text-mithila-primary"
        >
          <PiImage aria-hidden="true" className="h-7 w-7" />
          <span className="text-caption">Tap to upload a photo</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function SuccessBanner({ onReset }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <PiCheckCircle className="h-16 w-16 text-state-success" />
      <h2 className="font-handwritten text-[24px] text-mithila-text">Thanks for your suggestion!</h2>
      <p className="max-w-xs text-body text-mithila-textSecondary">
        Our team will review your spot and publish it once approved.
      </p>
      <Button id="suggest-submit-another" variant="secondary" onClick={onReset}>
        Suggest another spot
      </Button>
    </div>
  );
}

export default function SuggestSpotPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { requireAuth } = useRequireAuth();
  const { categories, bySlug } = useCategories();
  useSeo({
    title: 'Suggest a Spot',
    description: 'Know a hidden gem in Patna? Submit it for review and share it with the community.',
  });

  const [fields, setFields] = useState({
    name: '',
    category_slug: '',
    description: '',
    best_time_to_visit: 'anytime',
  });
  const [location, setLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requireAuth('Sign in with Google to submit your spot suggestion.')) {
      return;
    }

    const errs = validate(fields, location);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: fields.name.trim(),
        category_slug: fields.category_slug,
        lat: location.lat,
        lng: location.lng,
        description: fields.description.trim(),
        best_time_to_visit: fields.best_time_to_visit,
      };
      await createSubmission(payload, imageFile);
      setDone(true);
    } catch (err) {
      if (err.status === 401 || err.code === 'UNAUTHORIZED') {
        requireAuth('Your session expired. Please sign in to submit your suggestion.');
      } else {
        toast.error("Couldn't submit your spot", {
          subtitle: err.message ?? 'Check your connection and try again.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFields({
      name: '',
      category_slug: '',
      description: '',
      best_time_to_visit: 'anytime',
    });
    setLocation(null);
    setImageFile(null);
    setErrors({});
    setDone(false);
  };

  const categoryOptions = categories.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div className="min-h-full bg-mithila-canvas">
      {/* Sticky back bar */}
      <div className="sticky top-0 z-sticky border-b border-mithila-border bg-mithila-bg px-edge py-2">
        <div className="mx-auto flex max-w-screen-xl items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
          >
            <PiArrowLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <h1 className="font-handwritten text-display text-mithila-text">Suggest a Spot</h1>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-edge py-6">
        {done ? (
          <SuccessBanner onReset={reset} />
        ) : (
          <form id="suggest-spot-form" onSubmit={handleSubmit} noValidate className="space-y-5 lg:max-w-xl">
            <p className="text-body text-mithila-textSecondary">
              Know a hidden gem in Patna? Share it with the community — our curators will review it.
            </p>

            <TextField
              id="suggest-name"
              label="Spot name"
              required
              placeholder="e.g. Maurya Lok or Eco Park"
              value={fields.name}
              onChange={set('name')}
              error={errors.name}
            />

            <SelectField
              id="suggest-category"
              label="Category"
              required
              placeholder="Select a category"
              options={categoryOptions}
              value={fields.category_slug}
              onChange={set('category_slug')}
              error={errors.category_slug}
            />

            <div>
              <label className="mb-1 block text-[13px] font-medium text-mithila-textSecondary">
                Location on map <span className="text-mithila-primary">*</span>
              </label>
              <LocationPicker
                value={location}
                onChange={(loc) => {
                  setLocation(loc);
                  setErrors((prev) => ({ ...prev, location: undefined }));
                }}
                color={bySlug.get(fields.category_slug)?.color}
                invalid={Boolean(errors.location)}
                className="h-64"
              />
              {errors.location && (
                <p role="alert" className="mt-1 text-caption text-state-danger">
                  {errors.location}
                </p>
              )}
            </div>

            <TextAreaField
              id="suggest-description"
              label="Description"
              required
              rows={4}
              placeholder="What makes this spot special? (minimum 10 characters)"
              value={fields.description}
              onChange={set('description')}
              error={errors.description}
              hint="Helps curators review and enrich the spot details."
            />

            <SelectField
              id="suggest-best-time"
              label="Best time to visit"
              required
              options={BEST_TIME_OPTIONS}
              value={fields.best_time_to_visit}
              onChange={set('best_time_to_visit')}
              error={errors.best_time_to_visit}
            />

            <ImagePicker file={imageFile} onChange={setImageFile} />

            <div className="pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
              <Button
                id="suggest-submit"
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full"
              >
                Submit for review
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
