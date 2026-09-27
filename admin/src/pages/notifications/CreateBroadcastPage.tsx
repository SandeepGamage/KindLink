import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Info, Megaphone, Send } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { notifyStatsChanged } from '../../api/admin';
import {
  AUDIENCE_LABELS,
  TYPE_LABELS,
  createNotification,
  getNotifications,
  updateNotification,
  type NotificationAudience,
  type NotificationStatus,
  type NotificationType,
} from '../../api/notifications';

const AUDIENCES = Object.keys(AUDIENCE_LABELS) as NotificationAudience[];
const TYPES = Object.keys(TYPE_LABELS) as NotificationType[];

/** Create a broadcast, or edit an existing draft at /notifications/:id/edit. */
export default function CreateBroadcastPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<NotificationType>('INFO');
  const [audience, setAudience] = useState<NotificationAudience>('all');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState<NotificationStatus | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  // The backend has no GET /notifications/:id, so pick the draft out of the list.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getNotifications()
      .then((all) => {
        if (cancelled) return;
        const draft = all.find((b) => b._id === id);
        if (!draft) {
          setLoadError('This notification no longer exists.');
          return;
        }
        setTitle(draft.title);
        setBody(draft.message);
        setType(draft.type ?? 'INFO');
        setAudience(draft.audience || 'all');
      })
      .catch((err) => !cancelled && setLoadError((err as Error).message))
      .finally(() => !cancelled && setLoadingDraft(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (status: NotificationStatus) => {
    if (!title.trim() || !body.trim()) {
      setFormError('Both a title and a message are required.');
      return;
    }
    setFormError(null);
    setSubmitting(status);
    try {
      const input = { title: title.trim(), message: body.trim(), type, audience, status };
      if (id) {
        await updateNotification(id, input);
      } else {
        await createNotification({ ...input, sender: 'Admin' });
      }
      notifyStatsChanged();
      toast(status === 'sent' ? 'Broadcast published' : 'Draft saved');
      navigate('/notifications');
    } catch (err) {
      setFormError((err as Error).message || 'Could not save the notification.');
    } finally {
      setSubmitting(null);
    }
  };

  const header = (
    <PageHeader
      title={isEditing ? 'Edit Draft' : 'Create Broadcast'}
      subtitle={
        isEditing
          ? 'Update this draft, then save it or publish it.'
          : 'Compose a new message to notify your platform users.'
      }
      backTo="/notifications"
    />
  );

  if (loadingDraft || loadError) {
    return (
      <>
        {header}
        <div className="page-body page-animate">
          <div className="card">
            {loadError ? (
              <EmptyState icon={<AlertCircle size={40} />} title="Couldn't open this draft" message={loadError} />
            ) : (
              <div className="auth-loading inline">
                <div className="spinner" aria-hidden="true" />
                <span>Loading draft…</span>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="page-body page-animate">
        <div className="compose-grid">
          {/* Form */}
          <form
            className="card compose-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit('sent');
            }}
            noValidate
          >
            {formError && (
              <div className="banner banner-danger" role="alert">
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="broadcast-title">
                Headline / Title
              </label>
              <input
                id="broadcast-title"
                type="text"
                className="field-input"
                placeholder="e.g., Community day this Saturday"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="broadcast-type">
                  Notification Type
                </label>
                <select
                  id="broadcast-type"
                  className="field-input"
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <span className="field-label">Target Audience</span>
                <div className="pill-group" role="radiogroup" aria-label="Target audience">
                  {AUDIENCES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      role="radio"
                      aria-checked={audience === a}
                      className={`pill${audience === a ? ' active' : ''}`}
                      onClick={() => setAudience(a)}
                    >
                      {AUDIENCE_LABELS[a]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="field field-grow">
              <label className="field-label" htmlFor="broadcast-body">
                Message
              </label>
              <textarea
                id="broadcast-body"
                className="field-input field-textarea"
                placeholder="Write the broadcast message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <div className="compose-buttons">
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                onClick={() => handleSubmit('draft')}
                disabled={submitting !== null}
              >
                {submitting === 'draft' ? 'Saving…' : 'Save as Draft'}
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting !== null}>
                <Send size={16} /> {submitting === 'sent' ? 'Publishing…' : 'Publish Broadcast'}
              </button>
            </div>
          </form>

          {/* Preview */}
          <div className="compose-preview">
            <div className="section-eyebrow">
              <Megaphone size={14} /> Live Preview
            </div>
            <div className="preview-container">
              <div className="device-frame">
                <div className="device-header">User's Device</div>
                <div className="device-body">
                  <div className="preview-notification">
                    <div className="preview-icon">
                      <Info size={18} />
                    </div>
                    <div>
                      <div className="preview-title">{title || 'Notification Title'}</div>
                      <div className="preview-body">
                        {body || 'Your notification body will appear here. It expands to fit multiple lines.'}
                      </div>
                      <div className="preview-meta">
                        Just now • {TYPE_LABELS[type]} • {AUDIENCE_LABELS[audience]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="preview-caption">
                This is how the notification will appear to users in their inbox.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
