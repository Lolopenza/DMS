import React from 'react';

function StarButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: '1.6rem',
        color: active ? '#f59e0b' : '#cbd5e1',
        lineHeight: 1,
      }}
    >
      ★
    </button>
  );
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  serverError = '',
}) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [localError, setLocalError] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment('');
      setLocalError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');

    if (rating < 1 || rating > 5) {
      setLocalError('Please choose a rating from 1 to 5 stars.');
      return;
    }
    if (comment.length > 600) {
      setLocalError('Comment is too long (max 600 chars).');
      return;
    }

    await onSubmit({ rating, comment: comment.trim() });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Student feedback form"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div className="dmc-card" style={{ width: '100%', maxWidth: '520px', borderRadius: '12px' }}>
        <div className="dmc-card-header">
          <h3 className="dmc-title" style={{ margin: 0, marginBottom: '.4rem' }}>Share your feedback</h3>
        </div>
        <div className="dmc-card-body">
        <p className="dmc-subtitle" style={{ marginTop: 0, marginBottom: '1rem' }}>
          Rate your current learning experience and add a short comment.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.8rem' }}>
            <div className="dmc-title" style={{ marginBottom: '.4rem', fontWeight: 600 }}>Rating</div>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <StarButton
                  key={value}
                  active={value <= rating}
                  onClick={() => setRating(value)}
                  label={`Set rating ${value}`}
                />
              ))}
              <span className="dmc-subtitle" style={{ marginLeft: '.5rem', fontSize: '.9rem' }}>
                {rating > 0 ? `${rating}/5` : 'Not selected'}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '0.8rem' }}>
            <label htmlFor="feedback-comment" className="dmc-title" style={{ display: 'block', marginBottom: '.4rem', fontWeight: 600 }}>
              Comment
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={600}
              placeholder="What works well, and what should we improve?"
              className="form-control"
              style={{ width: '100%', borderRadius: '8px', padding: '.6rem' }}
            />
            <div className="dmc-subtitle" style={{ marginTop: '.2rem', fontSize: '.8rem' }}>
              {comment.length}/600
            </div>
          </div>

          {(localError || serverError) && (
            <div style={{ marginBottom: '.8rem', color: '#b91c1c', fontSize: '.9rem' }}>
              {localError || serverError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
            <button type="button" className="dmc-button-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="dmc-button-primary" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send feedback'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
