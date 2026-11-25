import { useState, useEffect, useRef } from 'react';
import ReelsView from './ReelsView';
import { CATEGORIES } from '../data';

// One square tile in the Instagram-style grid
function GridTile({ talent, onOpen }) {
  const category = CATEGORIES.find((c) => c.id === talent.category);

  let media;
  if (!talent.image) {
    media = (
      <div className={'grid-tile-placeholder ' + (category ? category.cls : '')}>{talent.title}</div>
    );
  } else if (talent.mediaType === 'video') {
    media = (
      <>
        <video src={talent.image} muted preload="metadata" />
        <div className="grid-tile-video-icon">▶</div>
      </>
    );
  } else {
    media = <img src={talent.image} alt={talent.title} />;
  }

  return (
    <div className="grid-tile" onClick={onOpen}>
      {media}
      <div className="grid-tile-overlay">
        👍 <span>{talent.endorsements || 0}</span>
      </div>
    </div>
  );
}

export default function ExploreView({ talents, usernames, loaded, onPostClick, onEndorse }) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userFilter, setUserFilter] = useState(null); // username or null
  const [reels, setReels] = useState(null); // { ids: [...], title } or null
  const searchRef = useRef(null);

  // close the search dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = q ? usernames.filter((u) => u.toLowerCase().includes(q)) : [];

  const list = userFilter ? talents.filter((t) => t.author === userFilter) : talents;
  const heading = userFilter ? '@' + userFilter : 'All Talents';

  // ----- Reels feed (opened by clicking a grid tile) -----
  if (reels) {
    const reelList = reels.ids.map((id) => talents.find((t) => t.id === id)).filter(Boolean);
    return (
      <main className="view">
        <ReelsView
          list={reelList}
          title={reels.title}
          onBack={() => setReels(null)}
          onEndorse={onEndorse}
        />
      </main>
    );
  }

  const openReels = (index) => {
    // the clicked talent plays first, the rest follow
    const ordered = [list[index], ...list.slice(0, index), ...list.slice(index + 1)];
    setReels({ ids: ordered.map((t) => t.id), title: heading });
  };

  const pickUser = (username) => {
    setUserFilter(username);
    setQuery('');
    setSearchOpen(false);
  };

  // ----- Search + grid -----
  return (
    <main className="view">
      <div className="view-header">
        <h2>{heading}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {userFilter && (
            <button className="btn-ghost" onClick={() => setUserFilter(null)}>
              Show all
            </button>
          )}
          <button className="btn-primary" onClick={onPostClick}>
            + Post a Talent
          </button>
        </div>
      </div>

      <div className="search-bar-wrap" ref={searchRef}>
        <input
          type="text"
          placeholder="🔍 Search people by username..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
        />
        {searchOpen && q && (
          <div className="user-search-dropdown">
            {matches.length === 0 ? (
              <div className="user-result-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
                No users found
              </div>
            ) : (
              matches.map((u) => (
                <div key={u} className="user-result-item" onClick={() => pickUser(u)}>
                  {u}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="post-grid">
        {!loaded ? (
          <div className="grid-empty">Loading talents...</div>
        ) : list.length === 0 ? (
          <div className="grid-empty">
            No talents here yet.
            <br />
            Tap "+ Post a Talent" to be the first.
          </div>
        ) : (
          list.map((talent, index) => (
            <GridTile key={talent.id} talent={talent} onOpen={() => openReels(index)} />
          ))
        )}
      </div>
    </main>
  );
}
