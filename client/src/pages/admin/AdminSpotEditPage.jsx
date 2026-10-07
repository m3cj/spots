import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PiArrowLeft } from 'react-icons/pi';
import { createAdminSpot, getAdminSpot, replaceSpotImages, updateAdminSpot } from '@/api/admin';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import SpotEditorForm from './SpotEditorForm';

const EMPTY_SPOT = {
  name: '',
  category_slug: '',
  area: '',
  city: 'Patna',
  state: 'Bihar',
  pincode: '',
  street: '',
  landmark: '',
  lat: '',
  lng: '',
  gmap_link: '',
  hero_img: '',
  description: '',
  best_time_to_visit: 'anytime',
  contacts: '',
  direction: '',
  tags: [],
  status: 'draft',
};

export default function AdminSpotEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !id || id === 'new';

  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) {
      setSpot(EMPTY_SPOT);
      return;
    }

    let active = true;
    setLoading(true);
    getAdminSpot(id)
      .then((data) => {
        if (active) setSpot(data);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, isNew]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const { gallery, ...spotData } = payload;
      let spotId = id;

      if (isNew) {
        const created = await createAdminSpot(spotData);
        spotId = created.id;
        toast.success('Spot created successfully');
      } else {
        await updateAdminSpot(spotId, spotData);
        toast.success('Spot updated successfully');
      }

      if (gallery) {
        await replaceSpotImages(spotId, gallery);
      }

      navigate('/admin/spots');
    } catch (err) {
      toast.error('Save failed', { subtitle: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-edge py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/spots')}
          aria-label="Back to spots list"
          className="press flex h-10 w-10 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
        >
          <PiArrowLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-handwritten text-display text-mithila-text">
            {isNew ? 'New Spot' : `Edit: ${spot?.name || 'Spot'}`}
          </h1>
          <p className="text-caption text-mithila-muted">
            {isNew ? 'Curate and configure a new spot' : 'Update coordinates, details and gallery'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-44 w-full rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      )}

      {!loading && error && (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      )}

      {!loading && spot && (
        <SpotEditorForm
          initial={spot}
          onSave={handleSave}
          onCancel={() => navigate('/admin/spots')}
          saving={saving}
        />
      )}
    </div>
  );
}
