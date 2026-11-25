import { useState } from 'react';
import { CATEGORIES, checkEligibility, daysLeft, minTierInfo } from '../data';

const FILTERS = [{ id: 'all', name: 'All' }, ...CATEGORIES];

// One opportunity card
function OpportunityCard({ opp, eligibility, applied, onApply }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const category = CATEGORIES.find((c) => c.id === opp.category);
  const tier = minTierInfo(opp.minTier);
  const left = daysLeft(opp.deadline);
  const closed = left < 0;

  const deadlineText = closed
    ? 'Closed'
    : left === 0
    ? 'Closes today'
    : left === 1
    ? 'Closes tomorrow'
    : `Closes in ${left} days`;

  const handleApply = async () => {
    setBusy(true);
    setError('');
    try {
      await onApply(opp.id);
    } catch (err) {
      setError(err.message || 'Could not apply. Please try again.');
    }
    setBusy(false);
  };

  let action;
  if (applied) {
    action = <button className="opp-btn opp-btn-done" disabled>✓ Applied</button>;
  } else if (closed) {
    action = <button className="opp-btn" disabled>Closed</button>;
  } else if (!eligibility.eligible) {
    action = <button className="opp-btn" disabled>Not eligible yet</button>;
  } else {
    action = (
      <button className="opp-btn opp-btn-apply" onClick={handleApply} disabled={busy}>
        {busy ? 'Applying...' : 'Apply'}
      </button>
    );
  }

  return (
    <div className={'opp-card' + (closed ? ' opp-closed' : '')}>
      <div className="opp-pills">
        <span className={'opp-pill ' + (category ? category.cls : '')}>
          {category ? category.name : opp.category}
        </span>
        <span className="opp-pill opp-pill-plain">{opp.type}</span>
        {!closed && eligibility.eligible && opp.minTier !== 'any' && (
          <span className="opp-pill opp-pill-match">✓ Matches your talent</span>
        )}
      </div>

      <h3 className="opp-title">{opp.title}</h3>
      <p className="opp-organiser">
        {opp.organiser}
        {opp.location ? ' · ' + opp.location : ''}
      </p>
      <p className="opp-desc">{opp.description}</p>

      <div className="opp-meta">
        <div>
          <span className="opp-meta-label">Deadline</span>
          <span className="opp-meta-value">
            {new Date(opp.deadline + 'T00:00:00').toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}{' '}
            · {deadlineText}
          </span>
        </div>
        <div>
          <span className="opp-meta-label">Who can apply</span>
          <span className={'tier-badge ' + tier.cls}>{tier.label}</span>
        </div>
      </div>

      {!applied && !closed && !eligibility.eligible && (
        <p className="opp-note">🔒 {eligibility.reason}</p>
      )}
      {error && <p className="form-error">{error}</p>}

      <div className="opp-footer">
        {opp.link ? (
          <a className="opp-link" href={opp.link} target="_blank" rel="noreferrer">
            More details
          </a>
        ) : (
          <span />
        )}
        {action}
      </div>
    </div>
  );
}

export default function OpportunitiesView({
  opportunities,
  talents,
  userId,
  appliedIds,
  loaded,
  loadError,
  onApply,
}) {
  const [filter, setFilter] = useState('all');

  const shown = opportunities
    .filter((o) => filter === 'all' || o.category === filter)
    .map((o) => ({
      opp: o,
      eligibility: checkEligibility(o, talents, userId),
      applied: appliedIds.includes(o.id),
      closed: daysLeft(o.deadline) < 0,
    }))
    // open ones first, then ones you can apply to, then by deadline
    .sort((a, b) => {
      if (a.closed !== b.closed) return a.closed ? 1 : -1;
      if (a.eligibility.eligible !== b.eligibility.eligible) return a.eligibility.eligible ? -1 : 1;
      return a.opp.deadline.localeCompare(b.opp.deadline);
    });

  return (
    <main className="view">
      <h2>Opportunities</h2>
      <p className="view-subtext">
        Auditions, competitions and events open to Ascend talents. The higher your tier, the more
        you unlock.
      </p>

      <div className="chips">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={'chip' + (filter === f.id ? ' active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.name}
          </button>
        ))}
      </div>

      {loadError && <p className="form-error">{loadError}</p>}

      <div className="opp-list">
        {!loaded ? (
          <p className="opp-empty">Loading opportunities...</p>
        ) : shown.length === 0 ? (
          <p className="opp-empty">No opportunities in this category right now. Check back soon.</p>
        ) : (
          shown.map(({ opp, eligibility, applied }) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              eligibility={eligibility}
              applied={applied}
              onApply={onApply}
            />
          ))
        )}
      </div>
    </main>
  );
}
