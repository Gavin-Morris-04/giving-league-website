"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-US">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F8F6F0", color: "#182628", padding: "4rem 1.5rem" }}>
        <main style={{ maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.25rem", lineHeight: 1.1, color: "#122A3A" }}>Something went wrong.</h1>
          <p style={{ marginTop: "1rem", fontSize: "1.125rem" }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ marginTop: "2rem", minHeight: 48, padding: "0 1.25rem", background: "#24584C", color: "#fff", border: 0, borderRadius: 4, fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
