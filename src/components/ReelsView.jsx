import MediaView from './MediaView';
import { getTierFromEndorsements } from '../data';

// Instagram Reels style full-screen vertical feed (CSS scroll-snap)
export default function ReelsView({ list, title, onBack, onEndorse }) {
  return (
    <div>
      <div className="reels-topbar">
        <button className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <h3>{title}</h3>
      </div>

      <div className="reels-container">
        {list.length === 0 ? (
          <div className="reels-empty">Nothing to show here yet.</div>
        ) : (
          list.map((talent) => {
            const tier = getTierFromEndorsements(talent.endorsements || 0);
            return (
              <div key={talent.id} className={'reel-slide' + (talent.image ? '' : ' no-image')}>
                <MediaView talent={talent} className="reel-media" />

                <div className="reel-side-actions">
                  <div>
                    <button className="reel-endorse-btn" onClick={() => onEndorse(talent.id)}>
                      👍
                    </button>
                    <div className="reel-endorse-count">{talent.endorsements || 0}</div>
                  </div>
                </div>

                <div className="reel-overlay">
                  <div className="reel-author">@{talent.author}</div>
                  <div className="reel-title">{talent.title}</div>
                  <div className="reel-desc">{talent.desc}</div>
                  <span className={'tier-badge reel-tier ' + tier.cls}>{tier.name}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
