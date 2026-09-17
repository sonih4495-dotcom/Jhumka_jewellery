'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
          backgroundColor: '#fafafa',
          color: '#18181b',
        }}
      >
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}
          >
            Something went wrong!
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#71717a',
              marginBottom: '1.5rem',
              maxWidth: '400px',
            }}
          >
            {error?.message ||
              'A critical error occurred. Please try again or refresh the page.'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 24px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: '#18181b',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}