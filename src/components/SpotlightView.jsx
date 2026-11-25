import TalentCard from './TalentCard';

// Top 5 most endorsed talents
export default function SpotlightView({ talents, onEndorse }) {
  const top = [...talents]
    .sort((a, b) => (b.endorsements || 0) - (a.endorsements || 0))
    .slice(0, 5);

  return (
    <main className="view">
      <h2>🏆 This Week's Spotlight</h2>
      <p className="view-subtext">Top endorsed talents across all categories</p>

      <div className="talent-list">
        {top.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nothing here yet.</p>
        ) : (
          top.map((t) => <TalentCard key={t.id} talent={t} onEndorse={onEndorse} />)
        )}
      </div>
    </main>
  );
}
