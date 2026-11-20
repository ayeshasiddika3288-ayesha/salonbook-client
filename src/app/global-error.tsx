"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f2",
          color: "#29231f",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #e9dfd4",
            borderRadius: "24px",
            padding: "40px 28px",
          }}
        >
          <h1 style={{ margin: 0, color: "#684329" }}>
            SalonBook is unavailable
          </h1>
          <p style={{ color: "#766e67", lineHeight: 1.7 }}>{message}</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "12px",
              background: "#8b5e3c",
              color: "#ffffff",
              border: 0,
              borderRadius: "999px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
