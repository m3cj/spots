import { useEffect, useState } from 'react';
import { PiCheck, PiCompass, PiMapPin, PiX } from 'react-icons/pi';
import { getAdminTags } from '@/api/admin';
import ChipInput from '@/components/ui/ChipInput';
import GalleryUploader from '@/components/ui/GalleryUploader';
import ImageUploader from '@/components/ui/ImageUploader';
import LocationPickerModal from '@/components/ui/LocationPickerModal';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import Button from '@/components/ui/Button';
import { STATE_OPTIONS } from '@/utils/indiaStates';
import { useCategories } from '@/hooks/useCategories';

const BEST_TIME_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
  { value: 'anytime', label: 'Anytime' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Published / Active' },
  { value: 'archived', label: 'Archived' },
];

export default function SpotEditorForm({
  initial,
  isSubmission = false,
  submission = null,
  onSave,
  onApprove,
  onReject,
  onCancel,
  saving = false,
}) {
  const { categories } = useCategories();
  const [fields, setFields] = useState({
    name: '',
    category_slug: '',
    street: '',
    landmark: '',
    area: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '',
    lat: '',
    lng: '',
    gmap_link: '',
    hero_img: '',
    description: '',
    best_time_to_visit: 'anytime',
    direction: '',
    contacts: '',
    tags: [],
    status: 'draft',
    ...initial,
  });

  const [gallery, setGallery] = useState(initial?.spot_images ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    getAdminTags()
      .then((res) => setAllTags(res ?? []))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setFields((p) => ({ ...p, [k]: e.target.value }));

  const handleLocationConfirmed = ({ lat, lng }) => {
    setFields((p) => ({
      ...p,
      lat,
      lng,
      gmap_link: p.gmap_link || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    }));
  };

  const getCleanPayload = () => {
    const payload = { ...fields, gallery };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' || payload[k] === null) delete payload[k];
    });
    if (payload.lat) payload.lat = Number(payload.lat);
    if (payload.lng) payload.lng = Number(payload.lng);
    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(getCleanPayload());
  };

  const handleApproveWithStatus = (targetStatus) => {
    const payload = getCleanPayload();
    payload.status = targetStatus;
    onApprove(payload);
  };

  const handleConfirmReject = () => {
    onReject(rejectReason.trim() || null);
    setShowRejectModal(false);
  };

  const catOptions = categories.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Submitter info card if reviewing */}
      {isSubmission && submission && (
        <div className="rounded-md border border-mithila-border bg-mithila-card p-4 shadow-sm">
          <p className="text-caption font-semibold uppercase tracking-wider text-mithila-primary">
            Community Suggestion Review
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-caption text-mithila-muted">
            <span>
              Submitter:{' '}
              <strong className="text-mithila-text">
                {submission.submitter?.display_name || submission.submitter?.email || 'Anonymous'}
              </strong>
            </span>
            <span>
              Submitted:{' '}
              <strong className="text-mithila-text">
                {new Date(submission.created_at).toLocaleDateString()}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* 1. Basics */}
      <section className="space-y-4 rounded-md border border-mithila-border bg-mithila-card p-5 shadow-sm">
        <h2 className="text-section font-bold text-mithila-text">1. Basic Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            id="spot-name"
            label="Spot Name"
            required
            value={fields.name || ''}
            onChange={set('name')}
            placeholder="e.g. Golghar or Blue Tokai"
          />
          <SelectField
            id="spot-cat"
            label="Category"
            required
            options={catOptions}
            placeholder="Select a category"
            value={fields.category_slug || ''}
            onChange={set('category_slug')}
          />
        </div>
      </section>

      {/* 2. Location & Address */}
      <section className="space-y-4 rounded-md border border-mithila-border bg-mithila-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-section font-bold text-mithila-text">2. Location & Address</h2>
            <p className="text-[12px] text-mithila-muted">
              Drop a pin on the map to set exact coordinates, then enter the street address.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            <PiCompass aria-hidden="true" className="mr-1.5 h-4 w-4" />
            Pick on Map
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="spot-lat"
            label="Latitude"
            type="number"
            step="any"
            required
            value={fields.lat ?? ''}
            onChange={set('lat')}
            placeholder="25.6203"
          />
          <TextField
            id="spot-lng"
            label="Longitude"
            type="number"
            step="any"
            required
            value={fields.lng ?? ''}
            onChange={set('lng')}
            placeholder="85.1395"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <TextField
            id="spot-street"
            label="Street / Road"
            value={fields.street || ''}
            onChange={set('street')}
            placeholder="e.g. Ashok Raj Path"
          />
          <TextField
            id="spot-landmark"
            label="Landmark"
            value={fields.landmark || ''}
            onChange={set('landmark')}
            placeholder="e.g. Near Gandhi Maidan Gate 1"
          />
          <TextField
            id="spot-area"
            label="Area / Locality"
            required
            value={fields.area || ''}
            onChange={set('area')}
            placeholder="e.g. Gandhi Maidan"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <TextField
            id="spot-city"
            label="City"
            required
            value={fields.city || ''}
            onChange={set('city')}
            placeholder="e.g. Patna"
          />
          <SelectField
            id="spot-state"
            label="State / UT"
            required
            options={STATE_OPTIONS}
            value={fields.state || 'Bihar'}
            onChange={set('state')}
          />
          <TextField
            id="spot-pincode"
            label="Pincode"
            value={fields.pincode || ''}
            onChange={set('pincode')}
            placeholder="e.g. 800001"
          />
        </div>

        <TextField
          id="spot-gmap"
          label="Google Maps URL"
          type="url"
          value={fields.gmap_link || ''}
          onChange={set('gmap_link')}
          hint="Auto-generated from coordinates or paste a custom Google Maps share link"
        />
      </section>

      {/* 3. Photos */}
      <section className="space-y-6 rounded-md border border-mithila-border bg-mithila-card p-5 shadow-sm">
        <h2 className="text-section font-bold text-mithila-text">3. Photos</h2>
        <ImageUploader
          label="Hero Photo (Cover)"
          value={fields.hero_img || ''}
          onChange={(url) => setFields((p) => ({ ...p, hero_img: url || '' }))}
          hint="Main image shown on discovery cards and detail header. WebP encoded."
        />

        <GalleryUploader
          images={gallery}
          onChange={setGallery}
        />
      </section>

      {/* 4. Details */}
      <section className="space-y-4 rounded-md border border-mithila-border bg-mithila-card p-5 shadow-sm">
        <h2 className="text-section font-bold text-mithila-text">4. Story & Details</h2>
        <TextAreaField
          id="spot-desc"
          label="Description / Story"
          rows={4}
          value={fields.description || ''}
          onChange={set('description')}
          placeholder="What makes this spot special? Tell its story…"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            id="spot-time"
            label="Best time to visit"
            options={BEST_TIME_OPTIONS}
            value={fields.best_time_to_visit || 'anytime'}
            onChange={set('best_time_to_visit')}
          />
          <TextField
            id="spot-contacts"
            label="Contacts / Phone"
            value={fields.contacts || ''}
            onChange={set('contacts')}
            placeholder="Phone number, Instagram handle, etc."
          />
        </div>

        <TextAreaField
          id="spot-direction"
          label="How to get there / Directions"
          rows={2}
          value={fields.direction || ''}
          onChange={set('direction')}
          placeholder="Nearest metro, auto route, or landmark hints…"
        />

        <ChipInput
          label="Tags"
          tags={fields.tags || []}
          onChange={(newTags) => setFields((p) => ({ ...p, tags: newTags }))}
          suggestions={allTags}
          hint="Press Enter or comma to add. Add themes like Riverfront, History, Chai, View…"
        />
      </section>

      {/* 5. Status */}
      {!isSubmission && (
        <section className="space-y-4 rounded-md border border-mithila-border bg-mithila-card p-5 shadow-sm">
          <h2 className="text-section font-bold text-mithila-text">5. Publishing Status</h2>
          <SelectField
            id="spot-status"
            label="Status"
            options={STATUS_OPTIONS}
            value={fields.status || 'draft'}
            onChange={set('status')}
          />
        </section>
      )}

      {/* Action Footer */}
      <div className="sticky bottom-0 z-sticky -mx-edge border-t border-mithila-border bg-mithila-card/95 px-edge py-3.5 shadow-lg backdrop-blur-none">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>

          {isSubmission ? (
            <div className="flex items-center gap-6">
              {/* Reject button separated by gap-6 (≥24px per design system §8.4) */}
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowRejectModal(true)}
                disabled={saving}
              >
                <PiX aria-hidden="true" className="mr-1 h-4 w-4" />
                Reject
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="ghost"
                  loading={saving}
                >
                  Save Edits
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={saving}
                  onClick={() => handleApproveWithStatus('draft')}
                >
                  Approve as Draft
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  loading={saving}
                  onClick={() => handleApproveWithStatus('active')}
                >
                  <PiCheck aria-hidden="true" className="mr-1 h-4 w-4" />
                  Approve & Publish
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                id="spot-form-save"
                type="submit"
                variant="primary"
                loading={saving}
              >
                <PiCheck aria-hidden="true" className="mr-1 h-4 w-4" />
                Save Spot
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        open={pickerOpen}
        initialLat={fields.lat}
        initialLng={fields.lng}
        onConfirm={handleLocationConfirmed}
        onClose={() => setPickerOpen(false)}
      />

      {/* Reject Reason Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-md bg-mithila-card p-6 shadow-lg space-y-4">
            <h3 className="text-section font-bold text-mithila-text">Reject Suggestion</h3>
            <p className="text-caption text-mithila-muted">
              Optionally provide a reason so the user knows why their suggestion could not be accepted.
            </p>
            <TextAreaField
              id="reject-reason-input"
              label="Rejection Reason"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate spot, insufficient information, or permanently closed…"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
