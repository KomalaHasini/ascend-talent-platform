// Shown only until the Supabase details are pasted into src/config.js
export default function SetupNotice() {
  return (
    <section id="auth-screen" className="screen">
      <div className="auth-card" style={{ textAlign: 'left' }}>
        <h2 style={{ marginBottom: '12px' }}>One last step</h2>
        <p className="tagline" style={{ marginBottom: '10px' }}>
          The database is not connected yet.
        </p>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          Open <b>src/config.js</b> and paste your Supabase project URL and anon key, then save.
          The steps are in <b>SETUP.md</b>.
        </p>
      </div>
    </section>
  );
}
