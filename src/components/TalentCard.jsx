import MediaView from './MediaView';
import { getTierFromEndorsements } from '../data';

// A card used in the Spotlight list and on the Profile page
export default function TalentCard({ talent, onEndorse }) {
  const tier = getTierFromEndorsements(talent.endorsements || 0);

  return (
    <div className="talent-card">
      <div className="talent-card-header">
        <h4>{talent.title}</h4>
        <span className={'tier-badge ' + tier.cls}>{tier.name}</span>
      </div>
      <div className="talent-meta">
        {talent.author} · {new Date(talent.timestamp).toLocaleDateString()}
      </div>
      <div>{talent.desc}</div>
      <MediaView talent={talent} className="talent-card-media" />
      <div className="talent-card-footer">
        <button className="endorse-btn" onClick={() => onEndorse(talent.id)}>
          👍 Endorse
        </button>
        <span className="endorse-count">{talent.endorsements || 0} endorsements</span>
      </div>
    </div>
  );
}
