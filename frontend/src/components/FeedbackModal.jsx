import React from 'react';
import { Button, Card, CardHeader } from './ui/index.js';
import { Textarea } from './ui/Input.jsx';

function StarButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-2xl leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
        active
          ? 'text-amber-500 hover:text-amber-400'
          : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500'
      }`}
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
      className="fixed inset-0 z-[10000] grid place-items-center bg-slate-950/50 p-4"
    >
      <Card variant="elevated" padding="lg" className="w-full max-w-[520px]">
        <CardHeader title="Share your feedback" subtitle="Rate your current learning experience and add a short comment." />
        <div className="mt-6">

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Rating</div>
              <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <StarButton
                  key={value}
                  active={value <= rating}
                  onClick={() => setRating(value)}
                  label={`Set rating ${value}`}
                />
              ))}
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                {rating > 0 ? `${rating}/5` : 'Not selected'}
              </span>
            </div>
            </div>

            <Textarea
              id="feedbackComment"
              label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={600}
              placeholder="What works well, and what should we improve?"
              rows={4}
              hint={`${comment.length}/600`}
            />

            {(localError || serverError) ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                {localError || serverError}
              </div>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send feedback'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
