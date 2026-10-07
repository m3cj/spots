import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PiArrowLeft } from 'react-icons/pi';
import {
  approveSubmission,
  getAdminSubmission,
  rejectSubmission,
  updateAdminSubmission,
} from '@/api/admin';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import SpotEditorForm from './SpotEditorForm';

export default function AdminSubmissionReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAdminSubmission(id)
      .then((data) => {
        if (active) setSubmission(data);
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
  }, [id]);

  const handleSaveEdits = async (payload) => {
    setSaving(true);
    try {
      await updateAdminSubmission(id, payload);
      toast.success('Submission edits saved');
    } catch (err) {
      toast.error('Save failed', { subtitle: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (payload) => {
    setSaving(true);
    try {
      await approveSubmission(id, payload);
      toast.success(
        payload.status === 'active' ? 'Submission approved & published' : 'Submission approved as draft',
      );
      navigate('/admin/submissions');
    } catch (err) {
      toast.error('Approval failed', { subtitle: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (reason) => {
    setSaving(true);
    try {
      await rejectSubmission(id, reason);
      toast.success('Submission rejected');
      navigate('/admin/submissions');
    } catch (err) {
      toast.error('Rejection failed', { subtitle: err.message });
    } finally {
      setSaving(false);
    }
  };

  const initialFormValues = submission
    ? {
        name: submission.name,
        category_slug: submission.category_slug,
        lat: submission.lat,
        lng: submission.lng,
        hero_img: submission.image_url || '',
        description: submission.description,
        best_time_to_visit: submission.best_time_to_visit,
        street: submission.street || '',
        landmark: submission.landmark || '',
        area: submission.area || '',
        city: submission.city || 'Patna',
        state: submission.state || 'Bihar',
        pincode: submission.pincode || '',
        tags: [],
        status: 'draft',
      }
    : null;

  return (
    <div className="px-edge py-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/submissions')}
          aria-label="Back to submissions queue"
          className="press flex h-10 w-10 items-center justify-center rounded-pill text-mithila-textSecondary hover:bg-mithila-pill"
        >
          <PiArrowLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-handwritten text-display text-mithila-text">
            Review: {submission?.name || 'Suggestion'}
          </h1>
          <p className="text-caption text-mithila-muted">
            Inspect, enrich, adjust location/photos before publishing or rejecting
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

      {!loading && submission && (
        <SpotEditorForm
          initial={initialFormValues}
          isSubmission={true}
          submission={submission}
          onSave={handleSaveEdits}
          onApprove={handleApprove}
          onReject={handleReject}
          onCancel={() => navigate('/admin/submissions')}
          saving={saving}
        />
      )}
    </div>
  );
}
