import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { isConfigured } from './config';
import * as api from './api';
import { computeStreak } from './data';
import AuthScreen from './components/AuthScreen';
import SetupNotice from './components/SetupNotice';
import SuccessTick from './components/SuccessTick';
import Navbar from './components/Navbar';
import ExploreView from './components/ExploreView';
import SpotlightView from './components/SpotlightView';
import ProfileView from './components/ProfileView';
import OpportunitiesView from './components/OpportunitiesView';
import PostModal from './components/PostModal';

export default function App() {
  // who is logged in on THIS device: { id, username } (accounts and posts live in the shared database)
  const [currentUser, setCurrentUser] = useLocalStorage('ascend_user', null);
  const [theme, setTheme] = useLocalStorage('th_theme', 'light');

  // data loaded from the shared database
  const [talents, setTalents] = useState([]);
  const [usernames, setUsernames] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [oppLoaded, setOppLoaded] = useState(false);
  const [oppError, setOppError] = useState('');

  // screen state
  const [view, setView] = useState('explore'); // 'explore' | 'spotlight' | 'opportunities' | 'profile'
  const [showModal, setShowModal] = useState(false);
  const [tick, setTick] = useState(null); // { id, message, callback } or null
  const [exploreKey, setExploreKey] = useState(0); // changing it resets the Explore page

  // apply the theme to the whole page
  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  // load everyone's posts, and check again every 15 seconds so new posts from friends appear
  const refresh = useCallback(async () => {
    try {
      const [t, u] = await Promise.all([api.fetchTalents(), api.fetchUsernames()]);
      setTalents(t);
      setUsernames(u);
      setLoadError('');
    } catch (err) {
      setLoadError('Could not load talents: ' + err.message);
    }
    setLoaded(true);

    // opportunities load separately, so the rest of the site still works if they fail
    try {
      const [opps, applied] = await Promise.all([
        api.fetchOpportunities(),
        currentUser ? api.fetchMyApplications(currentUser.id) : Promise.resolve([]),
      ]);
      setOpportunities(opps);
      setAppliedIds(applied);
      setOppError('');
    } catch (err) {
      setOppError('Could not load opportunities: ' + err.message);
    }
    setOppLoaded(true);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !isConfigured) return;
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [currentUser, refresh]);

  // ----- auth -----
  const showTick = (message, callback) => setTick({ id: Date.now(), message, callback });

  const finishTick = () => {
    const callback = tick && tick.callback;
    setTick(null);
    if (callback) callback();
  };

  const handleLoggedIn = (user) => {
    setCurrentUser(user);
    setView('explore');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoaded(false);
    setOppLoaded(false);
    setAppliedIds([]);
  };

  // ----- talents -----
  const handleEndorse = async (id) => {
    // show the new count immediately, then save it
    setTalents((prev) =>
      prev.map((t) => (t.id === id ? { ...t, endorsements: (t.endorsements || 0) + 1 } : t))
    );
    try {
      await api.endorse(id);
    } catch {
      refresh(); // something went wrong, get the real numbers back
    }
  };

  // apply to an opportunity (the card shows the error if it fails)
  const handleApply = async (opportunityId) => {
    await api.applyToOpportunity(currentUser.id, opportunityId);
    setAppliedIds((prev) => [...prev, opportunityId]);
  };

  // throws an error (shown inside the pop-up) when posting fails
  const handleAddTalent = async (data) => {
    const created = await api.addTalent({ user: currentUser, ...data });
    setTalents((prev) => [created, ...prev]);
    setShowModal(false);
    setView('explore');
    setExploreKey((k) => k + 1);
  };

  // ----- what to show -----
  if (!isConfigured) return <SetupNotice />;

  const myTalents = currentUser ? talents.filter((t) => t.authorId === currentUser.id) : [];

  return (
    <>
      {!currentUser ? (
        <AuthScreen
          onSignUp={api.signUp}
          onLogIn={api.logIn}
          onLoggedIn={handleLoggedIn}
          showTick={showTick}
        />
      ) : (
        <section id="app-screen" className="screen">
          <Navbar
            view={view}
            setView={setView}
            theme={theme}
            toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onLogout={handleLogout}
          />

          {loadError && (
            <p className="form-error" style={{ padding: '10px 32px 0' }}>
              {loadError}
            </p>
          )}

          {view === 'explore' && (
            <ExploreView
              key={exploreKey}
              talents={talents}
              usernames={usernames}
              loaded={loaded}
              onPostClick={() => setShowModal(true)}
              onEndorse={handleEndorse}
            />
          )}
          {view === 'spotlight' && <SpotlightView talents={talents} onEndorse={handleEndorse} />}
          {view === 'opportunities' && (
            <OpportunitiesView
              opportunities={opportunities}
              talents={talents}
              userId={currentUser.id}
              appliedIds={appliedIds}
              loaded={oppLoaded}
              loadError={oppError}
              onApply={handleApply}
            />
          )}
          {view === 'profile' && (
            <ProfileView
              username={currentUser.username}
              talents={talents}
              streak={computeStreak(myTalents)}
              onEndorse={handleEndorse}
            />
          )}
        </section>
      )}

      {showModal && <PostModal onClose={() => setShowModal(false)} onSubmit={handleAddTalent} />}
      {tick && <SuccessTick key={tick.id} message={tick.message} onDone={finishTick} />}
    </>
  );
}
