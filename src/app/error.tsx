"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message =
    error instanceof Error
      ? error.message
      : "An unexpected error occurred while loading this page.";

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#faf7f2] px-5 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-[#e9dfd4] bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
          !
        </div>

        <h1 className="mt-6 text-3xl font-bold text-[#684329]">
          Something went wrong
        </h1>

        <p className="mt-4 break-words text-sm leading-7 text-[#766e67]">
          {message}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#684329]"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="rounded-full border border-[#d8c8b8] px-6 py-3 text-sm font-semibold text-[#684329] transition hover:bg-[#faf7f2]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
