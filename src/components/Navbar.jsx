import logo from '../assets/logo.png';

const TABS = [
  { id: 'explore', label: 'Explore' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'profile', label: 'Profile' },
];

export default function Navbar({ view, setView, theme, toggleTheme, onLogout }) {
  return (
    <header className="topbar">
      <img src={logo} alt="Ascend" className="logo-image-small" />

      <nav className="nav-links">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={'nav-btn' + (view === tab.id ? ' active' : '')}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <button className="icon-btn" title="Toggle theme" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn-ghost" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}
