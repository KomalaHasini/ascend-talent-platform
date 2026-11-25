import { useEffect } from 'react';

// Animated tick mark shown for a short moment after sign up / login
export default function SuccessTick({ message, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="success-overlay">
      <div className="success-box">
        <svg className="tick-svg" viewBox="0 0 52 52">
          <circle className="tick-circle" cx="26" cy="26" r="24" fill="none" />
          <path className="tick-check" fill="none" d="M14 27 L22 35 L38 17" />
        </svg>
        <p className="success-message">{message}</p>
      </div>
    </div>
  );
}
