import { useState } from 'react';
import { PiCheck, PiPencil, PiPlus, PiTrash } from 'react-icons/pi';
import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  updateEvent,
} from '@/api/admin';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import ImageUploader from '@/components/ui/ImageUploader';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import SpotCombobox from '@/components/ui/SpotCombobox';
import { useAsync } from '@/hooks/useAsync';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/hooks/useToast';
import { formatEventWhen } from '@/utils/format';

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const EMPTY_EVENT = {
  title: '',
  event_date: '',
  start_time: '',
  end_time: '',
  description: '',
  booking_link: '',
  price: '',
  age_limit: '',
  categories: '',
  spot_id: '',
  hero_img: '',
  status: 'upcoming',
};

function EventRow({ event, onEdit, onDelete }) {
  const timeStr = event.end_time
    ? `${event.start_time.slice(0, 5)} – ${event.end_time.slice(0, 5)}`
    : event.start_time.slice(0, 5);

  return (
    <tr className="border-b border-mithila-border hover:bg-mithila-pill/40 transition-colors">
      <td className="py-3 pl-4">
        <div className="flex items-center gap-3">
          {event.hero_img ? (
            <img
              src={event.hero_img}
              alt=""
              className="h-10 w-14 shrink-0 rounded-xs border border-mithila-border object-cover"
            />
          ) : (
            <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xs bg-mithila-pill text-[10px] text-mithila-muted font-medium">
              No photo
            </div>
          )}
          <div>
            <p className="font-semibold text-mithila-text">{event.title}</p>
            <p className="text-[12px] text-mithila-muted">
              {event.spot?.name ? `${event.spot.name} (${event.spot.area || ''})` : `Venue Spot #${event.spot_id}`}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 text-caption text-mithila-textSecondary">
        {formatEventWhen(event.event_date, null)}
        <span className="block text-[12px] text-mithila-muted">{timeStr}</span>
      </td>
      <td className="py-3">
        <span
          className={`rounded-pill px-2.5 py-1 text-tag ${
            event.status === 'upcoming' || event.status === 'ongoing'
              ? 'bg-state-success text-white'
              : 'bg-mithila-pill text-mithila-muted'
          }`}
        >
          {event.status}
        </span>
      </td>
      <td className="py-3 pr-4 text-right">
        <button
          type="button"
          onClick={() => onEdit(event)}
          aria-label={`Edit ${event.title}`}
          className="press mr-2 inline-flex h-9 w-9 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
        >
          <PiPencil aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(event)}
          aria-label={`Delete ${event.title}`}
          className="press inline-flex h-9 w-9 items-center justify-center rounded-pill text-state-danger hover:bg-mithila-pill"
        >
          <PiTrash aria-hidden="true" className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function EventForm({ initial, onSave, onCancel, saving }) {
  const { categories } = useCategories();
  const [fields, setFields] = useState(initial);

  // Convert categories string to array for chips
  const selectedCats = (fields.categories || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const set = (k) => (e) => setFields((p) => ({ ...p, [k]: e.target.value }));

  const toggleCategory = (slug) => {
    const next = selectedCats.includes(slug)
      ? selectedCats.filter((s) => s !== slug)
      : [...selectedCats, slug];
    setFields((p) => ({ ...p, categories: next.join(',') }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...fields };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' || payload[k] === null) delete payload[k];
    });
    if (payload.spot_id) payload.spot_id = Number(payload.spot_id);
    if (payload.price) payload.price = Number(payload.price);
    if (payload.age_limit) payload.age_limit = Number(payload.age_limit);

    if (payload.start_time && payload.end_time && payload.end_time <= payload.start_time) {
      alert('End time must be after start time.');
      return;
    }

    onSave(payload);
  };

  return (
    <form id="admin-event-form" onSubmit={handleSubmit} className="space-y-4">
      <TextField
        id="ev-title"
        label="Event Title"
        required
        value={fields.title || ''}
        onChange={set('title')}
        placeholder="e.g. Ganga Aarti or Patna Lit Fest"
      />

      <SpotCombobox
        label="Venue Spot"
        required
        value={fields.spot_id}
        onChange={(val) => setFields((p) => ({ ...p, spot_id: val }))}
        hint="Search discovery spots to anchor this event"
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="ev-date"
          label="Event Date"
          type="date"
          required
          value={fields.event_date || ''}
          onChange={set('event_date')}
        />
        <SelectField
          id="ev-status"
          label="Status"
          options={STATUS_OPTIONS}
          value={fields.status || 'upcoming'}
          onChange={set('status')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="ev-start"
          label="Start time"
          type="time"
          required
          value={fields.start_time || ''}
          onChange={set('start_time')}
        />
        <TextField
          id="ev-end"
          label="End time (Optional)"
          type="time"
          value={fields.end_time || ''}
          onChange={set('end_time')}
          hint="Must be after start time"
        />
      </div>

      {/* Category multi-select chips */}
      <div className="space-y-1.5">
        <label className="text-caption font-semibold text-mithila-text">Categories</label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCats.includes(cat.slug);
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => toggleCategory(cat.slug)}
                className={`press flex items-center gap-1 rounded-pill px-3 py-1.5 text-tag transition-colors ${
                  isSelected
                    ? 'bg-mithila-primary text-white font-semibold shadow-sm'
                    : 'border border-mithila-border bg-mithila-card text-mithila-textSecondary hover:bg-mithila-pill'
                }`}
              >
                {isSelected && <PiCheck aria-hidden="true" className="h-3 w-3" />}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <ImageUploader
        label="Hero Photo (Optional)"
        value={fields.hero_img || ''}
        onChange={(url) => setFields((p) => ({ ...p, hero_img: url || '' }))}
        hint="Falls back to venue hero photo if omitted."
      />

      <TextAreaField
        id="ev-desc"
        label="Description"
        rows={3}
        value={fields.description || ''}
        onChange={set('description')}
        placeholder="Details about schedules, entry rules, guests…"
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="ev-price"
          label="Price (₹, blank = free)"
          type="number"
          min="0"
          step="0.01"
          value={fields.price ?? ''}
          onChange={set('price')}
        />
        <TextField
          id="ev-age"
          label="Age limit (e.g. 18)"
          type="number"
          min="0"
          value={fields.age_limit ?? ''}
          onChange={set('age_limit')}
        />
      </div>

      <TextField
        id="ev-booking"
        label="Booking link / URL"
        type="url"
        value={fields.booking_link || ''}
        onChange={set('booking_link')}
        placeholder="https://insider.in/..."
      />

      <div className="flex justify-end gap-3 pt-3 border-t border-mithila-border">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button id="event-form-save" type="submit" variant="primary" loading={saving}>
          Save Event
        </Button>
      </div>
    </form>
  );
}

export default function AdminEvents() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(
    (signal) => getAdminEvents({}, { signal }),
    [],
  );
  const events = data?.items ?? [];
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing && editing.id) {
        await updateEvent(editing.id, payload);
        toast.success('Event updated');
      } else {
        await createEvent(payload);
        toast.success('Event created');
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast.error('Save failed', { subtitle: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    try {
      await deleteEvent(event.id);
      toast.success('Event deleted');
      reload();
    } catch (err) {
      toast.error('Delete failed', { subtitle: err.message });
    }
  };

  const formInitial = editing && editing.id ? { ...EMPTY_EVENT, ...editing } : EMPTY_EVENT;

  return (
    <div className="px-edge py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-handwritten text-display text-mithila-text">Events</h1>
          <p className="text-caption text-mithila-muted">Manage workshops, festivals and cultural happenings</p>
        </div>
        <Button id="admin-event-new" variant="primary" onClick={() => setEditing(false)}>
          <PiPlus aria-hidden="true" className="mr-1 h-4 w-4" />
          New event
        </Button>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      )}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && events.length === 0 && (
        <EmptyState title="No events yet" description="Create the first event." />
      )}
      {!loading && events.length > 0 && (
        <div className="overflow-x-auto rounded-md bg-mithila-card shadow-sm border border-mithila-border">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-mithila-border bg-mithila-bg/50">
                <th className="py-2.5 pl-4 text-left text-caption font-semibold text-mithila-muted">
                  Title & Venue
                </th>
                <th className="py-2.5 text-left text-caption font-semibold text-mithila-muted">
                  Date & Time
                </th>
                <th className="py-2.5 text-left text-caption font-semibold text-mithila-muted">
                  Status
                </th>
                <th className="py-2.5 pr-4 text-right text-caption font-semibold text-mithila-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing && editing.id ? 'Edit event' : 'New event'}
      >
        {editing !== null && (
          <EventForm
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
