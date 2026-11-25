import TalentCard from './TalentCard';
import { getActivityTier } from '../data';

export default function ProfileView({ username, talents, streak, onEndorse }) {
  const myTalents = talents.filter((t) => t.author === username);
  const totalEndorsements = myTalents.reduce((sum, t) => sum + (t.endorsements || 0), 0);

  const tier = getActivityTier(myTalents.length);
  const range = tier.max - tier.min || 1;
  const progress =
    myTalents.length >= 20 ? 100 : Math.min(100, ((myTalents.length - tier.min) / range) * 100);

  return (
    <main className="view">
      <div className="profile-card">
        <div className="avatar-large">👤</div>
        <h2>{username}</h2>
        <div className="tier-badge">{tier.name}</div>

        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: progress + '%' }} />
        </div>
        <p className="progress-label">{myTalents.length} talents posted</p>

        <div className="profile-stats">
          <div>
            <strong>{myTalents.length}</strong>
            <span>Talents Posted</span>
          </div>
          <div>
            <strong>{totalEndorsements}</strong>
            <span>Endorsements</span>
          </div>
          <div>
            <strong>{streak}</strong>
            <span>🔥 Streak</span>
          </div>
        </div>

        <h3 className="my-talents-heading">My Talents</h3>
        <div className="talent-list">
          {myTalents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nothing here yet.</p>
          ) : (
            myTalents.map((t) => <TalentCard key={t.id} talent={t} onEndorse={onEndorse} />)
          )}
        </div>
      </div>
    </main>
  );
}
