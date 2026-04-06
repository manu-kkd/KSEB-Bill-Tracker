import './globals.css';

export const metadata = {
  title: 'Analyzer',
  description: 'Track and analyze your KSEB electricity bills',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h1 style={{ color: 'var(--primary)' }}>⚡Analyzer</h1>
            <p className="text-muted">Monitor your electricity usage and get AI insights.</p>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
