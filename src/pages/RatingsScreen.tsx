import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSubmitRating } from '@/hooks/useApi';
import { ScrollablePage } from '@/components/layout/ScrollablePage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Star } from 'lucide-react';

const QUICK_TAGS = ['Fast', 'Accurate', 'Packaging', 'Fair price'];

export function RatingsScreen() {
  const navigate = useNavigate();
  const submitRating = useSubmitRating();
  const search = useSearch({ from: '/ratings' }) as { submissionId?: string };
  const submissionId = search.submissionId || 's1';

  const [score, setScore] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState('');

  const toggleTag = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setSelectedTags(next);
  };

  const handleSubmit = () => {
    if (score === 0) return;
    submitRating.mutate(
      {
        submissionId,
        rating: { score, tags: Array.from(selectedTags), comment },
      },
      {
        onSuccess: () => navigate({ to: '/status' }),
      }
    );
  };

  return (
    <ScrollablePage
      header={
        <PageHeader
          title="Rate your service"
          description="order SWS-PG-004217 · completed 2 days ago"
          back={{ to: '/status' }}
        />
      }
      footer={
        <button
          onClick={handleSubmit}
          disabled={score === 0 || submitRating.isPending}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
            score > 0 && !submitRating.isPending
              ? 'bg-brand-gradient shadow-glow active:scale-[0.98]'
              : 'bg-surface-lighter text-muted-foreground cursor-not-allowed'
          }`}
        >
          {submitRating.isPending ? 'Submitting…' : 'Submit rating'}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Lab info */}
        <div>
          <div className="bg-surface-light rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center">
              <span className="text-brand font-bold">R</span>
            </div>
            <div>
              <p className="font-semibold">RAWLITY</p>
              <p className="text-xs text-muted-foreground">
                pre-grade · 3 cards · ฿1,050
              </p>
            </div>
          </div>
        </div>

        {/* Star rating */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setScore(s)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    s <= (hoveredStar || score)
                      ? 'text-pregrade fill-pregrade'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm font-mono text-muted-foreground">
            {score > 0 ? `${score} / 5` : 'Tap to rate'}
          </p>
        </div>

        {/* Quick tags */}
        <div>
          <p className="text-xs font-mono tracking-wider text-muted-foreground mb-3">
            QUICK TAGS
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedTags.has(tag)
                    ? 'bg-brand text-white'
                    : 'bg-surface-light text-muted-foreground hover:text-white'
                }`}
              >
                {tag} {selectedTags.has(tag) && '✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <p className="text-xs font-mono tracking-wider text-muted-foreground mb-2">
            COMMENT (OPTIONAL)
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Score matched the PSA result exactly — 9.5 pre-grade, PSA 10 on the strong copy. Worth every baht."
            rows={4}
            className="w-full bg-surface-light rounded-xl p-4 text-sm outline-none resize-none placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Privacy note */}
        <div>
          <div className="bg-surface-light rounded-xl p-4">
            <p className="text-xs text-muted-foreground">
              <span className="text-brand">Private until reviewed</span> — your rating is only published after RAWLITY has read it and responded to you.
            </p>
          </div>
        </div>

        {/* Example response */}
        <div>
          <p className="text-xs font-mono tracking-wider text-muted-foreground mb-2">
            AFTER THE LAB RESPONDS — EXAMPLE
          </p>
          <div className="bg-surface-light rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                <span className="text-brand text-xs font-bold">R</span>
              </div>
              <div>
                <p className="text-xs font-medium">RAWLITY responded · 1 day ago</p>
                <p className="text-xs text-muted-foreground">Published ✓</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              "Thanks BoBoBoA! Glad the 9.5 held up at PSA — bring the next batch in for a returning-customer rate."
            </p>
          </div>
        </div>

        {/* Public scorecard */}
        <div>
          <div className="bg-pregrade/5 border border-pregrade/20 rounded-xl p-4">
            <p className="text-xs font-mono text-pregrade mb-2">RAWLITY PUBLIC SCORECARD</p>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-pregrade fill-pregrade" />
              <span className="font-bold">4.9</span>
              <span className="text-xs text-muted-foreground">· 1,204 reviews</span>
            </div>
            <p className="text-xs text-muted-foreground">
              fast 92% · accurate 96%
            </p>
          </div>
        </div>
      </div>
    </ScrollablePage>
  );
}
