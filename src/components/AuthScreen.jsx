import { useState } from 'react';
import logo from '../assets/logo.png';
import { isValidContact } from '../data';

// Login / Sign up screen
export default function AuthScreen({ onSignUp, onLogIn, onLoggedIn, showTick }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setContact('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = contact.trim();
    const pw = password.trim();

    if (!id || !pw) return setError('Please fill both fields');
    if (mode === 'signup' && !isValidContact(id)) {
      return setError('Enter a valid email or phone number');
    }

    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') {
        await onSignUp(id, pw);
        // tick first, then send the user back to the Login form (no auto-login)
        showTick('Account created!', () => switchMode('login'));
      } else {
        const user = await onLogIn(id, pw);
        showTick('Login successful!', () => onLoggedIn(user));
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setBusy(false);
  };

  return (
    <section id="auth-screen" className="screen">
      <div className="auth-card">
        <img src={logo} alt="Ascend" className="logo-image-large" />
        <p className="tagline">Rise through your craft.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Phone Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          <input
            type="password"
            placeholder={mode === 'signup' ? 'Choose a password' : 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'signup' ? 'Sign Up' : 'Log In'}
          </button>

          {mode === 'login' ? (
            <p className="switch-text">
              New here? <span onClick={() => switchMode('signup')}>Create an account</span>
            </p>
          ) : (
            <p className="switch-text">
              Already have an account? <span onClick={() => switchMode('login')}>Log in</span>
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
